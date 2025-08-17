// Game Logic utilities - Chess rules and move validation
import {
  PIECE_TYPES,
  PIECE_COLORS,
  BOARD_SIZE,
  isValidPosition,
  getOpponentColor,
} from "../constants/gameConstants.js";
import {
  getPieceAt,
  isSquareOccupied,
  isPieceOwnedBy,
  isOnSameRank,
  isOnSameFile,
  isOnSameDiagonal,
  isPathClear,
  getDistance,
  getDiagonalDistance,
  copyBoard,
  findKing,
  isSquareUnderAttack,
} from "./boardUtils.js";

/**
 * Get all valid moves for a piece at a given position (including check validation)
 * @param {(Piece|null)[][]} board - The game board
 * @param {number} fromRow - Source row
 * @param {number} fromCol - Source column
 * @returns {Array<{row: number, col: number}>} Array of legal move positions
 */
export const getValidMoves = (board, fromRow, fromCol) => {
  // Use getLegalMoves which includes check validation
  return getLegalMoves(board, fromRow, fromCol);
};

/**
 * Get valid moves for a pawn
 * @param {(Piece|null)[][]} board - The game board
 * @param {number} fromRow - Source row
 * @param {number} fromCol - Source column
 * @param {Piece} piece - The pawn piece
 * @returns {Array<{row: number, col: number}>} Valid moves
 */
export const getPawnMoves = (board, fromRow, fromCol, piece) => {
  const moves = [];
  const direction = piece.color === PIECE_COLORS.WHITE ? -1 : 1;
  const startingRow = piece.color === PIECE_COLORS.WHITE ? 6 : 1;

  // Forward move (one square)
  const oneSquareForward = fromRow + direction;
  if (
    isValidPosition(oneSquareForward, fromCol) &&
    !isSquareOccupied(board, oneSquareForward, fromCol)
  ) {
    moves.push({ row: oneSquareForward, col: fromCol });

    // Forward move (two squares from starting position)
    if (fromRow === startingRow) {
      const twoSquaresForward = fromRow + 2 * direction;
      if (
        isValidPosition(twoSquaresForward, fromCol) &&
        !isSquareOccupied(board, twoSquaresForward, fromCol)
      ) {
        moves.push({ row: twoSquaresForward, col: fromCol });
      }
    }
  }

  // Diagonal captures
  const capturePositions = [
    { row: fromRow + direction, col: fromCol - 1 },
    { row: fromRow + direction, col: fromCol + 1 },
  ];

  capturePositions.forEach(({ row, col }) => {
    if (isValidPosition(row, col)) {
      const targetPiece = getPieceAt(board, row, col);
      if (targetPiece && targetPiece.color !== piece.color) {
        moves.push({ row, col });
      }
    }
  });

  return moves;
};

/**
 * Get valid moves for a rook
 * @param {(Piece|null)[][]} board - The game board
 * @param {number} fromRow - Source row
 * @param {number} fromCol - Source column
 * @param {Piece} piece - The rook piece
 * @returns {Array<{row: number, col: number}>} Valid moves
 */
export const getRookMoves = (board, fromRow, fromCol, piece) => {
  const moves = [];

  // Horizontal and vertical directions
  const directions = [
    { row: 0, col: 1 }, // Right
    { row: 0, col: -1 }, // Left
    { row: 1, col: 0 }, // Down
    { row: -1, col: 0 }, // Up
  ];

  directions.forEach(({ row: dRow, col: dCol }) => {
    for (let i = 1; i < BOARD_SIZE; i++) {
      const newRow = fromRow + dRow * i;
      const newCol = fromCol + dCol * i;

      if (!isValidPosition(newRow, newCol)) {
        break;
      }

      const targetPiece = getPieceAt(board, newRow, newCol);

      if (!targetPiece) {
        // Empty square - valid move
        moves.push({ row: newRow, col: newCol });
      } else if (targetPiece.color !== piece.color) {
        // Enemy piece - valid capture
        moves.push({ row: newRow, col: newCol });
        break; // Can't move further in this direction
      } else {
        // Own piece - blocked
        break;
      }
    }
  });

  return moves;
};

