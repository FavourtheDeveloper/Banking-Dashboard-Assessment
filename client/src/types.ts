// ============================================
// Account Types
// ============================================

export type AccountType = "CHECKING" | "SAVINGS";

export interface Account {
  id: string;
  accountNumber: string;
  accountType: AccountType;
  balance: number;
  accountHolder: string;
  createdAt: string;
}

// ============================================
// Transaction Types
// ============================================

export type TransactionType = "DEPOSIT" | "WITHDRAWAL" | "TRANSFER";

export interface Transaction {
  id: number;
  accountId: string;
  type: TransactionType;
  amount: number;
  description: string;
  createdAt: string;
}

export interface TransactionFilters {
  type?: TransactionType | "";
  startDate?: string;
  endDate?: string;
  minAmount?: string;
  maxAmount?: string;
}

// ============================================
// API Response Types
// ============================================

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

export interface TransactionResult {
  message: string;
  transaction: Transaction;
  newBalance: number;
}

export interface ApiError {
  error: string;
  details?: string[];
  code?: string;
}

export interface TransactionSummary {
  totalDeposits: number;
  totalWithdrawals: number;
  totalTransfers: number;
  transactionCount: number;
}
