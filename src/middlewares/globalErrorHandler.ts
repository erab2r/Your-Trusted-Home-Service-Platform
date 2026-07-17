import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { Prisma } from "../../generated/prisma/client";

export const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log("Error:", err);

  let statusCode =
    err.statusCode ||
    err.status ||
    httpStatus.INTERNAL_SERVER_ERROR;

  let errorMessage = err.message || "Internal Server Error";
  let errorName = err.name || "Error";

  if (err instanceof Prisma.PrismaClientValidationError) {
    statusCode = httpStatus.BAD_REQUEST;
    errorMessage =
      "You have provided incorrect field type or missing fields.";
  } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case "P2002":
        statusCode = httpStatus.BAD_REQUEST;
        errorMessage = "Duplicate Key Error.";
        break;

      case "P2003":
        statusCode = httpStatus.BAD_REQUEST;
        errorMessage = "Foreign key constraint failed.";
        break;

      case "P2025":
        statusCode = httpStatus.NOT_FOUND;
        errorMessage = "The requested record was not found.";
        break;
    }
  } else if (err instanceof Prisma.PrismaClientInitializationError) {
    switch (err.errorCode) {
      case "P1000":
        statusCode = httpStatus.UNAUTHORIZED;
        errorMessage =
          "Authentication failed against database server. Please check your credentials.";
        break;

      case "P1001":
        statusCode = httpStatus.BAD_GATEWAY;
        errorMessage = "Can't reach database server.";
        break;
    }
  } else if (err instanceof Prisma.PrismaClientUnknownRequestError) {
    statusCode = httpStatus.INTERNAL_SERVER_ERROR;
    errorMessage = "Error occurred during query execution.";
  }

  res.status(statusCode).json({
    success: false,
    statusCode,
    name: errorName,
    message: errorMessage,
    error: err.stack,
  });
};