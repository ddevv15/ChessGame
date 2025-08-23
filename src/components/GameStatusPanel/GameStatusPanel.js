// GameStatusPanel component - Displays current game information
import React from "react";
import styles from "./GameStatusPanel.module.css";
import {
  getModeDisplayName,
  getDifficultyDisplayName,
} from "../../utils/gameModeManager";

/**
 * GameStatusPanel component displays current game status and information
 * @param {Object} props - Component props
 * @param {string} props.currentPlayer - Current player color ('white' | 'black')
 * @param {string} props.gameMode - Current game mode ('pvp' | 'ai')
 * @param {string} props.gameStatus - Current game status
 * @param {boolean} props.isAITurn - Whether it's currently AI's turn
 * @param {string} props.aiDifficulty - AI difficulty level
 * @param {string} props.humanPlayerColor - Color the human player is playing (for AI mode)
 * @returns {JSX.Element} GameStatusPanel component
 */
const GameStatusPanel = ({
  currentPlayer,
  gameMode,
  gameStatus,
  isAITurn,
  aiDifficulty,
  humanPlayerColor,
}) => {
  const getPlayerDisplayName = (color) => {
    return color === "white" ? "White" : "Black";
  };

  const getGameStatusDisplay = () => {
    switch (gameStatus) {
      case "playing":
        return "Game in Progress";
      case "check":
        return "Check!";
      case "checkmate":
        return "Checkmate!";
      case "stalemate":
        return "Stalemate!";
      default:
        return "Game in Progress";
    }
  };

  const getStatusColor = () => {
    switch (gameStatus) {
      case "check":
        return styles.check;
      case "checkmate":
        return styles.checkmate;
      case "stalemate":
        return styles.stalemate;
      default:
        return styles.playing;
    }
  };

  const isGameOver = gameStatus === "checkmate" || gameStatus === "stalemate";

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>Game Status</h3>
      </div>

      <div className={styles.content}>
        {/* Game Mode Display */}
        <div className={styles.section}>
          <div className={styles.label}>Mode:</div>
          <div className={styles.value}>
            {getModeDisplayName(gameMode)}
            {gameMode === "ai" && aiDifficulty && (
              <span className={styles.difficulty}>
                {" "}
                ({getDifficultyDisplayName(aiDifficulty)})
              </span>
            )}
          </div>
        </div>

        {/* Current Player Turn */}
        <div className={styles.section}>
          <div className={styles.label}>Turn:</div>
          <div className={`${styles.value} ${styles.playerTurn}`}>
            <span
              className={`${styles.playerIndicator} ${styles[currentPlayer]}`}
            >
              {getPlayerDisplayName(currentPlayer)}
            </span>
            {gameMode === "ai" && (
              <span className={styles.playerType}>
                {isAITurn ? " (AI)" : " (You)"}
              </span>
            )}
          </div>
        </div>

        {/* Game Status */}
        <div className={styles.section}>
          <div className={styles.label}>Status:</div>
          <div className={`${styles.value} ${getStatusColor()}`}>
            {getGameStatusDisplay()}
          </div>
        </div>

        {/* AI Mode Specific Info */}
        {gameMode === "ai" && (
          <>
            <div className={styles.section}>
              <div className={styles.label}>You Play:</div>
              <div className={styles.value}>
                <span
                  className={`${styles.playerIndicator} ${styles[humanPlayerColor]}`}
                >
                  {getPlayerDisplayName(humanPlayerColor)}
                </span>
              </div>
            </div>

            {isAITurn && !isGameOver && (
              <div className={styles.aiThinking}>
                <div className={styles.aiIcon}>🤖</div>
                <div className={styles.aiText}>AI is thinking...</div>
              </div>
            )}
          </>
        )}

        {/* Game Over Message */}
        {isGameOver && (
          <div className={styles.gameOver}>
            <div className={styles.gameOverIcon}>
              {gameStatus === "checkmate" ? "👑" : "🤝"}
            </div>
            <div className={styles.gameOverText}>
              {gameStatus === "checkmate"
                ? `${getPlayerDisplayName(
                    getOpponentColor(currentPlayer)
                  )} wins!`
                : "Game ended in a draw!"}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Helper function to get opponent color
const getOpponentColor = (color) => {
  return color === "white" ? "black" : "white";
};

export default GameStatusPanel;
