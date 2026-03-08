import { Request, Response, NextFunction, RequestHandler } from "express";
import { AppError } from "../lib/AppError";
import { isDev } from "../config";

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      message: err.message,
      code: err.code,
    });
    return;
  }

  // Unexpected error — log fully in development
  console.error("💥  Unexpected error:", err);

  res.status(500).json({
    message: isDev ? err.message : "Something went wrong. Please try again.",
    ...(isDev && { stack: err.stack }),
  });
}

// ── asyncHandler ──────────────────────────────────────────────────────────────
// Wraps async route handlers so you don't need try/catch in every controller.
// Any thrown error is automatically passed to next(err) → errorHandler.

export function asyncHandler(fn: RequestHandler): RequestHandler {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
