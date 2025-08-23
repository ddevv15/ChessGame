// SAN (Standard Algebraic Notation) utilities for chess move parsing and generation
import {
  PIECE_TYPES,
  PIECE_COLORS,
  BOARD_SIZE,
  getOpponentColor,
} from "../constants/gameConstants.js";
import {
  getPieceAt,
  positionToAlgebraic,
  algebraicToPosition,
  findPieces,
} from "./boardUtils.js";
import {
  getLegalMoves,
  isKingInCheck,
  isCheckmate,
  isStalemate,
  makeMove,
} from "./gameLogic.js";

/**
 * Parse SAN move string to extract move components
 * @param {string} sanMove - SAN move string (e.g., "Nf3", "exd5", "O-O", "e8=Q+")
 * @returns {Object} Parsed move components
 */
export const parseSANComponents = (sanMove) => {
  if (!sanMove || typeof sanMove !== "string") {
    throw new Error("Invalid SAN move string");
  }

  const move = sanMove.trim();

  // Initialize components
  const components = {
    piece: PIECE_TYPES.PAWN, // Default to pawn
    fromFile: null,
    fromRank: null,
    toSquare: null,
    isCapture: false,
    isCheck: false,
    isCheckmate: false,
    isKingsideCastle: false,
    isQueensideCastle: false,
    promotionPiece: null,
    originalMove: move,
  };

  // Check for castling
  if (move === "O-O" || move === "0-0") {
    components.isKingsideCastle = true;
    return components;
  }
  if (move === "O-O-O" || move === "0-0-0") {
    components.isQueensideCastle = true;
    return components;
  }

  // Remove check/checkmate indicators
  let workingMove = move;
  if (workingMove.endsWith("#")) {
    components.isCheckmate = true;
    workingMove = workingMove.slice(0, -1);
  } else if (workingMove.endsWith("+")) {
    components.isCheck = true;
    workingMove = workingMove.slice(0, -1);
  }

  // Check for promotion
  const promotionMatch = workingMove.match(/=([QRBN])$/);
  if (promotionMatch) {
    const promotionChar = promotionMatch[1];
    components.promotionPiece = {
      Q: PIECE_TYPES.QUEEN,
      R: PIECE_TYPES.ROOK,
      B: PIECE_TYPES.BISHOP,
      N: PIECE_TYPES.KNIGHT,
    }[promotionChar];
    workingMove = workingMove.replace(/=([QRBN])$/, "");
  }

  // Check for capture
  if (workingMove.includes("x")) {
    components.isCapture = true;
    workingMove = workingMove.replace("x", "");
  }

  // Determine piece type
  const pieceMatch = workingMove.match(/^([KQRBN])/);
  if (pieceMatch) {
    const pieceChar = pieceMatch[1];
    components.piece = {
      K: PIECE_TYPES.KING,
      Q: PIECE_TYPES.QUEEN,
      R: PIECE_TYPES.ROOK,
      B: PIECE_TYPES.BISHOP,
      N: PIECE_TYPES.KNIGHT,
    }[pieceChar];
    workingMove = workingMove.slice(1);
  }

  // Extract destination square (last 2 characters should be the destination)
  const destinationMatch = workingMove.match(/([a-h][1-8])$/);
  if (destinationMatch) {
    components.toSquare = destinationMatch[1];
    workingMove = workingMove.replace(/([a-h][1-8])$/, "");
  } else {
    throw new Error(
      `Invalid SAN move: no valid destination square found in "${move}"`
    );
  }

  // Extract disambiguation (remaining characters)
  if (workingMove.length > 0) {
    // Could be file (a-h), rank (1-8), or both
    const fileMatch = workingMove.match(/([a-h])/);
    const rankMatch = workingMove.match(/([1-8])/);

    if (fileMatch) {
      components.fromFile = fileMatch[1];
    }
    if (rankMatch) {
      components.fromRank = parseInt(rankMatch[1]);
    }
  }

  return components;
};

/**
 * Find the source square for a SAN move
 * @param {(Piece|null)[][]} board - The game board
 * @param {Object} components - Parsed SAN components
 * @param {string} playerColor - Color of the player making the move
 * @returns {number[]|null} [row, col] of source square or null if not found
 */
