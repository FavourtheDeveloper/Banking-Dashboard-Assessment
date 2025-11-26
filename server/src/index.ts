/**
 * Banking Dashboard API Server
 *
 * TECHNICAL ASSESSMENT NOTES:
 * This is a basic implementation with intentional areas for improvement:
 * - Currently uses in-memory SQLite (not persistent)
 * - Basic error handling
 * - No authentication/authorization
 * - No input validation
 * - No rate limiting
 * - No caching
 * - No logging system
 * - No tests
 *
 * Candidates should consider:
 * - Data persistence
 * - Security measures
 * - API documentation
 * - Error handling
 * - Performance optimization
 * - Code organization
 * - Testing strategy
 */

import express from "express";
import cors from "cors";
import { db } from "./db";
import accountRoutes from "./routes/account.routes";
import transactionRoutes from "./routes/transaction.routes";

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

function seedAccounts() {
  const sampleAccounts = [
    {
      id: "1",
      accountNumber: "1001",
      accountType: "CHECKING",
      balance: 5000,
      accountHolder: "John Doe",
      createdAt: new Date().toISOString(),
    },
    {
      id: "2",
      accountNumber: "1002",
      accountType: "SAVINGS",
      balance: 10000,
      accountHolder: "Jane Smith",
      createdAt: new Date().toISOString(),
    },
  ];

  sampleAccounts.forEach((account) => {
    db.run(
      `
      INSERT OR REPLACE INTO accounts (id, accountNumber, accountType, balance, accountHolder, createdAt)
      VALUES (?, ?, ?, ?, ?, ?)
    `,
      [
        account.id,
        account.accountNumber,
        account.accountType,
        account.balance,
        account.accountHolder,
        account.createdAt,
      ],
      (err) => {
        if (err) console.error("Error inserting account:", err.message);
      }
    );
  });
}


// Initialize tables
function init() {
  db.run(`
    CREATE TABLE IF NOT EXISTS accounts (
      id TEXT PRIMARY KEY,
      accountNumber TEXT,
      accountType TEXT,
      balance REAL,
      accountHolder TEXT,
      createdAt TEXT
    )
  `, () => {
    seedAccounts(); // <-- seed after table creation
  });

  db.run(`
    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      accountId TEXT,
      type TEXT,
      amount REAL,
      description TEXT,
      createdAt TEXT
    )
  `);
}

init();

// Routes
app.use("/api/accounts", accountRoutes);
app.use("/api/accounts", transactionRoutes);

app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