/**
 * Get valid moves for a knight
 * @param {(Piece|null)[][]} board - The game board
 * @param {number} fromRow - Source row
 * @param {number} fromCol - Source column
 * @param {Piece} piece - The knight piece
 * @returns {Array<{row: number, col: number}>} Valid moves
 */
export const getKnightMoves = (board, fromRow, fromCol, piece) => {
  const moves = [];

  // Knight moves in L-shape: 2 squares in one direction, 1 in perpendicular
  const knightMoves = [
    { row: -2, col: -1 },
    { row: -2, col: 1 },
    { row: -1, col: -2 },
    { row: -1, col: 2 },
    { row: 1, col: -2 },
    { row: 1, col: 2 },
    { row: 2, col: -1 },
    { row: 2, col: 1 },
  ];

  knightMoves.forEach(({ row: dRow, col: dCol }) => {
    const newRow = fromRow + dRow;
    const newCol = fromCol + dCol;

    if (isValidPosition(newRow, newCol)) {
      const targetPiece = getPieceAt(board, newRow, newCol);

      if (!targetPiece || targetPiece.color !== piece.color) {
        moves.push({ row: newRow, col: newCol });
      }
    }
  });

  return moves;
};

/**
 * Get valid moves for a bishop
 * @param {(Piece|null)[][]} board - The game board
 * @param {number} fromRow - Source row
 * @param {number} fromCol - Source column
 * @param {Piece} piece - The bishop piece
 * @returns {Array<{row: number, col: number}>} Valid moves
 */
export const getBishopMoves = (board, fromRow, fromCol, piece) => {
  const moves = [];

  // Diagonal directions
  const directions = [
    { row: 1, col: 1 }, // Down-right
    { row: 1, col: -1 }, // Down-left
    { row: -1, col: 1 }, // Up-right
    { row: -1, col: -1 }, // Up-left
  ];

  directions.forEach(({ row: dRow, col: dCol }) => {
    for (let i = 1; i < BOARD_SIZE; i++) {
      const newRow = fromRow + dRow * i;
      const newCol = fromCol + dCol * i;

      if (!isValidPosition(newRow, newCol)) {
        break;
      }

      const targetPiece = getPieceAt(board, newRow, newCol);

      if (!targetPiece) {
        // Empty square - valid move
        moves.push({ row: newRow, col: newCol });
      } else if (targetPiece.color !== piece.color) {
        // Enemy piece - valid capture
        moves.push({ row: newRow, col: newCol });
        break; // Can't move further in this direction
      } else {
        // Own piece - blocked
        break;
      }
    }
  });

  return moves;
};

/**
 * Get valid moves for a queen
 * @param {(Piece|null)[][]} board - The game board
 * @param {number} fromRow - Source row
 * @param {number} fromCol - Source column
 * @param {Piece} piece - The queen piece
 * @returns {Array<{row: number, col: number}>} Valid moves
 */
export const getQueenMoves = (board, fromRow, fromCol, piece) => {
  // Queen moves like both rook and bishop
  const rookMoves = getRookMoves(board, fromRow, fromCol, piece);
  const bishopMoves = getBishopMoves(board, fromRow, fromCol, piece);

  return [...rookMoves, ...bishopMoves];
};

/**
 * Get valid moves for a king
 * @param {(Piece|null)[][]} board - The game board
 * @param {number} fromRow - Source row
 * @param {number} fromCol - Source column
 * @param {Piece} piece - The king piece
 * @returns {Array<{row: number, col: number}>} Valid moves
 */
export const getKingMoves = (board, fromRow, fromCol, piece) => {
  const moves = [];

  // King moves one square in any direction
  const directions = [
    { row: -1, col: -1 },
    { row: -1, col: 0 },
    { row: -1, col: 1 },
    { row: 0, col: -1 },
    { row: 0, col: 1 },
    { row: 1, col: -1 },
    { row: 1, col: 0 },
    { row: 1, col: 1 },
  ];

  directions.forEach(({ row: dRow, col: dCol }) => {
    const newRow = fromRow + dRow;
    const newCol = fromCol + dCol;

    if (isValidPosition(newRow, newCol)) {
      const targetPiece = getPieceAt(board, newRow, newCol);

      if (!targetPiece || targetPiece.color !== piece.color) {
        moves.push({ row: newRow, col: newCol });
      }
    }
  });

  return moves;
};

