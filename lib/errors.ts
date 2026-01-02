/**
 * Utility functions for handling errors consistently across the application
 */

export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = "AppError";
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized. Please sign in to continue.") {
    super(message, 401, "UNAUTHORIZED");
    this.name = "UnauthorizedError";
  }
}

export class ValidationError extends AppError {
  constructor(message = "Invalid input data", public details?: unknown) {
    super(message, 400, "VALIDATION_ERROR");
    this.name = "ValidationError";
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Resource not found") {
    super(message, 404, "NOT_FOUND");
    this.name = "NotFoundError";
  }
}

export class DatabaseError extends AppError {
  constructor(message = "Database operation failed") {
    super(message, 500, "DATABASE_ERROR");
    this.name = "DatabaseError";
  }
}

/**
 * Format error message for client consumption
 */
export function formatErrorResponse(error: unknown): {
  success: false;
  error: string;
  code?: string;
  details?: unknown;
} {
  // Handle custom AppError instances
  if (error instanceof AppError) {
    return {
      success: false,
      error: error.message,
      code: error.code,
      details: error instanceof ValidationError ? error.details : undefined,
    };
  }

  // Handle standard Error instances
  if (error instanceof Error) {
    return {
      success: false,
      error: error.message,
    };
  }

  // Handle unknown error types
  return {
    success: false,
    error: "An unexpected error occurred",
  };
}