export const findSourceSquare = (board, components, playerColor) => {
  const {
    piece,
    toSquare,
    fromFile,
    fromRank,
    isKingsideCastle,
    isQueensideCastle,
  } = components;

  // Handle castling
  if (isKingsideCastle || isQueensideCastle) {
    const kingRow = playerColor === PIECE_COLORS.WHITE ? 7 : 0;
    return [kingRow, 4]; // King's starting position
  }

  // Convert destination to coordinates
  const toPosition = algebraicToPosition(toSquare);
  if (!toPosition) {
    throw new Error(`Invalid destination square: ${toSquare}`);
  }
  const [toRow, toCol] = toPosition;

  // Find all pieces of the correct type and color
  const candidatePieces = findPieces(board, piece, playerColor);

  // Filter pieces that can legally move to the destination
  const validPieces = candidatePieces.filter(({ row, col }) => {
    const legalMoves = getLegalMoves(board, row, col);
    return legalMoves.some((move) => move.row === toRow && move.col === toCol);
  });

  if (validPieces.length === 0) {
    throw new Error(`No ${piece} can move to ${toSquare}`);
  }

  if (validPieces.length === 1) {
    return [validPieces[0].row, validPieces[0].col];
  }

  // Multiple pieces can move to destination - use disambiguation
  let filteredPieces = validPieces;

  // Filter by file if specified
  if (fromFile) {
    const fileCol = fromFile.charCodeAt(0) - "a".charCodeAt(0);
    filteredPieces = filteredPieces.filter(({ col }) => col === fileCol);
  }

  // Filter by rank if specified
  if (fromRank) {
    const rankRow = 8 - fromRank;
    filteredPieces = filteredPieces.filter(({ row }) => row === rankRow);
  }

  if (filteredPieces.length === 0) {
    throw new Error(
      `No ${piece} matches disambiguation for move to ${toSquare}`
    );
  }

  if (filteredPieces.length > 1) {
    throw new Error(
      `Ambiguous move: multiple ${piece}s can move to ${toSquare}`
    );
  }

  return [filteredPieces[0].row, filteredPieces[0].col];
};

/**
 * Parse SAN move string and convert to board coordinates
 * @param {string} sanMove - SAN move string
 * @param {(Piece|null)[][]} board - Current board state
 * @param {string} playerColor - Color of the player making the move
 * @returns {Object} Move object with from/to coordinates and metadata
 */
export const parseSANMove = (sanMove, board, playerColor) => {
  const components = parseSANComponents(sanMove);

  // Handle castling moves
  if (components.isKingsideCastle) {
    const kingRow = playerColor === PIECE_COLORS.WHITE ? 7 : 0;
    return {
      from: [kingRow, 4],
      to: [kingRow, 6],
      piece: { type: PIECE_TYPES.KING, color: playerColor },
      isCapture: false,
      isCheck: components.isCheck,
      isCheckmate: components.isCheckmate,
      isCastle: true,
      isKingsideCastle: true,
      promotionPiece: null,
      sanMove: components.originalMove,
    };
  }

  if (components.isQueensideCastle) {
    const kingRow = playerColor === PIECE_COLORS.WHITE ? 7 : 0;
    return {
      from: [kingRow, 4],
      to: [kingRow, 2],
      piece: { type: PIECE_TYPES.KING, color: playerColor },
      isCapture: false,
      isCheck: components.isCheck,
      isCheckmate: components.isCheckmate,
      isCastle: true,
      isQueensideCastle: true,
      promotionPiece: null,
      sanMove: components.originalMove,
    };
  }

  // Find source square
  const fromPosition = findSourceSquare(board, components, playerColor);
  const toPosition = algebraicToPosition(components.toSquare);

  if (!fromPosition || !toPosition) {
    throw new Error(`Could not determine move coordinates for ${sanMove}`);
  }

  const movingPiece = getPieceAt(board, fromPosition[0], fromPosition[1]);
  if (!movingPiece) {
    throw new Error(`No piece found at source position for move ${sanMove}`);
  }

  const targetPiece = getPieceAt(board, toPosition[0], toPosition[1]);
  const isCapture = targetPiece !== null;

  // Validate capture indication matches actual capture
  if (components.isCapture !== isCapture) {
    throw new Error(`Capture indication mismatch in move ${sanMove}`);
  }

  return {
    from: fromPosition,
    to: toPosition,
    piece: movingPiece,
    isCapture,
    isCheck: components.isCheck,
    isCheckmate: components.isCheckmate,
    isCastle: false,
    promotionPiece: components.promotionPiece,
    sanMove: components.originalMove,
  };
};

