// PromotionDialog component - Pawn promotion piece selection
import React from "react";
import ChessPiece from "../ChessPiece/ChessPiece.js";
import { PIECE_TYPES, PIECE_COLORS } from "../../constants/gameConstants.js";
import styles from "./PromotionDialog.module.css";

/**
 * PromotionDialog Component
 * Displays a modal dialog for selecting pawn promotion piece
 */
const PromotionDialog = ({
  isVisible = false,
  playerColor = PIECE_COLORS.WHITE,
  onPromotionSelect,
  onCancel,
}) => {
  // Available promotion pieces
  const promotionPieces = [
    PIECE_TYPES.QUEEN,
    PIECE_TYPES.ROOK,
    PIECE_TYPES.BISHOP,
    PIECE_TYPES.KNIGHT,
  ];

  // Handle piece selection
  const handlePieceSelect = (pieceType) => {
    if (onPromotionSelect) {
      onPromotionSelect(pieceType);
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (event, pieceType) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handlePieceSelect(pieceType);
    } else if (event.key === "Escape") {
      event.preventDefault();
      if (onCancel) {
        onCancel();
      }
    }
  };

  // Don't render if not visible
  if (!isVisible) {
    return null;
  }

  return (
    <div
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      aria-labelledby="promotion-title"
    >
      <div className={styles.dialog}>
        <div className={styles.header}>
          <h3 id="promotion-title" className={styles.title}>
            Choose Promotion Piece
          </h3>
          <p className={styles.subtitle}>
            Select which piece your pawn should become:
          </p>
        </div>

        <div
          className={styles.pieceGrid}
          role="group"
          aria-label="Promotion piece options"
        >
          {promotionPieces.map((pieceType) => (
            <button
              key={pieceType}
              className={styles.pieceButton}
              onClick={() => handlePieceSelect(pieceType)}
              onKeyDown={(e) => handleKeyDown(e, pieceType)}
              aria-label={`Promote to ${pieceType}`}
              autoFocus={pieceType === PIECE_TYPES.QUEEN} // Focus queen by default
            >
              <div className={styles.pieceContainer}>
                <ChessPiece
                  type={pieceType}
                  color={playerColor}
                  isAnimating={false}
                  isSelected={false}
                />
              </div>
              <span className={styles.pieceLabel}>
                {pieceType.charAt(0).toUpperCase() + pieceType.slice(1)}
              </span>
            </button>
          ))}
        </div>

        <div className={styles.footer}>
          <p className={styles.instruction}>
            Click on a piece or use keyboard navigation
          </p>
          {onCancel && (
            <button
              className={styles.cancelButton}
              onClick={onCancel}
              aria-label="Cancel promotion (not recommended)"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PromotionDialog;
