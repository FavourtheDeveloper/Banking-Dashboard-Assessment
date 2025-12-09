import { Router } from "express";
import {
  getAccounts,
  getAccountById,
  createAccount,
  deleteAccount,
} from "../controllers/account.controller";
import {
  validateAccountId,
  validateCreateAccount,
} from "../middleware/validation";

const router = Router();

/**
 * @route   GET /api/accounts
 * @desc    Get all accounts
 * @access  Public
 */
router.get("/", getAccounts);

/**
 * @route   GET /api/accounts/:id
 * @desc    Get account by ID
 * @access  Public
 */
router.get("/:id", validateAccountId, getAccountById);

/**
 * @route   POST /api/accounts
 * @desc    Create a new account
 * @access  Public
 */
router.post("/", validateCreateAccount, createAccount);

/**
 * @route   DELETE /api/accounts/:id
 * @desc    Delete an account
 * @access  Public
 */
router.delete("/:id", validateAccountId, deleteAccount);

export default router;
