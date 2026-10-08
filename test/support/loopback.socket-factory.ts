import dns from 'node:dns';
import net from 'node:net';
import tls from 'node:tls';
import type { ISocketFactory } from 'kafkajs';

const KEEP_ALIVE_DELAY_MS = 60_000;

/**
 * Socket factory for suites that talk to the stream broker from the host.
 *
 * The broker advertises its own container name in cluster metadata, so after
 * the bootstrap exchange every further connection is requested for a host
 * name that only resolves inside the container network. Resolving such a name
 * on the host fails with `getaddrinfo ENOTFOUND`; here an unresolvable name
 * is routed to the loopback interface, which is where the container's broker
 * port is published. Names that do resolve (including plain IPs) are handled
 * normally, so the same helper keeps working when a suite runs inside the
 * container network instead of on the host.
 *
 * Everything else matches the stock factory: keep-alives stay on and TLS
 * still receives the server name for non-IP hosts.
 */
export function loopbackSocketFactory(): ISocketFactory {
  const lookup: net.LookupFunction = (hostname, options, callback) => {
    dns.lookup(hostname, options, (error, address, family) => {
      if (error === null) {
        callback(null, address, family);
        return;
      }
      // Node invokes custom lookups with `all: true` and then expects the
      // array form of the answer; handing back a bare address string makes
      // the connect fail with "Invalid IP address: undefined" instead of
      // falling back to loopback, which is the whole point here.
      callback(
        null,
        options.all === true ? [{ address: '127.0.0.1', family: 4 }] : '127.0.0.1',
        family ?? 4,
      );
    });
  };

  return ({ host, port, ssl, onConnect }) => {
    // `ssl` arrives as `null` for a plaintext broker (kafkajs' default), so
    // the branch must be truthiness-based exactly like the stock factory —
    // a strict `undefined` check would push plaintext sockets into tls.connect.
    const socket = ssl
      ? tls.connect(
          { host, port, lookup, ...(!net.isIP(host) ? { servername: host } : {}), ...ssl },
          onConnect,
        )
      : net.connect({ host, port, lookup }, onConnect);

    socket.setKeepAlive(true, KEEP_ALIVE_DELAY_MS);
    return socket;
  };
}