/**
 * Check if a specific move is valid for a piece
 * @param {(Piece|null)[][]} board - The game board
 * @param {number} fromRow - Source row
 * @param {number} fromCol - Source column
 * @param {number} toRow - Destination row
 * @param {number} toCol - Destination column
 * @returns {boolean} True if move is valid
 */
export const isValidMove = (board, fromRow, fromCol, toRow, toCol) => {
  if (!isValidPosition(fromRow, fromCol) || !isValidPosition(toRow, toCol)) {
    return false;
  }

  // Can't move to same position
  if (fromRow === toRow && fromCol === toCol) {
    return false;
  }

  const piece = getPieceAt(board, fromRow, fromCol);
  if (!piece) {
    return false;
  }

  // Can't capture own piece
  const targetPiece = getPieceAt(board, toRow, toCol);
  if (targetPiece && targetPiece.color === piece.color) {
    return false;
  }

  const validMoves = getValidMoves(board, fromRow, fromCol);
  return validMoves.some((move) => move.row === toRow && move.col === toCol);
};

/**
 * Get all valid moves for all pieces of a specific color
 * @param {(Piece|null)[][]} board - The game board
 * @param {string} color - The color to get moves for
 * @returns {Array<{from: {row: number, col: number}, to: {row: number, col: number}, piece: Piece}>} All valid moves
 */
export const getAllValidMovesForColor = (board, color) => {
  const allMoves = [];

  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      const piece = getPieceAt(board, row, col);

      if (piece && piece.color === color) {
        const validMoves = getValidMoves(board, row, col);

        validMoves.forEach((move) => {
          allMoves.push({
            from: { row, col },
            to: { row: move.row, col: move.col },
            piece,
          });
        });
      }
    }
  }

  return allMoves;
};

/**
 * Check if a move follows the basic movement pattern for a piece type
 * @param {string} pieceType - The type of piece
 * @param {number} fromRow - Source row
 * @param {number} fromCol - Source column
 * @param {number} toRow - Destination row
 * @param {number} toCol - Destination column
 * @returns {boolean} True if move follows the piece's movement pattern
 */
export const isValidMovementPattern = (
  pieceType,
  fromRow,
  fromCol,
  toRow,
  toCol
) => {
  const rowDiff = Math.abs(toRow - fromRow);
  const colDiff = Math.abs(toCol - fromCol);

  switch (pieceType) {
    case PIECE_TYPES.PAWN:
      // Pawn moves are complex and handled in getPawnMoves
      return rowDiff <= 2 && colDiff <= 1;

    case PIECE_TYPES.ROOK:
      return (
        isOnSameRank(fromRow, fromCol, toRow, toCol) ||
        isOnSameFile(fromRow, fromCol, toRow, toCol)
      );

    case PIECE_TYPES.KNIGHT:
      return (
        (rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2)
      );

    case PIECE_TYPES.BISHOP:
      return isOnSameDiagonal(fromRow, fromCol, toRow, toCol);

    case PIECE_TYPES.QUEEN:
      return (
        isOnSameRank(fromRow, fromCol, toRow, toCol) ||
        isOnSameFile(fromRow, fromCol, toRow, toCol) ||
        isOnSameDiagonal(fromRow, fromCol, toRow, toCol)
      );

    case PIECE_TYPES.KING:
      return getDiagonalDistance(fromRow, fromCol, toRow, toCol) === 1;

    default:
      return false;
  }
};

/**
 * Check if a king of the specified color is in check
 * @param {(Piece|null)[][]} board - The game board
 * @param {string} kingColor - The color of the king to check
 * @returns {boolean} True if the king is in check
 */
export const isKingInCheck = (board, kingColor) => {
  // Find the king
  const kingPosition = findKing(board, kingColor);
  if (!kingPosition) {
    return false; // No king found
  }

  const opponentColor = getOpponentColor(kingColor);

  // Check if any opponent piece can attack the king's position
  return isSquareUnderAttackByColor(
    board,
    kingPosition.row,
    kingPosition.col,
    opponentColor
  );
};

