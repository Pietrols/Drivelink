import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";

export function validate(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const errors = formatZodErrors(result.error);
      res.status(422).json({
        message: "Validation failed",
        errors,
      });
      return;
    }

    // Replace req.body with the parsed and cleaned data
    req.body = result.data;
    next();
  };
}

function formatZodErrors(error: ZodError): Record<string, string[]> {
  const formatted: Record<string, string[]> = {};
  for (const issue of error.issues) {
    const field = issue.path.join(".") || "root";
    if (!formatted[field]) formatted[field] = [];
    formatted[field].push(issue.message);
  }
  return formatted;
}
