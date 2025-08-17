// GameBoard component - Main game controller and state manager
import React, { useReducer, useCallback, useState, useEffect } from "react";
import ChessBoard from "../ChessBoard/ChessBoard.js";
import GameControls from "../GameControls/GameControls.js";
import MoveHistory from "../MoveHistory/MoveHistory.js";
import PromotionDialog from "../PromotionDialog/PromotionDialog.js";
import GameOverModal from "../GameOverModal/GameOverModal.js";
import {
  createInitialGameState,
  GAME_ACTIONS,
  PIECE_COLORS,
  PIECE_TYPES,
  getOpponentColor,
} from "../../constants/gameConstants.js";
import {
  getValidMoves,
  isLegalMove,
  makeMove,
  getGameStatus,
  getKingInCheckPosition,
  isPromotion,
} from "../../utils/gameLogic.js";
import { getPieceAt } from "../../utils/boardUtils.js";
import { createMoveHistoryEntry } from "../../utils/chessNotation.js";
import styles from "./GameBoard.module.css";

/**
 * Game state reducer function
 * Handles all game state updates through actions
 */
const gameReducer = (state, action) => {
  switch (action.type) {
    case GAME_ACTIONS.SELECT_SQUARE: {
      const { row, col } = action.payload;

      // Handle invalid positions (used for deselection)
      if (row < 0 || col < 0 || row >= 8 || col >= 8) {
        return {
          ...state,
          selectedSquare: null,
          validMoves: [],
        };
      }

      const piece = getPieceAt(state.board, row, col);

      // If no piece is currently selected
      if (!state.selectedSquare) {
        // Only allow selection of current player's pieces
        if (piece && piece.color === state.currentPlayer) {
          const validMoves = getValidMoves(state.board, row, col);
          return {
            ...state,
            selectedSquare: [row, col],
            validMoves: validMoves.map((move) => [move.row, move.col]),
          };
        }

        // Clicking on empty square or opponent's piece - do nothing
        return state;
      }

      // If a piece is already selected
      const [selectedRow, selectedCol] = state.selectedSquare;

      // If clicking on the same square, deselect
      if (selectedRow === row && selectedCol === col) {
        return {
          ...state,
          selectedSquare: null,
          validMoves: [],
        };
      }

      // If clicking on another piece of the same color, select that piece instead
      if (piece && piece.color === state.currentPlayer) {
        const validMoves = getValidMoves(state.board, row, col);
        return {
          ...state,
          selectedSquare: [row, col],
          validMoves: validMoves.map((move) => [move.row, move.col]),
        };
      }

      // If clicking on a valid move destination (empty square or opponent piece)
      const isValidDestination = state.validMoves.some(
        ([moveRow, moveCol]) => moveRow === row && moveCol === col
      );

      if (isValidDestination) {
        // Valid move destination - clear selection and let the animation handler execute the move
        return {
          ...state,
          selectedSquare: null,
          validMoves: [],
        };
      }

      // Invalid destination - clear selection
      return {
        ...state,
        selectedSquare: null,
        validMoves: [],
      };
    }

    case GAME_ACTIONS.MAKE_MOVE: {
      const { fromRow, fromCol, toRow, toCol } = action.payload;

      // Validate the move is legal
      if (!isLegalMove(state.board, fromRow, fromCol, toRow, toCol)) {
        return state;
      }

      // Check if this move would result in pawn promotion
      if (isPromotion(state.board, fromRow, fromCol, toRow, toCol)) {
        // Start promotion process
        return {
          ...state,
          promotionState: {
            fromRow,
            fromCol,
            toRow,
            toCol,
            playerColor: state.currentPlayer,
          },
          selectedSquare: null,
          validMoves: [],
        };
      }

      // Execute the move normally
      const moveResult = makeMove(state.board, fromRow, fromCol, toRow, toCol);
      const newPlayer = getOpponentColor(state.currentPlayer);
      const newGameStatus = getGameStatus(moveResult.newBoard, newPlayer);

      // Create move history entry with algebraic notation
      const moveNumber = Math.floor(state.moveHistory.length / 2) + 1;
      const moveHistoryEntry = createMoveHistoryEntry(
        moveResult.move,
        state.board,
        moveResult.newBoard,
        state.currentPlayer,
        moveNumber
      );

      return {
        ...state,
        board: moveResult.newBoard,
        currentPlayer: newPlayer,
        selectedSquare: null,
        validMoves: [],
        moveHistory: [...state.moveHistory, moveHistoryEntry],
        gameStatus: newGameStatus,
      };
    }

    case GAME_ACTIONS.RESET_GAME: {
      return createInitialGameState();
    }

    case GAME_ACTIONS.SET_GAME_STATUS: {
      return {
        ...state,
        gameStatus: action.payload.status,
      };
    }

    case GAME_ACTIONS.SET_BOARD_STATE: {
      return {
        ...state,
        board: action.payload.board,
        currentPlayer: action.payload.currentPlayer,
        gameStatus: action.payload.gameStatus,
        selectedSquare: null,
        validMoves: [],
      };
    }

    case GAME_ACTIONS.START_PROMOTION: {
      return {
        ...state,
        promotionState: action.payload,
        selectedSquare: null,
        validMoves: [],
      };
    }

    case GAME_ACTIONS.COMPLETE_PROMOTION: {
      const { promotionPiece } = action.payload;
      const { fromRow, fromCol, toRow, toCol } = state.promotionState;

      // Execute the move with the selected promotion piece
      const moveResult = makeMove(
        state.board,
        fromRow,
        fromCol,
        toRow,
        toCol,
        promotionPiece
      );

      const newPlayer = getOpponentColor(state.currentPlayer);
      const newGameStatus = getGameStatus(moveResult.newBoard, newPlayer);

      // Create move history entry
      const moveNumber = Math.floor(state.moveHistory.length / 2) + 1;
      const moveHistoryEntry = createMoveHistoryEntry(
        moveResult.move,
        state.board,
        moveResult.newBoard,
        state.currentPlayer,
        moveNumber
      );

      return {
        ...state,
        board: moveResult.newBoard,
        currentPlayer: newPlayer,
        gameStatus: newGameStatus,
        promotionState: null,
        moveHistory: [...state.moveHistory, moveHistoryEntry],
      };
    }

    case GAME_ACTIONS.CANCEL_PROMOTION: {
      return {
        ...state,
        promotionState: null,
      };
    }

    default:
      return state;
  }
};

