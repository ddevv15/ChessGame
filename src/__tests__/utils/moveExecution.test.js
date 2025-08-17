// Move execution and capture logic tests
import {
  executeMove,
  makeMove,
  isCapture,
  isPromotion,
} from "../../utils/gameLogic.js";
import { PIECE_TYPES, PIECE_COLORS } from "../../constants/gameConstants.js";
import { initializeBoard } from "../../utils/boardUtils.js";

describe("Move Execution and Capture Logic", () => {
  let board;

  beforeEach(() => {
    board = initializeBoard();
  });

  describe("executeMove", () => {
    test("should execute a valid pawn move", () => {
      // Move white pawn from e2 to e4
      const result = executeMove(board, 6, 4, 4, 4);

      expect(result.newBoard[4][4]).toEqual({
        type: PIECE_TYPES.PAWN,
        color: PIECE_COLORS.WHITE,
        hasMoved: true,
      });
      expect(result.newBoard[6][4]).toBeNull();
      expect(result.capturedPiece).toBeNull();
      expect(result.promotedPiece).toBeNull();
    });

    test("should execute a capture move", () => {
      // Set up a capture scenario - white pawn captures black pawn diagonally
      // Move white pawn to e5
      board[3][4] = {
        type: PIECE_TYPES.PAWN,
        color: PIECE_COLORS.WHITE,
        hasMoved: true,
      };

      // Place black pawn at d6 to be captured
      board[2][3] = {
        type: PIECE_TYPES.PAWN,
        color: PIECE_COLORS.BLACK,
        hasMoved: true,
      };

      const result = executeMove(board, 3, 4, 2, 3);

      expect(result.newBoard[2][3]).toEqual({
        type: PIECE_TYPES.PAWN,
        color: PIECE_COLORS.WHITE,
        hasMoved: true,
      });
      expect(result.newBoard[3][4]).toBeNull();
      expect(result.capturedPiece).toEqual({
        type: PIECE_TYPES.PAWN,
        color: PIECE_COLORS.BLACK,
        hasMoved: true,
      });
    });

    test("should handle pawn promotion to queen", () => {
      // Set up pawn promotion scenario
      const testBoard = Array(8)
        .fill(null)
        .map(() => Array(8).fill(null));

      // Place white pawn on 7th rank (row 1)
      testBoard[1][4] = {
        type: PIECE_TYPES.PAWN,
        color: PIECE_COLORS.WHITE,
        hasMoved: true,
      };

      // Place kings to avoid check issues
      testBoard[7][4] = {
        type: PIECE_TYPES.KING,
        color: PIECE_COLORS.WHITE,
        hasMoved: false,
      };
      testBoard[0][0] = {
        type: PIECE_TYPES.KING,
        color: PIECE_COLORS.BLACK,
        hasMoved: false,
      };

      const result = executeMove(testBoard, 1, 4, 0, 4);

      expect(result.newBoard[0][4]).toEqual({
        type: PIECE_TYPES.QUEEN,
        color: PIECE_COLORS.WHITE,
        hasMoved: true,
      });
      expect(result.promotedPiece).toEqual({
        type: PIECE_TYPES.QUEEN,
        color: PIECE_COLORS.WHITE,
        hasMoved: true,
      });
    });

    test("should handle black pawn promotion", () => {
      // Set up black pawn promotion scenario
      const testBoard = Array(8)
        .fill(null)
        .map(() => Array(8).fill(null));

      // Place black pawn on 2nd rank (row 6)
      testBoard[6][4] = {
        type: PIECE_TYPES.PAWN,
        color: PIECE_COLORS.BLACK,
        hasMoved: true,
      };

      // Place kings
      testBoard[0][4] = {
        type: PIECE_TYPES.KING,
        color: PIECE_COLORS.WHITE,
        hasMoved: false,
      };
      testBoard[7][0] = {
        type: PIECE_TYPES.KING,
        color: PIECE_COLORS.BLACK,
        hasMoved: false,
      };

      const result = executeMove(testBoard, 6, 4, 7, 4);

      expect(result.newBoard[7][4]).toEqual({
        type: PIECE_TYPES.QUEEN,
        color: PIECE_COLORS.BLACK,
        hasMoved: true,
      });
      expect(result.promotedPiece).toEqual({
        type: PIECE_TYPES.QUEEN,
        color: PIECE_COLORS.BLACK,
        hasMoved: true,
      });
    });

    test("should throw error for illegal move", () => {
      expect(() => {
        executeMove(board, 6, 4, 3, 4); // Invalid pawn move (3 squares)
      }).toThrow("Invalid move: Move is not legal");
    });

    test("should throw error when no piece at source", () => {
      expect(() => {
        executeMove(board, 4, 4, 5, 4); // Empty square
      }).toThrow("Invalid move: No piece at source position");
    });

    test("should mark piece as moved", () => {
      const result = executeMove(board, 7, 1, 5, 2); // Knight move

      expect(result.newBoard[5][2].hasMoved).toBe(true);
    });
  });

  describe("makeMove", () => {
    test("should return complete move information", () => {
      const result = makeMove(board, 6, 4, 4, 4); // e2 to e4

      expect(result.newBoard[4][4]).toEqual({
        type: PIECE_TYPES.PAWN,
        color: PIECE_COLORS.WHITE,
        hasMoved: true,
      });

      expect(result.move).toEqual({
        from: { row: 6, col: 4 },
        to: { row: 4, col: 4 },
        piece: {
          type: PIECE_TYPES.PAWN,
          color: PIECE_COLORS.WHITE,
          hasMoved: false,
        },
        capturedPiece: null,
        promotedPiece: null,
        isCapture: false,
        isPromotion: false,
      });
    });

    test("should return capture information", () => {
      // Set up capture scenario
      board[4][4] = {
        type: PIECE_TYPES.PAWN,
        color: PIECE_COLORS.BLACK,
        hasMoved: true,
      };

      // Move white pawn to position for capture
      board[5][3] = {
        type: PIECE_TYPES.PAWN,
        color: PIECE_COLORS.WHITE,
        hasMoved: true,
      };

      const result = makeMove(board, 5, 3, 4, 4);

      expect(result.move.isCapture).toBe(true);
      expect(result.move.capturedPiece).toEqual({
        type: PIECE_TYPES.PAWN,
        color: PIECE_COLORS.BLACK,
        hasMoved: true,
      });
    });

    test("should return promotion information", () => {
      // Set up promotion scenario
      const testBoard = Array(8)
        .fill(null)
        .map(() => Array(8).fill(null));

      testBoard[1][4] = {
        type: PIECE_TYPES.PAWN,
        color: PIECE_COLORS.WHITE,
        hasMoved: true,
      };

      // Place kings
      testBoard[7][4] = {
        type: PIECE_TYPES.KING,
        color: PIECE_COLORS.WHITE,
        hasMoved: false,
      };
      testBoard[0][0] = {
        type: PIECE_TYPES.KING,
        color: PIECE_COLORS.BLACK,
        hasMoved: false,
      };

      const result = makeMove(testBoard, 1, 4, 0, 4);

      expect(result.move.isPromotion).toBe(true);
      expect(result.move.promotedPiece).toEqual({
        type: PIECE_TYPES.QUEEN,
        color: PIECE_COLORS.WHITE,
        hasMoved: true,
      });
    });

    test("should throw error when no piece at source", () => {
      expect(() => {
        makeMove(board, 4, 4, 5, 4); // Empty square
      }).toThrow("No piece at source position");
    });
  });

  describe("isCapture", () => {
    test("should return true for capture move", () => {
      // Set up direct capture scenario
      board[5][3] = {
        type: PIECE_TYPES.PAWN,
        color: PIECE_COLORS.WHITE,
        hasMoved: true,
      };

      // Place black piece at destination
      board[4][4] = {
        type: PIECE_TYPES.PAWN,
        color: PIECE_COLORS.BLACK,
        hasMoved: true,
      };

      expect(isCapture(board, 5, 3, 4, 4)).toBe(true);
    });

    test("should return false for non-capture move", () => {
      expect(isCapture(board, 6, 4, 4, 4)).toBe(false); // Empty destination
    });

    test("should return false when capturing own piece", () => {
      // Try to capture own piece
      expect(isCapture(board, 6, 4, 7, 4)).toBe(false); // White rook
    });

    test("should return false when no piece at source", () => {
      expect(isCapture(board, 4, 4, 5, 4)).toBe(false); // Empty source
    });
  });

  describe("isPromotion", () => {
    test("should return true for white pawn promotion", () => {
      const testBoard = Array(8)
        .fill(null)
        .map(() => Array(8).fill(null));

      testBoard[1][4] = {
        type: PIECE_TYPES.PAWN,
        color: PIECE_COLORS.WHITE,
        hasMoved: true,
      };

      expect(isPromotion(testBoard, 1, 4, 0, 4)).toBe(true);
    });

    test("should return true for black pawn promotion", () => {
      const testBoard = Array(8)
        .fill(null)
        .map(() => Array(8).fill(null));

      testBoard[6][4] = {
        type: PIECE_TYPES.PAWN,
        color: PIECE_COLORS.BLACK,
        hasMoved: true,
      };

      expect(isPromotion(testBoard, 6, 4, 7, 4)).toBe(true);
    });

    test("should return false for non-pawn pieces", () => {
      expect(isPromotion(board, 7, 1, 0, 1)).toBe(false); // Knight
    });

    test("should return false for pawn not reaching promotion rank", () => {
      expect(isPromotion(board, 6, 4, 4, 4)).toBe(false); // Pawn move but not to promotion rank
    });

    test("should return false when no piece at source", () => {
      expect(isPromotion(board, 4, 4, 0, 4)).toBe(false); // Empty source
    });
  });

  describe("Edge Cases", () => {
    test("should handle capture with promotion", () => {
      // Set up capture + promotion scenario
      const testBoard = Array(8)
        .fill(null)
        .map(() => Array(8).fill(null));

      // White pawn on 7th rank
      testBoard[1][3] = {
        type: PIECE_TYPES.PAWN,
        color: PIECE_COLORS.WHITE,
        hasMoved: true,
      };

      // Black piece on 8th rank to capture
      testBoard[0][4] = {
        type: PIECE_TYPES.ROOK,
        color: PIECE_COLORS.BLACK,
        hasMoved: false,
      };

      // Place kings
      testBoard[7][4] = {
        type: PIECE_TYPES.KING,
        color: PIECE_COLORS.WHITE,
        hasMoved: false,
      };
      testBoard[0][0] = {
        type: PIECE_TYPES.KING,
        color: PIECE_COLORS.BLACK,
        hasMoved: false,
      };

      const result = makeMove(testBoard, 1, 3, 0, 4);

      expect(result.move.isCapture).toBe(true);
      expect(result.move.isPromotion).toBe(true);
      expect(result.move.capturedPiece.type).toBe(PIECE_TYPES.ROOK);
      expect(result.move.promotedPiece.type).toBe(PIECE_TYPES.QUEEN);
    });

    test("should preserve board immutability", () => {
      const originalBoard = board.map((row) => [...row]);

      executeMove(board, 6, 4, 4, 4);

      // Original board should be unchanged
      expect(board).toEqual(originalBoard);
    });

    test("should handle rook moves and captures", () => {
      // Clear path for rook
      board[7][0] = null; // Remove corner rook
      board[4][0] = {
        type: PIECE_TYPES.ROOK,
        color: PIECE_COLORS.WHITE,
        hasMoved: true,
      };

      // Place enemy piece to capture
      board[4][7] = {
        type: PIECE_TYPES.PAWN,
        color: PIECE_COLORS.BLACK,
        hasMoved: true,
      };

      const result = makeMove(board, 4, 0, 4, 7);

      expect(result.move.isCapture).toBe(true);
      expect(result.newBoard[4][7].type).toBe(PIECE_TYPES.ROOK);
      expect(result.newBoard[4][0]).toBeNull();
    });
  });
});
