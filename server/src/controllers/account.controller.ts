import { Request, Response } from "express";
import { AccountService } from "../services/account.service";
import { asyncHandler } from "../middleware/errorHandler";

/**
 * Get all accounts
 * GET /api/accounts
 */
export const getAccounts = asyncHandler(async (req: Request, res: Response) => {
  const accounts = await AccountService.getAll();
  res.json(accounts);
});

/**
 * Get account by ID
 * GET /api/accounts/:id
 */
export const getAccountById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const account = await AccountService.getById(id);
  res.json(account);
});

/**
 * Create a new account
 * POST /api/accounts
 */
export const createAccount = asyncHandler(async (req: Request, res: Response) => {
  const account = await AccountService.create(req.body);
  res.status(201).json({
    message: "Account created successfully",
    account,
  });
});

/**
 * Delete an account
 * DELETE /api/accounts/:id
 */
export const deleteAccount = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  await AccountService.delete(id);
  res.json({ message: "Account deleted successfully" });
});
