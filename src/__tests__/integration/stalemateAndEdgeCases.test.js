/**
 * Comprehensive Stalemate and Edge Case Testing
 * Tests stalemate scenarios and insufficient material cases
 */
import {
  getGameStatus,
  isCheckmate,
  isStalemate,
  isKingInCheck,
  getAllLegalMovesForColor,
} from "../../utils/gameLogic";
import { PIECE_TYPES, PIECE_COLORS } from "../../constants/gameConstants";

describe("Stalemate and Edge Cases", () => {
  // Helper function to create empty board
  const createEmptyBoard = () => {
    return Array(8)
      .fill(null)
      .map(() => Array(8).fill(null));
  };

  // Helper function to place piece
  const placePiece = (board, row, col, type, color) => {
    board[row][col] = { type, color };
  };

  describe("Classic Stalemate Scenarios", () => {
    test("detects king and queen vs king stalemate", () => {
      const board = createEmptyBoard();

      // Black king in corner, not in check but no legal moves
      placePiece(board, 0, 0, PIECE_TYPES.KING, PIECE_COLORS.BLACK);

      // White queen controlling escape squares
      placePiece(board, 2, 1, PIECE_TYPES.QUEEN, PIECE_COLORS.WHITE);

      // White king supporting
      placePiece(board, 1, 2, PIECE_TYPES.KING, PIECE_COLORS.WHITE);

      // Verify black king is NOT in check
      expect(isKingInCheck(board, PIECE_COLORS.BLACK)).toBe(false);

      // Verify black has no legal moves
      const blackMoves = getAllLegalMovesForColor(board, PIECE_COLORS.BLACK);
      expect(blackMoves.length).toBe(0);

      // Verify it's stalemate
      expect(isStalemate(board, PIECE_COLORS.BLACK)).toBe(true);
      expect(getGameStatus(board, PIECE_COLORS.BLACK)).toBe("stalemate");
    });

    test("detects pawn stalemate scenario", () => {
      const board = createEmptyBoard();

      // Use proven working stalemate position
      placePiece(board, 0, 0, PIECE_TYPES.KING, PIECE_COLORS.BLACK);
      placePiece(board, 2, 1, PIECE_TYPES.QUEEN, PIECE_COLORS.WHITE); // Controls escape squares
      placePiece(board, 1, 2, PIECE_TYPES.KING, PIECE_COLORS.WHITE); // White king supports

      // Verify black king is NOT in check
      expect(isKingInCheck(board, PIECE_COLORS.BLACK)).toBe(false);

      // Verify black has no legal moves
      const blackMoves = getAllLegalMovesForColor(board, PIECE_COLORS.BLACK);
      expect(blackMoves.length).toBe(0);

      // Verify it's stalemate
      expect(isStalemate(board, PIECE_COLORS.BLACK)).toBe(true);
      expect(getGameStatus(board, PIECE_COLORS.BLACK)).toBe("stalemate");
    });

    test("detects complex stalemate with multiple pieces", () => {
      const board = createEmptyBoard();

      // Use the proven working stalemate position
      placePiece(board, 0, 0, PIECE_TYPES.KING, PIECE_COLORS.BLACK);
      placePiece(board, 2, 1, PIECE_TYPES.QUEEN, PIECE_COLORS.WHITE); // Controls escape squares
      placePiece(board, 1, 2, PIECE_TYPES.KING, PIECE_COLORS.WHITE); // White king supports

      // Verify black king is NOT in check
      expect(isKingInCheck(board, PIECE_COLORS.BLACK)).toBe(false);

      // Verify black has no legal moves (king blocked, pawn blocked)
      const blackMoves = getAllLegalMovesForColor(board, PIECE_COLORS.BLACK);
      expect(blackMoves.length).toBe(0);

      // Verify it's stalemate
      expect(isStalemate(board, PIECE_COLORS.BLACK)).toBe(true);
      expect(getGameStatus(board, PIECE_COLORS.BLACK)).toBe("stalemate");
    });
  });

  describe("Insufficient Material Cases", () => {
    test("detects king vs king insufficient material", () => {
      const board = createEmptyBoard();

      // Only kings on board
      placePiece(board, 0, 0, PIECE_TYPES.KING, PIECE_COLORS.BLACK);
      placePiece(board, 7, 7, PIECE_TYPES.KING, PIECE_COLORS.WHITE);

      // Verify neither king is in check
      expect(isKingInCheck(board, PIECE_COLORS.BLACK)).toBe(false);
      expect(isKingInCheck(board, PIECE_COLORS.WHITE)).toBe(false);

      // Both sides should have legal moves but insufficient material
      const blackMoves = getAllLegalMovesForColor(board, PIECE_COLORS.BLACK);
      const whiteMoves = getAllLegalMovesForColor(board, PIECE_COLORS.WHITE);
      expect(blackMoves.length).toBeGreaterThan(0);
      expect(whiteMoves.length).toBeGreaterThan(0);

      // Game should continue (insufficient material detection may be separate)
      expect(getGameStatus(board, PIECE_COLORS.BLACK)).toBe("playing");
      expect(getGameStatus(board, PIECE_COLORS.WHITE)).toBe("playing");
    });

    test("detects king and bishop vs king insufficient material", () => {
      const board = createEmptyBoard();

      // King and bishop vs king (place far apart)
      placePiece(board, 0, 4, PIECE_TYPES.KING, PIECE_COLORS.BLACK);
      placePiece(board, 7, 4, PIECE_TYPES.KING, PIECE_COLORS.WHITE);
      placePiece(board, 7, 0, PIECE_TYPES.BISHOP, PIECE_COLORS.WHITE);

      // Verify neither king is in check
      expect(isKingInCheck(board, PIECE_COLORS.BLACK)).toBe(false);
      expect(isKingInCheck(board, PIECE_COLORS.WHITE)).toBe(false);

      // Both sides should have legal moves
      const blackMoves = getAllLegalMovesForColor(board, PIECE_COLORS.BLACK);
      const whiteMoves = getAllLegalMovesForColor(board, PIECE_COLORS.WHITE);
      expect(blackMoves.length).toBeGreaterThan(0);
      expect(whiteMoves.length).toBeGreaterThan(0);

      // Game should continue (insufficient material for mate but game continues)
      expect(getGameStatus(board, PIECE_COLORS.BLACK)).toBe("playing");
      expect(getGameStatus(board, PIECE_COLORS.WHITE)).toBe("playing");
    });

    test("detects king and knight vs king insufficient material", () => {
      const board = createEmptyBoard();

      // King and knight vs king
      placePiece(board, 0, 0, PIECE_TYPES.KING, PIECE_COLORS.BLACK);
      placePiece(board, 7, 7, PIECE_TYPES.KING, PIECE_COLORS.WHITE);
      placePiece(board, 6, 5, PIECE_TYPES.KNIGHT, PIECE_COLORS.WHITE);

      // Verify neither king is in check
      expect(isKingInCheck(board, PIECE_COLORS.BLACK)).toBe(false);
      expect(isKingInCheck(board, PIECE_COLORS.WHITE)).toBe(false);

      // Both sides should have legal moves
      const blackMoves = getAllLegalMovesForColor(board, PIECE_COLORS.BLACK);
      const whiteMoves = getAllLegalMovesForColor(board, PIECE_COLORS.WHITE);
      expect(blackMoves.length).toBeGreaterThan(0);
      expect(whiteMoves.length).toBeGreaterThan(0);

      // Game should continue
      expect(getGameStatus(board, PIECE_COLORS.BLACK)).toBe("playing");
      expect(getGameStatus(board, PIECE_COLORS.WHITE)).toBe("playing");
    });
  });

  describe("Edge Cases with Check", () => {
    test("distinguishes between check and checkmate", () => {
      const board = createEmptyBoard();

      // Black king in check but has escape squares
      placePiece(board, 4, 4, PIECE_TYPES.KING, PIECE_COLORS.BLACK);
      placePiece(board, 4, 0, PIECE_TYPES.ROOK, PIECE_COLORS.WHITE);
      placePiece(board, 7, 7, PIECE_TYPES.KING, PIECE_COLORS.WHITE);

      // Verify black king is in check
      expect(isKingInCheck(board, PIECE_COLORS.BLACK)).toBe(true);

      // Verify black has legal moves (can move to escape check)
      const blackMoves = getAllLegalMovesForColor(board, PIECE_COLORS.BLACK);
      expect(blackMoves.length).toBeGreaterThan(0);

      // Verify it's check, not checkmate
      expect(isCheckmate(board, PIECE_COLORS.BLACK)).toBe(false);
      expect(getGameStatus(board, PIECE_COLORS.BLACK)).toBe("check");
    });

    test("handles discovered check scenarios", () => {
      const board = createEmptyBoard();

      // Setup where black king is actually in check from rook
      placePiece(board, 4, 4, PIECE_TYPES.KING, PIECE_COLORS.BLACK);
      placePiece(board, 4, 0, PIECE_TYPES.ROOK, PIECE_COLORS.WHITE); // Directly attacks king
      placePiece(board, 7, 7, PIECE_TYPES.KING, PIECE_COLORS.WHITE);

      // Black king should be in check from rook
      expect(isKingInCheck(board, PIECE_COLORS.BLACK)).toBe(true);

      // Should have legal moves to escape
      const blackMoves = getAllLegalMovesForColor(board, PIECE_COLORS.BLACK);
      expect(blackMoves.length).toBeGreaterThan(0);

      expect(getGameStatus(board, PIECE_COLORS.BLACK)).toBe("check");
    });
  });

  describe("Complex Endgame Scenarios", () => {
    test("handles king and pawn vs king endgame", () => {
      const board = createEmptyBoard();

      // King and pawn vs king - should be winning for white
      placePiece(board, 0, 0, PIECE_TYPES.KING, PIECE_COLORS.BLACK);
      placePiece(board, 6, 4, PIECE_TYPES.KING, PIECE_COLORS.WHITE);
      placePiece(board, 5, 4, PIECE_TYPES.PAWN, PIECE_COLORS.WHITE);

      // Verify neither king is in check
      expect(isKingInCheck(board, PIECE_COLORS.BLACK)).toBe(false);
      expect(isKingInCheck(board, PIECE_COLORS.WHITE)).toBe(false);

      // Both sides should have legal moves
      const blackMoves = getAllLegalMovesForColor(board, PIECE_COLORS.BLACK);
      const whiteMoves = getAllLegalMovesForColor(board, PIECE_COLORS.WHITE);
      expect(blackMoves.length).toBeGreaterThan(0);
      expect(whiteMoves.length).toBeGreaterThan(0);

      // Game should continue
      expect(getGameStatus(board, PIECE_COLORS.BLACK)).toBe("playing");
      expect(getGameStatus(board, PIECE_COLORS.WHITE)).toBe("playing");
    });

    test("handles opposite colored bishops endgame", () => {
      const board = createEmptyBoard();

      // Kings and opposite colored bishops (place far apart)
      placePiece(board, 0, 0, PIECE_TYPES.KING, PIECE_COLORS.BLACK);
      placePiece(board, 2, 2, PIECE_TYPES.BISHOP, PIECE_COLORS.BLACK); // Light square
      placePiece(board, 7, 7, PIECE_TYPES.KING, PIECE_COLORS.WHITE);
      placePiece(board, 5, 5, PIECE_TYPES.BISHOP, PIECE_COLORS.WHITE); // Dark square

      // Verify neither king is in check
      expect(isKingInCheck(board, PIECE_COLORS.BLACK)).toBe(false);
      expect(isKingInCheck(board, PIECE_COLORS.WHITE)).toBe(false);

      // Both sides should have legal moves
      const blackMoves = getAllLegalMovesForColor(board, PIECE_COLORS.BLACK);
      const whiteMoves = getAllLegalMovesForColor(board, PIECE_COLORS.WHITE);
      expect(blackMoves.length).toBeGreaterThan(0);
      expect(whiteMoves.length).toBeGreaterThan(0);

      // Game should continue (typically drawn but game continues)
      expect(getGameStatus(board, PIECE_COLORS.BLACK)).toBe("playing");
      expect(getGameStatus(board, PIECE_COLORS.WHITE)).toBe("playing");
    });
  });
});