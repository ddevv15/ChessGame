import React, { useState, useCallback } from "react";
import GameBoard from "./components/GameBoard/GameBoard.js";
import GameModeSelection from "./components/GameModeSelection/GameModeSelection.js";
import { GAME_MODES } from "./constants/gameConstants";
import "./styles/globals.css";
import "./App.css";

/**
 * Main App Component
 * Root component that provides the global layout and renders the chess game
 * Now includes game mode selection and routing between PvP and AI modes
 */
function App() {
  const [gameMode, setGameMode] = useState(null);
  const [aiDifficulty, setAiDifficulty] = useState("medium");

  const handleModeSelect = useCallback((mode, difficulty) => {
    setGameMode(mode);
    if (difficulty) {
      setAiDifficulty(difficulty);
    }
  }, []);

  const handleBackToModeSelection = useCallback(() => {
    setGameMode(null);
  }, []);

  const renderContent = () => {
    if (!gameMode) {
      return <GameModeSelection onModeSelect={handleModeSelect} />;
    }

    return (
      <GameBoard
        gameMode={gameMode}
        aiDifficulty={aiDifficulty}
        onBackToModeSelection={handleBackToModeSelection}
      />
    );
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1 className="App-title">Chess Game</h1>
        {gameMode && (
          <div className="App-mode-info">
            <span className="App-mode-badge">
              {gameMode === GAME_MODES.PVP ? "👥 PvP" : "🤖 AI"}
            </span>
            {gameMode === GAME_MODES.AI && (
              <span className="App-difficulty-badge">
                {aiDifficulty.charAt(0).toUpperCase() + aiDifficulty.slice(1)}
              </span>
            )}
          </div>
        )}
      </header>

      <main className="App-main">{renderContent()}</main>

      <footer className="App-footer">
        <p className="App-credits">
          Built with React • Chess Rules Implemented
          {gameMode === GAME_MODES.AI && " • Powered by Intelligent AI"}
        </p>
      </footer>
    </div>
  );
}

export default App;
