// ChessPiece component - Render individual chess pieces
import React, { useState, useEffect } from "react";
import {
  UNICODE_PIECES,
  PIECE_TYPES,
  PIECE_COLORS,
  isValidPieceType,
  isValidPieceColor,
} from "../../constants/gameConstants.js";
import styles from "./ChessPiece.module.css";

/**
 * ChessPiece component renders a chess piece using Unicode symbols
 * @param {Object} props - Component props
 * @param {string} props.type - Piece type (pawn, rook, knight, bishop, queen, king)
 * @param {string} props.color - Piece color (white, black)
 * @param {boolean} props.isAnimating - Whether the piece is currently animating
 * @param {boolean} props.isSelected - Whether the piece is currently selected
 * @param {boolean} props.isDragging - Whether the piece is being dragged (for future drag & drop)
 * @param {string} props.animationType - Type of animation (move, capture, appear, disappear)
 * @param {Function} props.onAnimationEnd - Callback when animation completes
 * @returns {JSX.Element} ChessPiece component
 */
const ChessPiece = ({
  type,
  color,
  isAnimating = false,
  isSelected = false,
  isDragging = false,
  animationType = "move",
  onAnimationEnd,
}) => {
  const [animationClass, setAnimationClass] = useState("");

  // Handle animation effects (must be before any early returns)
  useEffect(() => {
    if (isAnimating) {
      setAnimationClass(
        styles[
          `animate${
            animationType.charAt(0).toUpperCase() + animationType.slice(1)
          }`
        ] || styles.animating
      );

      // Set up animation end callback
      const timer = setTimeout(() => {
        setAnimationClass("");
        if (onAnimationEnd) {
          onAnimationEnd();
        }
      }, 300); // Match CSS animation duration

      return () => clearTimeout(timer);
    } else {
      setAnimationClass("");
    }
  }, [isAnimating, animationType, onAnimationEnd]);

  // Validate props (after hooks to comply with Rules of Hooks)
  if (!isValidPieceType(type) || !isValidPieceColor(color)) {
    console.warn(`Invalid piece: ${color} ${type}`);
    return null;
  }

  // Get the Unicode symbol for this piece
  const pieceSymbol = UNICODE_PIECES[color][type];

  // Build CSS classes
  const pieceClasses = [
    styles.piece,
    styles[color],
    styles[type], // Add piece-specific styling
    isSelected && styles.selected,
    isDragging && styles.dragging,
    animationClass,
  ]
    .filter(Boolean)
    .join(" ");

  // Get piece name for accessibility (handled by parent, but useful for debugging)
  const getPieceName = () => {
    const typeNames = {
      [PIECE_TYPES.PAWN]: "Pawn",
      [PIECE_TYPES.ROOK]: "Rook",
      [PIECE_TYPES.KNIGHT]: "Knight",
      [PIECE_TYPES.BISHOP]: "Bishop",
      [PIECE_TYPES.QUEEN]: "Queen",
      [PIECE_TYPES.KING]: "King",
    };

    const colorNames = {
      [PIECE_COLORS.WHITE]: "White",
      [PIECE_COLORS.BLACK]: "Black",
    };

    return `${colorNames[color]} ${typeNames[type]}`;
  };

  return (
    <span
      className={pieceClasses}
      aria-hidden="true" // Accessibility handled by parent Square component
      data-testid={`piece-${color}-${type}`}
      data-piece-name={getPieceName()}
      title={getPieceName()} // Tooltip for debugging
    >
      {pieceSymbol}
    </span>
  );
};

// Default props for better development experience
ChessPiece.defaultProps = {
  isAnimating: false,
  isSelected: false,
  isDragging: false,
  animationType: "move",
};

export default ChessPiece;
