import { useEffect, useState } from "react";
import { Transaction, getTransactions, createTransaction } from "../api";
import styles from "./TransactionList.module.css";

interface TransactionListProps {
  accountId: string;
  onClose: () => void;
}

export function TransactionList({ accountId, onClose }: TransactionListProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [type, setType] = useState<"" | "DEPOSIT" | "WITHDRAWAL" | "TRANSFER">("");
  const [amount, setAmount] = useState<number>(0);
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const data = await getTransactions(accountId, page);
      setTransactions(data.results);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch transactions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [accountId, page]);

  const handleCreateTransaction = async () => {
    try {
      await createTransaction(accountId, { type: type!, amount, description });
      setAmount(0);
      setDescription("");
      setType("");
      fetchTransactions();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Transaction failed");
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3>Transactions</h3>
        <button onClick={onClose}>Close</button>
      </div>

      <div className={styles.form}>
        <select value={type} onChange={(e) => setType(e.target.value as any)}>
          <option value="">Select Type</option>
          <option value="DEPOSIT">Deposit</option>
          <option value="WITHDRAWAL">Withdrawal</option>
          <option value="TRANSFER">Transfer</option>
        </select>
        <input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
        />
        <input
          type="text"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <button onClick={handleCreateTransaction}>Add Transaction</button>
      </div>

      {loading ? (
        <p>Loading transactions...</p>
      ) : error ? (
        <p style={{ color: "red" }}>{error}</p>
      ) : (
        <div className={styles.tableContainer}>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Description</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr key={tx.id}>
                  <td>{new Date(tx.createdAt).toLocaleString()}</td>
                  <td>{tx.type}</td>
                  <td>{tx.description}</td>
                  <td>${tx.amount.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className={styles.pagination}>
        <button disabled={page === 1} onClick={() => setPage(page - 1)}>
          Prev
        </button>
        <button onClick={() => setPage(page + 1)}>Next</button>
      </div>
    </div>
  );
}
