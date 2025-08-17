// Board utilities - Board manipulation and helper functions
import {
  INITIAL_BOARD_SETUP,
  BOARD_SIZE,
  isValidPosition,
  createInitialGameState,
} from "../constants/gameConstants.js";

/**
 * Initialize a new chess board with pieces in starting positions
 * @returns {(Piece|null)[][]} 8x8 board array with pieces in starting positions
 */
export const initializeBoard = () => {
  return INITIAL_BOARD_SETUP.map((row) =>
    row.map((piece) => (piece ? { ...piece } : null))
  );
};

/**
 * Create a deep copy of the board state
 * @param {(Piece|null)[][]} board - The board to copy
 * @returns {(Piece|null)[][]} Deep copy of the board
 */
export const copyBoard = (board) => {
  return board.map((row) => row.map((piece) => (piece ? { ...piece } : null)));
};

/**
 * Check if a square is occupied by any piece
 * @param {(Piece|null)[][]} board - The game board
 * @param {number} row - Row index (0-7)
 * @param {number} col - Column index (0-7)
 * @returns {boolean} True if square is occupied
 */
export const isSquareOccupied = (board, row, col) => {
  if (!isValidPosition(row, col)) return false;
  return board[row][col] !== null;
};

/**
 * Get the piece at a specific position
 * @param {(Piece|null)[][]} board - The game board
 * @param {number} row - Row index (0-7)
 * @param {number} col - Column index (0-7)
 * @returns {Piece|null} The piece at the position, or null if empty
 */
export const getPieceAt = (board, row, col) => {
  if (!isValidPosition(row, col)) return null;
  return board[row][col];
};

/**
 * Set a piece at a specific position
 * @param {(Piece|null)[][]} board - The game board
 * @param {number} row - Row index (0-7)
 * @param {number} col - Column index (0-7)
 * @param {Piece|null} piece - The piece to place, or null to clear
 * @returns {(Piece|null)[][]} New board with piece placed
 */
export const setPieceAt = (board, row, col, piece) => {
  if (!isValidPosition(row, col)) return board;

  const newBoard = copyBoard(board);
  newBoard[row][col] = piece;
  return newBoard;
};

/**
 * Move a piece from one position to another
 * @param {(Piece|null)[][]} board - The game board
 * @param {number} fromRow - Source row index
 * @param {number} fromCol - Source column index
 * @param {number} toRow - Destination row index
 * @param {number} toCol - Destination column index
 * @returns {(Piece|null)[][]} New board with piece moved
 */
export const movePiece = (board, fromRow, fromCol, toRow, toCol) => {
  if (!isValidPosition(fromRow, fromCol) || !isValidPosition(toRow, toCol)) {
    return board;
  }

  const piece = getPieceAt(board, fromRow, fromCol);
  if (!piece) return board;

  let newBoard = setPieceAt(board, fromRow, fromCol, null);
  newBoard = setPieceAt(newBoard, toRow, toCol, { ...piece, hasMoved: true });

  return newBoard;
};

/**
 * Check if a piece belongs to a specific player
 * @param {Piece|null} piece - The piece to check
 * @param {string} color - The player color to check against
 * @returns {boolean} True if piece belongs to the player
 */
export const isPieceOwnedBy = (piece, color) => {
  return piece && piece.color === color;
};

/**
 * Find all pieces of a specific type and color on the board
 * @param {(Piece|null)[][]} board - The game board
 * @param {string} type - Piece type to find
 * @param {string} color - Piece color to find
 * @returns {Array<{row: number, col: number, piece: Piece}>} Array of found pieces with positions
 */
export const findPieces = (board, type, color) => {
  const pieces = [];

  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      const piece = board[row][col];
      if (piece && piece.type === type && piece.color === color) {
        pieces.push({ row, col, piece });
      }
    }
  }

  return pieces;
};

/**
 * Find the king of a specific color
 * @param {(Piece|null)[][]} board - The game board
 * @param {string} color - The color of the king to find
 * @returns {{row: number, col: number, piece: Piece}|null} King position and piece, or null if not found
 */
export const findKing = (board, color) => {
  const kings = findPieces(board, "king", color);
  return kings.length > 0 ? kings[0] : null;
};

/**
 * Get all pieces of a specific color
 * @param {(Piece|null)[][]} board - The game board
 * @param {string} color - The color of pieces to find
 * @returns {Array<{row: number, col: number, piece: Piece}>} Array of pieces with positions
 */
