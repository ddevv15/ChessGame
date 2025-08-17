// Chess notation utilities - Convert moves to algebraic notation
import { PIECE_TYPES, PIECE_COLORS } from "../constants/gameConstants.js";
import {
  positionToAlgebraic,
  getPieceAt,
  findPieces,
  isOnSameRank,
  isOnSameFile,
} from "./boardUtils.js";
import {
  isKingInCheck,
  isCheckmate,
  isStalemate,
  getAllLegalMovesForColor,
} from "./gameLogic.js";

/**
 * Convert a piece type to its algebraic notation symbol
 * @param {string} pieceType - The piece type
 * @returns {string} The algebraic notation symbol
 */
export const pieceTypeToSymbol = (pieceType) => {
  const symbols = {
    [PIECE_TYPES.KING]: "K",
    [PIECE_TYPES.QUEEN]: "Q",
    [PIECE_TYPES.ROOK]: "R",
    [PIECE_TYPES.BISHOP]: "B",
    [PIECE_TYPES.KNIGHT]: "N",
    [PIECE_TYPES.PAWN]: "", // Pawns have no symbol in algebraic notation
  };

  return symbols[pieceType] || "";
};

/**
 * Check if disambiguation is needed for a move (multiple pieces of same type can reach destination)
 * @param {(Piece|null)[][]} board - The game board
 * @param {Object} move - The move object
 * @returns {{needsFile: boolean, needsRank: boolean}} Disambiguation requirements
 */
export const getDisambiguation = (board, move) => {
  const { from, to, piece } = move;

  // Pawns and kings never need disambiguation in basic chess
  if (piece.type === PIECE_TYPES.PAWN || piece.type === PIECE_TYPES.KING) {
    return { needsFile: false, needsRank: false };
  }

  // Find all pieces of the same type and color that could move to the same destination
  const samePieces = findPieces(board, piece.type, piece.color);
  const conflictingPieces = samePieces.filter(({ row, col }) => {
    // Skip the piece that's actually moving
    if (row === from.row && col === from.col) {
      return false;
    }

    // Check if this piece could also move to the destination
    // This is a simplified check - in a full implementation we'd use move validation
    return canPieceReachSquare(board, { row, col }, to, piece.type);
  });

  if (conflictingPieces.length === 0) {
    return { needsFile: false, needsRank: false };
  }

  // Check if file disambiguation is sufficient
  const sameFile = conflictingPieces.some(({ col }) => col === from.col);
  const sameRank = conflictingPieces.some(({ row }) => row === from.row);

  return {
    needsFile: sameRank || !sameFile,
    needsRank: sameFile && !sameRank,
  };
};

/**
 * Simplified check if a piece can reach a square (for disambiguation)
 * @param {(Piece|null)[][]} board - The game board
 * @param {{row: number, col: number}} from - Source position
 * @param {{row: number, col: number}} to - Destination position
 * @param {string} pieceType - Type of piece
 * @returns {boolean} True if piece could potentially reach the square
 */
const canPieceReachSquare = (board, from, to, pieceType) => {
  const rowDiff = Math.abs(to.row - from.row);
  const colDiff = Math.abs(to.col - from.col);

  switch (pieceType) {
    case PIECE_TYPES.ROOK:
      return (
        isOnSameRank(from.row, from.col, to.row, to.col) ||
        isOnSameFile(from.row, from.col, to.row, to.col)
      );
    case PIECE_TYPES.BISHOP:
      return rowDiff === colDiff;
    case PIECE_TYPES.QUEEN:
      return (
        rowDiff === colDiff ||
        isOnSameRank(from.row, from.col, to.row, to.col) ||
        isOnSameFile(from.row, from.col, to.row, to.col)
      );
    case PIECE_TYPES.KNIGHT:
      return (
        (rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2)
      );
    default:
      return false;
  }
};

/**
 * Convert a move to algebraic notation
 * @param {Object} move - The move object with from, to, piece, capturedPiece, etc.
 * @param {(Piece|null)[][]} board - The board state before the move
 * @param {(Piece|null)[][]} newBoard - The board state after the move
 * @param {string} currentPlayer - The color of the player making the move
 * @returns {string} The move in algebraic notation
 */
export const moveToAlgebraic = (move, board, newBoard, currentPlayer) => {
  const { from, to, piece, capturedPiece, promotedPiece } = move;

  let notation = "";

  // Handle castling (special case)
  if (piece.type === PIECE_TYPES.KING && Math.abs(to.col - from.col) === 2) {
    return to.col > from.col ? "O-O" : "O-O-O";
  }

  // Add piece symbol (except for pawns)
  if (piece.type !== PIECE_TYPES.PAWN) {
    notation += pieceTypeToSymbol(piece.type);

    // Add disambiguation if needed
    const disambiguation = getDisambiguation(board, move);
    if (disambiguation.needsFile) {
      notation += positionToAlgebraic(from.row, from.col)[0]; // file letter
    }
    if (disambiguation.needsRank) {
      notation += positionToAlgebraic(from.row, from.col)[1]; // rank number
    }
  } else if (capturedPiece) {
    // For pawn captures, include the file of departure
    notation += positionToAlgebraic(from.row, from.col)[0];
  }

  // Add capture symbol
  if (capturedPiece) {
    notation += "x";
  }

  // Add destination square
  notation += positionToAlgebraic(to.row, to.col);

  // Add promotion
  if (promotedPiece) {
    notation += "=" + pieceTypeToSymbol(promotedPiece.type);
  }

  // Add check or checkmate
  const opponentColor =
    currentPlayer === PIECE_COLORS.WHITE
      ? PIECE_COLORS.BLACK
      : PIECE_COLORS.WHITE;
  if (isCheckmate(newBoard, opponentColor)) {
    notation += "#";
  } else if (isKingInCheck(newBoard, opponentColor)) {
    notation += "+";
  }

  return notation;
};

