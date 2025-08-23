// GameModeSelection component - Initial game mode selection screen
import React, { useState } from "react";
import styles from "./GameModeSelection.module.css";

/**
 * GameModeSelection component renders the initial game mode selection screen
 * @param {Object} props - Component props
 * @param {Function} props.onModeSelect - Callback when game mode is selected
 * @returns {JSX.Element} GameModeSelection component
 */
const GameModeSelection = ({ onModeSelect }) => {
  const [selectedMode, setSelectedMode] = useState(null);
  const [difficulty, setDifficulty] = useState("medium");
  const [isLoading, setIsLoading] = useState(false);

  const handleModeSelect = (mode) => {
    setSelectedMode(mode);
    // For both modes, proceed immediately
    handleStartGame(mode);
  };

  const handleStartGame = async (mode) => {
    setIsLoading(true);

    try {
      // Call the mode selection callback
      onModeSelect(mode, mode === "ai" ? difficulty : undefined);
    } catch (error) {
      console.error("Error starting game:", error);
      alert("Failed to start game. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDifficultyChange = (e) => {
    setDifficulty(e.target.value);
  };

  const resetSelection = () => {
    setSelectedMode(null);
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.title}>♟️ React Chess Game</h1>
        <p className={styles.subtitle}>Choose your game mode</p>

        <div className={styles.modeButtons}>
          <button
            className={`${styles.modeButton} ${styles.pvpButton} ${
              selectedMode === "pvp" ? styles.selected : ""
            }`}
            onClick={() => handleModeSelect("pvp")}
            disabled={isLoading}
          >
            <span className={styles.modeIcon}>👥</span>
            <span className={styles.modeTitle}>Player vs Player</span>
            <span className={styles.modeDescription}>
              Play chess against another human player
            </span>
          </button>

          <button
            className={`${styles.modeButton} ${styles.aiButton} ${
              selectedMode === "ai" ? styles.selected : ""
            }`}
            onClick={() => handleModeSelect("ai")}
            disabled={isLoading}
          >
            <span className={styles.modeIcon}>🤖</span>
            <span className={styles.modeTitle}>Player vs AI</span>
            <span className={styles.modeDescription}>
              Challenge our AI opponent powered by Google Gemini
            </span>
          </button>
        </div>

        {selectedMode === "ai" && (
          <div className={styles.apiKeySection}>
            <h3 className={styles.sectionTitle}>AI Configuration</h3>

            <div className={styles.difficultySection}>
              <label htmlFor="difficulty" className={styles.label}>
                AI Difficulty:
              </label>
              <select
                id="difficulty"
                value={difficulty}
                onChange={handleDifficultyChange}
                className={styles.select}
                disabled={isLoading}
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>

            <div className={styles.aiInfo}>
              <p className={styles.aiDescription}>
                🤖 Play against our AI opponent with intelligent move selection
                based on difficulty level.
              </p>
              <p className={styles.aiNote}>
                <strong>Note:</strong> AI moves are calculated using advanced
                chess algorithms and fallback strategies.
              </p>
            </div>

            <div className={styles.actionButtons}>
              <button
                className={styles.startButton}
                onClick={() => handleStartGame("ai")}
                disabled={isLoading}
              >
                {isLoading ? "Starting..." : "Start AI Game"}
              </button>
              <button
                className={styles.backButton}
                onClick={resetSelection}
                disabled={isLoading}
              >
                Back
              </button>
            </div>
          </div>
        )}

        {selectedMode === "pvp" && (
          <div className={styles.actionButtons}>
            <button
              className={styles.startButton}
              onClick={() => handleStartGame("pvp")}
              disabled={isLoading}
            >
              {isLoading ? "Starting..." : "Start PvP Game"}
            </button>
            <button
              className={styles.backButton}
              onClick={resetSelection}
              disabled={isLoading}
            >
              Back
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default GameModeSelection;
