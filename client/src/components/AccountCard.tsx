import { Account } from "../types";

interface AccountCardProps {
  account: Account;
  onViewTransactions: (accountId: string) => void;
}

export function AccountCard({ account, onViewTransactions }: AccountCardProps) {
  return (
    <div className="card">
      <h3>{account.accountHolder}</h3>
      <p>Account Number: {account.accountNumber}</p>
      <p>Type: {account.accountType}</p>
      <p>Balance: ${account.balance.toFixed(2)}</p>
      <button onClick={() => onViewTransactions(account.id)}>View Transactions</button>
    </div>
  );
}
