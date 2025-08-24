// ErrorModal component - Display user-friendly error messages and recovery options
import React from "react";
import styles from "./ErrorModal.module.css";

/**
 * ErrorModal Component
 * Displays user-friendly error messages with recovery options
 */
const ErrorModal = ({
  isVisible,
  error,
  onRetry,
  onSwitchToPvP,
  onDismiss,
  onClose,
}) => {
  if (!isVisible || !error) {
    return null;
  }

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    }
  };

  const handleSwitchToPvP = () => {
    if (onSwitchToPvP) {
      onSwitchToPvP();
    }
  };

  const handleDismiss = () => {
    if (onDismiss) {
      onDismiss();
    }
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    }
  };

  const { title, message, action, canRetry, canContinue, severity } = error;

  return (
    <div className={styles.overlay} data-testid="error-modal-overlay">
      <div
        className={`${styles.modal} ${styles[severity] || styles.recoverable}`}
        data-testid="error-modal"
        role="dialog"
        aria-labelledby="error-modal-title"
        aria-describedby="error-modal-message"
      >
        <div className={styles.header}>
          <h2 id="error-modal-title" className={styles.title}>
            {severity === "critical" ? "⚠️" : "ℹ️"} {title}
          </h2>
          <button
            className={styles.closeButton}
            onClick={handleClose}
            aria-label="Close error dialog"
            data-testid="error-modal-close"
          >
            ×
          </button>
        </div>

        <div className={styles.content}>
          <p id="error-modal-message" className={styles.message}>
            {message}
          </p>

          <div className={styles.actions}>
            {canRetry && (
              <button
                className={`${styles.button} ${styles.retryButton}`}
                onClick={handleRetry}
                data-testid="error-modal-retry"
              >
                {action === "Try Again" ? "🔄 Try Again" : action}
              </button>
            )}

            {canContinue && action === "Switch to PvP" && (
              <button
                className={`${styles.button} ${styles.switchButton}`}
                onClick={handleSwitchToPvP}
                data-testid="error-modal-switch-pvp"
              >
                👥 Switch to PvP
              </button>
            )}

            {action === "Continue" && (
              <button
                className={`${styles.button} ${styles.continueButton}`}
                onClick={handleDismiss}
                data-testid="error-modal-continue"
              >
                ✓ Continue
              </button>
            )}

            <button
              className={`${styles.button} ${styles.dismissButton}`}
              onClick={handleDismiss}
              data-testid="error-modal-dismiss"
            >
              Dismiss
            </button>
          </div>
        </div>

        {process.env.NODE_ENV === "development" && error.originalError && (
          <details className={styles.debugInfo}>
            <summary>Debug Information</summary>
            <pre className={styles.debugText}>
              {JSON.stringify(
                {
                  originalError: error.originalError,
                  errorType: error.errorType,
                  timestamp: new Date(error.timestamp).toISOString(),
                  retryCount: error.retryCount,
                },
                null,
                2
              )}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
};

export default ErrorModal;
