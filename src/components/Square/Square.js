// Square component - Individual board square rendering
import React from "react";
import ChessPiece from "../ChessPiece/ChessPiece.js";
import styles from "./Square.module.css";

/**
 * Square component renders an individual chess board square
 * @param {Object} props - Component props
 * @param {Piece|null} props.piece - The chess piece on this square (if any)
 * @param {boolean} props.isLight - Whether this is a light-colored square
 * @param {boolean} props.isSelected - Whether this square is currently selected
 * @param {boolean} props.isValidMove - Whether this square is a valid move destination
 * @param {boolean} props.isInCheck - Whether this square contains a king in check
 * @param {Object|null} props.animationData - Animation data for this square
 * @param {Function} props.onAnimationEnd - Animation completion callback
 * @param {number} props.row - Row index of this square (0-7)
 * @param {number} props.col - Column index of this square (0-7)
 * @param {Function} props.onClick - Click handler function
 * @returns {JSX.Element} Square component
 */
const Square = ({
  piece,
  isLight,
  isSelected = false,
  isValidMove = false,
  isInCheck = false,
  isInvalidMove = false,
  isFocused = false,
  animationData = null,
  onAnimationEnd,
  row,
  col,
  onClick,
}) => {
  // Build CSS classes based on square state
  const squareClasses = [
    styles.square,
    isLight ? styles.lightSquare : styles.darkSquare,
    isSelected && styles.selected,
    isValidMove && styles.validMove,
    isInCheck && styles.inCheck,
    isInvalidMove && styles.invalidMove,
    isFocused && styles.focused,
  ]
    .filter(Boolean)
    .join(" ");

  // Handle click events
  const handleClick = () => {
    if (onClick) {
      onClick(row, col);
    }
  };

  // Handle keyboard events for accessibility
  const handleKeyDown = (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleClick();
    }
  };

  // Generate accessible label for screen readers
  const getAccessibleLabel = () => {
    const file = String.fromCharCode("a".charCodeAt(0) + col);
    const rank = (8 - row).toString();
    const position = `${file}${rank}`;

    if (piece) {
      return `${piece.color} ${piece.type} on ${position}${
        isSelected ? ", selected" : ""
      }${isValidMove ? ", valid move" : ""}`;
    }

    return `Empty square ${position}${isSelected ? ", selected" : ""}${
      isValidMove ? ", valid move" : ""
    }`;
  };

  // Handle animation completion
  const handleAnimationComplete = () => {
    if (onAnimationEnd && animationData) {
      const animationKey = `${row}-${col}`;
      onAnimationEnd(animationKey);
    }
  };

  // Determine if piece should be animated
  const shouldAnimatePiece = () => {
    return (
      animationData &&
      (animationData.type === "move" || animationData.type === "capture")
    );
  };

  // Get animation type for piece
  const getAnimationType = () => {
    if (!animationData) return "move";
    return animationData.type;
  };

  return (
    <div
      className={squareClasses}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={getAccessibleLabel()}
      data-testid={`square-${row}-${col}`}
    >
      {/* Regular piece rendering */}
      {piece && !animationData && (
        <ChessPiece
          type={piece.type}
          color={piece.color}
          isAnimating={false}
          isSelected={isSelected}
        />
      )}

      {/* Animated piece rendering */}
      {animationData && animationData.piece && (
        <ChessPiece
          type={animationData.piece.type}
          color={animationData.piece.color}
          isAnimating={true}
          animationType={getAnimationType()}
          onAnimationEnd={handleAnimationComplete}
        />
      )}

      {/* Valid move indicator */}
      {isValidMove && !piece && !animationData && (
        <div className={styles.moveIndicator} aria-hidden="true" />
      )}

      {/* Capture indicator for valid moves on occupied squares */}
      {isValidMove && piece && !animationData && (
        <div className={styles.captureIndicator} aria-hidden="true" />
      )}
    </div>
  );
};

export default Square;
