import { Request, Response, NextFunction } from "express";
import { ApiError } from "./errorHandler";
import { TransactionType, AccountType } from "../types";

// Transaction validation
export function validateTransaction(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { type, amount, description } = req.body;
  const errors: string[] = [];

  // Validate type
  const validTypes: TransactionType[] = ["DEPOSIT", "WITHDRAWAL", "TRANSFER"];
  if (!type) {
    errors.push("Transaction type is required");
  } else if (!validTypes.includes(type)) {
    errors.push(`Invalid transaction type. Must be one of: ${validTypes.join(", ")}`);
  }

  // Validate amount
  if (amount === undefined || amount === null) {
    errors.push("Amount is required");
  } else if (typeof amount !== "number" || isNaN(amount)) {
    errors.push("Amount must be a valid number");
  } else if (amount <= 0) {
    errors.push("Amount must be greater than 0");
  } else if (amount > 1000000) {
    errors.push("Amount cannot exceed $1,000,000 per transaction");
  }

  // Validate description (optional but has max length)
  if (description && typeof description === "string" && description.length > 255) {
    errors.push("Description cannot exceed 255 characters");
  }

  if (errors.length > 0) {
    throw ApiError.badRequest("Validation failed", errors);
  }

  next();
}

// Account ID validation
export function validateAccountId(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { id } = req.params;

  if (!id || id.trim() === "") {
    throw ApiError.badRequest("Account ID is required");
  }

  next();
}

// Transaction filters validation
export function validateTransactionFilters(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { type, startDate, endDate, minAmount, maxAmount, page, limit } = req.query;
  const errors: string[] = [];

  // Validate type filter
  const validTypes: TransactionType[] = ["DEPOSIT", "WITHDRAWAL", "TRANSFER"];
  if (type && !validTypes.includes(type as TransactionType)) {
    errors.push(`Invalid type filter. Must be one of: ${validTypes.join(", ")}`);
  }

  // Validate date filters
  if (startDate && isNaN(Date.parse(startDate as string))) {
    errors.push("Invalid start date format");
  }
  if (endDate && isNaN(Date.parse(endDate as string))) {
    errors.push("Invalid end date format");
  }

  // Validate amount filters
  if (minAmount && (isNaN(Number(minAmount)) || Number(minAmount) < 0)) {
    errors.push("Minimum amount must be a positive number");
  }
  if (maxAmount && (isNaN(Number(maxAmount)) || Number(maxAmount) < 0)) {
    errors.push("Maximum amount must be a positive number");
  }

  // Validate pagination
  if (page && (isNaN(Number(page)) || Number(page) < 1)) {
    errors.push("Page must be a positive integer");
  }
  if (limit && (isNaN(Number(limit)) || Number(limit) < 1 || Number(limit) > 100)) {
    errors.push("Limit must be between 1 and 100");
  }

  if (errors.length > 0) {
    throw ApiError.badRequest("Invalid query parameters", errors);
  }

  next();
}

// Account creation validation
export function validateCreateAccount(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { accountNumber, accountType, accountHolder, initialBalance } = req.body;
  const errors: string[] = [];

  if (!accountNumber || accountNumber.trim() === "") {
    errors.push("Account number is required");
  }

  const validTypes: AccountType[] = ["CHECKING", "SAVINGS"];
  if (!accountType) {
    errors.push("Account type is required");
  } else if (!validTypes.includes(accountType)) {
    errors.push(`Invalid account type. Must be one of: ${validTypes.join(", ")}`);
  }

  if (!accountHolder || accountHolder.trim() === "") {
    errors.push("Account holder name is required");
  }

  if (initialBalance !== undefined && (typeof initialBalance !== "number" || initialBalance < 0)) {
    errors.push("Initial balance must be a non-negative number");
  }

  if (errors.length > 0) {
    throw ApiError.badRequest("Validation failed", errors);
  }

  next();
}

