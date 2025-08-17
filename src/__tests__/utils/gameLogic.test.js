// Game logic and board utilities tests
import {
  initializeBoard,
  copyBoard,
  isSquareOccupied,
  getPieceAt,
  setPieceAt,
  movePiece,
  isPieceOwnedBy,
  findPieces,
  findKing,
  getAllPiecesOfColor,
  positionToAlgebraic,
  algebraicToPosition,
  getDistance,
  getDiagonalDistance,
  isOnSameDiagonal,
  isOnSameRank,
  isOnSameFile,
  getSquaresBetween,
  isPathClear,
  getEmptySquares,
  countPieces,
  getMaterialValue,
  isSquareUnderAttack,
} from "../../utils/boardUtils.js";
import {
  getValidMoves,
  getPawnMoves,
  getRookMoves,
  getKnightMoves,
  getBishopMoves,
  getQueenMoves,
  getKingMoves,
  isValidMove,
  getAllValidMovesForColor,
  isValidMovementPattern,
  isKingInCheck,
  isSquareUnderAttackByColor,
  getValidMovesWithoutCheckValidation,
  wouldMoveExposeKing,
  getLegalMoves,
  isCheckmate,
  isStalemate,
  getAllLegalMovesForColor,
  isLegalMove,
  getGameStatus,
  getKingInCheckPosition,
} from "../../utils/gameLogic.js";
import {
  PIECE_TYPES,
  PIECE_COLORS,
  createPiece,
} from "../../constants/gameConstants.js";