/**
 * GameBoard Component
 * Main game controller that manages game state and coordinates child components
 */
const GameBoard = () => {
  // Initialize game state with useReducer
  const [gameState, dispatch] = useReducer(
    gameReducer,
    null,
    createInitialGameState
  );

  // State for visual feedback on invalid moves
  const [invalidMoveAttempt, setInvalidMoveAttempt] = useState(null);

  // State for piece animations
  const [animatingPieces, setAnimatingPieces] = useState(new Map());
  const [movingPiece, setMovingPiece] = useState(null);

  // State for keyboard navigation
  const [focusedSquare, setFocusedSquare] = useState([0, 0]);

  // Handle square clicks from the chess board
  const handleSquareClick = useCallback(
    (row, col) => {
      // Don't allow moves if game is over
      if (
        gameState.gameStatus === "checkmate" ||
        gameState.gameStatus === "stalemate"
      ) {
        return;
      }

      // If no piece is selected, try to select a piece
      if (!gameState.selectedSquare) {
        dispatch({
          type: GAME_ACTIONS.SELECT_SQUARE,
          payload: { row, col },
        });
        return;
      }

      const [selectedRow, selectedCol] = gameState.selectedSquare;

      // If clicking on the same square, deselect
      if (selectedRow === row && selectedCol === col) {
        dispatch({
          type: GAME_ACTIONS.SELECT_SQUARE,
          payload: { row: -1, col: -1 }, // Invalid position to clear selection
        });
        return;
      }

      // Check if this is a valid move destination
      const isValidDestination = gameState.validMoves.some(
        ([moveRow, moveCol]) => moveRow === row && moveCol === col
      );

      if (isValidDestination) {
        // Clear any previous invalid move feedback
        setInvalidMoveAttempt(null);

        // Start piece movement animation
        const piece = getPieceAt(gameState.board, selectedRow, selectedCol);
        const capturedPiece = getPieceAt(gameState.board, row, col);

        // Set up animation state
        setMovingPiece({
          piece,
          fromRow: selectedRow,
          fromCol: selectedCol,
          toRow: row,
          toCol: col,
          isCapture: !!capturedPiece,
        });

        // Add animation for moving piece
        const movingKey = `${selectedRow}-${selectedCol}`;
        const newAnimatingPieces = new Map(animatingPieces);
        newAnimatingPieces.set(movingKey, {
          type: "move",
          piece,
          fromRow: selectedRow,
          fromCol: selectedCol,
          toRow: row,
          toCol: col,
        });

        // Add animation for captured piece if any
        if (capturedPiece) {
          const capturedKey = `${row}-${col}`;
          newAnimatingPieces.set(capturedKey, {
            type: "capture",
            piece: capturedPiece,
            row,
            col,
          });
        }

        setAnimatingPieces(newAnimatingPieces);

        // Execute the move immediately
        dispatch({
          type: GAME_ACTIONS.MAKE_MOVE,
          payload: {
            fromRow: selectedRow,
            fromCol: selectedCol,
            toRow: row,
            toCol: col,
          },
        });
      } else {
        // Check if this was an invalid move attempt (not selecting a new piece)
        const piece = getPieceAt(gameState.board, row, col);
        const isSelectingNewPiece =
          piece && piece.color === gameState.currentPlayer;

        if (!isSelectingNewPiece) {
          // Show visual feedback for invalid move
          setInvalidMoveAttempt({ row, col });

          // Clear the feedback after a short delay
          setTimeout(() => {
            setInvalidMoveAttempt(null);
          }, 1000);
        }

        // Try to select a new piece (or clear selection if invalid)
        dispatch({
          type: GAME_ACTIONS.SELECT_SQUARE,
          payload: { row, col },
        });
      }
    },
    [gameState.selectedSquare, gameState.validMoves, gameState.gameStatus]
  );

  // Handle animation completion
  const handleAnimationEnd = useCallback((animationKey) => {
    setAnimatingPieces((prev) => {
      const newMap = new Map(prev);
      newMap.delete(animationKey);
      return newMap;
    });
  }, []);

  // Clear moving piece state when animations complete
  useEffect(() => {
    if (animatingPieces.size === 0 && movingPiece) {
      setMovingPiece(null);
    }
  }, [animatingPieces.size, movingPiece]);

  // Handle game reset
  const handleReset = useCallback(() => {
    // Clear all animations
    setAnimatingPieces(new Map());
    setMovingPiece(null);
    setInvalidMoveAttempt(null);
    setFocusedSquare([0, 0]);

    dispatch({ type: GAME_ACTIONS.RESET_GAME });
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (event) => {
      // Don't handle keyboard if game is over
      if (
        gameState.gameStatus === "checkmate" ||
        gameState.gameStatus === "stalemate"
      ) {
        return;
      }

      const [focusRow, focusCol] = focusedSquare;
      let newRow = focusRow;
      let newCol = focusCol;

      switch (event.key) {
        case "ArrowUp":
          event.preventDefault();
          newRow = Math.max(0, focusRow - 1);
          break;
        case "ArrowDown":
          event.preventDefault();
          newRow = Math.min(7, focusRow + 1);
          break;
        case "ArrowLeft":
          event.preventDefault();
          newCol = Math.max(0, focusCol - 1);
          break;
        case "ArrowRight":
          event.preventDefault();
          newCol = Math.min(7, focusCol + 1);
          break;
        case "Enter":
        case " ":
          event.preventDefault();
          handleSquareClick(focusRow, focusCol);
          return;
        case "Escape":
          event.preventDefault();
          // Clear selection
          dispatch({
            type: GAME_ACTIONS.SELECT_SQUARE,
            payload: { row: -1, col: -1 },
          });
          return;
        // Debug feature: Press 'M' to set up a checkmate scenario
        case "M":
        case "m":
          if (process.env.NODE_ENV === "development") {
            event.preventDefault();
            // Set up a simple checkmate scenario for testing
            const checkmateBoard = Array(8)
              .fill(null)
              .map(() => Array(8).fill(null));
            checkmateBoard[0][0] = {
              type: PIECE_TYPES.KING,
              color: PIECE_COLORS.BLACK,
            };
            checkmateBoard[1][1] = {
              type: PIECE_TYPES.QUEEN,
              color: PIECE_COLORS.WHITE,
            };
            checkmateBoard[2][1] = {
              type: PIECE_TYPES.KING,
              color: PIECE_COLORS.WHITE,
            };

            const newGameStatus = getGameStatus(
              checkmateBoard,
              PIECE_COLORS.BLACK
            );

            dispatch({
              type: GAME_ACTIONS.SET_BOARD_STATE,
              payload: {
                board: checkmateBoard,
                currentPlayer: PIECE_COLORS.BLACK,
                gameStatus: newGameStatus,
              },
            });
          }
          return;
        // Debug feature: Press 'P' to set up a pawn promotion scenario
        case "P":
        case "p":
          if (process.env.NODE_ENV === "development") {
            event.preventDefault();
            // Set up a pawn promotion scenario for testing
            const promotionBoard = Array(8)
              .fill(null)
              .map(() => Array(8).fill(null));

            // White pawn ready to promote on 7th rank
            promotionBoard[1][4] = {
              type: PIECE_TYPES.PAWN,
              color: PIECE_COLORS.WHITE,
            };

            // Kings for valid game state
            promotionBoard[0][0] = {
              type: PIECE_TYPES.KING,
              color: PIECE_COLORS.BLACK,
            };
            promotionBoard[7][7] = {
              type: PIECE_TYPES.KING,
              color: PIECE_COLORS.WHITE,
            };

            dispatch({
              type: GAME_ACTIONS.SET_BOARD_STATE,
              payload: {
                board: promotionBoard,
                currentPlayer: PIECE_COLORS.WHITE,
                gameStatus: "playing",
              },
            });
          }
          return;
        default:
          return;
      }

      setFocusedSquare([newRow, newCol]);
    },
    [focusedSquare, gameState.gameStatus, handleSquareClick]
  );

  // Add keyboard event listener
  useEffect(() => {
    const gameBoard = document.querySelector('[data-testid="game-board"]');
    if (gameBoard) {
      gameBoard.addEventListener("keydown", handleKeyDown);
      return () => {
        gameBoard.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [handleKeyDown]);

  // Handle promotion piece selection
  const handlePromotionSelect = useCallback((pieceType) => {
    dispatch({
      type: GAME_ACTIONS.COMPLETE_PROMOTION,
      payload: { promotionPiece: pieceType },
    });
  }, []);

  // Handle promotion cancellation (not recommended)
  const handlePromotionCancel = useCallback(() => {
    dispatch({ type: GAME_ACTIONS.CANCEL_PROMOTION });
  }, []);

  // Get king position if in check for visual indication
  const kingInCheckPosition = getKingInCheckPosition(
    gameState.board,
    gameState.currentPlayer
  );

  return (
    <div
      className={styles.gameBoard}
      data-testid="game-board"
      tabIndex={0}
      role="application"
      aria-label="Chess game board with keyboard navigation. Use arrow keys to navigate, Enter or Space to select, Escape to clear selection."
    >
      <div className={styles.boardSection}>
        <ChessBoard
          board={gameState.board}
          selectedSquare={gameState.selectedSquare}
          validMoves={gameState.validMoves}
          kingInCheck={
            kingInCheckPosition
              ? [kingInCheckPosition.row, kingInCheckPosition.col]
              : null
          }
          invalidMoveAttempt={invalidMoveAttempt}
          animatingPieces={animatingPieces}
          movingPiece={movingPiece}
          focusedSquare={focusedSquare}
          onSquareClick={handleSquareClick}
          onAnimationEnd={handleAnimationEnd}
        />
      </div>

      <div className={styles.sidePanel}>
        <GameControls
          gameStatus={gameState.gameStatus}
          currentPlayer={gameState.currentPlayer}
          onReset={handleReset}
        />

        <MoveHistory
          moves={gameState.moveHistory}
          currentMoveIndex={gameState.moveHistory.length - 1}
        />
      </div>

      {/* Promotion Dialog */}
      <PromotionDialog
        isVisible={!!gameState.promotionState}
        playerColor={gameState.promotionState?.playerColor}
        onPromotionSelect={handlePromotionSelect}
        onCancel={handlePromotionCancel}
      />

      {/* Game Over Modal */}
      <GameOverModal
        gameStatus={gameState.gameStatus}
        currentPlayer={gameState.currentPlayer}
        onReset={handleReset}
        isVisible={
          gameState.gameStatus === "checkmate" ||
          gameState.gameStatus === "stalemate"
        }
      />
    </div>
  );
};

export default GameBoard;
