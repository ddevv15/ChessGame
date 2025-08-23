// FEN (Forsyth-Edwards Notation) utilities for chess board state representation
import {
  PIECE_TYPES,
  PIECE_COLORS,
  BOARD_SIZE,
  getOpponentColor,
} from "../constants/gameConstants.js";
import { getPieceAt, findKing } from "./boardUtils.js";

/**
 * Convert a piece to its FEN character representation
 * @param {Piece} piece - The piece to convert
 * @returns {string} FEN character for the piece
 */
export const pieceToFENChar = (piece) => {
  if (!piece) return "";

  const charMap = {
    [PIECE_TYPES.PAWN]: "p",
    [PIECE_TYPES.ROOK]: "r",
    [PIECE_TYPES.KNIGHT]: "n",
    [PIECE_TYPES.BISHOP]: "b",
    [PIECE_TYPES.QUEEN]: "q",
    [PIECE_TYPES.KING]: "k",
  };

  const char = charMap[piece.type];
  return piece.color === PIECE_COLORS.WHITE ? char.toUpperCase() : char;
};

/**
 * Convert FEN character to piece object
 * @param {string} fenChar - FEN character representing a piece
 * @returns {Piece|null} Piece object or null if invalid
 */
export const fenCharToPiece = (fenChar) => {
  if (!fenChar || typeof fenChar !== "string") return null;

  const charMap = {
    p: PIECE_TYPES.PAWN,
    r: PIECE_TYPES.ROOK,
    n: PIECE_TYPES.KNIGHT,
    b: PIECE_TYPES.BISHOP,
    q: PIECE_TYPES.QUEEN,
    k: PIECE_TYPES.KING,
  };

  const lowerChar = fenChar.toLowerCase();
  const pieceType = charMap[lowerChar];

  if (!pieceType) return null;

  return {
    type: pieceType,
    color: fenChar === lowerChar ? PIECE_COLORS.BLACK : PIECE_COLORS.WHITE,
    hasMoved: false, // FEN doesn't track individual piece movement history
  };
};

/**
 * Convert board position to FEN board representation
 * @param {(Piece|null)[][]} board - The game board
 * @returns {string} FEN board position string
 */
export const boardToFEN = (board) => {
  const fenRows = [];

  for (let row = 0; row < BOARD_SIZE; row++) {
    let fenRow = "";
    let emptyCount = 0;

    for (let col = 0; col < BOARD_SIZE; col++) {
      const piece = getPieceAt(board, row, col);

      if (piece) {
        // If we have accumulated empty squares, add the count
        if (emptyCount > 0) {
          fenRow += emptyCount.toString();
          emptyCount = 0;
        }
        // Add the piece character
        fenRow += pieceToFENChar(piece);
      } else {
        // Count empty squares
        emptyCount++;
      }
    }

    // Add any remaining empty squares at the end of the row
    if (emptyCount > 0) {
      fenRow += emptyCount.toString();
    }

    fenRows.push(fenRow);
  }

  return fenRows.join("/");
};

/**
 * Convert FEN board string to board array
 * @param {string} fenBoard - FEN board position string
 * @returns {(Piece|null)[][]} 8x8 board array
 */
export const fenToBoard = (fenBoard) => {
  if (!fenBoard || typeof fenBoard !== "string") {
    throw new Error("Invalid FEN board string");
  }

  const rows = fenBoard.split("/");
  if (rows.length !== 8) {
    throw new Error("FEN board must have exactly 8 rows");
  }

  const board = [];

  for (let rowIndex = 0; rowIndex < 8; rowIndex++) {
    const fenRow = rows[rowIndex];
    const boardRow = [];

    for (let i = 0; i < fenRow.length; i++) {
      const char = fenRow[i];

      if (char >= "1" && char <= "8") {
        // Empty squares
        const emptyCount = parseInt(char);
        for (let j = 0; j < emptyCount; j++) {
          boardRow.push(null);
        }
      } else {
        // Piece
        const piece = fenCharToPiece(char);
        if (!piece) {
          throw new Error(`Invalid FEN piece character: ${char}`);
        }
        boardRow.push(piece);
      }
    }

    if (boardRow.length !== 8) {
      throw new Error(`FEN row ${rowIndex + 1} must have exactly 8 squares`);
    }

    board.push(boardRow);
  }

  return board;
};