export const getAllPiecesOfColor = (board, color) => {
  const pieces = [];

  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      const piece = board[row][col];
      if (piece && piece.color === color) {
        pieces.push({ row, col, piece });
      }
    }
  }

  return pieces;
};

/**
 * Convert board position to algebraic notation (e.g., [0,0] -> "a8")
 * @param {number} row - Row index (0-7)
 * @param {number} col - Column index (0-7)
 * @returns {string} Algebraic notation
 */
export const positionToAlgebraic = (row, col) => {
  if (!isValidPosition(row, col)) return "";
  const file = String.fromCharCode("a".charCodeAt(0) + col);
  const rank = (8 - row).toString();
  return file + rank;
};

/**
 * Convert algebraic notation to board position (e.g., "a8" -> [0,0])
 * @param {string} algebraic - Algebraic notation (e.g., "a8")
 * @returns {number[]|null} [row, col] position or null if invalid
 */
export const algebraicToPosition = (algebraic) => {
  if (typeof algebraic !== "string" || algebraic.length !== 2) return null;

  const file = algebraic.charAt(0).toLowerCase();
  const rank = algebraic.charAt(1);

  if (file < "a" || file > "h" || rank < "1" || rank > "8") return null;

  const col = file.charCodeAt(0) - "a".charCodeAt(0);
  const row = 8 - parseInt(rank);

  return [row, col];
};

/**
 * Calculate the distance between two positions
 * @param {number} row1 - First position row
 * @param {number} col1 - First position column
 * @param {number} row2 - Second position row
 * @param {number} col2 - Second position column
 * @returns {number} Manhattan distance between positions
 */
export const getDistance = (row1, col1, row2, col2) => {
  return Math.abs(row1 - row2) + Math.abs(col1 - col2);
};

/**
 * Calculate the diagonal distance between two positions
 * @param {number} row1 - First position row
 * @param {number} col1 - First position column
 * @param {number} row2 - Second position row
 * @param {number} col2 - Second position column
 * @returns {number} Maximum of row or column distance (diagonal distance)
 */
export const getDiagonalDistance = (row1, col1, row2, col2) => {
  return Math.max(Math.abs(row1 - row2), Math.abs(col1 - col2));
};

/**
 * Check if two positions are on the same diagonal
 * @param {number} row1 - First position row
 * @param {number} col1 - First position column
 * @param {number} row2 - Second position row
 * @param {number} col2 - Second position column
 * @returns {boolean} True if positions are on the same diagonal
 */
export const isOnSameDiagonal = (row1, col1, row2, col2) => {
  return Math.abs(row1 - row2) === Math.abs(col1 - col2);
};

/**
 * Check if two positions are on the same rank (row)
 * @param {number} row1 - First position row
 * @param {number} col1 - First position column
 * @param {number} row2 - Second position row
 * @param {number} col2 - Second position column
 * @returns {boolean} True if positions are on the same rank
 */
export const isOnSameRank = (row1, col1, row2, col2) => {
  return row1 === row2;
};

/**
 * Check if two positions are on the same file (column)
 * @param {number} row1 - First position row
 * @param {number} col1 - First position column
 * @param {number} row2 - Second position row
 * @param {number} col2 - Second position column
 * @returns {boolean} True if positions are on the same file
 */
export const isOnSameFile = (row1, col1, row2, col2) => {
  return col1 === col2;
};

/**
 * Get all squares between two positions (exclusive of endpoints)
 * @param {number} fromRow - Starting row
 * @param {number} fromCol - Starting column
 * @param {number} toRow - Ending row
 * @param {number} toCol - Ending column
 * @returns {Array<{row: number, col: number}>} Array of positions between start and end
 */
export const getSquaresBetween = (fromRow, fromCol, toRow, toCol) => {
  const squares = [];

  if (fromRow === toRow && fromCol === toCol) {
    return squares; // Same position
  }

  const rowDiff = toRow - fromRow;
  const colDiff = toCol - fromCol;

  // Check if it's a valid straight line or diagonal
  if (
    rowDiff !== 0 &&
    colDiff !== 0 &&
    Math.abs(rowDiff) !== Math.abs(colDiff)
  ) {
    return squares; // Not a valid line
  }

  const steps = Math.max(Math.abs(rowDiff), Math.abs(colDiff));
  const rowStep = rowDiff === 0 ? 0 : rowDiff / Math.abs(rowDiff);
  const colStep = colDiff === 0 ? 0 : colDiff / Math.abs(colDiff);

  for (let i = 1; i < steps; i++) {
    const row = fromRow + rowStep * i;
    const col = fromCol + colStep * i;
    squares.push({ row, col });
  }

  return squares;
};

