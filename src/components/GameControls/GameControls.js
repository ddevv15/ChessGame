// GameControls component - Game control buttons
import React, { useState } from "react";
import {
  PIECE_COLORS,
  GAME_MODES,
  DIFFICULTY_LEVELS,
} from "../../constants/gameConstants.js";
import styles from "./GameControls.module.css";

/**
 * GameControls Component
 * Displays game status, current player, and control buttons
 */
const GameControls = ({
  gameStatus = "playing",
  currentPlayer = PIECE_COLORS.WHITE,
  gameMode = GAME_MODES.PVP,
  aiDifficulty = DIFFICULTY_LEVELS.MEDIUM,
  isAIThinking = false,
  onReset,
  onBackToModeSelection,
  onModeChange,
}) => {
  // State for confirmation dialogs
  const [showModeChangeConfirm, setShowModeChangeConfirm] = useState(false);
  const [pendingModeChange, setPendingModeChange] = useState(null);
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

  /**
   * Handle back to mode selection button click
   */
  const handleBackToModeSelection = () => {
    if (onBackToModeSelection) {
      onBackToModeSelection();
    }
  };

  /**
   * Get display text for game mode
   */
  const getModeDisplayText = () => {
    switch (gameMode) {
      case GAME_MODES.AI:
        return `vs AI (${aiDifficulty})`;
      case GAME_MODES.PVP:
      default:
        return "Player vs Player";
    }
  };

  /**
   * Handle mode change request
   */
  const handleModeChangeRequest = (
    newMode,
    newDifficulty = DIFFICULTY_LEVELS.MEDIUM
  ) => {
    // If game is in progress, show confirmation dialog
    if (gameStatus === "playing" || gameStatus === "check") {
      setPendingModeChange({ mode: newMode, difficulty: newDifficulty });
      setShowModeChangeConfirm(true);
    } else {
      // Game is over, change mode immediately
      if (onModeChange) {
        onModeChange(newMode, newDifficulty);
      }
    }
  };

  /**
   * Confirm mode change
   */
  const confirmModeChange = () => {
    if (pendingModeChange && onModeChange) {
      onModeChange(pendingModeChange.mode, pendingModeChange.difficulty);
    }
    setShowModeChangeConfirm(false);
    setPendingModeChange(null);
  };

  /**
   * Cancel mode change
   */
  const cancelModeChange = () => {
    setShowModeChangeConfirm(false);
    setPendingModeChange(null);
  };

  return (
    <div
      className={`${styles.gameControls} ${
        gameMode === GAME_MODES.AI
          ? styles.aiModeControls
          : styles.pvpModeControls
      } ${isAIThinking ? styles.aiThinking : ""}`}
      role="region"
      aria-label="Game controls and status"
      data-game-mode={gameMode}
      data-ai-thinking={isAIThinking}
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

      {/* Game Mode Display */}
      <div className={styles.modeSection}>
        <h4 className={styles.modeTitle}>Game Mode</h4>
        <div
          className={`${styles.modeDisplay} ${
            gameMode === GAME_MODES.AI
              ? styles.aiModeDisplay
              : styles.pvpModeDisplay
          }`}
        >
          <span className={styles.modeText}>{getModeDisplayText()}</span>
          <div
            className={`${styles.modeIndicator} ${
              isAIThinking ? styles.thinkingIndicator : ""
            }`}
          >
            {gameMode === GAME_MODES.AI ? "🤖" : "👥"}
          </div>
          {gameMode === GAME_MODES.AI && isAIThinking && (
            <div className={styles.thinkingDots}>
              <span className={styles.dot}></span>
              <span className={styles.dot}></span>
              <span className={styles.dot}></span>
            </div>
          )}
        </div>
      </div>

      <div className={styles.controlsSection}>
        <div className={styles.buttonGroup}>
          <button
            className={styles.resetButton}
            onClick={handleReset}
            type="button"
            aria-label={`Reset game to starting position in ${getModeDisplayText()} mode`}
          >
            <span className={styles.resetIcon}>↻</span>
            New Game
          </button>

          {onBackToModeSelection && (
            <button
              className={styles.backButton}
              onClick={handleBackToModeSelection}
              type="button"
              aria-label="Back to mode selection"
            >
              <span className={styles.backIcon}>←</span>
              Back to Menu
            </button>
          )}
        </div>

        {/* Mode Switching Controls */}
        {onModeChange && (
          <div className={styles.modeSwitchSection}>
            <h4 className={styles.modeSwitchTitle}>Switch Mode</h4>
            <div className={styles.modeSwitchButtons}>
              <button
                className={`${styles.modeButton} ${
                  gameMode === GAME_MODES.PVP ? styles.modeButtonActive : ""
                }`}
                onClick={() => handleModeChangeRequest(GAME_MODES.PVP)}
                type="button"
                aria-label="Switch to Player vs Player mode"
                disabled={gameMode === GAME_MODES.PVP}
              >
                <span className={styles.modeButtonIcon}>👥</span>
                PvP
              </button>

              <div className={styles.aiModeGroup}>
                <button
                  className={`${styles.modeButton} ${
                    gameMode === GAME_MODES.AI &&
                    aiDifficulty === DIFFICULTY_LEVELS.EASY
                      ? styles.modeButtonActive
                      : ""
                  }`}
                  onClick={() =>
                    handleModeChangeRequest(
                      GAME_MODES.AI,
                      DIFFICULTY_LEVELS.EASY
                    )
                  }
                  type="button"
                  aria-label="Switch to AI mode - Easy difficulty"
                  disabled={
                    gameMode === GAME_MODES.AI &&
                    aiDifficulty === DIFFICULTY_LEVELS.EASY
                  }
                >
                  <span className={styles.modeButtonIcon}>🤖</span>
                  AI Easy
                </button>

                <button
                  className={`${styles.modeButton} ${
                    gameMode === GAME_MODES.AI &&
                    aiDifficulty === DIFFICULTY_LEVELS.MEDIUM
                      ? styles.modeButtonActive
                      : ""
                  }`}
                  onClick={() =>
                    handleModeChangeRequest(
                      GAME_MODES.AI,
                      DIFFICULTY_LEVELS.MEDIUM
                    )
                  }
                  type="button"
                  aria-label="Switch to AI mode - Medium difficulty"
                  disabled={
                    gameMode === GAME_MODES.AI &&
                    aiDifficulty === DIFFICULTY_LEVELS.MEDIUM
                  }
                >
                  <span className={styles.modeButtonIcon}>🤖</span>
                  AI Medium
                </button>

                <button
                  className={`${styles.modeButton} ${
                    gameMode === GAME_MODES.AI &&
                    aiDifficulty === DIFFICULTY_LEVELS.HARD
                      ? styles.modeButtonActive
                      : ""
                  }`}
                  onClick={() =>
                    handleModeChangeRequest(
                      GAME_MODES.AI,
                      DIFFICULTY_LEVELS.HARD
                    )
                  }
                  type="button"
                  aria-label="Switch to AI mode - Hard difficulty"
                  disabled={
                    gameMode === GAME_MODES.AI &&
                    aiDifficulty === DIFFICULTY_LEVELS.HARD
                  }
                >
                  <span className={styles.modeButtonIcon}>🤖</span>
                  AI Hard
                </button>
              </div>
            </div>
          </div>
        )}

        {(gameStatus === "checkmate" || gameStatus === "stalemate") && (
          <div className={styles.gameOverMessage}>
            <p>Game Over</p>
            <p className={styles.gameOverSubtext}>
              Click "New Game" to start again
            </p>
          </div>
        )}
      </div>

      {/* Mode Change Confirmation Dialog */}
      {showModeChangeConfirm && (
        <div
          className={styles.confirmationOverlay}
          role="dialog"
          aria-modal="true"
          aria-labelledby="mode-change-title"
        >
          <div className={styles.confirmationDialog}>
            <h3 id="mode-change-title" className={styles.confirmationTitle}>
              Change Game Mode?
            </h3>
            <p className={styles.confirmationMessage}>
              Changing the game mode will start a new game. Your current
              progress will be lost.
            </p>
            <p className={styles.confirmationDetails}>
              Switch to:{" "}
              <strong>
                {pendingModeChange?.mode === GAME_MODES.AI
                  ? `AI (${pendingModeChange.difficulty})`
                  : "Player vs Player"}
              </strong>
            </p>
            <div className={styles.confirmationButtons}>
              <button
                className={styles.confirmButton}
                onClick={confirmModeChange}
                type="button"
                aria-label="Confirm mode change and start new game"
              >
                Yes, Change Mode
              </button>
              <button
                className={styles.cancelButton}
                onClick={cancelModeChange}
                type="button"
                aria-label="Cancel mode change and continue current game"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameControls;
