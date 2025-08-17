// MoveHistory component - Display move history panel
import React, { useRef, useEffect } from "react";
import { PIECE_COLORS } from "../../constants/gameConstants.js";
import styles from "./MoveHistory.module.css";

/**
 * MoveHistory Component
 * Displays a scrollable list of moves in algebraic notation
 */
const MoveHistory = ({ moves = [], currentMoveIndex = -1 }) => {
  const historyRef = useRef(null);

  // Auto-scroll to the latest move when new moves are added
  useEffect(() => {
    if (historyRef.current && moves.length > 0) {
      historyRef.current.scrollTop = historyRef.current.scrollHeight;
    }
  }, [moves.length]);

  // Group moves by pairs (white and black moves)
  const movePairs = [];
  for (let i = 0; i < moves.length; i += 2) {
    const whiteMove = moves[i];
    const blackMove = moves[i + 1] || null;
    movePairs.push({ white: whiteMove, black: blackMove });
  }

  return (
    <div
      className={styles.moveHistory}
      role="region"
      aria-label="Chess move history"
    >
      <div className={styles.header}>
        <h3 id="move-history-title">Move History</h3>
      </div>

      <div
        className={styles.moveList}
        ref={historyRef}
        role="log"
        aria-live="polite"
        aria-labelledby="move-history-title"
        tabIndex={0}
      >
        {movePairs.length === 0 ? (
          <div className={styles.emptyState} role="status">
            No moves yet
          </div>
        ) : (
          movePairs.map((pair, index) => (
            <div key={index} className={styles.movePair} role="listitem">
              <span
                className={styles.moveNumber}
                aria-label={`Move ${index + 1}`}
              >
                {index + 1}.
              </span>

              <div className={styles.moves}>
                {pair.white && (
                  <span
                    className={`${styles.move} ${styles.whiteMove} ${
                      currentMoveIndex === index * 2 ? styles.currentMove : ""
                    }`}
                    aria-label={`White's move: ${pair.white.notation}`}
                  >
                    {pair.white.notation}
                  </span>
                )}

                {pair.black && (
                  <span
                    className={`${styles.move} ${styles.blackMove} ${
                      currentMoveIndex === index * 2 + 1
                        ? styles.currentMove
                        : ""
                    }`}
                    aria-label={`Black's move: ${pair.black.notation}`}
                  >
                    {pair.black.notation}
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {moves.length > 0 && (
        <div className={styles.footer}>
          <span className={styles.moveCount}>
            {moves.length} move{moves.length !== 1 ? "s" : ""}
          </span>
        </div>
      )}
    </div>
  );
};

export default MoveHistory;