/**
 * Check if the path between two positions is clear (no pieces blocking)
 * @param {(Piece|null)[][]} board - The game board
 * @param {number} fromRow - Starting row
 * @param {number} fromCol - Starting column
 * @param {number} toRow - Ending row
 * @param {number} toCol - Ending column
 * @returns {boolean} True if path is clear
 */
export const isPathClear = (board, fromRow, fromCol, toRow, toCol) => {
  const squaresBetween = getSquaresBetween(fromRow, fromCol, toRow, toCol);

  for (const square of squaresBetween) {
    if (isSquareOccupied(board, square.row, square.col)) {
      return false;
    }
  }

  return true;
};

/**
 * Check if a square is under attack by any piece of the specified color
 * @param {(Piece|null)[][]} board - The game board
 * @param {number} targetRow - Row of square to check
 * @param {number} targetCol - Column of square to check
 * @param {string} attackingColor - Color of pieces that might be attacking
 * @returns {boolean} True if square is under attack
 */
export const isSquareUnderAttack = (
  board,
  targetRow,
  targetCol,
  attackingColor
) => {
  // This is a simplified version - will be enhanced in later tasks with proper piece movement rules
  const attackingPieces = getAllPiecesOfColor(board, attackingColor);

  for (const { row, col, piece } of attackingPieces) {
    // Basic attack patterns - will be refined with proper move validation later
    switch (piece.type) {
      case "pawn":
        const direction = attackingColor === "white" ? -1 : 1;
        if (
          row + direction === targetRow &&
          (col - 1 === targetCol || col + 1 === targetCol)
        ) {
          return true;
        }
        break;
      case "rook":
        if (
          (isOnSameRank(row, col, targetRow, targetCol) ||
            isOnSameFile(row, col, targetRow, targetCol)) &&
          isPathClear(board, row, col, targetRow, targetCol)
        ) {
          return true;
        }
        break;
      case "bishop":
        if (
          isOnSameDiagonal(row, col, targetRow, targetCol) &&
          isPathClear(board, row, col, targetRow, targetCol)
        ) {
          return true;
        }
        break;
      case "queen":
        if (
          (isOnSameRank(row, col, targetRow, targetCol) ||
            isOnSameFile(row, col, targetRow, targetCol) ||
            isOnSameDiagonal(row, col, targetRow, targetCol)) &&
          isPathClear(board, row, col, targetRow, targetCol)
        ) {
          return true;
        }
        break;
      case "king":
        if (getDiagonalDistance(row, col, targetRow, targetCol) === 1) {
          return true;
        }
        break;
      case "knight":
        const rowDist = Math.abs(row - targetRow);
        const colDist = Math.abs(col - targetCol);
        if (
          (rowDist === 2 && colDist === 1) ||
          (rowDist === 1 && colDist === 2)
        ) {
          return true;
        }
        break;
    }
  }

  return false;
};

/**
 * Get all empty squares on the board
 * @param {(Piece|null)[][]} board - The game board
 * @returns {Array<{row: number, col: number}>} Array of empty square positions
 */
export const getEmptySquares = (board) => {
  const emptySquares = [];

  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      if (!isSquareOccupied(board, row, col)) {
        emptySquares.push({ row, col });
      }
    }
  }

  return emptySquares;
};

/**
 * Count pieces of a specific type and color on the board
 * @param {(Piece|null)[][]} board - The game board
 * @param {string} type - Piece type to count
 * @param {string} color - Piece color to count
 * @returns {number} Number of pieces found
 */
export const countPieces = (board, type, color) => {
  return findPieces(board, type, color).length;
};

/**
 * Get the total material value for a color (simplified scoring)
 * @param {(Piece|null)[][]} board - The game board
 * @param {string} color - Color to calculate material for
 * @returns {number} Total material value
 */
export const getMaterialValue = (board, color) => {
  const pieceValues = {
    pawn: 1,
    knight: 3,
    bishop: 3,
    rook: 5,
    queen: 9,
    king: 0, // King has no material value
  };

  let totalValue = 0;
  const pieces = getAllPiecesOfColor(board, color);

  for (const { piece } of pieces) {
    totalValue += pieceValues[piece.type] || 0;
  }

  return totalValue;
};
