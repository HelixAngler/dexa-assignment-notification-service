import { HttpException } from '@nestjs/common';

/**
 * Error carrying a machine-readable code instead of prose.
 *
 * The global exception filter renders it as `{statusCode, code, message}`,
 * replacing the placeholder message with the localized text for `code`.
 * `details` are merged into the body as additional fields — useful for
 * optional integers such as an attempts-left counter — and can never
 * overwrite `statusCode`, `code` or `message`.
 */
export class AppException extends HttpException {
  constructor(
    public readonly statusCode: number,
    public readonly code: string,
    public readonly details: Record<string, unknown> = {},
  ) {
    super({ ...details, statusCode, code, message: code }, statusCode);
  }
}
