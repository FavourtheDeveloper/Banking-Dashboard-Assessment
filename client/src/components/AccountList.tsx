import { useState, useEffect } from "react";
import { Account } from "../types";
import { getAccounts } from "../api";
import { AccountCard } from "./AccountCard";
import { TransactionList } from "./TransactionList"; // we'll create this next
import styles from "./AccountList.module.css";

export function AccountList() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const data = await getAccounts();
        setAccounts(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchAccounts();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className={styles.container}>
      <h2>Accounts</h2>
      <div className={styles.grid}>
        {accounts.map((account) => (
          <AccountCard
            key={account.id}
            account={account}
            onViewTransactions={setSelectedAccountId}
          />
        ))}
      </div>

      {selectedAccountId && (
        <TransactionList
          accountId={selectedAccountId}
          onClose={() => setSelectedAccountId(null)}
        />
      )}
    </div>
  );
}