/**
 * Determine castling rights from board state
 * @param {(Piece|null)[][]} board - The game board
 * @returns {string} Castling rights string (e.g., "KQkq", "Kq", "-")
 */
export const getCastlingRights = (board) => {
  let castlingRights = "";

  // Check white castling rights
  const whiteKing = findKing(board, PIECE_COLORS.WHITE);
  if (
    whiteKing &&
    !whiteKing.piece.hasMoved &&
    whiteKing.row === 7 &&
    whiteKing.col === 4
  ) {
    // Check kingside castling (h1 rook)
    const kingsideRook = getPieceAt(board, 7, 7);
    if (
      kingsideRook &&
      kingsideRook.type === PIECE_TYPES.ROOK &&
      kingsideRook.color === PIECE_COLORS.WHITE &&
      !kingsideRook.hasMoved
    ) {
      castlingRights += "K";
    }

    // Check queenside castling (a1 rook)
    const queensideRook = getPieceAt(board, 7, 0);
    if (
      queensideRook &&
      queensideRook.type === PIECE_TYPES.ROOK &&
      queensideRook.color === PIECE_COLORS.WHITE &&
      !queensideRook.hasMoved
    ) {
      castlingRights += "Q";
    }
  }

  // Check black castling rights
  const blackKing = findKing(board, PIECE_COLORS.BLACK);
  if (
    blackKing &&
    !blackKing.piece.hasMoved &&
    blackKing.row === 0 &&
    blackKing.col === 4
  ) {
    // Check kingside castling (h8 rook)
    const kingsideRook = getPieceAt(board, 0, 7);
    if (
      kingsideRook &&
      kingsideRook.type === PIECE_TYPES.ROOK &&
      kingsideRook.color === PIECE_COLORS.BLACK &&
      !kingsideRook.hasMoved
    ) {
      castlingRights += "k";
    }

    // Check queenside castling (a8 rook)
    const queensideRook = getPieceAt(board, 0, 0);
    if (
      queensideRook &&
      queensideRook.type === PIECE_TYPES.ROOK &&
      queensideRook.color === PIECE_COLORS.BLACK &&
      !queensideRook.hasMoved
    ) {
      castlingRights += "q";
    }
  }

  return castlingRights || "-";
};

/**
 * Get en passant target square from game state
 * @param {Move[]} moveHistory - Array of moves made in the game
 * @returns {string} En passant target square in algebraic notation or "-"
 */
export const getEnPassantTarget = (moveHistory) => {
  if (!moveHistory || moveHistory.length === 0) {
    return "-";
  }

  const lastMove = moveHistory[moveHistory.length - 1];

  // Check if last move was a pawn moving two squares
  if (
    lastMove.piece.type === PIECE_TYPES.PAWN &&
    Math.abs(lastMove.from[0] - lastMove.to[0]) === 2
  ) {
    // Calculate the en passant target square (square behind the pawn)
    // For white pawn moving from rank 2 to rank 4, target is rank 3
    // For black pawn moving from rank 7 to rank 5, target is rank 6
    const targetRow = (lastMove.from[0] + lastMove.to[0]) / 2;
    const targetCol = lastMove.to[1];

    // Convert to algebraic notation
    const file = String.fromCharCode("a".charCodeAt(0) + targetCol);
    const rank = (8 - targetRow).toString();
    return file + rank;
  }

  return "-";
};

/**
 * Calculate halfmove clock (moves since last pawn move or capture)
 * @param {Move[]} moveHistory - Array of moves made in the game
 * @returns {number} Halfmove clock value
 */
export const getHalfmoveClock = (moveHistory) => {
  if (!moveHistory || moveHistory.length === 0) {
    return 0;
  }

  let halfmoveClock = 0;

  // Count backwards from the last move until we find a pawn move or capture
  for (let i = moveHistory.length - 1; i >= 0; i--) {
    const move = moveHistory[i];

    // Reset counter if this was a pawn move or capture
    if (move.piece.type === PIECE_TYPES.PAWN || move.capturedPiece) {
      break;
    }

    halfmoveClock++;
  }

  return halfmoveClock;
};

/**
 * Calculate fullmove number (increments after black's move)
 * @param {Move[]} moveHistory - Array of moves made in the game
 * @returns {number} Fullmove number
 */
export const getFullmoveNumber = (moveHistory) => {
  if (!moveHistory || moveHistory.length === 0) {
    return 1;
  }

  // Each pair of moves (white + black) increments the fullmove number
  return Math.floor(moveHistory.length / 2) + 1;
};

