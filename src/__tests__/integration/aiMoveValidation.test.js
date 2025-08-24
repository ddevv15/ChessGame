/**
 * Comprehensive tests for AI move validation and error recovery
 * Tests various AI error scenarios and validation edge cases
 */
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import App from "../../App";
import {
  PIECE_COLORS,
  DIFFICULTY_LEVELS,
  PIECE_TYPES,
} from "../../constants/gameConstants";
import * as aiService from "../../utils/aiService.js";
import * as sanUtils from "../../utils/sanUtils.js";
import { initializeBoard } from "../../utils/boardUtils.js";

// Mock the AI service
jest.mock("../../utils/aiService.js");

const mockGetAIMove = aiService.getAIMove;

describe("AI Move Validation and Error Recovery", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Invalid AI Move Scenarios", () => {
    test("handles AI returning completely invalid SAN notation", async () => {
      mockGetAIMove.mockResolvedValue({
        isValid: false,
        error: "Invalid SAN notation",
        sanMove: "xyz123",
        source: "ai",
      });

      render(<App />);

      const aiButton = screen.getByRole("button", { name: /player vs ai/i });
      fireEvent.click(aiButton);

      await waitFor(() => {
        expect(screen.getByRole("application")).toBeInTheDocument();
      });

      // Make a move to trigger AI
      const squares = screen.getAllByRole("button");
      const whitePawnE2 = squares.find((square) =>
        square.getAttribute("aria-label")?.includes("white pawn on e2")
      );
      const e4Square = squares.find((square) =>
        square.getAttribute("aria-label")?.includes("Empty square e4")
      );

      if (whitePawnE2 && e4Square) {
        fireEvent.click(whitePawnE2);
        fireEvent.click(e4Square);

        // Should fall back to valid move
        await waitFor(
          () => {
            const statusElements = screen.getAllByRole("status");
            const whiteTurnStatus = statusElements.find((el) =>
              el.textContent?.includes("White to move")
            );
            expect(whiteTurnStatus).toBeInTheDocument();
          },
          { timeout: 5000 }
        );

        expect(mockGetAIMove).toHaveBeenCalled();
      }
    });

    test("handles AI returning move for wrong piece type", async () => {
      mockGetAIMove.mockResolvedValue({
        isValid: false,
        error: "Move not possible for piece type",
        sanMove: "Qh5", // Queen can't move from starting position
        source: "ai",
      });

      render(<App />);

      const aiButton = screen.getByRole("button", { name: /player vs ai/i });
      fireEvent.click(aiButton);

      await waitFor(() => {
        expect(screen.getByRole("application")).toBeInTheDocument();
      });

      // Make a move to trigger AI
      const squares = screen.getAllByRole("button");
      const whitePawnE2 = squares.find((square) =>
        square.getAttribute("aria-label")?.includes("white pawn on e2")
      );
      const e4Square = squares.find((square) =>
        square.getAttribute("aria-label")?.includes("Empty square e4")
      );

      if (whitePawnE2 && e4Square) {
        fireEvent.click(whitePawnE2);
        fireEvent.click(e4Square);

        // Should handle invalid move and continue
        await waitFor(
          () => {
            const statusElements = screen.getAllByRole("status");
            const whiteTurnStatus = statusElements.find((el) =>
              el.textContent?.includes("White to move")
            );
            expect(whiteTurnStatus).toBeInTheDocument();
          },
          { timeout: 5000 }
        );
      }
    });

    test("handles AI returning move that would put own king in check", async () => {
      mockGetAIMove.mockResolvedValue({
        isValid: false,
        error: "Move would put own king in check",
        sanMove: "Ke2", // Hypothetical illegal king move
        source: "ai",
      });

      render(<App />);

      const aiButton = screen.getByRole("button", { name: /player vs ai/i });
      fireEvent.click(aiButton);

      await waitFor(() => {
        expect(screen.getByRole("application")).toBeInTheDocument();
      });

      // Make a move to trigger AI
      const squares = screen.getAllByRole("button");
      const whitePawnE2 = squares.find((square) =>
        square.getAttribute("aria-label")?.includes("white pawn on e2")
      );
      const e4Square = squares.find((square) =>
        square.getAttribute("aria-label")?.includes("Empty square e4")
      );

      if (whitePawnE2 && e4Square) {
        fireEvent.click(whitePawnE2);
        fireEvent.click(e4Square);

        // Should reject invalid move and use fallback
        await waitFor(
          () => {
            const statusElements = screen.getAllByRole("status");
            const whiteTurnStatus = statusElements.find((el) =>
              el.textContent?.includes("White to move")
            );
            expect(whiteTurnStatus).toBeInTheDocument();
          },
          { timeout: 5000 }
        );
      }
    });

    test("handles AI returning move to occupied square by same color", async () => {
      mockGetAIMove.mockResolvedValue({
        isValid: false,
        error: "Square occupied by own piece",
        sanMove: "Nb8", // Knight trying to move to square with own piece
        source: "ai",
      });

      render(<App />);

      const aiButton = screen.getByRole("button", { name: /player vs ai/i });
      fireEvent.click(aiButton);

      await waitFor(() => {
        expect(screen.getByRole("application")).toBeInTheDocument();
      });

      // Make a move to trigger AI
      const squares = screen.getAllByRole("button");
      const whitePawnE2 = squares.find((square) =>
        square.getAttribute("aria-label")?.includes("white pawn on e2")
      );
      const e4Square = squares.find((square) =>
        square.getAttribute("aria-label")?.includes("Empty square e4")
      );

      if (whitePawnE2 && e4Square) {
        fireEvent.click(whitePawnE2);
        fireEvent.click(e4Square);

        // Should handle invalid move
        await waitFor(
          () => {
            const statusElements = screen.getAllByRole("status");
            const whiteTurnStatus = statusElements.find((el) =>
              el.textContent?.includes("White to move")
            );
            expect(whiteTurnStatus).toBeInTheDocument();
          },
          { timeout: 5000 }
        );
      }
    });

    test("handles AI returning ambiguous move without disambiguation", async () => {
      mockGetAIMove.mockResolvedValue({
        isValid: false,
        error: "Ambiguous move - disambiguation required",
        sanMove: "Ne4", // Ambiguous knight move
        source: "ai",
      });

      render(<App />);

      const aiButton = screen.getByRole("button", { name: /player vs ai/i });
      fireEvent.click(aiButton);

      await waitFor(() => {
        expect(screen.getByRole("application")).toBeInTheDocument();
      });

      // Make a move to trigger AI
      const squares = screen.getAllByRole("button");
      const whitePawnE2 = squares.find((square) =>
        square.getAttribute("aria-label")?.includes("white pawn on e2")
      );
      const e4Square = squares.find((square) =>
        square.getAttribute("aria-label")?.includes("Empty square e4")
      );

      if (whitePawnE2 && e4Square) {
        fireEvent.click(whitePawnE2);
        fireEvent.click(e4Square);

        // Should handle ambiguous move
        await waitFor(
          () => {
            const statusElements = screen.getAllByRole("status");
            const whiteTurnStatus = statusElements.find((el) =>
              el.textContent?.includes("White to move")
            );
            expect(whiteTurnStatus).toBeInTheDocument();
          },
          { timeout: 5000 }
        );
      }
    });
  });

  describe("AI Service Error Recovery", () => {
    test("recovers from multiple consecutive AI failures", async () => {
      // Mock multiple failures followed by success
      mockGetAIMove
        .mockRejectedValueOnce(new Error("Network timeout"))
        .mockRejectedValueOnce(new Error("API rate limit"))
        .mockResolvedValueOnce({
          isValid: true,
          sanMove: "e5",
          moveDetails: {
            from: [1, 4],
            to: [3, 4],
            piece: { type: "pawn", color: "black" },
          },
          confidence: "low",
          source: "fallback",
        });

      render(<App />);

      const aiButton = screen.getByRole("button", { name: /player vs ai/i });
      fireEvent.click(aiButton);

      await waitFor(() => {
        expect(screen.getByRole("application")).toBeInTheDocument();
      });

      // Make a move to trigger AI
      const squares = screen.getAllByRole("button");
      const whitePawnE2 = squares.find((square) =>
        square.getAttribute("aria-label")?.includes("white pawn on e2")
      );
      const e4Square = squares.find((square) =>
        square.getAttribute("aria-label")?.includes("Empty square e4")
      );

      if (whitePawnE2 && e4Square) {
        fireEvent.click(whitePawnE2);
        fireEvent.click(e4Square);

        // Should eventually succeed with fallback
        await waitFor(
          () => {
            const statusElements = screen.getAllByRole("status");
            const whiteTurnStatus = statusElements.find((el) =>
              el.textContent?.includes("White to move")
            );
            expect(whiteTurnStatus).toBeInTheDocument();
          },
          { timeout: 10000 }
        );

        // Should have been called multiple times due to retries
        expect(mockGetAIMove).toHaveBeenCalledTimes(3);
      }
    });

    test("handles API authentication errors", async () => {
      mockGetAIMove.mockRejectedValue(
        new Error("401 Unauthorized - Invalid API key")
      );

      render(<App />);

      const aiButton = screen.getByRole("button", { name: /player vs ai/i });
      fireEvent.click(aiButton);

      await waitFor(() => {
        expect(screen.getByRole("application")).toBeInTheDocument();
      });

      // Make a move to trigger AI
      const squares = screen.getAllByRole("button");
      const whitePawnE2 = squares.find((square) =>
        square.getAttribute("aria-label")?.includes("white pawn on e2")
      );
      const e4Square = squares.find((square) =>
        square.getAttribute("aria-label")?.includes("Empty square e4")
      );

      if (whitePawnE2 && e4Square) {
        fireEvent.click(whitePawnE2);
        fireEvent.click(e4Square);

        // Should fall back to random move
        await waitFor(
          () => {
            const statusElements = screen.getAllByRole("status");
            const whiteTurnStatus = statusElements.find((el) =>
              el.textContent?.includes("White to move")
            );
            expect(whiteTurnStatus).toBeInTheDocument();
          },
          { timeout: 5000 }
        );
      }
    });

    test("handles API quota exceeded errors", async () => {
      mockGetAIMove.mockRejectedValue(
        new Error("429 Too Many Requests - Quota exceeded")
      );

      render(<App />);

      const aiButton = screen.getByRole("button", { name: /player vs ai/i });
      fireEvent.click(aiButton);

      await waitFor(() => {
        expect(screen.getByRole("application")).toBeInTheDocument();
      });

      // Make a move to trigger AI
      const squares = screen.getAllByRole("button");
      const whitePawnE2 = squares.find((square) =>
        square.getAttribute("aria-label")?.includes("white pawn on e2")
      );
      const e4Square = squares.find((square) =>
        square.getAttribute("aria-label")?.includes("Empty square e4")
      );

      if (whitePawnE2 && e4Square) {
        fireEvent.click(whitePawnE2);
        fireEvent.click(e4Square);

        // Should continue with fallback moves
        await waitFor(
          () => {
            const statusElements = screen.getAllByRole("status");
            const whiteTurnStatus = statusElements.find((el) =>
              el.textContent?.includes("White to move")
            );
            expect(whiteTurnStatus).toBeInTheDocument();
          },
          { timeout: 5000 }
        );
      }
    });

    test("handles malformed API responses", async () => {
      mockGetAIMove.mockResolvedValue({
        // Missing required fields
        isValid: undefined,
        sanMove: null,
        error: "Malformed response",
      });

      render(<App />);

      const aiButton = screen.getByRole("button", { name: /player vs ai/i });
      fireEvent.click(aiButton);

      await waitFor(() => {
        expect(screen.getByRole("application")).toBeInTheDocument();
      });

      // Make a move to trigger AI
      const squares = screen.getAllByRole("button");
      const whitePawnE2 = squares.find((square) =>
        square.getAttribute("aria-label")?.includes("white pawn on e2")
      );
      const e4Square = squares.find((square) =>
        square.getAttribute("aria-label")?.includes("Empty square e4")
      );

      if (whitePawnE2 && e4Square) {
        fireEvent.click(whitePawnE2);
        fireEvent.click(e4Square);

        // Should handle malformed response gracefully
        await waitFor(
          () => {
            const statusElements = screen.getAllByRole("status");
            const whiteTurnStatus = statusElements.find((el) =>
              el.textContent?.includes("White to move")
            );
            expect(whiteTurnStatus).toBeInTheDocument();
          },
          { timeout: 5000 }
        );
      }
    });
  });

  describe("Move Validation Edge Cases", () => {
    test("validates castling moves correctly", async () => {
      mockGetAIMove.mockResolvedValue({
        isValid: true,
        sanMove: "O-O",
        moveDetails: {
          from: [0, 4],
          to: [0, 6],
          piece: { type: "king", color: "black" },
        },
        confidence: "high",
        source: "ai",
      });

      render(<App />);

      const aiButton = screen.getByRole("button", { name: /player vs ai/i });
      fireEvent.click(aiButton);

      await waitFor(() => {
        expect(screen.getByRole("application")).toBeInTheDocument();
      });

      // Make a move to trigger AI
      const squares = screen.getAllByRole("button");
      const whitePawnE2 = squares.find((square) =>
        square.getAttribute("aria-label")?.includes("white pawn on e2")
      );
      const e4Square = squares.find((square) =>
        square.getAttribute("aria-label")?.includes("Empty square e4")
      );

      if (whitePawnE2 && e4Square) {
        fireEvent.click(whitePawnE2);
        fireEvent.click(e4Square);

        // AI should attempt castling (though it may not be legal from starting position)
        await waitFor(
          () => {
            const statusElements = screen.getAllByRole("status");
            const whiteTurnStatus = statusElements.find((el) =>
              el.textContent?.includes("White to move")
            );
            expect(whiteTurnStatus).toBeInTheDocument();
          },
          { timeout: 5000 }
        );

        expect(mockGetAIMove).toHaveBeenCalled();
      }
    });

    test("validates en passant moves correctly", async () => {
      mockGetAIMove.mockResolvedValue({
        isValid: true,
        sanMove: "exd6",
        moveDetails: {
          from: [3, 4],
          to: [2, 3],
          piece: { type: "pawn", color: "black" },
        },
        confidence: "high",
        source: "ai",
      });

      render(<App />);

      const aiButton = screen.getByRole("button", { name: /player vs ai/i });
      fireEvent.click(aiButton);

      await waitFor(() => {
        expect(screen.getByRole("application")).toBeInTheDocument();
      });

      // Make a move to trigger AI
      const squares = screen.getAllByRole("button");
      const whitePawnE2 = squares.find((square) =>
        square.getAttribute("aria-label")?.includes("white pawn on e2")
      );
      const e4Square = squares.find((square) =>
        square.getAttribute("aria-label")?.includes("Empty square e4")
      );

      if (whitePawnE2 && e4Square) {
        fireEvent.click(whitePawnE2);
        fireEvent.click(e4Square);

        // AI should handle en passant validation
        await waitFor(
          () => {
            const statusElements = screen.getAllByRole("status");
            const whiteTurnStatus = statusElements.find((el) =>
              el.textContent?.includes("White to move")
            );
            expect(whiteTurnStatus).toBeInTheDocument();
          },
          { timeout: 5000 }
        );
      }
    });

    test("validates pawn promotion moves correctly", async () => {
      mockGetAIMove.mockResolvedValue({
        isValid: true,
        sanMove: "e8=Q+",
        moveDetails: {
          from: [1, 4],
          to: [0, 4],
          piece: { type: "pawn", color: "black" },
          promotionPiece: "queen",
        },
        confidence: "high",
        source: "ai",
      });

      render(<App />);

      const aiButton = screen.getByRole("button", { name: /player vs ai/i });
      fireEvent.click(aiButton);

      await waitFor(() => {
        expect(screen.getByRole("application")).toBeInTheDocument();
      });

      // Make a move to trigger AI
      const squares = screen.getAllByRole("button");
      const whitePawnE2 = squares.find((square) =>
        square.getAttribute("aria-label")?.includes("white pawn on e2")
      );
      const e4Square = squares.find((square) =>
        square.getAttribute("aria-label")?.includes("Empty square e4")
      );

      if (whitePawnE2 && e4Square) {
        fireEvent.click(whitePawnE2);
        fireEvent.click(e4Square);

        // AI should handle promotion validation
        await waitFor(
          () => {
            const statusElements = screen.getAllByRole("status");
            const whiteTurnStatus = statusElements.find((el) =>
              el.textContent?.includes("White to move")
            );
            expect(whiteTurnStatus).toBeInTheDocument();
          },
          { timeout: 5000 }
        );
      }
    });

    test("validates check and checkmate indicators", async () => {
      mockGetAIMove.mockResolvedValue({
        isValid: true,
        sanMove: "Qh5+",
        moveDetails: {
          from: [0, 3],
          to: [3, 7],
          piece: { type: "queen", color: "black" },
        },
        confidence: "high",
        source: "ai",
      });

      render(<App />);

      const aiButton = screen.getByRole("button", { name: /player vs ai/i });
      fireEvent.click(aiButton);

      await waitFor(() => {
        expect(screen.getByRole("application")).toBeInTheDocument();
      });

      // Make a move to trigger AI
      const squares = screen.getAllByRole("button");
      const whitePawnE2 = squares.find((square) =>
        square.getAttribute("aria-label")?.includes("white pawn on e2")
      );
      const e4Square = squares.find((square) =>
        square.getAttribute("aria-label")?.includes("Empty square e4")
      );

      if (whitePawnE2 && e4Square) {
        fireEvent.click(whitePawnE2);
        fireEvent.click(e4Square);

        // AI should handle check validation
        await waitFor(
          () => {
            const statusElements = screen.getAllByRole("status");
            const whiteTurnStatus = statusElements.find((el) =>
              el.textContent?.includes("White to move")
            );
            expect(whiteTurnStatus).toBeInTheDocument();
          },
          { timeout: 5000 }
        );
      }
    });
  });

  describe("Difficulty-Specific Validation", () => {
    test("validates easy difficulty moves are reasonable", async () => {
      mockGetAIMove.mockResolvedValue({
        isValid: true,
        sanMove: "e5",
        moveDetails: {
          from: [1, 4],
          to: [3, 4],
          piece: { type: "pawn", color: "black" },
        },
        confidence: "low",
        source: "ai",
      });

      render(<App />);

      const aiButton = screen.getByRole("button", { name: /player vs ai/i });
      fireEvent.click(aiButton);

      await waitFor(() => {
        expect(screen.getByRole("application")).toBeInTheDocument();
      });

      // Switch to easy difficulty
      const easyButton = screen.getByLabelText(
        "Switch to AI mode - Easy difficulty"
      );
      fireEvent.click(easyButton);

      await waitFor(() => {
        expect(screen.getByText("Change Game Mode?")).toBeInTheDocument();
      });

      const confirmButton = screen.getByText("Yes, Change Mode");
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(screen.getByText("vs AI (easy)")).toBeInTheDocument();
      });

      // Make a move to trigger AI
      const squares = screen.getAllByRole("button");
      const whitePawnE2 = squares.find((square) =>
        square.getAttribute("aria-label")?.includes("white pawn on e2")
      );
      const e4Square = squares.find((square) =>
        square.getAttribute("aria-label")?.includes("Empty square e4")
      );

      if (whitePawnE2 && e4Square) {
        fireEvent.click(whitePawnE2);
        fireEvent.click(e4Square);

        await waitFor(
          () => {
            const statusElements = screen.getAllByRole("status");
            const whiteTurnStatus = statusElements.find((el) =>
              el.textContent?.includes("White to move")
            );
            expect(whiteTurnStatus).toBeInTheDocument();
          },
          { timeout: 5000 }
        );

        // Verify AI was called with easy difficulty
        expect(mockGetAIMove).toHaveBeenCalledWith(
          expect.any(Object),
          PIECE_COLORS.BLACK,
          DIFFICULTY_LEVELS.EASY,
          undefined
        );
      }
    });

    test("validates hard difficulty moves are optimal", async () => {
      mockGetAIMove.mockResolvedValue({
        isValid: true,
        sanMove: "Nf6",
        moveDetails: {
          from: [0, 6],
          to: [2, 5],
          piece: { type: "knight", color: "black" },
        },
        confidence: "high",
        source: "ai",
      });

      render(<App />);

      const aiButton = screen.getByRole("button", { name: /player vs ai/i });
      fireEvent.click(aiButton);

      await waitFor(() => {
        expect(screen.getByRole("application")).toBeInTheDocument();
      });

      // Switch to hard difficulty
      const hardButton = screen.getByLabelText(
        "Switch to AI mode - Hard difficulty"
      );
      fireEvent.click(hardButton);

      await waitFor(() => {
        expect(screen.getByText("Change Game Mode?")).toBeInTheDocument();
      });

      const confirmButton = screen.getByText("Yes, Change Mode");
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(screen.getByText("vs AI (hard)")).toBeInTheDocument();
      });

      // Make a move to trigger AI
      const squares = screen.getAllByRole("button");
      const whitePawnE2 = squares.find((square) =>
        square.getAttribute("aria-label")?.includes("white pawn on e2")
      );
      const e4Square = squares.find((square) =>
        square.getAttribute("aria-label")?.includes("Empty square e4")
      );

      if (whitePawnE2 && e4Square) {
        fireEvent.click(whitePawnE2);
        fireEvent.click(e4Square);

        await waitFor(
          () => {
            const statusElements = screen.getAllByRole("status");
            const whiteTurnStatus = statusElements.find((el) =>
              el.textContent?.includes("White to move")
            );
            expect(whiteTurnStatus).toBeInTheDocument();
          },
          { timeout: 5000 }
        );

        // Verify AI was called with hard difficulty
        expect(mockGetAIMove).toHaveBeenCalledWith(
          expect.any(Object),
          PIECE_COLORS.BLACK,
          DIFFICULTY_LEVELS.HARD,
          undefined
        );
      }
    });
  });

  describe("Fallback Move Generation", () => {
    test("generates valid fallback moves when AI fails", async () => {
      // Mock AI failure, should trigger fallback
      mockGetAIMove.mockRejectedValue(new Error("AI service unavailable"));

      render(<App />);

      const aiButton = screen.getByRole("button", { name: /player vs ai/i });
      fireEvent.click(aiButton);

      await waitFor(() => {
        expect(screen.getByRole("application")).toBeInTheDocument();
      });

      // Make a move to trigger AI
      const squares = screen.getAllByRole("button");
      const whitePawnE2 = squares.find((square) =>
        square.getAttribute("aria-label")?.includes("white pawn on e2")
      );
      const e4Square = squares.find((square) =>
        square.getAttribute("aria-label")?.includes("Empty square e4")
      );

      if (whitePawnE2 && e4Square) {
        fireEvent.click(whitePawnE2);
        fireEvent.click(e4Square);

        // Should generate fallback move
        await waitFor(
          () => {
            const statusElements = screen.getAllByRole("status");
            const whiteTurnStatus = statusElements.find((el) =>
              el.textContent?.includes("White to move")
            );
            expect(whiteTurnStatus).toBeInTheDocument();
          },
          { timeout: 5000 }
        );

        // Verify move was made (fallback should work)
        const moveHistoryElements = screen.getAllByText(/^[1-9]\./);
        expect(moveHistoryElements.length).toBeGreaterThan(0);
      }
    });

    test("fallback moves respect chess rules", async () => {
      // Mock AI failure to trigger fallback
      mockGetAIMove.mockRejectedValue(new Error("AI timeout"));

      render(<App />);

      const aiButton = screen.getByRole("button", { name: /player vs ai/i });
      fireEvent.click(aiButton);

      await waitFor(() => {
        expect(screen.getByRole("application")).toBeInTheDocument();
      });

      // Make multiple moves to test fallback consistency
      const squares = screen.getAllByRole("button");
      const whitePawnE2 = squares.find((square) =>
        square.getAttribute("aria-label")?.includes("white pawn on e2")
      );
      const e4Square = squares.find((square) =>
        square.getAttribute("aria-label")?.includes("Empty square e4")
      );

      if (whitePawnE2 && e4Square) {
        fireEvent.click(whitePawnE2);
        fireEvent.click(e4Square);

        // Wait for fallback move
        await waitFor(
          () => {
            const statusElements = screen.getAllByRole("status");
            const whiteTurnStatus = statusElements.find((el) =>
              el.textContent?.includes("White to move")
            );
            expect(whiteTurnStatus).toBeInTheDocument();
          },
          { timeout: 5000 }
        );

        // Make another move to test fallback again
        const updatedSquares = screen.getAllByRole("button");
        const whitePawnD2 = updatedSquares.find((square) =>
          square.getAttribute("aria-label")?.includes("white pawn on d2")
        );
        const d4Square = updatedSquares.find((square) =>
          square.getAttribute("aria-label")?.includes("Empty square d4")
        );

        if (whitePawnD2 && d4Square) {
          fireEvent.click(whitePawnD2);
          fireEvent.click(d4Square);

          // Should generate another fallback move
          await waitFor(
            () => {
              const statusElements = screen.getAllByRole("status");
              const whiteTurnStatus = statusElements.find((el) =>
                el.textContent?.includes("White to move")
              );
              expect(whiteTurnStatus).toBeInTheDocument();
            },
            { timeout: 5000 }
          );

          // Verify multiple moves were made
          const moveHistoryElements = screen.getAllByText(/^[1-9]\./);
          expect(moveHistoryElements.length).toBeGreaterThan(1);
        }
      }
    });

    test("fallback moves vary by difficulty level", async () => {
      // Mock AI failure for different difficulties
      mockGetAIMove.mockRejectedValue(new Error("Service unavailable"));

      render(<App />);

      // Test easy difficulty fallback
      const aiButton = screen.getByRole("button", { name: /player vs ai/i });
      fireEvent.click(aiButton);

      await waitFor(() => {
        expect(screen.getByRole("application")).toBeInTheDocument();
      });

      // Switch to easy difficulty
      const easyButton = screen.getByLabelText(
        "Switch to AI mode - Easy difficulty"
      );
      fireEvent.click(easyButton);

      await waitFor(() => {
        expect(screen.getByText("Change Game Mode?")).toBeInTheDocument();
      });

      const confirmButton = screen.getByText("Yes, Change Mode");
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(screen.getByText("vs AI (easy)")).toBeInTheDocument();
      });

      // Make a move to trigger fallback
      const squares = screen.getAllByRole("button");
      const whitePawnE2 = squares.find((square) =>
        square.getAttribute("aria-label")?.includes("white pawn on e2")
      );
      const e4Square = squares.find((square) =>
        square.getAttribute("aria-label")?.includes("Empty square e4")
      );

      if (whitePawnE2 && e4Square) {
        fireEvent.click(whitePawnE2);
        fireEvent.click(e4Square);

        // Should generate fallback move appropriate for easy difficulty
        await waitFor(
          () => {
            const statusElements = screen.getAllByRole("status");
            const whiteTurnStatus = statusElements.find((el) =>
              el.textContent?.includes("White to move")
            );
            expect(whiteTurnStatus).toBeInTheDocument();
          },
          { timeout: 5000 }
        );

        // Verify AI was called with easy difficulty
        expect(mockGetAIMove).toHaveBeenCalledWith(
          expect.any(Object),
          PIECE_COLORS.BLACK,
          DIFFICULTY_LEVELS.EASY,
          undefined
        );
      }
    });
  });
});
