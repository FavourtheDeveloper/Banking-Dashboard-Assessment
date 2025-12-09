import { Router } from "express";
import {
  getTransactions,
  createTransaction,
  getTransactionSummary,
} from "../controllers/transaction.controller";
import {
  validateAccountId,
  validateTransaction,
  validateTransactionFilters,
} from "../middleware/validation";

const router = Router();

/**
 * @route   GET /api/accounts/:id/transactions
 * @desc    Get transactions for an account with optional filtering
 * @query   page, limit, type, startDate, endDate, minAmount, maxAmount
 * @access  Public
 */
router.get(
  "/:id/transactions",
  validateAccountId,
  validateTransactionFilters,
  getTransactions
);

/**
 * @route   POST /api/accounts/:id/transactions
 * @desc    Create a new transaction
 * @body    { type: 'DEPOSIT' | 'WITHDRAWAL' | 'TRANSFER', amount: number, description?: string }
 * @access  Public
 */
router.post(
  "/:id/transactions",
  validateAccountId,
  validateTransaction,
  createTransaction
);

/**
 * @route   GET /api/accounts/:id/transactions/summary
 * @desc    Get transaction summary for an account
 * @access  Public
 */
router.get(
  "/:id/transactions/summary",
  validateAccountId,
  getTransactionSummary
);

export default router;