/**
 * Check if a square is under attack by any piece of the specified color
 * @param {(Piece|null)[][]} board - The game board
 * @param {number} targetRow - Row of square to check
 * @param {number} targetCol - Column of square to check
 * @param {string} attackingColor - Color of pieces that might be attacking
 * @returns {boolean} True if square is under attack
 */
export const isSquareUnderAttackByColor = (
  board,
  targetRow,
  targetCol,
  attackingColor
) => {
  // Check all pieces of the attacking color
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      const piece = getPieceAt(board, row, col);

      if (piece && piece.color === attackingColor) {
        // Get valid moves for this piece (without check validation to avoid recursion)
        const moves = getValidMovesWithoutCheckValidation(board, row, col);

        // Check if any move targets the square we're checking
        if (
          moves.some((move) => move.row === targetRow && move.col === targetCol)
        ) {
          return true;
        }
      }
    }
  }

  return false;
};

/**
 * Get valid moves for a piece without checking if moves would put own king in check
 * This is used internally to avoid infinite recursion in check detection
 * @param {(Piece|null)[][]} board - The game board
 * @param {number} fromRow - Source row
 * @param {number} fromCol - Source column
 * @returns {Array<{row: number, col: number}>} Array of valid move positions
 */
export const getValidMovesWithoutCheckValidation = (
  board,
  fromRow,
  fromCol
) => {
  if (!isValidPosition(fromRow, fromCol)) {
    return [];
  }

  const piece = getPieceAt(board, fromRow, fromCol);
  if (!piece) {
    return [];
  }

  switch (piece.type) {
    case PIECE_TYPES.PAWN:
      return getPawnMoves(board, fromRow, fromCol, piece);
    case PIECE_TYPES.ROOK:
      return getRookMoves(board, fromRow, fromCol, piece);
    case PIECE_TYPES.KNIGHT:
      return getKnightMoves(board, fromRow, fromCol, piece);
    case PIECE_TYPES.BISHOP:
      return getBishopMoves(board, fromRow, fromCol, piece);
    case PIECE_TYPES.QUEEN:
      return getQueenMoves(board, fromRow, fromCol, piece);
    case PIECE_TYPES.KING:
      return getKingMoves(board, fromRow, fromCol, piece);
    default:
      return [];
  }
};

/**
 * Check if a move would put the moving player's king in check
 * @param {(Piece|null)[][]} board - The game board
 * @param {number} fromRow - Source row
 * @param {number} fromCol - Source column
 * @param {number} toRow - Destination row
 * @param {number} toCol - Destination column
 * @returns {boolean} True if move would put own king in check
 */
export const wouldMoveExposeKing = (board, fromRow, fromCol, toRow, toCol) => {
  const piece = getPieceAt(board, fromRow, fromCol);
  if (!piece) {
    return false;
  }

  // Make a temporary copy of the board with the move applied
  const tempBoard = copyBoard(board);

  // Apply the move
  tempBoard[toRow][toCol] = { ...piece };
  tempBoard[fromRow][fromCol] = null;

  // Check if this move puts the king in check
  const kingInCheck = isKingInCheck(tempBoard, piece.color);

  return kingInCheck;
};

/**
 * Get all legal moves for a piece (excluding moves that would put own king in check)
 * @param {(Piece|null)[][]} board - The game board
 * @param {number} fromRow - Source row
 * @param {number} fromCol - Source column
 * @returns {Array<{row: number, col: number}>} Array of legal move positions
 */
export const getLegalMoves = (board, fromRow, fromCol) => {
  const validMoves = getValidMovesWithoutCheckValidation(
    board,
    fromRow,
    fromCol
  );

  // Filter out moves that would put own king in check
  return validMoves.filter(
    (move) => !wouldMoveExposeKing(board, fromRow, fromCol, move.row, move.col)
  );
};

/**
 * Check if a player is in checkmate
 * @param {(Piece|null)[][]} board - The game board
 * @param {string} playerColor - The color of the player to check
 * @returns {boolean} True if player is in checkmate
 */
