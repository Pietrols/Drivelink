export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode = 500, code = "INTERNAL_ERROR") {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = statusCode < 500;
    Error.captureStackTrace(this, this.constructor);
  }
}

// ── Common error factories ────────────────────────────────────────────────────

export const Errors = {
  unauthorized: (msg = "Unauthorized") =>
    new AppError(msg, 401, "UNAUTHORIZED"),
  forbidden: (msg = "Forbidden") => new AppError(msg, 403, "FORBIDDEN"),
  notFound: (msg = "Not found") => new AppError(msg, 404, "NOT_FOUND"),
  conflict: (msg = "Conflict") => new AppError(msg, 409, "CONFLICT"),
  badRequest: (msg = "Bad request") => new AppError(msg, 400, "BAD_REQUEST"),
  tooMany: (msg = "Too many requests") =>
    new AppError(msg, 429, "TOO_MANY_REQUESTS"),
};
