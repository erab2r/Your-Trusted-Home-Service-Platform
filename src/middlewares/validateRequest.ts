import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { type ZodIssue, ZodTypeAny } from "zod";

type ValidationTarget = "body" | "query" | "params";

type ValidationSchema = ZodTypeAny;

export const validateRequest = (
  schema: ValidationSchema,
  target: ValidationTarget = "body"
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[target]);

    if (!result.success) {
      const message = result.error.issues
        .map((issue: ZodIssue) => {
          const path = issue.path.length
            ? issue.path.join(".")
            : "value";

          return `${path}: ${issue.message}`;
        })
        .join("; ");

      const error: any = new Error(message);
      error.statusCode = httpStatus.BAD_REQUEST;
      error.details = result.error.issues;

      return next(error);
    }

    req[target] = result.data as never;
    next();
  };
};
