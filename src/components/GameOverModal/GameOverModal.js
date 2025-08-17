// GameOverModal component - Modal for game over states
import React, { useEffect } from "react";
import { PIECE_COLORS } from "../../constants/gameConstants.js";
import styles from "./GameOverModal.module.css";

/**
 * GameOverModal Component
 * Displays a prominent modal overlay when the game ends (checkmate or stalemate)
 */
const GameOverModal = ({
  gameStatus,
  currentPlayer,
  onReset,
  isVisible = false,
}) => {
  /**
   * Handle escape key to close modal (but only allow reset)
   */
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape" && onReset) {
        onReset();
      }
    };

    if (isVisible) {
      document.addEventListener("keydown", handleKeyDown);
      // Prevent body scroll when modal is open
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isVisible, onReset]);

  /**
   * Get game over message based on status
   */
  const getGameOverMessage = () => {
    switch (gameStatus) {
      case "checkmate":
        const winner = currentPlayer === PIECE_COLORS.WHITE ? "Black" : "White";
        return {
          title: "Checkmate!",
          subtitle: `${winner} Wins`,
          icon: "🏆",
          type: "checkmate",
        };
      case "stalemate":
        return {
          title: "Stalemate",
          subtitle: "It's a Draw",
          icon: "🤝",
          type: "stalemate",
        };
      default:
        return {
          title: "Game Over",
          subtitle: "",
          icon: "🎯",
          type: "default",
        };
    }
  };

  /**
   * Handle reset button click
   */
  const handleReset = () => {
    if (onReset) {
      onReset();
    }
  };

  /**
   * Handle backdrop click to reset game
   */
  const handleBackdropClick = (event) => {
    if (event.target === event.currentTarget && onReset) {
      onReset();
    }
  };

  if (!isVisible) {
    return null;
  }

  const message = getGameOverMessage();

  return (
    <div
      className={styles.modalOverlay}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="game-over-title"
      aria-describedby="game-over-subtitle"
    >
      <div className={`${styles.modalContent} ${styles[message.type]}`}>
        <div className={styles.modalHeader}>
          <div className={styles.gameOverIcon}>{message.icon}</div>
          <h2 id="game-over-title" className={styles.gameOverTitle}>
            {message.title}
          </h2>
          {message.subtitle && (
            <p id="game-over-subtitle" className={styles.gameOverSubtitle}>
              {message.subtitle}
            </p>
          )}
        </div>

        <div className={styles.modalBody}>
          <div className={styles.gameOverDetails}>
            {gameStatus === "checkmate" && (
              <div className={styles.winnerDetails}>
                <div className={styles.winnerIcon}>👑</div>
                <p className={styles.winnerText}>
                  Congratulations to{" "}
                  <span className={styles.winnerName}>
                    {currentPlayer === PIECE_COLORS.WHITE ? "Black" : "White"}
                  </span>
                  !
                </p>
              </div>
            )}
            {gameStatus === "stalemate" && (
              <div className={styles.drawDetails}>
                <div className={styles.drawIcon}>⚖️</div>
                <p className={styles.drawText}>
                  No legal moves available, but the king is not in check.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className={styles.modalFooter}>
          <button
            className={styles.newGameButton}
            onClick={handleReset}
            type="button"
            aria-label="Start a new game"
            autoFocus
          >
            <span className={styles.buttonIcon}>🎮</span>
            <span className={styles.buttonText}>New Game</span>
          </button>
          <p className={styles.helpText}>
            Press <kbd>Esc</kbd> or click outside to start a new game
          </p>
        </div>
      </div>
    </div>
  );
};

export default GameOverModal;