describe("Board Utilities", () => {
  let testBoard;

  beforeEach(() => {
    testBoard = initializeBoard();
  });

  describe("initializeBoard", () => {
    test("should create an 8x8 board", () => {
      const board = initializeBoard();
      expect(board).toHaveLength(8);
      expect(board[0]).toHaveLength(8);
    });

    test("should place pieces in correct starting positions", () => {
      const board = initializeBoard();

      // Check white king position
      expect(board[7][4]).toEqual({
        type: PIECE_TYPES.KING,
        color: PIECE_COLORS.WHITE,
        hasMoved: false,
      });

      // Check black king position
      expect(board[0][4]).toEqual({
        type: PIECE_TYPES.KING,
        color: PIECE_COLORS.BLACK,
        hasMoved: false,
      });

      // Check empty squares in the middle
      expect(board[3][3]).toBeNull();
      expect(board[4][4]).toBeNull();
    });
  });

  describe("copyBoard", () => {
    test("should create a deep copy of the board", () => {
      const originalBoard = initializeBoard();
      const copiedBoard = copyBoard(originalBoard);

      expect(copiedBoard).toEqual(originalBoard);
      expect(copiedBoard).not.toBe(originalBoard);
      expect(copiedBoard[0]).not.toBe(originalBoard[0]);
    });

    test("should not affect original when copy is modified", () => {
      const originalBoard = initializeBoard();
      const copiedBoard = copyBoard(originalBoard);

      copiedBoard[0][0] = null;

      expect(originalBoard[0][0]).not.toBeNull();
      expect(copiedBoard[0][0]).toBeNull();
    });
  });

  describe("isSquareOccupied", () => {
    test("should return true for occupied squares", () => {
      expect(isSquareOccupied(testBoard, 0, 0)).toBe(true);
      expect(isSquareOccupied(testBoard, 7, 7)).toBe(true);
    });

    test("should return false for empty squares", () => {
      expect(isSquareOccupied(testBoard, 3, 3)).toBe(false);
      expect(isSquareOccupied(testBoard, 4, 4)).toBe(false);
    });

    test("should return false for invalid positions", () => {
      expect(isSquareOccupied(testBoard, -1, 0)).toBe(false);
      expect(isSquareOccupied(testBoard, 8, 0)).toBe(false);
      expect(isSquareOccupied(testBoard, 0, -1)).toBe(false);
      expect(isSquareOccupied(testBoard, 0, 8)).toBe(false);
    });
  });

  describe("getPieceAt", () => {
    test("should return piece at valid position", () => {
      const piece = getPieceAt(testBoard, 0, 0);
      expect(piece).toEqual({
        type: PIECE_TYPES.ROOK,
        color: PIECE_COLORS.BLACK,
        hasMoved: false,
      });
    });

    test("should return null for empty squares", () => {
      expect(getPieceAt(testBoard, 3, 3)).toBeNull();
    });

    test("should return null for invalid positions", () => {
      expect(getPieceAt(testBoard, -1, 0)).toBeNull();
      expect(getPieceAt(testBoard, 8, 0)).toBeNull();
    });
  });

  describe("setPieceAt", () => {
    test("should place piece at valid position", () => {
      const newPiece = createPiece(PIECE_TYPES.QUEEN, PIECE_COLORS.WHITE);
      const newBoard = setPieceAt(testBoard, 3, 3, newPiece);

      expect(getPieceAt(newBoard, 3, 3)).toEqual(newPiece);
      expect(getPieceAt(testBoard, 3, 3)).toBeNull(); // Original unchanged
    });

    test("should clear square when piece is null", () => {
      const newBoard = setPieceAt(testBoard, 0, 0, null);
      expect(getPieceAt(newBoard, 0, 0)).toBeNull();
    });
  });

  describe("movePiece", () => {
    test("should move piece from source to destination", () => {
      const originalPiece = getPieceAt(testBoard, 1, 0);
      const newBoard = movePiece(testBoard, 1, 0, 3, 0);

      expect(getPieceAt(newBoard, 1, 0)).toBeNull();
      expect(getPieceAt(newBoard, 3, 0)).toEqual({
        ...originalPiece,
        hasMoved: true,
      });
    });

    test("should return original board for invalid moves", () => {
      const newBoard = movePiece(testBoard, -1, 0, 3, 0);
      expect(newBoard).toBe(testBoard);
    });
  });

  describe("findKing", () => {
    test("should find white king", () => {
      const whiteKing = findKing(testBoard, PIECE_COLORS.WHITE);
      expect(whiteKing).toEqual({
        row: 7,
        col: 4,
        piece: {
          type: PIECE_TYPES.KING,
          color: PIECE_COLORS.WHITE,
          hasMoved: false,
        },
      });
    });

    test("should find black king", () => {
      const blackKing = findKing(testBoard, PIECE_COLORS.BLACK);
      expect(blackKing).toEqual({
        row: 0,
        col: 4,
        piece: {
          type: PIECE_TYPES.KING,
          color: PIECE_COLORS.BLACK,
          hasMoved: false,
        },
      });
    });
  });

  describe("positionToAlgebraic", () => {
    test("should convert positions correctly", () => {
      expect(positionToAlgebraic(0, 0)).toBe("a8");
      expect(positionToAlgebraic(7, 7)).toBe("h1");
      expect(positionToAlgebraic(3, 4)).toBe("e5");
    });

    test("should return empty string for invalid positions", () => {
      expect(positionToAlgebraic(-1, 0)).toBe("");
      expect(positionToAlgebraic(8, 0)).toBe("");
    });
  });

  describe("algebraicToPosition", () => {
    test("should convert algebraic notation correctly", () => {
      expect(algebraicToPosition("a8")).toEqual([0, 0]);
      expect(algebraicToPosition("h1")).toEqual([7, 7]);
      expect(algebraicToPosition("e5")).toEqual([3, 4]);
    });

    test("should return null for invalid notation", () => {
      expect(algebraicToPosition("z9")).toBeNull();
      expect(algebraicToPosition("a")).toBeNull();
      expect(algebraicToPosition("")).toBeNull();
    });
  });

  describe("getDistance", () => {
    test("should calculate Manhattan distance correctly", () => {
      expect(getDistance(0, 0, 3, 4)).toBe(7);
      expect(getDistance(2, 2, 2, 2)).toBe(0);
      expect(getDistance(1, 1, 2, 2)).toBe(2);
    });
  });

  describe("getDiagonalDistance", () => {
    test("should calculate diagonal distance correctly", () => {
      expect(getDiagonalDistance(0, 0, 3, 3)).toBe(3);
      expect(getDiagonalDistance(1, 1, 2, 3)).toBe(2);
      expect(getDiagonalDistance(2, 2, 2, 2)).toBe(0);
    });
  });

  describe("isOnSameDiagonal", () => {
    test("should detect diagonal alignment", () => {
      expect(isOnSameDiagonal(0, 0, 3, 3)).toBe(true);
      expect(isOnSameDiagonal(1, 1, 4, 4)).toBe(true);
      expect(isOnSameDiagonal(0, 7, 7, 0)).toBe(true);
      expect(isOnSameDiagonal(0, 0, 1, 2)).toBe(false);
    });
  });

  describe("isOnSameRank", () => {
    test("should detect same rank (row)", () => {
      expect(isOnSameRank(3, 0, 3, 7)).toBe(true);
      expect(isOnSameRank(0, 0, 1, 0)).toBe(false);
    });
  });

  describe("isOnSameFile", () => {
    test("should detect same file (column)", () => {
      expect(isOnSameFile(0, 3, 7, 3)).toBe(true);
      expect(isOnSameFile(0, 0, 0, 1)).toBe(false);
    });
  });

  describe("getSquaresBetween", () => {
    test("should return squares between horizontal positions", () => {
      const squares = getSquaresBetween(0, 0, 0, 3);
      expect(squares).toEqual([
        { row: 0, col: 1 },
        { row: 0, col: 2 },
      ]);
    });

    test("should return squares between vertical positions", () => {
      const squares = getSquaresBetween(0, 0, 3, 0);
      expect(squares).toEqual([
        { row: 1, col: 0 },
        { row: 2, col: 0 },
      ]);
    });

    test("should return squares between diagonal positions", () => {
      const squares = getSquaresBetween(0, 0, 3, 3);
      expect(squares).toEqual([
        { row: 1, col: 1 },
        { row: 2, col: 2 },
      ]);
    });

    test("should return empty array for same position", () => {
      const squares = getSquaresBetween(2, 2, 2, 2);
      expect(squares).toEqual([]);
    });

    test("should return empty array for invalid line", () => {
      const squares = getSquaresBetween(0, 0, 1, 2);
      expect(squares).toEqual([]);
    });
  });

  describe("isPathClear", () => {
    test("should return true for clear horizontal path", () => {
      expect(isPathClear(testBoard, 3, 0, 3, 7)).toBe(true);
    });

    test("should return false for blocked path", () => {
      expect(isPathClear(testBoard, 0, 0, 0, 7)).toBe(false);
    });

    test("should return true for adjacent squares", () => {
      expect(isPathClear(testBoard, 3, 3, 3, 4)).toBe(true);
    });
  });

  describe("getEmptySquares", () => {
    test("should return all empty squares", () => {
      const emptySquares = getEmptySquares(testBoard);
      expect(emptySquares.length).toBe(32); // 64 - 32 pieces = 32 empty squares

      // Check that all returned squares are actually empty
      emptySquares.forEach(({ row, col }) => {
        expect(getPieceAt(testBoard, row, col)).toBeNull();
      });
    });
  });

  describe("countPieces", () => {
    test("should count pieces correctly", () => {
      expect(countPieces(testBoard, PIECE_TYPES.PAWN, PIECE_COLORS.WHITE)).toBe(
        8
      );
      expect(countPieces(testBoard, PIECE_TYPES.ROOK, PIECE_COLORS.BLACK)).toBe(
        2
      );
      expect(countPieces(testBoard, PIECE_TYPES.KING, PIECE_COLORS.WHITE)).toBe(
        1
      );
    });
  });

  describe("getMaterialValue", () => {
    test("should calculate material value correctly", () => {
      const whiteValue = getMaterialValue(testBoard, PIECE_COLORS.WHITE);
      const blackValue = getMaterialValue(testBoard, PIECE_COLORS.BLACK);

      // Each side starts with: 8 pawns (8) + 2 rooks (10) + 2 knights (6) + 2 bishops (6) + 1 queen (9) = 39
      expect(whiteValue).toBe(39);
      expect(blackValue).toBe(39);
    });
  });

  describe("isSquareUnderAttack", () => {
    test("should detect pawn attacks", () => {
      // White pawn on e2 can attack d3 and f3
      expect(isSquareUnderAttack(testBoard, 5, 3, PIECE_COLORS.WHITE)).toBe(
        true
      ); // d3
      expect(isSquareUnderAttack(testBoard, 5, 5, PIECE_COLORS.WHITE)).toBe(
        true
      ); // f3
      // e3 is attacked by knight on g1, so let's test a different square
      expect(isSquareUnderAttack(testBoard, 4, 4, PIECE_COLORS.WHITE)).toBe(
        false
      ); // e4 (not under attack by pawns)
    });

    test("should detect rook attacks on clear paths", () => {
      // Create a board with a rook in the middle
      const customBoard = Array(8)
        .fill(null)
        .map(() => Array(8).fill(null));
      customBoard[4][4] = createPiece(PIECE_TYPES.ROOK, PIECE_COLORS.WHITE);

      expect(isSquareUnderAttack(customBoard, 4, 0, PIECE_COLORS.WHITE)).toBe(
        true
      ); // Same rank
      expect(isSquareUnderAttack(customBoard, 0, 4, PIECE_COLORS.WHITE)).toBe(
        true
      ); // Same file
      expect(isSquareUnderAttack(customBoard, 3, 3, PIECE_COLORS.WHITE)).toBe(
        false
      ); // Diagonal
    });

    test("should detect knight attacks", () => {
      // Knight on b1 can attack various squares
      expect(isSquareUnderAttack(testBoard, 5, 0, PIECE_COLORS.WHITE)).toBe(
        true
      ); // a3
      expect(isSquareUnderAttack(testBoard, 5, 2, PIECE_COLORS.WHITE)).toBe(
        true
      ); // c3
      expect(isSquareUnderAttack(testBoard, 6, 3, PIECE_COLORS.WHITE)).toBe(
        true
      ); // d2
    });
  });

  // Game Logic Tests
  describe("Pawn Movement", () => {
    test("should allow pawn to move one square forward", () => {
      const moves = getPawnMoves(
        testBoard,
        6,
        4,
        createPiece(PIECE_TYPES.PAWN, PIECE_COLORS.WHITE)
      );
      expect(moves).toContainEqual({ row: 5, col: 4 });
    });

    test("should allow pawn to move two squares from starting position", () => {
      const moves = getPawnMoves(
        testBoard,
        6,
        4,
        createPiece(PIECE_TYPES.PAWN, PIECE_COLORS.WHITE)
      );
      expect(moves).toContainEqual({ row: 4, col: 4 });
    });

    test("should not allow pawn to move two squares if not on starting row", () => {
      const moves = getPawnMoves(
        testBoard,
        5,
        4,
        createPiece(PIECE_TYPES.PAWN, PIECE_COLORS.WHITE)
      );
      expect(moves).not.toContainEqual({ row: 3, col: 4 });
    });

    test("should allow pawn to capture diagonally", () => {
      const customBoard = Array(8)
        .fill(null)
        .map(() => Array(8).fill(null));
      customBoard[4][4] = createPiece(PIECE_TYPES.PAWN, PIECE_COLORS.WHITE);
      customBoard[3][3] = createPiece(PIECE_TYPES.PAWN, PIECE_COLORS.BLACK);
      customBoard[3][5] = createPiece(PIECE_TYPES.PAWN, PIECE_COLORS.BLACK);

      const moves = getPawnMoves(customBoard, 4, 4, customBoard[4][4]);
      expect(moves).toContainEqual({ row: 3, col: 3 });
      expect(moves).toContainEqual({ row: 3, col: 5 });
    });

    test("should not allow pawn to capture forward", () => {
      const customBoard = Array(8)
        .fill(null)
        .map(() => Array(8).fill(null));
      customBoard[4][4] = createPiece(PIECE_TYPES.PAWN, PIECE_COLORS.WHITE);
      customBoard[3][4] = createPiece(PIECE_TYPES.PAWN, PIECE_COLORS.BLACK);

      const moves = getPawnMoves(customBoard, 4, 4, customBoard[4][4]);
      expect(moves).not.toContainEqual({ row: 3, col: 4 });
    });

    test("should handle black pawn movement direction", () => {
      const moves = getPawnMoves(
        testBoard,
        1,
        4,
        createPiece(PIECE_TYPES.PAWN, PIECE_COLORS.BLACK)
      );
      expect(moves).toContainEqual({ row: 2, col: 4 });
      expect(moves).toContainEqual({ row: 3, col: 4 });
    });
  });

  describe("Rook Movement", () => {
    test("should move horizontally and vertically", () => {
      const customBoard = Array(8)
        .fill(null)
        .map(() => Array(8).fill(null));
      customBoard[4][4] = createPiece(PIECE_TYPES.ROOK, PIECE_COLORS.WHITE);

      const moves = getRookMoves(customBoard, 4, 4, customBoard[4][4]);

      // Should include horizontal moves
      expect(moves).toContainEqual({ row: 4, col: 0 });
      expect(moves).toContainEqual({ row: 4, col: 7 });

      // Should include vertical moves
      expect(moves).toContainEqual({ row: 0, col: 4 });
      expect(moves).toContainEqual({ row: 7, col: 4 });
    });

    test("should be blocked by own pieces", () => {
      const customBoard = Array(8)
        .fill(null)
        .map(() => Array(8).fill(null));
      customBoard[4][4] = createPiece(PIECE_TYPES.ROOK, PIECE_COLORS.WHITE);
      customBoard[4][6] = createPiece(PIECE_TYPES.PAWN, PIECE_COLORS.WHITE);

      const moves = getRookMoves(customBoard, 4, 4, customBoard[4][4]);

      expect(moves).toContainEqual({ row: 4, col: 5 });
      expect(moves).not.toContainEqual({ row: 4, col: 6 });
      expect(moves).not.toContainEqual({ row: 4, col: 7 });
    });

    test("should capture enemy pieces", () => {
      const customBoard = Array(8)
        .fill(null)
        .map(() => Array(8).fill(null));
      customBoard[4][4] = createPiece(PIECE_TYPES.ROOK, PIECE_COLORS.WHITE);
      customBoard[4][6] = createPiece(PIECE_TYPES.PAWN, PIECE_COLORS.BLACK);

      const moves = getRookMoves(customBoard, 4, 4, customBoard[4][4]);

      expect(moves).toContainEqual({ row: 4, col: 5 });
      expect(moves).toContainEqual({ row: 4, col: 6 });
      expect(moves).not.toContainEqual({ row: 4, col: 7 });
    });
  });

  describe("Knight Movement", () => {
    test("should move in L-shape pattern", () => {
      const customBoard = Array(8)
        .fill(null)
        .map(() => Array(8).fill(null));
      customBoard[4][4] = createPiece(PIECE_TYPES.KNIGHT, PIECE_COLORS.WHITE);

      const moves = getKnightMoves(customBoard, 4, 4, customBoard[4][4]);

      const expectedMoves = [
        { row: 2, col: 3 },
        { row: 2, col: 5 },
        { row: 3, col: 2 },
        { row: 3, col: 6 },
        { row: 5, col: 2 },
        { row: 5, col: 6 },
        { row: 6, col: 3 },
        { row: 6, col: 5 },
      ];

      expectedMoves.forEach((move) => {
        expect(moves).toContainEqual(move);
      });
    });

    test("should not be blocked by pieces in between", () => {
      const customBoard = Array(8)
        .fill(null)
        .map(() => Array(8).fill(null));
      customBoard[4][4] = createPiece(PIECE_TYPES.KNIGHT, PIECE_COLORS.WHITE);
      customBoard[3][4] = createPiece(PIECE_TYPES.PAWN, PIECE_COLORS.BLACK);
      customBoard[4][3] = createPiece(PIECE_TYPES.PAWN, PIECE_COLORS.BLACK);

      const moves = getKnightMoves(customBoard, 4, 4, customBoard[4][4]);

      // Knight should still be able to jump over pieces
      expect(moves).toContainEqual({ row: 2, col: 3 });
      expect(moves).toContainEqual({ row: 2, col: 5 });
    });

    test("should not move to squares occupied by own pieces", () => {
      const customBoard = Array(8)
        .fill(null)
        .map(() => Array(8).fill(null));
      customBoard[4][4] = createPiece(PIECE_TYPES.KNIGHT, PIECE_COLORS.WHITE);
      customBoard[2][3] = createPiece(PIECE_TYPES.PAWN, PIECE_COLORS.WHITE);

      const moves = getKnightMoves(customBoard, 4, 4, customBoard[4][4]);

      expect(moves).not.toContainEqual({ row: 2, col: 3 });
    });
  });

  describe("Bishop Movement", () => {
    test("should move diagonally", () => {
      const customBoard = Array(8)
        .fill(null)
        .map(() => Array(8).fill(null));
      customBoard[4][4] = createPiece(PIECE_TYPES.BISHOP, PIECE_COLORS.WHITE);

      const moves = getBishopMoves(customBoard, 4, 4, customBoard[4][4]);

      // Should include diagonal moves
      expect(moves).toContainEqual({ row: 0, col: 0 });
      expect(moves).toContainEqual({ row: 7, col: 7 });
      expect(moves).toContainEqual({ row: 1, col: 7 });
      expect(moves).toContainEqual({ row: 7, col: 1 });
    });

    test("should be blocked by pieces", () => {
      const customBoard = Array(8)
        .fill(null)
        .map(() => Array(8).fill(null));
      customBoard[4][4] = createPiece(PIECE_TYPES.BISHOP, PIECE_COLORS.WHITE);
      customBoard[6][6] = createPiece(PIECE_TYPES.PAWN, PIECE_COLORS.BLACK);

      const moves = getBishopMoves(customBoard, 4, 4, customBoard[4][4]);

      expect(moves).toContainEqual({ row: 5, col: 5 });
      expect(moves).toContainEqual({ row: 6, col: 6 });
      expect(moves).not.toContainEqual({ row: 7, col: 7 });
    });
  });

  describe("Queen Movement", () => {
    test("should move like both rook and bishop", () => {
      const customBoard = Array(8)
        .fill(null)
        .map(() => Array(8).fill(null));
      customBoard[4][4] = createPiece(PIECE_TYPES.QUEEN, PIECE_COLORS.WHITE);

      const moves = getQueenMoves(customBoard, 4, 4, customBoard[4][4]);

      // Should include rook-like moves
      expect(moves).toContainEqual({ row: 4, col: 0 });
      expect(moves).toContainEqual({ row: 0, col: 4 });

      // Should include bishop-like moves
      expect(moves).toContainEqual({ row: 0, col: 0 });
      expect(moves).toContainEqual({ row: 7, col: 7 });
    });
  });

  describe("King Movement", () => {
    test("should move one square in any direction", () => {
      const customBoard = Array(8)
        .fill(null)
        .map(() => Array(8).fill(null));
      customBoard[4][4] = createPiece(PIECE_TYPES.KING, PIECE_COLORS.WHITE);

      const moves = getKingMoves(customBoard, 4, 4, customBoard[4][4]);

      const expectedMoves = [
        { row: 3, col: 3 },
        { row: 3, col: 4 },
        { row: 3, col: 5 },
        { row: 4, col: 3 },
        { row: 4, col: 5 },
        { row: 5, col: 3 },
        { row: 5, col: 4 },
        { row: 5, col: 5 },
      ];

      expectedMoves.forEach((move) => {
        expect(moves).toContainEqual(move);
      });

      expect(moves).toHaveLength(8);
    });

    test("should not move to squares occupied by own pieces", () => {
      const customBoard = Array(8)
        .fill(null)
        .map(() => Array(8).fill(null));
      customBoard[4][4] = createPiece(PIECE_TYPES.KING, PIECE_COLORS.WHITE);
      customBoard[3][3] = createPiece(PIECE_TYPES.PAWN, PIECE_COLORS.WHITE);

      const moves = getKingMoves(customBoard, 4, 4, customBoard[4][4]);

      expect(moves).not.toContainEqual({ row: 3, col: 3 });
      expect(moves).toHaveLength(7);
    });
  });

  describe("General Move Validation", () => {
    test("should validate moves correctly", () => {
      expect(isValidMove(testBoard, 6, 4, 5, 4)).toBe(true); // Pawn forward
      expect(isValidMove(testBoard, 6, 4, 4, 4)).toBe(true); // Pawn two squares
      expect(isValidMove(testBoard, 7, 1, 5, 2)).toBe(true); // Knight move
      expect(isValidMove(testBoard, 6, 4, 5, 5)).toBe(false); // Invalid pawn diagonal without capture
    });

    test("should reject invalid moves", () => {
      expect(isValidMove(testBoard, 6, 4, 6, 4)).toBe(false); // Same position
      expect(isValidMove(testBoard, 6, 4, 8, 4)).toBe(false); // Out of bounds
      expect(isValidMove(testBoard, 3, 3, 4, 4)).toBe(false); // No piece at source
    });

    test("should not allow capturing own pieces", () => {
      expect(isValidMove(testBoard, 7, 0, 6, 0)).toBe(false); // Rook capturing own pawn
    });
  });

  describe("Movement Pattern Validation", () => {
    test("should validate piece movement patterns", () => {
      expect(isValidMovementPattern(PIECE_TYPES.ROOK, 0, 0, 0, 7)).toBe(true);
      expect(isValidMovementPattern(PIECE_TYPES.ROOK, 0, 0, 7, 0)).toBe(true);
      expect(isValidMovementPattern(PIECE_TYPES.ROOK, 0, 0, 1, 1)).toBe(false);

      expect(isValidMovementPattern(PIECE_TYPES.BISHOP, 0, 0, 7, 7)).toBe(true);
      expect(isValidMovementPattern(PIECE_TYPES.BISHOP, 0, 0, 0, 7)).toBe(
        false
      );

      expect(isValidMovementPattern(PIECE_TYPES.KNIGHT, 0, 0, 2, 1)).toBe(true);
      expect(isValidMovementPattern(PIECE_TYPES.KNIGHT, 0, 0, 1, 2)).toBe(true);
      expect(isValidMovementPattern(PIECE_TYPES.KNIGHT, 0, 0, 2, 2)).toBe(
        false
      );

      expect(isValidMovementPattern(PIECE_TYPES.KING, 4, 4, 5, 5)).toBe(true);
      expect(isValidMovementPattern(PIECE_TYPES.KING, 4, 4, 6, 6)).toBe(false);
    });
  });

  describe("Get All Valid Moves", () => {
    test("should get all valid moves for a color", () => {
      const whiteMoves = getAllValidMovesForColor(
        testBoard,
        PIECE_COLORS.WHITE
      );

      // White should have moves available (pawns and knights)
      expect(whiteMoves.length).toBeGreaterThan(0);

      // Check that all moves are for white pieces
      whiteMoves.forEach((move) => {
        expect(move.piece.color).toBe(PIECE_COLORS.WHITE);
      });
    });

    test("should return empty array for empty board", () => {
      const emptyBoard = Array(8)
        .fill(null)
        .map(() => Array(8).fill(null));
      const moves = getAllValidMovesForColor(emptyBoard, PIECE_COLORS.WHITE);

      expect(moves).toHaveLength(0);
    });
  });

  describe("Check Detection", () => {
    test("should detect when king is in check", () => {
      const customBoard = Array(8)
        .fill(null)
        .map(() => Array(8).fill(null));
      customBoard[4][4] = createPiece(PIECE_TYPES.KING, PIECE_COLORS.WHITE);
      customBoard[4][0] = createPiece(PIECE_TYPES.ROOK, PIECE_COLORS.BLACK);

      expect(isKingInCheck(customBoard, PIECE_COLORS.WHITE)).toBe(true);
    });

    test("should return false when king is not in check", () => {
      const customBoard = Array(8)
        .fill(null)
        .map(() => Array(8).fill(null));
      customBoard[4][4] = createPiece(PIECE_TYPES.KING, PIECE_COLORS.WHITE);
      customBoard[6][0] = createPiece(PIECE_TYPES.ROOK, PIECE_COLORS.BLACK);

      expect(isKingInCheck(customBoard, PIECE_COLORS.WHITE)).toBe(false);
    });

    test("should detect check from different piece types", () => {
      const testCases = [
        {
          name: "rook check",
          kingPos: [4, 4],
          attackerPos: [4, 0],
          attackerType: PIECE_TYPES.ROOK,
        },
        {
          name: "bishop check",
          kingPos: [4, 4],
          attackerPos: [0, 0],
          attackerType: PIECE_TYPES.BISHOP,
        },
        {
          name: "queen check",
          kingPos: [4, 4],
          attackerPos: [4, 7],
          attackerType: PIECE_TYPES.QUEEN,
        },
        {
          name: "knight check",
          kingPos: [4, 4],
          attackerPos: [2, 3],
          attackerType: PIECE_TYPES.KNIGHT,
        },
        {
          name: "pawn check",
          kingPos: [4, 4],
          attackerPos: [3, 3], // Black pawn attacks diagonally down
          attackerType: PIECE_TYPES.PAWN,
        },
      ];

      testCases.forEach(({ name, kingPos, attackerPos, attackerType }) => {
        const customBoard = Array(8)
          .fill(null)
          .map(() => Array(8).fill(null));
        customBoard[kingPos[0]][kingPos[1]] = createPiece(
          PIECE_TYPES.KING,
          PIECE_COLORS.WHITE
        );
        customBoard[attackerPos[0]][attackerPos[1]] = createPiece(
          attackerType,
          PIECE_COLORS.BLACK
        );

        expect(isKingInCheck(customBoard, PIECE_COLORS.WHITE)).toBe(true);
      });
    });
  });

  describe("Square Attack Detection", () => {
    test("should detect when square is under attack", () => {
      const customBoard = Array(8)
        .fill(null)
        .map(() => Array(8).fill(null));
      customBoard[0][0] = createPiece(PIECE_TYPES.ROOK, PIECE_COLORS.BLACK);

      expect(
        isSquareUnderAttackByColor(customBoard, 0, 7, PIECE_COLORS.BLACK)
      ).toBe(true);
      expect(
        isSquareUnderAttackByColor(customBoard, 7, 0, PIECE_COLORS.BLACK)
      ).toBe(true);
      expect(
        isSquareUnderAttackByColor(customBoard, 1, 1, PIECE_COLORS.BLACK)
      ).toBe(false);
    });
  });

  describe("Move Exposure Detection", () => {
    test("should detect when move would expose king to check", () => {
      const customBoard = Array(8)
        .fill(null)
        .map(() => Array(8).fill(null));
      customBoard[4][4] = createPiece(PIECE_TYPES.KING, PIECE_COLORS.WHITE);
      customBoard[4][3] = createPiece(PIECE_TYPES.BISHOP, PIECE_COLORS.WHITE);
      customBoard[4][0] = createPiece(PIECE_TYPES.ROOK, PIECE_COLORS.BLACK);

      // Moving the bishop would expose the king to the rook
      expect(wouldMoveExposeKing(customBoard, 4, 3, 5, 4)).toBe(true);
    });

    test("should return false when move doesn't expose king", () => {
      const customBoard = Array(8)
        .fill(null)
        .map(() => Array(8).fill(null));
      customBoard[4][4] = createPiece(PIECE_TYPES.KING, PIECE_COLORS.WHITE);
      customBoard[3][4] = createPiece(PIECE_TYPES.PAWN, PIECE_COLORS.WHITE);

      // Moving pawn forward doesn't expose king
      expect(wouldMoveExposeKing(customBoard, 3, 4, 2, 4)).toBe(false);
    });
  });

  describe("Legal Moves", () => {
    test("should filter out moves that would put king in check", () => {
      const customBoard = Array(8)
        .fill(null)
        .map(() => Array(8).fill(null));
      customBoard[4][4] = createPiece(PIECE_TYPES.KING, PIECE_COLORS.WHITE);
      customBoard[4][3] = createPiece(PIECE_TYPES.BISHOP, PIECE_COLORS.WHITE);
      customBoard[4][0] = createPiece(PIECE_TYPES.ROOK, PIECE_COLORS.BLACK);

      const legalMoves = getLegalMoves(customBoard, 4, 3);
      const allMoves = getValidMovesWithoutCheckValidation(customBoard, 4, 3);

      // Legal moves should be fewer than all possible moves
      expect(legalMoves.length).toBeLessThan(allMoves.length);

      // The move that would expose king should not be in legal moves
      expect(legalMoves).not.toContainEqual({ row: 5, col: 4 });
    });

    test("should include all moves when no check exposure", () => {
      const customBoard = Array(8)
        .fill(null)
        .map(() => Array(8).fill(null));
      customBoard[4][4] = createPiece(PIECE_TYPES.QUEEN, PIECE_COLORS.WHITE);

      const legalMoves = getLegalMoves(customBoard, 4, 4);
      const allMoves = getValidMovesWithoutCheckValidation(customBoard, 4, 4);

      expect(legalMoves).toEqual(allMoves);
    });
  });

  describe("Checkmate Detection", () => {
    test("should detect checkmate", () => {
      // Simple back-rank mate
      const customBoard = Array(8)
        .fill(null)
        .map(() => Array(8).fill(null));
      customBoard[7][4] = createPiece(PIECE_TYPES.KING, PIECE_COLORS.WHITE);
      customBoard[6][3] = createPiece(PIECE_TYPES.PAWN, PIECE_COLORS.WHITE);
      customBoard[6][4] = createPiece(PIECE_TYPES.PAWN, PIECE_COLORS.WHITE);
      customBoard[6][5] = createPiece(PIECE_TYPES.PAWN, PIECE_COLORS.WHITE);
      customBoard[7][0] = createPiece(PIECE_TYPES.ROOK, PIECE_COLORS.BLACK); // Rook on same rank as king

      expect(isCheckmate(customBoard, PIECE_COLORS.WHITE)).toBe(true);
    });

    test("should return false when not in checkmate", () => {
      expect(isCheckmate(testBoard, PIECE_COLORS.WHITE)).toBe(false);
    });

    test("should return false when in check but has legal moves", () => {
      const customBoard = Array(8)
        .fill(null)
        .map(() => Array(8).fill(null));
      customBoard[4][4] = createPiece(PIECE_TYPES.KING, PIECE_COLORS.WHITE);
      customBoard[4][0] = createPiece(PIECE_TYPES.ROOK, PIECE_COLORS.BLACK);

      expect(isCheckmate(customBoard, PIECE_COLORS.WHITE)).toBe(false);
    });
  });

  describe("Stalemate Detection", () => {
    test("should detect stalemate", () => {
      // King with no legal moves but not in check
      const customBoard = Array(8)
        .fill(null)
        .map(() => Array(8).fill(null));
      customBoard[0][0] = createPiece(PIECE_TYPES.KING, PIECE_COLORS.WHITE);
      customBoard[1][2] = createPiece(PIECE_TYPES.KING, PIECE_COLORS.BLACK);
      customBoard[2][1] = createPiece(PIECE_TYPES.QUEEN, PIECE_COLORS.BLACK);

      expect(isStalemate(customBoard, PIECE_COLORS.WHITE)).toBe(true);
    });

    test("should return false when not in stalemate", () => {
      expect(isStalemate(testBoard, PIECE_COLORS.WHITE)).toBe(false);
    });

    test("should return false when in check", () => {
      const customBoard = Array(8)
        .fill(null)
        .map(() => Array(8).fill(null));
      customBoard[4][4] = createPiece(PIECE_TYPES.KING, PIECE_COLORS.WHITE);
      customBoard[4][0] = createPiece(PIECE_TYPES.ROOK, PIECE_COLORS.BLACK);

      expect(isStalemate(customBoard, PIECE_COLORS.WHITE)).toBe(false);
    });
  });

  describe("Game Status", () => {
    test("should return correct game status", () => {
      // Normal position
      expect(getGameStatus(testBoard, PIECE_COLORS.WHITE)).toBe("playing");

      // Check position
      const checkBoard = Array(8)
        .fill(null)
        .map(() => Array(8).fill(null));
      checkBoard[4][4] = createPiece(PIECE_TYPES.KING, PIECE_COLORS.WHITE);
      checkBoard[4][0] = createPiece(PIECE_TYPES.ROOK, PIECE_COLORS.BLACK);
      expect(getGameStatus(checkBoard, PIECE_COLORS.WHITE)).toBe("check");

      // Checkmate position
      const checkmateBoard = Array(8)
        .fill(null)
        .map(() => Array(8).fill(null));
      checkmateBoard[7][4] = createPiece(PIECE_TYPES.KING, PIECE_COLORS.WHITE);
      checkmateBoard[6][3] = createPiece(PIECE_TYPES.PAWN, PIECE_COLORS.WHITE);
      checkmateBoard[6][4] = createPiece(PIECE_TYPES.PAWN, PIECE_COLORS.WHITE);
      checkmateBoard[6][5] = createPiece(PIECE_TYPES.PAWN, PIECE_COLORS.WHITE);
      checkmateBoard[7][0] = createPiece(PIECE_TYPES.ROOK, PIECE_COLORS.BLACK); // Rook on same rank as king
      expect(getGameStatus(checkmateBoard, PIECE_COLORS.WHITE)).toBe(
        "checkmate"
      );

      // Stalemate position
      const stalemateBoard = Array(8)
        .fill(null)
        .map(() => Array(8).fill(null));
      stalemateBoard[0][0] = createPiece(PIECE_TYPES.KING, PIECE_COLORS.WHITE);
      stalemateBoard[1][2] = createPiece(PIECE_TYPES.KING, PIECE_COLORS.BLACK);
      stalemateBoard[2][1] = createPiece(PIECE_TYPES.QUEEN, PIECE_COLORS.BLACK);
      expect(getGameStatus(stalemateBoard, PIECE_COLORS.WHITE)).toBe(
        "stalemate"
      );
    });
  });

  describe("King Position Detection", () => {
    test("should return king position when in check", () => {
      const customBoard = Array(8)
        .fill(null)
        .map(() => Array(8).fill(null));
      customBoard[4][4] = createPiece(PIECE_TYPES.KING, PIECE_COLORS.WHITE);
      customBoard[4][0] = createPiece(PIECE_TYPES.ROOK, PIECE_COLORS.BLACK);

      const kingPos = getKingInCheckPosition(customBoard, PIECE_COLORS.WHITE);
      expect(kingPos).toEqual({ row: 4, col: 4 });
    });

    test("should return null when king is not in check", () => {
      const kingPos = getKingInCheckPosition(testBoard, PIECE_COLORS.WHITE);
      expect(kingPos).toBeNull();
    });
  });

  describe("Legal Move Validation", () => {
    test("should validate legal moves correctly", () => {
      // Normal pawn move should be legal
      expect(isLegalMove(testBoard, 6, 4, 5, 4)).toBe(true);

      // Move that would expose king should be illegal
      const customBoard = Array(8)
        .fill(null)
        .map(() => Array(8).fill(null));
      customBoard[4][4] = createPiece(PIECE_TYPES.KING, PIECE_COLORS.WHITE);
      customBoard[4][3] = createPiece(PIECE_TYPES.BISHOP, PIECE_COLORS.WHITE);
      customBoard[4][0] = createPiece(PIECE_TYPES.ROOK, PIECE_COLORS.BLACK);

      expect(isLegalMove(customBoard, 4, 3, 5, 4)).toBe(false);
    });
  });
});
