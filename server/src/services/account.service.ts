import { db } from "../db";
import { Account, CreateAccountDTO } from "../types";
import { ApiError } from "../middleware/errorHandler";

/**
 * Account Service
 * Handles all business logic for account operations
 */
export class AccountService {
  /**
   * Get all accounts
   */
  static getAll(): Promise<Account[]> {
    return new Promise((resolve, reject) => {
      db.all("SELECT * FROM accounts ORDER BY createdAt DESC", (err, rows) => {
        if (err) {
          reject(ApiError.internal("Failed to retrieve accounts"));
          return;
        }
        resolve(rows as Account[]);
      });
    });
  }

  /**
   * Get account by ID
   */
  static getById(id: string): Promise<Account> {
    return new Promise((resolve, reject) => {
      db.get("SELECT * FROM accounts WHERE id = ?", [id], (err, row) => {
        if (err) {
          reject(ApiError.internal("Failed to retrieve account"));
          return;
        }
        if (!row) {
          reject(ApiError.notFound(`Account with ID ${id} not found`));
          return;
        }
        resolve(row as Account);
      });
    });
  }

  /**
   * Create a new account
   */
  static create(data: CreateAccountDTO): Promise<Account> {
    return new Promise((resolve, reject) => {
      const id = Date.now().toString();
      const createdAt = new Date().toISOString();
      const balance = data.initialBalance || 0;

      db.run(
        `INSERT INTO accounts (id, accountNumber, accountType, balance, accountHolder, createdAt)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [id, data.accountNumber, data.accountType, balance, data.accountHolder, createdAt],
        function (err) {
          if (err) {
            reject(ApiError.internal("Failed to create account"));
            return;
          }
          resolve({
            id,
            accountNumber: data.accountNumber,
            accountType: data.accountType,
            balance,
            accountHolder: data.accountHolder,
            createdAt,
          });
        }
      );
    });
  }

  /**
   * Update account balance
   */
  static updateBalance(id: string, newBalance: number): Promise<void> {
    return new Promise((resolve, reject) => {
      db.run(
        "UPDATE accounts SET balance = ? WHERE id = ?",
        [newBalance, id],
        (err) => {
          if (err) {
            reject(ApiError.internal("Failed to update account balance"));
            return;
          }
          resolve();
        }
      );
    });
  }

  /**
   * Delete an account
   */
  static delete(id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      db.run("DELETE FROM accounts WHERE id = ?", [id], function (err) {
        if (err) {
          reject(ApiError.internal("Failed to delete account"));
          return;
        }
        if (this.changes === 0) {
          reject(ApiError.notFound(`Account with ID ${id} not found`));
          return;
        }
        resolve();
      });
    });
  }
}

