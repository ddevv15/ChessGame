// GameBoard component - Main game controller and state manager
import React, { useReducer, useCallback, useState, useEffect } from "react";
import ChessBoard from "../ChessBoard/ChessBoard.js";
import GameControls from "../GameControls/GameControls.js";
import MoveHistory from "../MoveHistory/MoveHistory.js";
import PromotionDialog from "../PromotionDialog/PromotionDialog.js";
import GameOverModal from "../GameOverModal/GameOverModal.js";
import AIThinkingIndicator from "../AIThinkingIndicator/AIThinkingIndicator.js";
import ErrorModal from "../ErrorModal/ErrorModal.js";
import {
  createInitialGameState,
  GAME_ACTIONS,
  PIECE_COLORS,
  PIECE_TYPES,
  GAME_MODES,
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
import { getAIMove } from "../../utils/aiService.js";
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
const GameBoard = ({
  gameMode,
  aiDifficulty,
  onBackToModeSelection,
  onModeChange,
}) => {
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

  // AI-related state
  const [isAIThinking, setIsAIThinking] = useState(false);
  const [aiThinkingStartTime, setAiThinkingStartTime] = useState(null);

  // Error handling state
  const [currentError, setCurrentError] = useState(null);
  const [errorHistory, setErrorHistory] = useState([]);
  const [aiRetryCount, setAiRetryCount] = useState(0);
  const [isRecoveringFromError, setIsRecoveringFromError] = useState(false);

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

    // Clear error state
    setCurrentError(null);
    setErrorHistory([]);
    setAiRetryCount(0);
    setIsRecoveringFromError(false);
    setIsAIThinking(false);
    setAiThinkingStartTime(null);

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

  // Error handling callbacks
  const handleAIError = useCallback(
    (errorResult) => {
      console.error("AI Error:", errorResult);

      // Add to error history
      setErrorHistory((prev) => [
        ...prev,
        {
          ...errorResult,
          timestamp: Date.now(),
          gameState: {
            currentPlayer: gameState.currentPlayer,
            moveCount: gameState.moveHistory.length,
          },
        },
      ]);

      // Show error modal for critical errors or repeated failures
      if (errorResult.severity === "critical" || aiRetryCount >= 2) {
        setCurrentError(errorResult.userMessage);
      }
    },
    [gameState.currentPlayer, gameState.moveHistory.length, aiRetryCount]
  );

  const handleErrorRetry = useCallback(() => {
    setCurrentError(null);
    setIsRecoveringFromError(true);
    setAiRetryCount((prev) => prev + 1);

    // Trigger AI move retry
    setTimeout(() => {
      setIsRecoveringFromError(false);
    }, 1000);
  }, []);

  const handleSwitchToPvP = useCallback(() => {
    setCurrentError(null);
    setAiRetryCount(0);
    setIsRecoveringFromError(false);

    // Switch to PvP mode
    if (onModeChange) {
      onModeChange(GAME_MODES.PVP);
    }
  }, [onModeChange]);

  const handleErrorDismiss = useCallback(() => {
    setCurrentError(null);
    setIsRecoveringFromError(false);
  }, []);

  // AI move logic - trigger AI moves in AI mode with comprehensive error handling
  useEffect(() => {
    const shouldTriggerAI =
      gameMode === GAME_MODES.AI &&
      gameState.gameStatus === "playing" &&
      gameState.currentPlayer === PIECE_COLORS.BLACK && // AI plays as black
      !isAIThinking &&
      !gameState.promotionState && // Don't trigger AI during promotion
      !currentError && // Don't trigger AI while error modal is shown
      !isRecoveringFromError; // Don't trigger during error recovery

    if (shouldTriggerAI) {
      const makeAIMove = async () => {
        setIsAIThinking(true);
        setAiThinkingStartTime(Date.now());

        try {
          // Get API key from environment
          const apiKey = process.env.REACT_APP_GEMINI_API_KEY;

          // Enhanced AI move request with error handling
          const aiMoveResult = await getAIMove(
            gameState,
            PIECE_COLORS.BLACK,
            aiDifficulty || "medium",
            apiKey,
            {
              maxRetries: Math.max(0, 3 - aiRetryCount), // Reduce retries after failures
              enableRetry: aiRetryCount < 3,
              onError: handleAIError,
            }
          );

          if (aiMoveResult.isValid && aiMoveResult.moveDetails) {
            const { from, to } = aiMoveResult.moveDetails;

            // Reset retry count on successful move
            setAiRetryCount(0);

            // Execute AI move
            dispatch({
              type: GAME_ACTIONS.MAKE_MOVE,
              payload: {
                fromRow: from[0],
                fromCol: from[1],
                toRow: to[0],
                toCol: to[1],
              },
            });

            // Log successful AI move for debugging
            if (process.env.NODE_ENV === "development") {
              console.log("AI move executed:", {
                move: aiMoveResult.sanMove,
                source: aiMoveResult.source,
                confidence: aiMoveResult.confidence,
                fallbackUsed: aiMoveResult.fallbackUsed,
              });
            }
          } else {
            // Handle AI move failure
            console.error("AI move failed:", aiMoveResult.error);

            if (aiMoveResult.userMessage) {
              handleAIError(aiMoveResult);
            }
          }
        } catch (error) {
          console.error("Critical error in AI move:", error);

          // Handle critical errors
          const criticalError = {
            title: "Critical AI Error",
            message:
              "A critical error occurred with the AI service. Would you like to switch to Player vs Player mode?",
            action: "Switch to PvP",
            canRetry: false,
            canContinue: true,
            severity: "critical",
            originalError: error.message,
            timestamp: Date.now(),
          };

          handleAIError({ userMessage: criticalError });
        } finally {
          setIsAIThinking(false);
          setAiThinkingStartTime(null);
        }
      };

      // Add a small delay to make AI thinking visible, with longer delay after errors
      const baseDelay = isRecoveringFromError ? 2000 : 500;
      const randomDelay = Math.random() * (isRecoveringFromError ? 1000 : 1500);
      const delay = Math.max(baseDelay, baseDelay + randomDelay);

      const timeoutId = setTimeout(makeAIMove, delay);

      return () => clearTimeout(timeoutId);
    }
  }, [
    gameState.currentPlayer,
    gameState.gameStatus,
    gameMode,
    aiDifficulty,
    isAIThinking,
    gameState.promotionState,
    gameState,
    currentError,
    isRecoveringFromError,
    aiRetryCount,
    handleAIError,
  ]);

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
      className={`${styles.gameBoard} ${
        gameMode === GAME_MODES.AI ? styles.aiMode : styles.pvpMode
      }`}
      data-testid="game-board"
      data-game-mode={gameMode}
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
          gameMode={gameMode}
          currentPlayer={gameState.currentPlayer}
          isAIThinking={isAIThinking}
          onSquareClick={handleSquareClick}
          onAnimationEnd={handleAnimationEnd}
        />
      </div>

      <div className={styles.sidePanel}>
        <GameControls
          gameStatus={gameState.gameStatus}
          currentPlayer={gameState.currentPlayer}
          gameMode={gameMode}
          aiDifficulty={aiDifficulty}
          isAIThinking={isAIThinking}
          onReset={handleReset}
          onBackToModeSelection={onBackToModeSelection}
          onModeChange={onModeChange}
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

      {/* AI Thinking Indicator */}
      {gameMode === GAME_MODES.AI && (
        <AIThinkingIndicator
          isVisible={isAIThinking}
          thinkingStartTime={aiThinkingStartTime}
          difficulty={aiDifficulty}
        />
      )}

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

      {/* Error Modal */}
      <ErrorModal
        isVisible={!!currentError}
        error={currentError}
        onRetry={handleErrorRetry}
        onSwitchToPvP={handleSwitchToPvP}
        onDismiss={handleErrorDismiss}
        onClose={handleErrorDismiss}
      />
    </div>
  );
};

export default GameBoard;
