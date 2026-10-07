import { ArgumentsHost, Catch, ExceptionFilter, HttpException, Logger } from '@nestjs/common';

/** Languages this service answers error messages in. */
export type SupportedLanguage = 'id' | 'en';

/** Language used when the request does not ask for a specific one. */
export const DEFAULT_LANGUAGE: SupportedLanguage = 'id';

const MESSAGES_ID: Record<string, string> = {
  AUTH_REQUIRED: 'Autentikasi diperlukan. Silakan masuk terlebih dahulu.',
  AUTH_INVALID: 'Email atau kata sandi tidak sesuai.',
  AUTH_LOCKED: 'Akun dikunci sementara karena terlalu banyak percobaan gagal.',
  FORBIDDEN: 'Anda tidak memiliki izin untuk melakukan aksi ini.',
  BAD_REQUEST: 'Permintaan tidak dapat diproses.',
  UNPROCESSABLE_ENTITY: 'Data permintaan tidak valid sehingga tidak dapat diproses.',
  NOT_FOUND: 'Data yang diminta tidak ditemukan.',
  METHOD_NOT_ALLOWED: 'Metode permintaan tidak diizinkan.',
  CONFLICT: 'Permintaan bertentangan dengan data yang sudah ada.',
  PAYLOAD_TOO_LARGE: 'Ukuran permintaan terlalu besar.',
  UNSUPPORTED_MEDIA_TYPE: 'Tipe konten permintaan tidak didukung.',
  TOO_MANY_REQUESTS: 'Terlalu banyak permintaan. Silakan coba lagi nanti.',
  PASSWORD_WEAK: 'Kata sandi tidak memenuhi persyaratan keamanan.',
  PHONE_INVALID: 'Nomor telepon tidak valid.',
  PHOTO_TOO_LARGE: 'Ukuran foto maksimal 2 MB.',
  PHOTO_TYPE: 'Foto harus berupa gambar JPG atau PNG.',
  EMAIL_TAKEN: 'Email sudah terdaftar.',
  SESSION_ALREADY_OPEN: 'Masih ada sesi absensi yang terbuka.',
  NO_OPEN_SESSION: 'Tidak ada sesi absensi terbuka untuk ditutup.',
  IDEMPOTENCY_CONFLICT: 'Kunci idempotency sudah dipakai untuk permintaan yang berbeda.',
  RANGE_INVALID: 'Rentang tanggal tidak valid: tanggal awal tidak boleh setelah tanggal akhir.',
  INTERNAL: 'Terjadi kesalahan pada server. Silakan coba lagi.',
};

// The annotation pins the English table to the Indonesian one: a code present
// in either language but missing in the other becomes a compile error.
const MESSAGES_EN: Record<keyof typeof MESSAGES_ID, string> = {
  AUTH_REQUIRED: 'Authentication required. Please sign in again.',
  AUTH_INVALID: 'Invalid email or password.',
  AUTH_LOCKED: 'Account temporarily locked after too many failed attempts.',
  FORBIDDEN: 'You do not have permission to perform this action.',
  BAD_REQUEST: 'The request could not be processed.',
  UNPROCESSABLE_ENTITY: 'The request data is invalid and could not be processed.',
  NOT_FOUND: 'The requested data was not found.',
  METHOD_NOT_ALLOWED: 'That request method is not allowed.',
  CONFLICT: 'The request conflicts with existing data.',
  PAYLOAD_TOO_LARGE: 'The request payload is too large.',
  UNSUPPORTED_MEDIA_TYPE: 'The content type of the request is not supported.',
  TOO_MANY_REQUESTS: 'Too many requests. Please try again later.',
  PASSWORD_WEAK: 'The password does not meet the security requirements.',
  PHONE_INVALID: 'The phone number is invalid.',
  PHOTO_TOO_LARGE: 'Photos must be 2 MB or smaller.',
  PHOTO_TYPE: 'The photo must be a JPG or PNG image.',
  EMAIL_TAKEN: 'That email is already registered.',
  SESSION_ALREADY_OPEN: 'An attendance session is still open.',
  NO_OPEN_SESSION: 'There is no open attendance session to close.',
  IDEMPOTENCY_CONFLICT: 'That idempotency key was already used for a different request.',
  RANGE_INVALID: 'The date range is invalid: the start date must not be after the end date.',
  INTERNAL: 'A server error occurred. Please try again.',
};

/**
 * Machine code → human message for every code this system can emit, in both
 * languages. A code missing from the active table falls back to the code
 * derived from the HTTP status, then to the generic server-error text, so a
 * response body always carries a localized, non-technical message.
 */
export const ERROR_MESSAGES: Record<SupportedLanguage, Record<string, string>> = {
  id: MESSAGES_ID,
  en: MESSAGES_EN,
};

/**
 * Resolves the message language from an `Accept-Language` header. The parse
 * is deliberately loose: any tag starting with `id`/`in`/`en` counts (so
 * `id-ID`, `in` and `en-GB` all work), quality weights decide between
 * candidates, and anything unrecognised or missing falls back to the default
 * language.
 */
