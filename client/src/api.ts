import {
  Account,
  Transaction,
  TransactionType,
  TransactionFilters,
  PaginatedResponse,
  TransactionResult,
  TransactionSummary,
  ApiError,
} from "./types";

const API_URL = "http://localhost:3001/api";

// ============================================
// Error Handling
// ============================================

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error: ApiError = await response.json().catch(() => ({
      error: "An unexpected error occurred",
    }));
    throw new Error(error.details?.join(", ") || error.error);
  }
  return response.json();
}

// ============================================
// Account API
// ============================================

export async function getAccounts(): Promise<Account[]> {
  const response = await fetch(`${API_URL}/accounts`);
  return handleResponse<Account[]>(response);
}

export async function getAccount(id: string): Promise<Account> {
  const response = await fetch(`${API_URL}/accounts/${id}`);
  return handleResponse<Account>(response);
}

// ============================================
// Transaction API
// ============================================

export async function getTransactions(
  accountId: string,
  page: number = 1,
  limit: number = 10,
  filters?: TransactionFilters
): Promise<PaginatedResponse<Transaction>> {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  if (filters) {
    if (filters.type) params.append("type", filters.type);
    if (filters.startDate) params.append("startDate", filters.startDate);
    if (filters.endDate) params.append("endDate", filters.endDate);
    if (filters.minAmount) params.append("minAmount", filters.minAmount);
    if (filters.maxAmount) params.append("maxAmount", filters.maxAmount);
  }

  const response = await fetch(
    `${API_URL}/accounts/${accountId}/transactions?${params}`
  );
  return handleResponse<PaginatedResponse<Transaction>>(response);
}

export async function createTransaction(
  accountId: string,
  data: {
    type: TransactionType;
    amount: number;
    description?: string;
  }
): Promise<TransactionResult> {
  const response = await fetch(`${API_URL}/accounts/${accountId}/transactions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse<TransactionResult>(response);
}

export async function getTransactionSummary(
  accountId: string
): Promise<TransactionSummary> {
  const response = await fetch(
    `${API_URL}/accounts/${accountId}/transactions/summary`
  );
  return handleResponse<TransactionSummary>(response);
}

// ============================================
// Health Check
// ============================================

export async function checkHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_URL}/health`);
    return response.ok;
  } catch {
    return false;
  }
}
