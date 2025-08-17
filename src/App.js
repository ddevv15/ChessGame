import React from "react";
import GameBoard from "./components/GameBoard/GameBoard.js";
import "./styles/globals.css";
import "./App.css";

/**
 * Main App Component
 * Root component that provides the global layout and renders the chess game
 */
function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1 className="App-title">Chess Game</h1>
      </header>

      <main className="App-main">
        <GameBoard />
      </main>

      <footer className="App-footer">
        <p className="App-credits">
          Built with React • Chess Rules Implemented
        </p>
      </footer>
    </div>
  );
}

export default App;