/**
 * Parse algebraic notation to extract move information
 * @param {string} notation - The algebraic notation string
 * @returns {Object|null} Parsed move information or null if invalid
 */
export const parseAlgebraic = (notation) => {
  if (!notation || typeof notation !== "string") {
    return null;
  }

  // Remove check/checkmate indicators
  const cleanNotation = notation.replace(/[+#]$/, "");

  // Handle castling
  if (cleanNotation === "O-O" || cleanNotation === "O-O-O") {
    return {
      type: "castling",
      side: cleanNotation === "O-O" ? "kingside" : "queenside",
    };
  }

  // Regular expression to parse standard algebraic notation
  const moveRegex = /^([KQRBN])?([a-h])?([1-8])?(x)?([a-h][1-8])(=([QRBN]))?$/;
  const match = cleanNotation.match(moveRegex);

  if (!match) {
    return null;
  }

  const [
    ,
    pieceSymbol,
    disambigFile,
    disambigRank,
    capture,
    destination,
    ,
    promotion,
  ] = match;

  return {
    type: "normal",
    piece: symbolToPieceType(pieceSymbol || ""),
    disambiguationFile: disambigFile,
    disambiguationRank: disambigRank,
    isCapture: !!capture,
    destination,
    promotion: symbolToPieceType(promotion || ""),
  };
};

/**
 * Convert algebraic notation symbol to piece type
 * @param {string} symbol - The algebraic notation symbol
 * @returns {string} The piece type
 */
export const symbolToPieceType = (symbol) => {
  const types = {
    K: PIECE_TYPES.KING,
    Q: PIECE_TYPES.QUEEN,
    R: PIECE_TYPES.ROOK,
    B: PIECE_TYPES.BISHOP,
    N: PIECE_TYPES.KNIGHT,
    "": PIECE_TYPES.PAWN,
  };

  return types[symbol] || PIECE_TYPES.PAWN;
};

/**
 * Format a move for display in move history
 * @param {Object} move - The move object
 * @param {number} moveNumber - The move number in the game
 * @param {string} playerColor - The color of the player who made the move
 * @returns {string} Formatted move string for display
 */
export const formatMoveForDisplay = (move, moveNumber, playerColor) => {
  const { notation } = move;

  if (playerColor === PIECE_COLORS.WHITE) {
    return `${moveNumber}. ${notation}`;
  } else {
    return `${moveNumber}... ${notation}`;
  }
};

/**
 * Create a move history entry
 * @param {Object} move - The move object
 * @param {(Piece|null)[][]} boardBefore - Board state before move
 * @param {(Piece|null)[][]} boardAfter - Board state after move
 * @param {string} currentPlayer - Player making the move
 * @param {number} moveNumber - Move number in the game
 * @returns {Object} Move history entry
 */
export const createMoveHistoryEntry = (
  move,
  boardBefore,
  boardAfter,
  currentPlayer,
  moveNumber
) => {
  const notation = moveToAlgebraic(
    move,
    boardBefore,
    boardAfter,
    currentPlayer
  );

  return {
    ...move,
    notation,
    moveNumber,
    player: currentPlayer,
    timestamp: Date.now(),
    displayText: formatMoveForDisplay({ notation }, moveNumber, currentPlayer),
  };
};

/**
 * Validate algebraic notation format
 * @param {string} notation - The notation to validate
 * @returns {boolean} True if notation is valid format
 */
export const isValidAlgebraicNotation = (notation) => {
  if (!notation || typeof notation !== "string") {
    return false;
  }

  // Check for castling
  if (notation === "O-O" || notation === "O-O-O") {
    return true;
  }

  // Check for standard notation
  const standardRegex =
    /^([KQRBN])?([a-h])?([1-8])?(x)?([a-h][1-8])(=([QRBN]))?[+#]?$/;
  return standardRegex.test(notation);
};

/**
 * Get move type from notation
 * @param {string} notation - The algebraic notation
 * @returns {string} The type of move (normal, castling, capture, promotion, etc.)
 */
export const getMoveType = (notation) => {
  if (!notation) return "unknown";

  if (notation.includes("O-O")) return "castling";
  if (notation.includes("x")) return "capture";
  if (notation.includes("=")) return "promotion";
  if (notation.includes("+")) return "check";
  if (notation.includes("#")) return "checkmate";

  return "normal";
};
