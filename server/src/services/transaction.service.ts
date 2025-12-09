import { db } from "../db";
import {
  Transaction,
  CreateTransactionDTO,
  TransactionFilters,
  PaginatedResponse,
  TransactionResult,
} from "../types";
import { ApiError } from "../middleware/errorHandler";
import { AccountService } from "./account.service";

/**
 * Transaction Service
 * Handles all business logic for transaction operations
 */
export class TransactionService {
  /**
   * Get transactions for an account with filtering and pagination
   */
  static async getByAccountId(
    accountId: string,
    page: number = 1,
    limit: number = 10,
    filters?: TransactionFilters
  ): Promise<PaginatedResponse<Transaction>> {
    // Verify account exists
    await AccountService.getById(accountId);

    return new Promise((resolve, reject) => {
      let whereClause = "WHERE accountId = ?";
      const params: (string | number)[] = [accountId];

      // Apply filters
      if (filters?.type) {
        whereClause += " AND type = ?";
        params.push(filters.type);
      }
      if (filters?.startDate) {
        whereClause += " AND createdAt >= ?";
        params.push(filters.startDate);
      }
      if (filters?.endDate) {
        whereClause += " AND createdAt <= ?";
        params.push(filters.endDate);
      }
      if (filters?.minAmount) {
        whereClause += " AND amount >= ?";
        params.push(filters.minAmount);
      }
      if (filters?.maxAmount) {
        whereClause += " AND amount <= ?";
        params.push(filters.maxAmount);
      }

      // First get total count
      db.get(
        `SELECT COUNT(*) as count FROM transactions ${whereClause}`,
        params,
        (err, row: { count: number }) => {
          if (err) {
            reject(ApiError.internal("Failed to count transactions"));
            return;
          }

          const total = row.count;
          const totalPages = Math.ceil(total / limit);
          const offset = (page - 1) * limit;

          // Then get paginated results
          db.all(
            `SELECT * FROM transactions ${whereClause} ORDER BY createdAt DESC LIMIT ? OFFSET ?`,
            [...params, limit, offset],
            (err, rows) => {
              if (err) {
                reject(ApiError.internal("Failed to retrieve transactions"));
                return;
              }

              resolve({
                data: rows as Transaction[],
                pagination: {
                  page,
                  limit,
                  total,
                  totalPages,
                  hasMore: page < totalPages,
                },
              });
            }
          );
        }
      );
    });
  }

  /**
   * Create a new transaction
   */
  static async create(
    accountId: string,
    data: CreateTransactionDTO
  ): Promise<TransactionResult> {
    // Get the account
    const account = await AccountService.getById(accountId);

    // Calculate new balance
    let newBalance = account.balance;

    switch (data.type) {
      case "DEPOSIT":
        newBalance += data.amount;
        break;
      case "WITHDRAWAL":
      case "TRANSFER":
        if (data.amount > account.balance) {
          throw ApiError.insufficientFunds();
        }
        newBalance -= data.amount;
        break;
    }

    // Update account balance
    await AccountService.updateBalance(accountId, newBalance);

    // Create the transaction record
    return new Promise((resolve, reject) => {
      const createdAt = new Date().toISOString();
      const description = data.description || "";

      db.run(
        `INSERT INTO transactions (accountId, type, amount, description, createdAt)
         VALUES (?, ?, ?, ?, ?)`,
        [accountId, data.type, data.amount, description, createdAt],
        function (err) {
          if (err) {
            reject(ApiError.internal("Failed to create transaction"));
            return;
          }

          resolve({
            message: `${data.type} of $${data.amount.toFixed(2)} completed successfully`,
            transaction: {
              id: this.lastID,
              accountId,
              type: data.type,
              amount: data.amount,
              description,
              createdAt,
            },
            newBalance,
          });
        }
      );
    });
  }

  /**
   * Get transaction summary for an account
   */
  static async getSummary(accountId: string): Promise<{
    totalDeposits: number;
    totalWithdrawals: number;
    totalTransfers: number;
    transactionCount: number;
  }> {
    await AccountService.getById(accountId);

    return new Promise((resolve, reject) => {
      db.get(
        `SELECT 
          COALESCE(SUM(CASE WHEN type = 'DEPOSIT' THEN amount ELSE 0 END), 0) as totalDeposits,
          COALESCE(SUM(CASE WHEN type = 'WITHDRAWAL' THEN amount ELSE 0 END), 0) as totalWithdrawals,
          COALESCE(SUM(CASE WHEN type = 'TRANSFER' THEN amount ELSE 0 END), 0) as totalTransfers,
          COUNT(*) as transactionCount
         FROM transactions WHERE accountId = ?`,
        [accountId],
        (err, row) => {
          if (err) {
            reject(ApiError.internal("Failed to get transaction summary"));
            return;
          }
          resolve(row as {
            totalDeposits: number;
            totalWithdrawals: number;
            totalTransfers: number;
            transactionCount: number;
          });
        }
      );
    });
  }
}