/**
 * Generate complete FEN string from game state
 * @param {Object} gameState - Current game state
 * @param {(Piece|null)[][]} gameState.board - The game board
 * @param {string} gameState.currentPlayer - Current player color
 * @param {Move[]} gameState.moveHistory - Array of moves made
 * @returns {string} Complete FEN string
 */
export const generateFEN = (gameState) => {
  if (!gameState || !gameState.board) {
    throw new Error("Invalid game state provided");
  }

  const { board, currentPlayer, moveHistory = [] } = gameState;

  // 1. Board position
  const boardFEN = boardToFEN(board);

  // 2. Active color
  const activeColor = currentPlayer === PIECE_COLORS.WHITE ? "w" : "b";

  // 3. Castling rights
  const castlingRights = getCastlingRights(board);

  // 4. En passant target square
  const enPassantTarget = getEnPassantTarget(moveHistory);

  // 5. Halfmove clock
  const halfmoveClock = getHalfmoveClock(moveHistory);

  // 6. Fullmove number
  const fullmoveNumber = getFullmoveNumber(moveHistory);

  return `${boardFEN} ${activeColor} ${castlingRights} ${enPassantTarget} ${halfmoveClock} ${fullmoveNumber}`;
};

/**
 * Parse FEN string into components
 * @param {string} fenString - Complete FEN string
 * @returns {Object} Parsed FEN components
 */
export const parseFEN = (fenString) => {
  if (!fenString || typeof fenString !== "string") {
    throw new Error("Invalid FEN string provided");
  }

  const parts = fenString.trim().split(/\s+/);

  if (parts.length !== 6) {
    throw new Error("FEN string must have exactly 6 components");
  }

  const [
    boardPosition,
    activeColor,
    castlingRights,
    enPassantTarget,
    halfmoveClock,
    fullmoveNumber,
  ] = parts;

  // Validate active color
  if (activeColor !== "w" && activeColor !== "b") {
    throw new Error("Invalid active color in FEN string");
  }

  // Validate castling rights
  if (!/^[KQkq]*$|^-$/.test(castlingRights)) {
    throw new Error("Invalid castling rights in FEN string");
  }

  // Validate en passant target
  if (!/^[a-h][1-8]$|^-$/.test(enPassantTarget)) {
    throw new Error("Invalid en passant target in FEN string");
  }

  // Validate halfmove clock
  const halfmove = parseInt(halfmoveClock);
  if (isNaN(halfmove) || halfmove < 0) {
    throw new Error("Invalid halfmove clock in FEN string");
  }

  // Validate fullmove number
  const fullmove = parseInt(fullmoveNumber);
  if (isNaN(fullmove) || fullmove < 1) {
    throw new Error("Invalid fullmove number in FEN string");
  }

  return {
    boardPosition,
    activeColor: activeColor === "w" ? PIECE_COLORS.WHITE : PIECE_COLORS.BLACK,
    castlingRights,
    enPassantTarget,
    halfmoveClock: halfmove,
    fullmoveNumber: fullmove,
    board: fenToBoard(boardPosition),
  };
};

/**
 * Validate FEN string format
 * @param {string} fenString - FEN string to validate
 * @returns {boolean} True if FEN string is valid
 */
export const isValidFEN = (fenString) => {
  try {
    parseFEN(fenString);
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Get standard starting position FEN
 * @returns {string} FEN string for standard chess starting position
 */
export const getStartingPositionFEN = () => {
  return "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
};

/**
 * Create game state from FEN string
 * @param {string} fenString - FEN string to convert
 * @returns {Object} Game state object
 */
export const gameStateFromFEN = (fenString) => {
  const parsed = parseFEN(fenString);

  return {
    board: parsed.board,
    currentPlayer: parsed.activeColor,
    moveHistory: [], // FEN doesn't contain move history
    gameStatus: "playing", // Would need additional logic to determine actual status
    selectedSquare: null,
    validMoves: [],
    promotionState: null,
    // Additional metadata could be derived from FEN components if needed
    fenMetadata: {
      castlingRights: parsed.castlingRights,
      enPassantTarget: parsed.enPassantTarget,
      halfmoveClock: parsed.halfmoveClock,
      fullmoveNumber: parsed.fullmoveNumber,
    },
  };
};
