/**
 * Banking Dashboard API Server
 *
 * Features implemented:
 * - Proper service layer architecture
 * - Input validation middleware
 * - Centralized error handling
 * - Typed responses
 * - Transaction filtering and pagination
 * - Account CRUD operations
 */

import express from "express";
import cors from "cors";
import { db } from "./db";
import accountRoutes from "./routes/account.routes";
import transactionRoutes from "./routes/transaction.routes";
import { errorHandler } from "./middleware/errorHandler";

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Routes
app.use("/api/accounts", accountRoutes);
app.use("/api/accounts", transactionRoutes);

// Error handling middleware (must be last)
app.use(errorHandler as express.ErrorRequestHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: "Endpoint not found",
    path: req.path,
  });
});

// Database initialization
function initDatabase() {
  return new Promise<void>((resolve, reject) => {
    db.serialize(() => {
      // Create accounts table
      db.run(
        `CREATE TABLE IF NOT EXISTS accounts (
          id TEXT PRIMARY KEY,
          accountNumber TEXT UNIQUE NOT NULL,
          accountType TEXT NOT NULL CHECK(accountType IN ('CHECKING', 'SAVINGS')),
          balance REAL DEFAULT 0,
          accountHolder TEXT NOT NULL,
          createdAt TEXT NOT NULL
        )`,
        (err) => {
          if (err) {
            console.error("Error creating accounts table:", err);
            reject(err);
            return;
          }
        }
      );

      // Create transactions table
      db.run(
        `CREATE TABLE IF NOT EXISTS transactions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          accountId TEXT NOT NULL,
          type TEXT NOT NULL CHECK(type IN ('DEPOSIT', 'WITHDRAWAL', 'TRANSFER')),
          amount REAL NOT NULL,
          description TEXT DEFAULT '',
          createdAt TEXT NOT NULL,
          FOREIGN KEY (accountId) REFERENCES accounts(id)
        )`,
        (err) => {
          if (err) {
            console.error("Error creating transactions table:", err);
            reject(err);
            return;
          }
        }
      );

      // Create index for faster transaction queries
      db.run(
        `CREATE INDEX IF NOT EXISTS idx_transactions_accountId ON transactions(accountId)`,
        (err) => {
          if (err) {
            console.error("Error creating index:", err);
          }
        }
      );

      // Seed sample data
      seedData();
      resolve();
    });
  });
}

function seedData() {
  const sampleAccounts = [
    {
      id: "1",
      accountNumber: "ACC-001-2024",
      accountType: "CHECKING",
      balance: 5250.75,
      accountHolder: "John Doe",
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "2",
      accountNumber: "ACC-002-2024",
      accountType: "SAVINGS",
      balance: 12500.0,
      accountHolder: "Jane Smith",
      createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "3",
      accountNumber: "ACC-003-2024",
      accountType: "CHECKING",
      balance: 890.25,
      accountHolder: "Robert Johnson",
      createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];

  const sampleTransactions = [
    { accountId: "1", type: "DEPOSIT", amount: 1500, description: "Salary deposit", daysAgo: 25 },
    { accountId: "1", type: "WITHDRAWAL", amount: 200, description: "ATM withdrawal", daysAgo: 20 },
    { accountId: "1", type: "TRANSFER", amount: 350, description: "Rent payment", daysAgo: 15 },
    { accountId: "1", type: "DEPOSIT", amount: 500, description: "Freelance payment", daysAgo: 10 },
    { accountId: "1", type: "WITHDRAWAL", amount: 75.50, description: "Grocery shopping", daysAgo: 5 },
    { accountId: "2", type: "DEPOSIT", amount: 5000, description: "Initial deposit", daysAgo: 55 },
    { accountId: "2", type: "DEPOSIT", amount: 2500, description: "Bonus payment", daysAgo: 30 },
    { accountId: "2", type: "DEPOSIT", amount: 5000, description: "Tax refund", daysAgo: 10 },
    { accountId: "3", type: "DEPOSIT", amount: 1000, description: "Initial deposit", daysAgo: 14 },
    { accountId: "3", type: "WITHDRAWAL", amount: 109.75, description: "Utility bills", daysAgo: 7 },
  ];

  sampleAccounts.forEach((account) => {
    db.run(
      `INSERT OR IGNORE INTO accounts (id, accountNumber, accountType, balance, accountHolder, createdAt)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [account.id, account.accountNumber, account.accountType, account.balance, account.accountHolder, account.createdAt]
    );
  });

  sampleTransactions.forEach((tx) => {
    const createdAt = new Date(Date.now() - tx.daysAgo * 24 * 60 * 60 * 1000).toISOString();
    db.run(
      `INSERT INTO transactions (accountId, type, amount, description, createdAt)
       VALUES (?, ?, ?, ?, ?)`,
      [tx.accountId, tx.type, tx.amount, tx.description, createdAt]
    );
  });

  console.log("Sample data seeded successfully");
}

// Start server
initDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`
╔═══════════════════════════════════════════════════════════════╗
║                   Banking Dashboard API                        ║
╠═══════════════════════════════════════════════════════════════╣
║  Server running on: http://localhost:${PORT}                     ║
║  Health check: http://localhost:${PORT}/api/health               ║
╠═══════════════════════════════════════════════════════════════╣
║  Endpoints:                                                     ║
║  GET    /api/accounts              - List all accounts         ║
║  GET    /api/accounts/:id          - Get account by ID         ║
║  POST   /api/accounts              - Create new account        ║
║  DELETE /api/accounts/:id          - Delete account            ║
║  GET    /api/accounts/:id/transactions - Get transactions      ║
║  POST   /api/accounts/:id/transactions - Create transaction    ║
║  GET    /api/accounts/:id/transactions/summary - Get summary   ║
╚═══════════════════════════════════════════════════════════════╝
      `);
    });
  })
  .catch((err) => {
    console.error("Failed to initialize database:", err);
    process.exit(1);
  });
