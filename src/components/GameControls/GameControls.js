// GameControls component - Game control buttons
import React from "react";
import { PIECE_COLORS } from "../../constants/gameConstants.js";
import styles from "./GameControls.module.css";

/**
 * GameControls Component
 * Displays game status, current player, and control buttons
 */
const GameControls = ({
  gameStatus = "playing",
  currentPlayer = PIECE_COLORS.WHITE,
  onReset,
}) => {
  /**
   * Get display text for game status
   */
  const getStatusText = () => {
    switch (gameStatus) {
      case "check":
        return `${
          currentPlayer === PIECE_COLORS.WHITE ? "White" : "Black"
        } is in check`;
      case "checkmate":
        const winner = currentPlayer === PIECE_COLORS.WHITE ? "Black" : "White";
        return `Checkmate! ${winner} wins`;
      case "stalemate":
        return "Stalemate - Draw";
      case "playing":
      default:
        return `${
          currentPlayer === PIECE_COLORS.WHITE ? "White" : "Black"
        } to move`;
    }
  };

  /**
   * Get CSS class for status display based on game state
   */
  const getStatusClass = () => {
    switch (gameStatus) {
      case "check":
        return styles.statusCheck;
      case "checkmate":
        return styles.statusCheckmate;
      case "stalemate":
        return styles.statusStalemate;
      case "playing":
      default:
        return styles.statusPlaying;
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

  return (
    <div
      className={styles.gameControls}
      role="region"
      aria-label="Game controls and status"
    >
      <div className={styles.statusSection}>
        <h3 className={styles.statusTitle} id="game-status-title">
          Game Status
        </h3>
        <div
          className={`${styles.statusText} ${getStatusClass()}`}
          role="status"
          aria-live="polite"
          aria-labelledby="game-status-title"
        >
          {getStatusText()}
        </div>

        {/* Visual game state indicator */}
        <div className={styles.gameStateVisual}>
          {gameStatus === "check" && (
            <div className={styles.checkIndicator}>
              <span className={styles.checkIcon}>⚠️</span>
              <span className={styles.checkText}>Check!</span>
            </div>
          )}
          {gameStatus === "checkmate" && (
            <div className={styles.checkmateIndicator}>
              <span className={styles.checkmateIcon}>🏁</span>
              <span className={styles.checkmateText}>Checkmate</span>
            </div>
          )}
          {gameStatus === "stalemate" && (
            <div className={styles.stalemateIndicator}>
              <span className={styles.stalemateIcon}>🤝</span>
              <span className={styles.stalemateText}>Draw</span>
            </div>
          )}
        </div>

        {currentPlayer &&
          (gameStatus === "playing" || gameStatus === "check") && (
            <div
              className={styles.currentPlayer}
              role="status"
              aria-live="polite"
            >
              <div
                className={`${styles.playerIndicator} ${
                  gameStatus === "check" ? styles.playerInCheck : ""
                }`}
              >
                <div
                  className={`${styles.playerColor} ${
                    currentPlayer === PIECE_COLORS.WHITE
                      ? styles.white
                      : styles.black
                  }`}
                  aria-hidden="true"
                />
                <span className={styles.playerText}>
                  {currentPlayer === PIECE_COLORS.WHITE ? "White" : "Black"}'s
                  turn
                  {gameStatus === "check" && " (in check!)"}
                </span>
              </div>
            </div>
          )}
      </div>

      <div className={styles.controlsSection}>
        <button
          className={styles.resetButton}
          onClick={handleReset}
          type="button"
          aria-label="Reset game to starting position"
        >
          <span className={styles.resetIcon}>↻</span>
          New Game
        </button>

        {(gameStatus === "checkmate" || gameStatus === "stalemate") && (
          <div className={styles.gameOverMessage}>
            <p>Game Over</p>
            <p className={styles.gameOverSubtext}>
              Click "New Game" to start again
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GameControls;
