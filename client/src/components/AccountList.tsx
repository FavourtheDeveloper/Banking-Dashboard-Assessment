import { Account } from "../types";
import styles from "./AccountList.module.css";

interface AccountListProps {
  accounts: Account[];
  onViewTransactions: (account: Account) => void;
}

export function AccountList({ accounts, onViewTransactions }: AccountListProps) {
  if (accounts.length === 0) {
    return (
      <div className={styles.empty}>
        <div className={styles.emptyIcon}>🏦</div>
        <p className={styles.emptyText}>No accounts found</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>
          Your Accounts
          <span className={styles.count}>({accounts.length})</span>
        </h2>
      </div>

      <div className={styles.grid}>
        {accounts.map((account, index) => (
          <AccountCard
            key={account.id}
            account={account}
            index={index}
            onViewTransactions={onViewTransactions}
          />
        ))}
      </div>
    </div>
  );
}

interface AccountCardProps {
  account: Account;
  index: number;
  onViewTransactions: (account: Account) => void;
}

function AccountCard({ account, index, onViewTransactions }: AccountCardProps) {
  const initials = account.accountHolder
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  const formattedBalance = account.balance.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const [dollars, cents] = formattedBalance.split(".");

  const createdDate = new Date(account.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const isSavings = account.accountType === "SAVINGS";

  return (
    <div
      className={`${styles.card} ${isSavings ? styles["card--savings"] : ""}`}
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <div className={styles.cardHeader}>
        <div className={styles.cardAvatar}>{initials}</div>
        <span
          className={`${styles.cardBadge} ${
            isSavings ? styles["cardBadge--savings"] : styles["cardBadge--checking"]
          }`}
        >
          {account.accountType}
        </span>
      </div>

      <h3 className={styles.cardName}>{account.accountHolder}</h3>
      <p className={styles.cardNumber}>{account.accountNumber}</p>

      <div className={styles.balanceSection}>
        <p className={styles.balanceLabel}>Available Balance</p>
        <p className={styles.balanceValue}>
          ${dollars}
          <span>.{cents}</span>
        </p>
      </div>

      <div className={styles.cardFooter}>
        <span className={styles.cardDate}>Opened {createdDate}</span>
        <button
          className={styles.cardButton}
          onClick={() => onViewTransactions(account)}
        >
          Transactions →
        </button>
      </div>
    </div>
  );
}