export function resolveLanguage(header: string | undefined): SupportedLanguage {
  if (header === undefined || header.trim() === '') {
    return DEFAULT_LANGUAGE;
  }

  const candidates: Array<{ language: SupportedLanguage; quality: number; position: number }> = [];
  header.split(',').forEach((part, position) => {
    const [tagPart, ...parameters] = part.split(';');
    const language = recognizeLanguage(tagPart.trim().toLowerCase());
    if (language === undefined) {
      return;
    }
    let quality = 1;
    parameters.forEach((parameter) => {
      const match = parameter.trim().match(/^q\s*=\s*([0-9.]+)/i);
      if (match !== null) {
        const parsed = Number(match[1]);
        if (Number.isFinite(parsed)) {
          quality = parsed;
        }
      }
    });
    candidates.push({ language, quality, position });
  });

  candidates.sort((a, b) => b.quality - a.quality || a.position - b.position);
  return candidates[0]?.language ?? DEFAULT_LANGUAGE;
}

/** Maps a bare HTTP status to the machine code used when none was supplied. */
function statusToCode(status: number): string {
  switch (status) {
    case 400:
      return 'BAD_REQUEST';
    case 401:
      return 'AUTH_REQUIRED';
    case 403:
      return 'FORBIDDEN';
    case 404:
      return 'NOT_FOUND';
    case 405:
      return 'METHOD_NOT_ALLOWED';
    case 409:
      return 'CONFLICT';
    case 413:
      return 'PAYLOAD_TOO_LARGE';
    case 415:
      return 'UNSUPPORTED_MEDIA_TYPE';
    case 422:
      return 'UNPROCESSABLE_ENTITY';
    case 423:
      return 'AUTH_LOCKED';
    case 429:
      return 'TOO_MANY_REQUESTS';
    default:
      return status >= 500 ? 'INTERNAL' : 'BAD_REQUEST';
  }
}

/** Response fields the filter always owns; every other body key is detail. */
const FIXED_FIELDS = ['statusCode', 'code', 'message', 'error'];

interface ErrorPayload {
  statusCode: number;
  code: string;
  details: Record<string, unknown>;
}

/**
 * Turns any thrown value into a status, a machine code and extra fields.
 * Anything that is not an HTTP exception is reported as an opaque 500 —
 * its type, message and stack never reach the client.
 */
function describeException(exception: unknown): ErrorPayload {
  if (!(exception instanceof HttpException)) {
    return { statusCode: 500, code: 'INTERNAL', details: {} };
  }

  const statusCode = exception.getStatus();
  const body: unknown = exception.getResponse();
  if (typeof body !== 'object' || body === null) {
    return { statusCode, code: statusToCode(statusCode), details: {} };
  }

  const record = body as Record<string, unknown>;
  const code =
    typeof record.code === 'string' && record.code.length > 0
      ? record.code
      : statusToCode(statusCode);

  const details: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(record)) {
    if (!FIXED_FIELDS.includes(key)) {
      details[key] = value;
    }
  }
  return { statusCode, code, details };
}

/** Narrow header tags to a supported language, or `undefined` when unknown. */
function recognizeLanguage(tag: string): SupportedLanguage | undefined {
  if (tag === 'en' || tag.startsWith('en-')) {
    return 'en';
  }
  if (tag === 'id' || tag.startsWith('id-') || tag === 'in' || tag.startsWith('in-')) {
    return 'id';
  }
  return undefined;
}

interface HttpRequestLike {
  headers?: Record<string, string | string[] | undefined>;
}

interface HttpResponseLike {
  status(code: number): HttpResponseLike;
  json(body: unknown): unknown;
}

/**
 * The one place error responses are shaped. Every failure leaves this filter
 * as exactly `{statusCode, code, message}` plus any `details` fields the
 * thrower merged in; the message is picked from the bilingual table for the
 * language in `Accept-Language`, and unhandled errors are logged internally
 * while the client only ever sees the generic server-error text.
 */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const http = host.switchToHttp();
    const request = http.getRequest<HttpRequestLike>();
    const response = http.getResponse<HttpResponseLike>();
    const { statusCode, code, details } = describeException(exception);

    if (!(exception instanceof HttpException)) {
      const reason = exception instanceof Error ? exception.message : String(exception);
      const stack = exception instanceof Error ? exception.stack : undefined;
      this.logger.error(`unhandled exception: ${reason}`, stack);
    }

    const rawHeader = request.headers?.['accept-language'];
    const header = Array.isArray(rawHeader) ? rawHeader.join(',') : rawHeader;
    const table = ERROR_MESSAGES[resolveLanguage(header)];
    const message = table[code] ?? table[statusToCode(statusCode)] ?? table.INTERNAL;

    response.status(statusCode).json({ statusCode, code, message, ...details });
  }
}
