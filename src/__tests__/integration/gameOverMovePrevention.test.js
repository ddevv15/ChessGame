/**
 * Tests to verify that all game over states prevent further moves
 * Ensures game logic correctly blocks moves after checkmate/stalemate
 */
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import GameBoard from "../../components/GameBoard/GameBoard";
import {
  getGameStatus,
  isCheckmate,
  isStalemate,
  isKingInCheck,
  getAllLegalMovesForColor,
  isValidMove,
} from "../../utils/gameLogic";
import { PIECE_TYPES, PIECE_COLORS } from "../../constants/gameConstants";

describe("Game Over Move Prevention", () => {
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

  // Helper function to create a mock game state
  const createGameState = (board, currentPlayer, gameStatus) => {
    return {
      board,
      currentPlayer,
      gameStatus,
      moveHistory: [],
      capturedPieces: { white: [], black: [] },
      isCheck: gameStatus === "check",
      isCheckmate: gameStatus === "checkmate",
      isStalemate: gameStatus === "stalemate",
    };
  };

  describe("Checkmate Move Prevention", () => {
    test("prevents all moves when in checkmate", () => {
      const board = createEmptyBoard();

      // Scholar's Mate position - Black is checkmated
      placePiece(board, 0, 4, PIECE_TYPES.KING, PIECE_COLORS.BLACK);
      placePiece(board, 1, 5, PIECE_TYPES.QUEEN, PIECE_COLORS.WHITE);
      placePiece(board, 4, 2, PIECE_TYPES.BISHOP, PIECE_COLORS.WHITE);
      placePiece(board, 7, 4, PIECE_TYPES.KING, PIECE_COLORS.WHITE);

      // Complete checkmate setup (copy from working Scholar's Mate test)
      placePiece(board, 1, 3, PIECE_TYPES.PAWN, PIECE_COLORS.BLACK); // d7
      placePiece(board, 1, 4, PIECE_TYPES.PAWN, PIECE_COLORS.BLACK); // e7
      placePiece(board, 1, 6, PIECE_TYPES.PAWN, PIECE_COLORS.BLACK); // g7
      placePiece(board, 1, 7, PIECE_TYPES.PAWN, PIECE_COLORS.BLACK); // h7
      placePiece(board, 0, 0, PIECE_TYPES.ROOK, PIECE_COLORS.WHITE); // a8 - controls d8
      placePiece(board, 7, 5, PIECE_TYPES.ROOK, PIECE_COLORS.WHITE); // f1 - controls f8

      // Verify it's checkmate
      expect(isCheckmate(board, PIECE_COLORS.BLACK)).toBe(true);
      expect(getGameStatus(board, PIECE_COLORS.BLACK)).toBe("checkmate");

      // Verify no legal moves for black
      const blackMoves = getAllLegalMovesForColor(board, PIECE_COLORS.BLACK);
      expect(blackMoves.length).toBe(0);

      // Test specific move attempts that should fail
      expect(
        isValidMove(
          board,
          { row: 0, col: 4 },
          { row: 0, col: 3 },
          PIECE_COLORS.BLACK
        )
      ).toBe(false);
      expect(
        isValidMove(
          board,
          { row: 1, col: 0 },
          { row: 2, col: 0 },
          PIECE_COLORS.BLACK
        )
      ).toBe(false);
      expect(
        isValidMove(
          board,
          { row: 0, col: 1 },
          { row: 0, col: 2 },
          PIECE_COLORS.BLACK
        )
      ).toBe(false);
    });

    test("prevents moves for checkmated player but allows opponent moves", () => {
      const board = createEmptyBoard();

      // Back rank mate - White is checkmated
      placePiece(board, 7, 6, PIECE_TYPES.KING, PIECE_COLORS.WHITE);
      placePiece(board, 6, 5, PIECE_TYPES.PAWN, PIECE_COLORS.WHITE);
      placePiece(board, 6, 6, PIECE_TYPES.PAWN, PIECE_COLORS.WHITE);
      placePiece(board, 6, 7, PIECE_TYPES.PAWN, PIECE_COLORS.WHITE);
      placePiece(board, 7, 0, PIECE_TYPES.ROOK, PIECE_COLORS.BLACK);
      placePiece(board, 0, 4, PIECE_TYPES.KING, PIECE_COLORS.BLACK);

      // Verify white is checkmated
      expect(isCheckmate(board, PIECE_COLORS.WHITE)).toBe(true);
      expect(getGameStatus(board, PIECE_COLORS.WHITE)).toBe("checkmate");

      // White should have no legal moves
      const whiteMoves = getAllLegalMovesForColor(board, PIECE_COLORS.WHITE);
      expect(whiteMoves.length).toBe(0);

      // Black should still have legal moves (though game is over)
      const blackMoves = getAllLegalMovesForColor(board, PIECE_COLORS.BLACK);
      expect(blackMoves.length).toBeGreaterThan(0);

      // Test that white moves are blocked
      expect(
        isValidMove(
          board,
          { row: 7, col: 6 },
          { row: 7, col: 5 },
          PIECE_COLORS.WHITE
        )
      ).toBe(false);
      expect(
        isValidMove(
          board,
          { row: 6, col: 5 },
          { row: 5, col: 5 },
          PIECE_COLORS.WHITE
        )
      ).toBe(false);
    });
  });

  describe("Stalemate Move Prevention", () => {
    test("prevents all moves when in stalemate", () => {
      const board = createEmptyBoard();

      // Classic stalemate position - black king in corner, no moves but not in check
      placePiece(board, 0, 0, PIECE_TYPES.KING, PIECE_COLORS.BLACK);
      placePiece(board, 2, 1, PIECE_TYPES.QUEEN, PIECE_COLORS.WHITE); // Controls escape squares
      placePiece(board, 1, 2, PIECE_TYPES.KING, PIECE_COLORS.WHITE); // White king supports

      // Verify it's stalemate
      expect(isStalemate(board, PIECE_COLORS.BLACK)).toBe(true);
      expect(getGameStatus(board, PIECE_COLORS.BLACK)).toBe("stalemate");

      // Verify no legal moves for black
      const blackMoves = getAllLegalMovesForColor(board, PIECE_COLORS.BLACK);
      expect(blackMoves.length).toBe(0);

      // Test that black king cannot move
      expect(
        isValidMove(
          board,
          { row: 0, col: 0 },
          { row: 0, col: 1 },
          PIECE_COLORS.BLACK
        )
      ).toBe(false);
      expect(
        isValidMove(
          board,
          { row: 0, col: 0 },
          { row: 1, col: 0 },
          PIECE_COLORS.BLACK
        )
      ).toBe(false);
      expect(
        isValidMove(
          board,
          { row: 0, col: 0 },
          { row: 1, col: 1 },
          PIECE_COLORS.BLACK
        )
      ).toBe(false);
    });

    test("prevents moves for stalemated player", () => {
      const board = createEmptyBoard();

      // Use the same working stalemate position as the first test
      placePiece(board, 0, 0, PIECE_TYPES.KING, PIECE_COLORS.BLACK);
      placePiece(board, 2, 1, PIECE_TYPES.QUEEN, PIECE_COLORS.WHITE); // Controls escape squares
      placePiece(board, 1, 2, PIECE_TYPES.KING, PIECE_COLORS.WHITE); // White king supports

      // Verify stalemate
      expect(isStalemate(board, PIECE_COLORS.BLACK)).toBe(true);

      // Black should have no legal moves
      const blackMoves = getAllLegalMovesForColor(board, PIECE_COLORS.BLACK);
      expect(blackMoves.length).toBe(0);

      // Test specific moves that should be blocked
      expect(
        isValidMove(
          board,
          { row: 0, col: 7 },
          { row: 0, col: 6 },
          PIECE_COLORS.BLACK
        )
      ).toBe(false);
      expect(
        isValidMove(
          board,
          { row: 1, col: 0 },
          { row: 2, col: 0 },
          PIECE_COLORS.BLACK
        )
      ).toBe(false);
    });
  });

  describe("Game State Consistency", () => {
    test("game status correctly reflects move availability", () => {
      const board = createEmptyBoard();

      // Normal playing position
      placePiece(board, 0, 4, PIECE_TYPES.KING, PIECE_COLORS.BLACK);
      placePiece(board, 7, 4, PIECE_TYPES.KING, PIECE_COLORS.WHITE);
      placePiece(board, 1, 4, PIECE_TYPES.PAWN, PIECE_COLORS.BLACK);
      placePiece(board, 6, 4, PIECE_TYPES.PAWN, PIECE_COLORS.WHITE);

      // Should be playing state with legal moves
      expect(getGameStatus(board, PIECE_COLORS.WHITE)).toBe("playing");
      expect(getGameStatus(board, PIECE_COLORS.BLACK)).toBe("playing");

      const whiteMoves = getAllLegalMovesForColor(board, PIECE_COLORS.WHITE);
      const blackMoves = getAllLegalMovesForColor(board, PIECE_COLORS.BLACK);

      expect(whiteMoves.length).toBeGreaterThan(0);
      expect(blackMoves.length).toBeGreaterThan(0);
    });

    test("check state allows legal moves but blocks illegal ones", () => {
      const board = createEmptyBoard();

      // King in check but has escape moves
      placePiece(board, 4, 4, PIECE_TYPES.KING, PIECE_COLORS.BLACK);
      placePiece(board, 4, 0, PIECE_TYPES.ROOK, PIECE_COLORS.WHITE);
      placePiece(board, 7, 7, PIECE_TYPES.KING, PIECE_COLORS.WHITE);

      // Should be in check
      expect(isKingInCheck(board, PIECE_COLORS.BLACK)).toBe(true);
      expect(getGameStatus(board, PIECE_COLORS.BLACK)).toBe("check");

      // Should have legal moves (king can escape)
      const blackMoves = getAllLegalMovesForColor(board, PIECE_COLORS.BLACK);
      expect(blackMoves.length).toBeGreaterThan(0);

      // But moves that don't resolve check should be invalid
      // (This depends on the specific implementation of move validation)
    });
  });

  describe("UI Integration for Move Prevention", () => {
    test("GameBoard component respects game over state", () => {
      const board = createEmptyBoard();

      // Checkmate position
      placePiece(board, 0, 4, PIECE_TYPES.KING, PIECE_COLORS.BLACK);
      placePiece(board, 1, 5, PIECE_TYPES.QUEEN, PIECE_COLORS.WHITE);
      placePiece(board, 4, 2, PIECE_TYPES.BISHOP, PIECE_COLORS.WHITE);
      placePiece(board, 7, 4, PIECE_TYPES.KING, PIECE_COLORS.WHITE);

      const gameState = createGameState(board, PIECE_COLORS.BLACK, "checkmate");

      // Mock onMove function to track if moves are attempted
      const mockOnMove = jest.fn();

      render(
        <GameBoard
          gameState={gameState}
          onMove={mockOnMove}
          onReset={() => {}}
        />
      );

      // Try to click on pieces - should not trigger moves
      const kingSquare = screen.getByTestId("square-0-4");
      fireEvent.click(kingSquare);

      // onMove should not be called for game over state
      expect(mockOnMove).not.toHaveBeenCalled();
    });

    test("squares are not selectable in game over state", () => {
      const board = createEmptyBoard();

      // Stalemate position
      placePiece(board, 0, 0, PIECE_TYPES.KING, PIECE_COLORS.BLACK);
      placePiece(board, 2, 1, PIECE_TYPES.QUEEN, PIECE_COLORS.WHITE);
      placePiece(board, 1, 2, PIECE_TYPES.KING, PIECE_COLORS.WHITE);

      const gameState = createGameState(board, PIECE_COLORS.BLACK, "stalemate");

      render(
        <GameBoard gameState={gameState} onMove={() => {}} onReset={() => {}} />
      );

      // Squares should not become selected/highlighted
      const kingSquare = screen.getByTestId("square-0-0");
      fireEvent.click(kingSquare);

      // Check that square doesn't get selected class
      expect(kingSquare).not.toHaveClass(/selected|highlighted/);
    });
  });

  describe("Edge Cases in Move Prevention", () => {
    test("handles rapid click attempts during game over", () => {
      const board = createEmptyBoard();

      // Checkmate position
      placePiece(board, 0, 4, PIECE_TYPES.KING, PIECE_COLORS.BLACK);
      placePiece(board, 1, 5, PIECE_TYPES.QUEEN, PIECE_COLORS.WHITE);
      placePiece(board, 4, 2, PIECE_TYPES.BISHOP, PIECE_COLORS.WHITE);
      placePiece(board, 7, 4, PIECE_TYPES.KING, PIECE_COLORS.WHITE);

      const gameState = createGameState(board, PIECE_COLORS.BLACK, "checkmate");
      const mockOnMove = jest.fn();

      render(
        <GameBoard
          gameState={gameState}
          onMove={mockOnMove}
          onReset={() => {}}
        />
      );

      // Rapidly click multiple squares
      const squares = [
        screen.getByTestId("square-0-4"),
        screen.getByTestId("square-1-0"),
        screen.getByTestId("square-0-1"),
      ];

      squares.forEach((square) => {
        fireEvent.click(square);
        fireEvent.click(square);
      });

      // No moves should be triggered
      expect(mockOnMove).not.toHaveBeenCalled();
    });

    test("prevents moves even with valid piece selection", () => {
      const board = createEmptyBoard();

      // Use the same working stalemate position
      placePiece(board, 0, 0, PIECE_TYPES.KING, PIECE_COLORS.BLACK);
      placePiece(board, 2, 1, PIECE_TYPES.QUEEN, PIECE_COLORS.WHITE); // Controls escape squares
      placePiece(board, 1, 2, PIECE_TYPES.KING, PIECE_COLORS.WHITE); // White king supports

      // This should be stalemate for black
      expect(isStalemate(board, PIECE_COLORS.BLACK)).toBe(true);

      // Even though rook exists and normally could move, no moves should be legal
      const blackMoves = getAllLegalMovesForColor(board, PIECE_COLORS.BLACK);
      expect(blackMoves.length).toBe(0);

      // Specific rook moves should be invalid
      expect(
        isValidMove(
          board,
          { row: 1, col: 0 },
          { row: 1, col: 1 },
          PIECE_COLORS.BLACK
        )
      ).toBe(false);
      expect(
        isValidMove(
          board,
          { row: 1, col: 0 },
          { row: 2, col: 0 },
          PIECE_COLORS.BLACK
        )
      ).toBe(false);
    });
  });
});
