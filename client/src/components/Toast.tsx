import { useEffect } from "react";
import styles from "./Toast.module.css";

interface ToastProps {
  message: string;
  type: "success" | "error";
  onClose: () => void;
  duration?: number;
}

export function Toast({ message, type, onClose, duration = 4000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div className={`${styles.toast} ${styles[`toast--${type}`]}`}>
      <div className={styles.icon}>
        {type === "success" ? "✓" : "✕"}
      </div>
      <p className={styles.message}>{message}</p>
      <button className={styles.close} onClick={onClose}>
        ×
      </button>
    </div>
  );
}

