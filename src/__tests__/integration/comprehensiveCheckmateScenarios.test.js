/**
 * Comprehensive End-Game Testing Scenarios
 * Tests actual checkmate positions and verifies complete game over flow
 */
import {
  getGameStatus,
  isCheckmate,
  isStalemate,
  isKingInCheck,
  getAllLegalMovesForColor,
} from "../../utils/gameLogic";
import { PIECE_TYPES, PIECE_COLORS } from "../../constants/gameConstants";

describe("Comprehensive Checkmate Scenarios", () => {
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

  describe("Scholar's Mate (4-move checkmate)", () => {
    test("detects Scholar's Mate checkmate correctly", () => {
      const board = createEmptyBoard();

      // Simplified Scholar's Mate position
      // Black king trapped in corner
      placePiece(board, 0, 4, PIECE_TYPES.KING, PIECE_COLORS.BLACK);

      // White queen delivering checkmate on f7 (row 1, col 5)
      placePiece(board, 1, 5, PIECE_TYPES.QUEEN, PIECE_COLORS.WHITE);

      // White bishop supporting on c4 (row 4, col 2)
      placePiece(board, 4, 2, PIECE_TYPES.BISHOP, PIECE_COLORS.WHITE);

      // White king
      placePiece(board, 7, 4, PIECE_TYPES.KING, PIECE_COLORS.WHITE);

      // Black pawns blocking king's escape (typical Scholar's Mate position)
      placePiece(board, 1, 3, PIECE_TYPES.PAWN, PIECE_COLORS.BLACK); // d7
      placePiece(board, 1, 4, PIECE_TYPES.PAWN, PIECE_COLORS.BLACK); // e7
      placePiece(board, 1, 6, PIECE_TYPES.PAWN, PIECE_COLORS.BLACK); // g7
      placePiece(board, 1, 7, PIECE_TYPES.PAWN, PIECE_COLORS.BLACK); // h7

      // Add white pieces to control escape squares and complete the checkmate
      placePiece(board, 0, 0, PIECE_TYPES.ROOK, PIECE_COLORS.WHITE); // a8 - controls d8 via 8th rank
      placePiece(board, 7, 5, PIECE_TYPES.ROOK, PIECE_COLORS.WHITE); // f1 - controls f8 via f-file

      // Verify black king is in check
      expect(isKingInCheck(board, PIECE_COLORS.BLACK)).toBe(true);

      // Verify black has no legal moves
      const blackMoves = getAllLegalMovesForColor(board, PIECE_COLORS.BLACK);
      expect(blackMoves.length).toBe(0);

      // Verify it's checkmate
      expect(isCheckmate(board, PIECE_COLORS.BLACK)).toBe(true);
      expect(getGameStatus(board, PIECE_COLORS.BLACK)).toBe("checkmate");
    });
  });

  describe("Back Rank Mate", () => {
    test("detects back rank mate correctly", () => {
      const board = createEmptyBoard();

      // White king trapped on back rank by own pawns
      placePiece(board, 7, 6, PIECE_TYPES.KING, PIECE_COLORS.WHITE);
      placePiece(board, 6, 5, PIECE_TYPES.PAWN, PIECE_COLORS.WHITE);
      placePiece(board, 6, 6, PIECE_TYPES.PAWN, PIECE_COLORS.WHITE);
      placePiece(board, 6, 7, PIECE_TYPES.PAWN, PIECE_COLORS.WHITE);

      // Black rook delivering mate on back rank
      placePiece(board, 7, 0, PIECE_TYPES.ROOK, PIECE_COLORS.BLACK);

      // Black king safely positioned
      placePiece(board, 0, 4, PIECE_TYPES.KING, PIECE_COLORS.BLACK);

      // Verify white king is in check
      expect(isKingInCheck(board, PIECE_COLORS.WHITE)).toBe(true);

      // Verify white has no legal moves
      const whiteMoves = getAllLegalMovesForColor(board, PIECE_COLORS.WHITE);
      expect(whiteMoves.length).toBe(0);

      // Verify it's checkmate
      expect(isCheckmate(board, PIECE_COLORS.WHITE)).toBe(true);
      expect(getGameStatus(board, PIECE_COLORS.WHITE)).toBe("checkmate");
    });
  });

  describe("Queen and King vs King Mate", () => {
    test("detects queen and king mate correctly", () => {
      const board = createEmptyBoard();

      // Black king cornered in corner
      placePiece(board, 0, 0, PIECE_TYPES.KING, PIECE_COLORS.BLACK);

      // White queen delivering checkmate and king supporting
      placePiece(board, 0, 2, PIECE_TYPES.QUEEN, PIECE_COLORS.WHITE); // Queen on same rank
      placePiece(board, 1, 1, PIECE_TYPES.KING, PIECE_COLORS.WHITE); // King supporting

      // Verify black king is in check
      expect(isKingInCheck(board, PIECE_COLORS.BLACK)).toBe(true);

      // Verify black has no legal moves
      const blackMoves = getAllLegalMovesForColor(board, PIECE_COLORS.BLACK);
      expect(blackMoves.length).toBe(0);

      // Verify it's checkmate
      expect(isCheckmate(board, PIECE_COLORS.BLACK)).toBe(true);
      expect(getGameStatus(board, PIECE_COLORS.BLACK)).toBe("checkmate");
    });
  });

  describe("Smothered Mate", () => {
    test("detects smothered mate correctly", () => {
      const board = createEmptyBoard();

      // Classic smothered mate position
      // Black king on h8 corner
      placePiece(board, 0, 7, PIECE_TYPES.KING, PIECE_COLORS.BLACK);

      // Black pieces blocking all escape squares
      placePiece(board, 0, 6, PIECE_TYPES.ROOK, PIECE_COLORS.BLACK); // g8 - blocks horizontal
      placePiece(board, 1, 7, PIECE_TYPES.ROOK, PIECE_COLORS.BLACK); // h7 - blocks vertical
      placePiece(board, 1, 6, PIECE_TYPES.PAWN, PIECE_COLORS.BLACK); // g7 - blocks diagonal

      // White knight on f7 delivering checkmate
      placePiece(board, 1, 5, PIECE_TYPES.KNIGHT, PIECE_COLORS.WHITE);

      // White king safely positioned
      placePiece(board, 7, 4, PIECE_TYPES.KING, PIECE_COLORS.WHITE);

      // Verify black king is in check
      expect(isKingInCheck(board, PIECE_COLORS.BLACK)).toBe(true);

      // Verify black has no legal moves
      const blackMoves = getAllLegalMovesForColor(board, PIECE_COLORS.BLACK);
      expect(blackMoves.length).toBe(0);

      // Verify it's checkmate
      expect(isCheckmate(board, PIECE_COLORS.BLACK)).toBe(true);
      expect(getGameStatus(board, PIECE_COLORS.BLACK)).toBe("checkmate");
    });
  });

  describe("Anastasia's Mate", () => {
    test("detects Anastasia's mate correctly", () => {
      const board = createEmptyBoard();

      // Black king on h8, trapped by own pawn on g7
      placePiece(board, 0, 7, PIECE_TYPES.KING, PIECE_COLORS.BLACK);
      placePiece(board, 1, 6, PIECE_TYPES.PAWN, PIECE_COLORS.BLACK);

      // White rook on h1 and knight on f6
      placePiece(board, 7, 7, PIECE_TYPES.ROOK, PIECE_COLORS.WHITE);
      placePiece(board, 2, 5, PIECE_TYPES.KNIGHT, PIECE_COLORS.WHITE);

      // White king
      placePiece(board, 7, 4, PIECE_TYPES.KING, PIECE_COLORS.WHITE);

      // Verify black king is in check
      expect(isKingInCheck(board, PIECE_COLORS.BLACK)).toBe(true);

      // Verify black has no legal moves
      const blackMoves = getAllLegalMovesForColor(board, PIECE_COLORS.BLACK);
      expect(blackMoves.length).toBe(0);

      // Verify it's checkmate
      expect(isCheckmate(board, PIECE_COLORS.BLACK)).toBe(true);
      expect(getGameStatus(board, PIECE_COLORS.BLACK)).toBe("checkmate");
    });
  });
});
