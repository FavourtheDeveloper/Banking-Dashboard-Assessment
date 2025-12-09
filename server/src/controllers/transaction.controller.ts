import { Request, Response } from "express";
import { TransactionService } from "../services/transaction.service";
import { asyncHandler } from "../middleware/errorHandler";
import { TransactionFilters, TransactionType } from "../types";

/**
 * Get transactions for an account
 * GET /api/accounts/:id/transactions
 */
export const getTransactions = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const {
    page = "1",
    limit = "10",
    type,
    startDate,
    endDate,
    minAmount,
    maxAmount,
  } = req.query;

  const filters: TransactionFilters = {};
  if (type) filters.type = type as TransactionType;
  if (startDate) filters.startDate = startDate as string;
  if (endDate) filters.endDate = endDate as string;
  if (minAmount) filters.minAmount = Number(minAmount);
  if (maxAmount) filters.maxAmount = Number(maxAmount);

  const result = await TransactionService.getByAccountId(
    id,
    parseInt(page as string),
    parseInt(limit as string),
    Object.keys(filters).length > 0 ? filters : undefined
  );

  res.json(result);
});

/**
 * Create a new transaction
 * POST /api/accounts/:id/transactions
 */
export const createTransaction = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { type, amount, description } = req.body;

  const result = await TransactionService.create(id, {
    type,
    amount,
    description,
  });

  res.status(201).json(result);
});

/**
 * Get transaction summary for an account
 * GET /api/accounts/:id/transactions/summary
 */
export const getTransactionSummary = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const summary = await TransactionService.getSummary(id);
  res.json(summary);
});
