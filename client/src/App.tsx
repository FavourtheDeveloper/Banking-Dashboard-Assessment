import { useState, useEffect, useCallback } from "react";
import { AccountList } from "./components/AccountList";
import { TransactionModal } from "./components/TransactionModal";
import { Toast } from "./components/Toast";
import { getAccounts, checkHealth } from "./api";
import { Account } from "./types";
import "./App.css";

function App() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [isOnline, setIsOnline] = useState(true);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const fetchAccounts = useCallback(async () => {
    try {
      setError(null);
      const data = await getAccounts();
      setAccounts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load accounts");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAccounts();

    // Check API health
    checkHealth().then(setIsOnline);

    // Periodic health check
    const interval = setInterval(() => {
      checkHealth().then(setIsOnline);
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchAccounts]);

  const handleViewTransactions = (account: Account) => {
    setSelectedAccount(account);
  };

  const handleCloseModal = () => {
    setSelectedAccount(null);
  };

  const handleTransactionSuccess = (newBalance: number, message: string) => {
    // Update the account balance in the list
    setAccounts((prev) =>
      prev.map((acc) =>
        acc.id === selectedAccount?.id ? { ...acc, balance: newBalance } : acc
      )
    );

    // Update selected account
    if (selectedAccount) {
      setSelectedAccount({ ...selectedAccount, balance: newBalance });
    }

    // Show success toast
    setToast({ message, type: "success" });
  };

  const handleTransactionError = (message: string) => {
    setToast({ message, type: "error" });
  };

  // Calculate stats
  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);
  const checkingAccounts = accounts.filter(
    (acc) => acc.accountType === "CHECKING"
  ).length;
  const savingsAccounts = accounts.filter(
    (acc) => acc.accountType === "SAVINGS"
  ).length;

  return (
    <div className="app">
      <header className="header">
        <div className="header__content">
          <div className="header__brand">
            <div className="header__logo">B</div>
            <div>
              <h1 className="header__title">Banking Dashboard</h1>
              <p className="header__subtitle">Clive Alliance Accessment</p>
            </div>
          </div>
          <div className="header__status">
            <span
              className={`header__status-dot ${
                !isOnline ? "header__status-dot--offline" : ""
              }`}
            />
            {isOnline ? "Connected" : "Offline"}
          </div>
        </div>
      </header>

      <main className="main">
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner" />
            <p className="loading-text">Loading your accounts...</p>
          </div>
        ) : error ? (
          <div className="error-container">
            <div className="error-icon">!</div>
            <h2 className="error-title">Something went wrong</h2>
            <p className="error-message">{error}</p>
            <button className="error-button" onClick={fetchAccounts}>
              Try Again
            </button>
          </div>
        ) : (
          <>
            {/* Stats Bar */}
            <div className="stats-bar">
              <div className="stat-card">
                <div className="stat-card__icon stat-card__icon--accounts">
                  📊
                </div>
                <div className="stat-card__content">
                  <p className="stat-card__label">Total Accounts</p>
                  <p className="stat-card__value">{accounts.length}</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-card__icon stat-card__icon--balance">
                  💰
                </div>
                <div className="stat-card__content">
                  <p className="stat-card__label">Total Balance</p>
                  <p className="stat-card__value">
                    $
                    {totalBalance.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                    })}
                  </p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-card__icon stat-card__icon--transactions">
                  🏦
                </div>
                <div className="stat-card__content">
                  <p className="stat-card__label">Checking</p>
                  <p className="stat-card__value">{checkingAccounts}</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-card__icon stat-card__icon--growth">
                  💎
                </div>
                <div className="stat-card__content">
                  <p className="stat-card__label">Savings</p>
                  <p className="stat-card__value">{savingsAccounts}</p>
                </div>
              </div>
            </div>

            {/* Account List */}
            <AccountList
              accounts={accounts}
              onViewTransactions={handleViewTransactions}
            />
          </>
        )}
      </main>

      {/* Transaction Modal */}
      {selectedAccount && (
        <TransactionModal
          account={selectedAccount}
          onClose={handleCloseModal}
          onSuccess={handleTransactionSuccess}
          onError={handleTransactionError}
        />
      )}

      {/* Toast Notifications */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      <footer>
        <h4>&copy; FavourtheDev</h4>
      </footer>
    </div>
  );
}

export default App;