export const isCheckmate = (board, playerColor) => {
  // Must be in check to be in checkmate
  if (!isKingInCheck(board, playerColor)) {
    return false;
  }

  // Check if any legal move exists
  return getAllLegalMovesForColor(board, playerColor).length === 0;
};

/**
 * Check if a player is in stalemate
 * @param {(Piece|null)[][]} board - The game board
 * @param {string} playerColor - The color of the player to check
 * @returns {boolean} True if player is in stalemate
 */
export const isStalemate = (board, playerColor) => {
  // Must NOT be in check to be in stalemate
  if (isKingInCheck(board, playerColor)) {
    return false;
  }

  // Check if no legal moves exist
  return getAllLegalMovesForColor(board, playerColor).length === 0;
};

/**
 * Get all legal moves for all pieces of a specific color
 * @param {(Piece|null)[][]} board - The game board
 * @param {string} color - The color to get moves for
 * @returns {Array<{from: {row: number, col: number}, to: {row: number, col: number}, piece: Piece}>} All legal moves
 */
export const getAllLegalMovesForColor = (board, color) => {
  const allMoves = [];

  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      const piece = getPieceAt(board, row, col);

      if (piece && piece.color === color) {
        const legalMoves = getLegalMoves(board, row, col);

        legalMoves.forEach((move) => {
          allMoves.push({
            from: { row, col },
            to: { row: move.row, col: move.col },
            piece,
          });
        });
      }
    }
  }

  return allMoves;
};

/**
 * Check if a move is legal (valid move that doesn't put own king in check)
 * @param {(Piece|null)[][]} board - The game board
 * @param {number} fromRow - Source row
 * @param {number} fromCol - Source column
 * @param {number} toRow - Destination row
 * @param {number} toCol - Destination column
 * @returns {boolean} True if move is legal
 */
export const isLegalMove = (board, fromRow, fromCol, toRow, toCol) => {
  // First check if it's a valid move according to piece rules
  if (!isValidMove(board, fromRow, fromCol, toRow, toCol)) {
    return false;
  }

  // Then check if it would put own king in check
  return !wouldMoveExposeKing(board, fromRow, fromCol, toRow, toCol);
};

/**
 * Get the current game status for a player
 * @param {(Piece|null)[][]} board - The game board
 * @param {string} playerColor - The color of the current player
 * @returns {string} Game status: 'playing', 'check', 'checkmate', or 'stalemate'
 */
export const getGameStatus = (board, playerColor) => {
  const inCheck = isKingInCheck(board, playerColor);
  const hasLegalMoves = getAllLegalMovesForColor(board, playerColor).length > 0;

  if (inCheck && !hasLegalMoves) {
    return "checkmate";
  } else if (!inCheck && !hasLegalMoves) {
    return "stalemate";
  } else if (inCheck) {
    return "check";
  } else {
    return "playing";
  }
};

/**
 * Find the position of the king in check (if any)
 * @param {(Piece|null)[][]} board - The game board
 * @param {string} playerColor - The color of the player to check
 * @returns {{row: number, col: number}|null} Position of king in check, or null
 */
export const getKingInCheckPosition = (board, playerColor) => {
  if (isKingInCheck(board, playerColor)) {
    const kingPosition = findKing(board, playerColor);
    return kingPosition
      ? { row: kingPosition.row, col: kingPosition.col }
      : null;
  }
  return null;
};

/**
 * Execute a move on the board and return the new board state
 * @param {(Piece|null)[][]} board - The current game board
 * @param {number} fromRow - Source row
 * @param {number} fromCol - Source column
 * @param {number} toRow - Destination row
 * @param {number} toCol - Destination column
 * @param {string} promotionPiece - Optional piece type for pawn promotion
 * @returns {{newBoard: (Piece|null)[][], capturedPiece: Piece|null, promotedPiece: Piece|null, needsPromotion: boolean}} Result of move execution
 */
