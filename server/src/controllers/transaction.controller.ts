import { Request, Response } from "express";
import { db } from "../db";

interface Account {
  id: string;
  accountNumber: string;
  accountType: "CHECKING" | "SAVINGS";
  balance: number;
  accountHolder: string;
  createdAt: string;
}


export const createTransaction = (req: Request, res: Response): void => {
  const accountId = req.params.id;
  const { type, amount, description } = req.body;

  if (!type || !amount || amount <= 0) {
    res.status(400).json({ error: "Invalid transaction payload" });
    return;
  }

  db.get<Account>("SELECT * FROM accounts WHERE id = ?", [accountId], (err, account) => {
    if (err) { res.status(500).json({ error: err.message }); return; }
    if (!account) { res.status(404).json({ error: "Account not found" }); return; }

    let newBalance = account.balance;

    if (type === "DEPOSIT") newBalance += amount;
    else if (type === "WITHDRAWAL") {
      if (amount > account.balance) { res.status(400).json({ error: "Insufficient balance" }); return; }
      newBalance -= amount;
    }

    db.run("UPDATE accounts SET balance = ? WHERE id = ?", [newBalance, accountId], (err2) => {
      if (err2) { res.status(500).json({ error: err2.message }); return; }

      const createdAt = new Date().toISOString();

      db.run(
        "INSERT INTO transactions (accountId, type, amount, description, createdAt) VALUES (?, ?, ?, ?, ?)",
        [accountId, type, amount, description || "", createdAt],
        function (err3) {
          if (err3) { res.status(500).json({ error: err3.message }); return; }

          res.json({
            message: "Transaction created",
            balance: newBalance,
            transaction: { id: this.lastID, accountId, type, amount, description, createdAt },
          });
        }
      );
    });
  });
};

export const getTransactions = (req: Request, res: Response): void => {
  const { id } = req.params;
  const page = parseInt((req.query.page as string) || "1");
  const limit = parseInt((req.query.limit as string) || "10");
  const offset = (page - 1) * limit;

  db.all(
    `SELECT * FROM transactions WHERE accountId = ? ORDER BY createdAt DESC LIMIT ? OFFSET ?`,
    [id, limit, offset],
    (err, rows) => {
      if (err) { res.status(500).json({ error: err.message }); return; }
      res.json({ page, limit, results: rows });
    }
  );
};
