import { Request, Response, NextFunction } from "express";

// Custom error class for API errors
export class ApiError extends Error {
  statusCode: number;
  details?: string[];
  code?: string;

  constructor(
    message: string,
    statusCode: number = 500,
    details?: string[],
    code?: string
  ) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.code = code;
    this.name = "ApiError";
  }

  static badRequest(message: string, details?: string[]) {
    return new ApiError(message, 400, details, "BAD_REQUEST");
  }

  static notFound(message: string) {
    return new ApiError(message, 404, undefined, "NOT_FOUND");
  }

  static insufficientFunds() {
    return new ApiError("Insufficient funds for this transaction", 400, undefined, "INSUFFICIENT_FUNDS");
  }

  static internal(message: string = "Internal server error") {
    return new ApiError(message, 500, undefined, "INTERNAL_ERROR");
  }
}

// Error handling middleware
export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error(`[ERROR] ${new Date().toISOString()} - ${err.message}`);
  console.error(err.stack);

  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      error: err.message,
      code: err.code,
      details: err.details,
    });
  }

  // Handle unexpected errors
  res.status(500).json({
    error: "An unexpected error occurred",
    code: "INTERNAL_ERROR",
  });
}

// Async handler wrapper to catch errors
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