/**
 * Validate SAN move against current board position
 * @param {string} sanMove - SAN move string
 * @param {(Piece|null)[][]} board - Current board state
 * @param {string} playerColor - Color of the player making the move
 * @returns {boolean} True if move is valid
 */
export const validateSANMove = (sanMove, board, playerColor) => {
  try {
    const parsedMove = parseSANMove(sanMove, board, playerColor);

    // Additional validation: check if the move would actually result in check/checkmate
    const { newBoard } = makeMove(
      board,
      parsedMove.from[0],
      parsedMove.from[1],
      parsedMove.to[0],
      parsedMove.to[1],
      parsedMove.promotionPiece?.type
    );

    const opponentColor = getOpponentColor(playerColor);
    const isInCheck = isKingInCheck(newBoard, opponentColor);
    const isInCheckmate = isCheckmate(newBoard, opponentColor);

    // Validate check/checkmate indicators
    if (parsedMove.isCheckmate && !isInCheckmate) {
      return false;
    }
    if (parsedMove.isCheck && !isInCheck) {
      return false;
    }
    if (!parsedMove.isCheck && !parsedMove.isCheckmate && isInCheck) {
      // Move should have check indicator but doesn't
      return false;
    }

    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Convert move coordinates to SAN notation
 * @param {(Piece|null)[][]} board - Current board state
 * @param {number} fromRow - Source row
 * @param {number} fromCol - Source column
 * @param {number} toRow - Destination row
 * @param {number} toCol - Destination column
 * @param {string} promotionPiece - Optional promotion piece type
 * @returns {string} SAN notation string
 */
export const moveToSAN = (
  board,
  fromRow,
  fromCol,
  toRow,
  toCol,
  promotionPiece = null
) => {
  const movingPiece = getPieceAt(board, fromRow, fromCol);
  if (!movingPiece) {
    throw new Error("No piece at source position");
  }

  const targetPiece = getPieceAt(board, toRow, toCol);
  const isCapture = targetPiece !== null;
  const toSquare = positionToAlgebraic(toRow, toCol);

  // Handle castling
  if (
    movingPiece.type === PIECE_TYPES.KING &&
    Math.abs(toCol - fromCol) === 2
  ) {
    return toCol > fromCol ? "O-O" : "O-O-O";
  }

  let san = "";

  // Add piece symbol (except for pawns)
  if (movingPiece.type !== PIECE_TYPES.PAWN) {
    const pieceSymbol = {
      [PIECE_TYPES.KING]: "K",
      [PIECE_TYPES.QUEEN]: "Q",
      [PIECE_TYPES.ROOK]: "R",
      [PIECE_TYPES.BISHOP]: "B",
      [PIECE_TYPES.KNIGHT]: "N",
    }[movingPiece.type];
    san += pieceSymbol;

    // Add disambiguation if needed
    const disambiguation = getDisambiguation(
      board,
      movingPiece,
      fromRow,
      fromCol,
      toRow,
      toCol
    );
    san += disambiguation;
  } else if (isCapture) {
    // For pawn captures, include the source file
    const fromFile = String.fromCharCode("a".charCodeAt(0) + fromCol);
    san += fromFile;
  }

  // Add capture indicator
  if (isCapture) {
    san += "x";
  }

  // Add destination square
  san += toSquare;

  // Add promotion
  if (promotionPiece) {
    const promotionSymbol = {
      [PIECE_TYPES.QUEEN]: "Q",
      [PIECE_TYPES.ROOK]: "R",
      [PIECE_TYPES.BISHOP]: "B",
      [PIECE_TYPES.KNIGHT]: "N",
    }[promotionPiece];
    san += "=" + promotionSymbol;
  }

  // Check for check/checkmate after the move
  const { newBoard } = makeMove(
    board,
    fromRow,
    fromCol,
    toRow,
    toCol,
    promotionPiece
  );
  const opponentColor = getOpponentColor(movingPiece.color);

  if (isCheckmate(newBoard, opponentColor)) {
    san += "#";
  } else if (isKingInCheck(newBoard, opponentColor)) {
    san += "+";
  }

  return san;
};

/**
 * Get disambiguation string for a piece move
 * @param {(Piece|null)[][]} board - Current board state
 * @param {Piece} piece - The piece being moved
 * @param {number} fromRow - Source row
 * @param {number} fromCol - Source column
 * @param {number} toRow - Destination row
 * @param {number} toCol - Destination column
 * @returns {string} Disambiguation string (empty, file, rank, or both)
 */
export const getDisambiguation = (
  board,
  piece,
  fromRow,
  fromCol,
  toRow,
  toCol
) => {
  // Find all pieces of the same type and color that can move to the same destination
  const samePieces = findPieces(board, piece.type, piece.color);
  const conflictingPieces = samePieces.filter(({ row, col }) => {
    if (row === fromRow && col === fromCol) {
      return false; // Skip the piece we're moving
    }

    const legalMoves = getLegalMoves(board, row, col);
    return legalMoves.some((move) => move.row === toRow && move.col === toCol);
  });

  if (conflictingPieces.length === 0) {
    return ""; // No disambiguation needed
  }

  // Check if file disambiguation is sufficient
  const sameFile = conflictingPieces.some(({ col }) => col === fromCol);
  const sameRank = conflictingPieces.some(({ row }) => row === fromRow);

  if (!sameFile) {
    // File disambiguation is sufficient
    return String.fromCharCode("a".charCodeAt(0) + fromCol);
  } else if (!sameRank) {
    // Rank disambiguation is sufficient
    return (8 - fromRow).toString();
  } else {
    // Need both file and rank
    const file = String.fromCharCode("a".charCodeAt(0) + fromCol);
    const rank = (8 - fromRow).toString();
    return file + rank;
  }
};

/**
 * Parse multiple SAN moves from a string
 * @param {string} movesString - String containing multiple SAN moves
 * @returns {string[]} Array of individual SAN move strings
 */
export const parseMoveList = (movesString) => {
  if (!movesString || typeof movesString !== "string") {
    return [];
  }

  // Remove move numbers and extra whitespace
  const cleanString = movesString
    .replace(/\d+\./g, "") // Remove move numbers like "1.", "2.", etc.
    .replace(/\s+/g, " ") // Normalize whitespace
    .trim();

  if (!cleanString) {
    return [];
  }

  // Split by spaces and filter out empty strings
  return cleanString.split(" ").filter((move) => move.length > 0);
};

/**
 * Validate a sequence of SAN moves
 * @param {string[]} sanMoves - Array of SAN move strings
 * @param {(Piece|null)[][]} initialBoard - Starting board position
 * @param {string} startingPlayer - Color of the first player to move
 * @returns {Object} Validation result with success flag and details
 */
export const validateMoveSequence = (
  sanMoves,
  initialBoard,
  startingPlayer = PIECE_COLORS.WHITE
) => {
  let currentBoard = initialBoard;
  let currentPlayer = startingPlayer;
  const validatedMoves = [];

  try {
    for (let i = 0; i < sanMoves.length; i++) {
      const sanMove = sanMoves[i];

      if (!validateSANMove(sanMove, currentBoard, currentPlayer)) {
        return {
          success: false,
          error: `Invalid move at position ${i + 1}: ${sanMove}`,
          validatedMoves,
        };
      }

      const parsedMove = parseSANMove(sanMove, currentBoard, currentPlayer);
      const { newBoard } = makeMove(
        currentBoard,
        parsedMove.from[0],
        parsedMove.from[1],
        parsedMove.to[0],
        parsedMove.to[1],
        parsedMove.promotionPiece?.type
      );

      validatedMoves.push({
        san: sanMove,
        from: parsedMove.from,
        to: parsedMove.to,
        piece: parsedMove.piece,
      });

      currentBoard = newBoard;
      currentPlayer = getOpponentColor(currentPlayer);
    }

    return {
      success: true,
      validatedMoves,
      finalBoard: currentBoard,
      finalPlayer: currentPlayer,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      validatedMoves,
    };
  }
};
