import { Account } from "./types";

const API_URL = "http://localhost:3001/api";

export const getAccounts = async (): Promise<Account[]> => {
  const response = await fetch(`${API_URL}/accounts`);
  if (!response.ok) {
    throw new Error("Failed to fetch accounts");
  }
  return response.json();
};

export const getAccount = async (id: string): Promise<Account> => {
  const response = await fetch(`${API_URL}/accounts/${id}`);
  if (!response.ok) {
    throw new Error("Failed to fetch account");
  }
  return response.json();
};

// --- TRANSACTIONS ---

export interface Transaction {
  id: number;
  accountId: string;
  type: "DEPOSIT" | "WITHDRAWAL" | "TRANSFER";
  amount: number;
  description: string;
  createdAt: string;
}

// Fetch transactions for an account
export const getTransactions = async (
  accountId: string,
  page = 1,
  limit = 5
): Promise<{ page: number; limit: number; results: Transaction[] }> => {
  const response = await fetch(`${API_URL}/accounts/${accountId}/transactions?page=${page}&limit=${limit}`);
  if (!response.ok) {
    throw new Error("Failed to fetch transactions");
  }
  return response.json();
};

// Create a new transaction
export const createTransaction = async (
  accountId: string,
  data: { type: "DEPOSIT" | "WITHDRAWAL" | "TRANSFER"; amount: number; description: string }
): Promise<{ message: string; balance: number; transaction: Transaction }> => {
  const response = await fetch(`${API_URL}/accounts/${accountId}/transactions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to create transaction");
  }
  return response.json();
};