export const executeMove = (
  board,
  fromRow,
  fromCol,
  toRow,
  toCol,
  promotionPiece = null
) => {
  // Get the piece being moved
  const movingPiece = getPieceAt(board, fromRow, fromCol);
  if (!movingPiece) {
    throw new Error("Invalid move: No piece at source position");
  }

  // Validate the move is legal
  if (!isLegalMove(board, fromRow, fromCol, toRow, toCol)) {
    throw new Error("Invalid move: Move is not legal");
  }

  // Create a copy of the board
  const newBoard = copyBoard(board);

  // Get the piece being captured (if any)
  const capturedPiece = getPieceAt(newBoard, toRow, toCol);

  // Move the piece
  newBoard[toRow][toCol] = { ...movingPiece, hasMoved: true };
  newBoard[fromRow][fromCol] = null;

  // Handle pawn promotion
  let promotedPiece = null;
  let needsPromotion = false;

  if (movingPiece.type === PIECE_TYPES.PAWN) {
    const promotionRow = movingPiece.color === PIECE_COLORS.WHITE ? 0 : 7;
    if (toRow === promotionRow) {
      if (promotionPiece) {
        // Promote to specified piece
        const promoted = {
          type: promotionPiece,
          color: movingPiece.color,
          hasMoved: true,
        };
        newBoard[toRow][toCol] = promoted;
        promotedPiece = promoted;
      } else {
        // Needs promotion choice - use queen as default but indicate UI promotion needed
        const promoted = {
          type: PIECE_TYPES.QUEEN,
          color: movingPiece.color,
          hasMoved: true,
        };
        newBoard[toRow][toCol] = promoted;
        promotedPiece = promoted;
        needsPromotion = true; // UI should still show promotion dialog
      }
    }
  }

  return {
    newBoard,
    capturedPiece,
    promotedPiece,
    needsPromotion,
  };
};

/**
 * Make a move and return comprehensive move information
 * @param {(Piece|null)[][]} board - The current game board
 * @param {number} fromRow - Source row
 * @param {number} fromCol - Source column
 * @param {number} toRow - Destination row
 * @param {number} toCol - Destination column
 * @param {string} promotionPiece - Optional piece type for pawn promotion
 * @returns {{
 *   newBoard: (Piece|null)[][],
 *   move: {
 *     from: {row: number, col: number},
 *     to: {row: number, col: number},
 *     piece: Piece,
 *     capturedPiece: Piece|null,
 *     promotedPiece: Piece|null,
 *     isCapture: boolean,
 *     isPromotion: boolean
 *   },
 *   needsPromotion: boolean
 * }} Complete move result
 */
export const makeMove = (
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

  const result = executeMove(
    board,
    fromRow,
    fromCol,
    toRow,
    toCol,
    promotionPiece
  );

  const move = {
    from: { row: fromRow, col: fromCol },
    to: { row: toRow, col: toCol },
    piece: movingPiece,
    capturedPiece: result.capturedPiece,
    promotedPiece: result.promotedPiece,
    isCapture: result.capturedPiece !== null,
    isPromotion: result.promotedPiece !== null,
  };

  return {
    newBoard: result.newBoard,
    move,
    needsPromotion: result.needsPromotion,
  };
};

/**
 * Check if a move would result in a capture
 * @param {(Piece|null)[][]} board - The game board
 * @param {number} fromRow - Source row
 * @param {number} fromCol - Source column
 * @param {number} toRow - Destination row
 * @param {number} toCol - Destination column
 * @returns {boolean} True if move would capture a piece
 */
export const isCapture = (board, fromRow, fromCol, toRow, toCol) => {
  const movingPiece = getPieceAt(board, fromRow, fromCol);
  const targetPiece = getPieceAt(board, toRow, toCol);

  return (
    targetPiece !== null &&
    movingPiece !== null &&
    targetPiece.color !== movingPiece.color
  );
};

/**
 * Check if a pawn move would result in promotion
 * @param {(Piece|null)[][]} board - The game board
 * @param {number} fromRow - Source row
 * @param {number} fromCol - Source column
 * @param {number} toRow - Destination row
 * @param {number} toCol - Destination column
 * @returns {boolean} True if move would promote a pawn
 */
export const isPromotion = (board, fromRow, fromCol, toRow, toCol) => {
  const piece = getPieceAt(board, fromRow, fromCol);

  if (!piece || piece.type !== PIECE_TYPES.PAWN) {
    return false;
  }

  const promotionRow = piece.color === PIECE_COLORS.WHITE ? 0 : 7;
  return toRow === promotionRow;
};
