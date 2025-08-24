// ChessBoard component - Renders the 8x8 chess board grid
import React from "react";
import Square from "../Square/Square.js";
import {
  BOARD_SIZE,
  isValidPosition,
  isSamePosition,
} from "../../constants/gameConstants.js";
import styles from "./ChessBoard.module.css";

/**
 * ChessBoard component renders the complete 8x8 chess board
 * @param {Object} props - Component props
 * @param {(Piece|null)[][]} props.board - 8x8 array representing the board state
 * @param {number[]|null} props.selectedSquare - Currently selected square [row, col]
 * @param {number[][]} props.validMoves - Array of valid move positions [[row, col], ...]
 * @param {number[]|null} props.kingInCheck - Position of king in check [row, col]
 * @param {Map} props.animatingPieces - Map of animating pieces by position key
 * @param {Object|null} props.movingPiece - Currently moving piece data
 * @param {Function} props.onSquareClick - Click handler for squares (row, col) => void
 * @param {Function} props.onAnimationEnd - Animation completion callback
 * @param {boolean} props.isFlipped - Whether to flip the board (black perspective)
 * @returns {JSX.Element} ChessBoard component
 */
const ChessBoard = ({
  board,
  selectedSquare = null,
  validMoves = [],
  kingInCheck = null,
  invalidMoveAttempt = null,
  animatingPieces = new Map(),
  movingPiece = null,
  focusedSquare = null,
  gameMode = "pvp",
  currentPlayer = "white",
  isAIThinking = false,
  onSquareClick,
  onAnimationEnd,
  isFlipped = false,
}) => {
  // Validate board prop
  if (!board || !Array.isArray(board) || board.length !== BOARD_SIZE) {
    console.error("ChessBoard: Invalid board prop - must be 8x8 array");
    return <div className={styles.error}>Invalid board state</div>;
  }

  // Check if a square is selected
  const isSquareSelected = (row, col) => {
    return selectedSquare && isSamePosition([row, col], selectedSquare);
  };

  // Check if a square is a valid move destination
  const isValidMoveSquare = (row, col) => {
    return validMoves.some((move) => isSamePosition([row, col], move));
  };

  // Check if a square contains a king in check
  const isKingInCheckSquare = (row, col) => {
    return kingInCheck && isSamePosition([row, col], kingInCheck);
  };

  // Check if a square is an invalid move attempt
  const isInvalidMoveSquare = (row, col) => {
    return (
      invalidMoveAttempt &&
      isSamePosition(
        [row, col],
        [invalidMoveAttempt.row, invalidMoveAttempt.col]
      )
    );
  };

  // Check if a square is currently focused for keyboard navigation
  const isFocusedSquare = (row, col) => {
    return focusedSquare && isSamePosition([row, col], focusedSquare);
  };

  // Get animation data for a piece at a specific position
  const getAnimationData = (row, col) => {
    const key = `${row}-${col}`;
    return animatingPieces.get(key) || null;
  };

  // Check if a piece should be hidden during animation
  const shouldHidePiece = (row, col) => {
    // Hide piece at source position during move animation
    if (
      movingPiece &&
      movingPiece.fromRow === row &&
      movingPiece.fromCol === col
    ) {
      return true;
    }

    // Hide piece being captured during capture animation
    const animData = getAnimationData(row, col);
    return animData && animData.type === "capture";
  };

  // Determine if a square should be light or dark
  const isLightSquare = (row, col) => {
    return (row + col) % 2 === 0;
  };

  // Handle square click events
  const handleSquareClick = (row, col) => {
    if (onSquareClick) {
      onSquareClick(row, col);
    }
  };

  // Generate the board squares
  const renderSquares = () => {
    const squares = [];

    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        // Calculate display position (flip board if needed)
        const displayRow = isFlipped ? BOARD_SIZE - 1 - row : row;
        const displayCol = isFlipped ? BOARD_SIZE - 1 - col : col;

        // Get piece at this position
        let piece = board[row] && board[row][col] ? board[row][col] : null;

        // Hide piece if it's being animated
        if (shouldHidePiece(row, col)) {
          piece = null;
        }

        // Get animation data for this square
        const animationData = getAnimationData(row, col);

        // Create unique key for React
        const key = `square-${row}-${col}`;

        squares.push(
          <Square
            key={key}
            piece={piece}
            row={row}
            col={col}
            isLight={isLightSquare(displayRow, displayCol)}
            isSelected={isSquareSelected(row, col)}
            isValidMove={isValidMoveSquare(row, col)}
            isInCheck={isKingInCheckSquare(row, col)}
            isInvalidMove={isInvalidMoveSquare(row, col)}
            isFocused={isFocusedSquare(row, col)}
            animationData={animationData}
            gameMode={gameMode}
            currentPlayer={currentPlayer}
            isAIThinking={isAIThinking}
            onAnimationEnd={onAnimationEnd}
            onClick={handleSquareClick}
          />
        );
      }
    }

    return squares;
  };

  // Generate rank labels (1-8)
  const renderRankLabels = () => {
    const labels = [];
    for (let rank = 1; rank <= 8; rank++) {
      const displayRank = isFlipped ? rank : 9 - rank;
      labels.push(
        <div key={`rank-${rank}`} className={styles.rankLabel}>
          {displayRank}
        </div>
      );
    }
    return labels;
  };

  // Generate file labels (a-h)
  const renderFileLabels = () => {
    const labels = [];
    for (let file = 0; file < 8; file++) {
      const letter = String.fromCharCode("a".charCodeAt(0) + file);
      const displayLetter = isFlipped
        ? String.fromCharCode("h".charCodeAt(0) - file)
        : letter;
      labels.push(
        <div key={`file-${letter}`} className={styles.fileLabel}>
          {displayLetter}
        </div>
      );
    }
    return labels;
  };

  // Build CSS classes for the board container
  const boardClasses = [
    styles.chessBoard,
    isFlipped && styles.flipped,
    gameMode === "ai" && styles.aiMode,
    gameMode === "ai" && isAIThinking && styles.aiThinking,
    gameMode === "ai" && currentPlayer === "black" && styles.aiTurn,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={`${styles.chessBoardContainer} ${
        gameMode === "ai" ? styles.aiModeContainer : styles.pvpModeContainer
      }`}
    >
      {/* Mode indicator overlay */}
      {gameMode === "ai" && (
        <div className={styles.modeIndicator}>
          <div
            className={`${styles.modeIcon} ${
              isAIThinking ? styles.thinking : ""
            }`}
          >
            {currentPlayer === "black" && gameMode === "ai" ? "🤖" : "👤"}
          </div>
          {isAIThinking && (
            <div className={styles.aiThinkingOverlay}>
              <div className={styles.thinkingPulse}></div>
            </div>
          )}
        </div>
      )}

      {/* Rank labels (left side) */}
      <div className={styles.rankLabels}>{renderRankLabels()}</div>

      {/* Main board */}
      <div className={styles.boardWrapper}>
        <div
          className={boardClasses}
          role="grid"
          aria-label={`Chess board - ${gameMode === "ai" ? "AI" : "PvP"} mode`}
          data-testid="chess-board"
          data-game-mode={gameMode}
          data-current-player={currentPlayer}
          data-ai-thinking={isAIThinking}
        >
          {renderSquares()}
        </div>

        {/* File labels (bottom) */}
        <div className={styles.fileLabels}>{renderFileLabels()}</div>
      </div>

      {/* Rank labels (right side) for symmetry */}
      <div className={styles.rankLabels}>{renderRankLabels()}</div>
    </div>
  );
};

export default ChessBoard;
