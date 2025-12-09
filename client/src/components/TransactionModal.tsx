import { useState, useEffect, useCallback } from "react";
import { Account, Transaction, TransactionType, TransactionFilters, PaginatedResponse } from "../types";
import { getTransactions, createTransaction } from "../api";
import styles from "./TransactionModal.module.css";

interface TransactionModalProps {
  account: Account;
  onClose: () => void;
  onSuccess: (newBalance: number, message: string) => void;
  onError: (message: string) => void;
}

export function TransactionModal({
  account,
  onClose,
  onSuccess,
  onError,
}: TransactionModalProps) {
  // Transaction list state
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 0,
    hasMore: false,
  });

  // Filter state
  const [filters, setFilters] = useState<TransactionFilters>({
    type: "",
  });

  // Form state
  const [formData, setFormData] = useState({
    type: "" as TransactionType | "",
    amount: "",
    description: "",
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  // Track current balance for display
  const [currentBalance, setCurrentBalance] = useState(account.balance);

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const result: PaginatedResponse<Transaction> = await getTransactions(
        account.id,
        page,
        10,
        filters.type ? { type: filters.type as TransactionType } : undefined
      );
      setTransactions(result.data);
      setPagination({
        total: result.pagination.total,
        totalPages: result.pagination.totalPages,
        hasMore: result.pagination.hasMore,
      });
    } catch (err) {
      onError(err instanceof Error ? err.message : "Failed to load transactions");
    } finally {
      setLoading(false);
    }
  }, [account.id, page, filters, onError]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // Reset page when filter changes
  useEffect(() => {
    setPage(1);
  }, [filters.type]);

  // Form validation
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.type) {
      errors.type = "Please select a transaction type";
    }

    const amount = parseFloat(formData.amount);
    if (!formData.amount || isNaN(amount)) {
      errors.amount = "Please enter a valid amount";
    } else if (amount <= 0) {
      errors.amount = "Amount must be greater than 0";
    } else if (amount > 1000000) {
      errors.amount = "Amount cannot exceed $1,000,000";
    } else if (
      (formData.type === "WITHDRAWAL" || formData.type === "TRANSFER") &&
      amount > currentBalance
    ) {
      errors.amount = "Insufficient funds";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const result = await createTransaction(account.id, {
        type: formData.type as TransactionType,
        amount: parseFloat(formData.amount),
        description: formData.description || undefined,
      });

      // Update local balance
      setCurrentBalance(result.newBalance);

      // Reset form
      setFormData({ type: "", amount: "", description: "" });
      setFormErrors({});

      // Refresh transactions
      fetchTransactions();

      // Notify parent
      onSuccess(result.newBalance, result.message);
    } catch (err) {
      onError(err instanceof Error ? err.message : "Transaction failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleFilterChange = (type: TransactionType | "") => {
    setFilters({ ...filters, type: filters.type === type ? "" : type });
  };

  const clearFilters = () => {
    setFilters({ type: "" });
  };

  const initials = account.accountHolder
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerInfo}>
            <div className={styles.headerAvatar}>{initials}</div>
            <div>
              <h2 className={styles.headerTitle}>{account.accountHolder}</h2>
              <p className={styles.headerBalance}>
                Balance:{" "}
                <strong>
                  ${currentBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </strong>
              </p>
            </div>
          </div>
          <button className={styles.closeButton} onClick={onClose}>
            ×
          </button>
        </div>

        {/* Content */}
        <div className={styles.content}>
          {/* New Transaction Form */}
          <div className={styles.formSection}>
            <h3 className={styles.formTitle}>➕ New Transaction</h3>
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Type</label>
                <select
                  className={`${styles.formSelect} ${
                    formErrors.type ? styles["formSelect--error"] : ""
                  }`}
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value as TransactionType | "" })
                  }
                >
                  <option value="">Select...</option>
                  <option value="DEPOSIT">💵 Deposit</option>
                  <option value="WITHDRAWAL">💳 Withdrawal</option>
                  <option value="TRANSFER">🔄 Transfer</option>
                </select>
                {formErrors.type && (
                  <span className={styles.formError}>{formErrors.type}</span>
                )}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Amount</label>
                <input
                  type="number"
                  className={`${styles.formInput} ${
                    formErrors.amount ? styles["formInput--error"] : ""
                  }`}
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData({ ...formData, amount: e.target.value })
                  }
                  min="0"
                  step="0.01"
                />
                {formErrors.amount && (
                  <span className={styles.formError}>{formErrors.amount}</span>
                )}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Description</label>
                <input
                  type="text"
                  className={styles.formInput}
                  placeholder="Optional description..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  maxLength={255}
                />
              </div>

              <button
                className={styles.submitButton}
                onClick={handleSubmit}
                disabled={submitting}
              >
                {submitting ? "Processing..." : "Submit"}
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className={styles.filtersSection}>
            <div className={styles.filtersHeader}>
              <span className={styles.filtersTitle}>Filter by Type</span>
              {filters.type && (
                <button className={styles.filtersClear} onClick={clearFilters}>
                  Clear filters
                </button>
              )}
            </div>
            <div className={styles.filtersGrid}>
              {(["DEPOSIT", "WITHDRAWAL", "TRANSFER"] as TransactionType[]).map(
                (type) => (
                  <button
                    key={type}
                    className={`${styles.filterChip} ${
                      styles[`filterChip--${type.toLowerCase()}`]
                    } ${filters.type === type ? styles["filterChip--active"] : ""}`}
                    onClick={() => handleFilterChange(type)}
                  >
                    {type === "DEPOSIT" && "💵 "}
                    {type === "WITHDRAWAL" && "💳 "}
                    {type === "TRANSFER" && "🔄 "}
                    {type.charAt(0) + type.slice(1).toLowerCase()}
                  </button>
                )
              )}
            </div>
          </div>

          {/* Transactions List */}
          <div className={styles.transactionsHeader}>
            <h3 className={styles.transactionsTitle}>Transaction History</h3>
            <span className={styles.transactionsCount}>
              {pagination.total} transaction{pagination.total !== 1 ? "s" : ""}
            </span>
          </div>

          {loading ? (
            <div className={styles.loading}>
              <div className={styles.loadingSpinner} />
              <span>Loading transactions...</span>
            </div>
          ) : transactions.length === 0 ? (
            <div className={styles.empty}>
              <div className={styles.emptyIcon}>📭</div>
              <p className={styles.emptyText}>
                {filters.type
                  ? `No ${filters.type.toLowerCase()} transactions found`
                  : "No transactions yet"}
              </p>
            </div>
          ) : (
            <div className={styles.transactionsList}>
              {transactions.map((tx, index) => (
                <TransactionItem key={tx.id} transaction={tx} index={index} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className={styles.pagination}>
              <button
                className={styles.paginationButton}
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
              >
                ← Previous
              </button>
              <span className={styles.paginationInfo}>
                Page {page} of {pagination.totalPages}
              </span>
              <button
                className={styles.paginationButton}
                onClick={() => setPage(page + 1)}
                disabled={!pagination.hasMore}
              >
                Next →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface TransactionItemProps {
  transaction: Transaction;
  index: number;
}

function TransactionItem({ transaction, index }: TransactionItemProps) {
  const icons = {
    DEPOSIT: "↓",
    WITHDRAWAL: "↑",
    TRANSFER: "↔",
  };

  const formattedDate = new Date(transaction.createdAt).toLocaleDateString(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  );

  const amountPrefix = transaction.type === "DEPOSIT" ? "+" : "-";

  return (
    <div
      className={styles.transactionItem}
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      <div
        className={`${styles.transactionIcon} ${
          styles[`transactionIcon--${transaction.type.toLowerCase()}`]
        }`}
      >
        {icons[transaction.type]}
      </div>
      <div className={styles.transactionDetails}>
        <p className={styles.transactionType}>
          {transaction.type.charAt(0) + transaction.type.slice(1).toLowerCase()}
        </p>
        <p className={styles.transactionDescription}>
          {transaction.description || "No description"}
        </p>
      </div>
      <div className={styles.transactionMeta}>
        <p
          className={`${styles.transactionAmount} ${
            styles[`transactionAmount--${transaction.type.toLowerCase()}`]
          }`}
        >
          {amountPrefix}$
          {transaction.amount.toLocaleString("en-US", {
            minimumFractionDigits: 2,
          })}
        </p>
        <p className={styles.transactionDate}>{formattedDate}</p>
      </div>
    </div>
  );
}

