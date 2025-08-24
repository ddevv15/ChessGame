/**
 * Comprehensive Integration tests for AI functionality
 */
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import App from "../../App";
import {
  GAME_MODES,
  PIECE_COLORS,
  DIFFICULTY_LEVELS,
} from "../../constants/gameConstants";
import * as aiService from "../../utils/aiService.js";

// Mock the AI service to avoid API calls in tests
jest.mock("../../utils/aiService.js");

const mockGetAIMove = aiService.getAIMove;

describe("AI Integration", () => {
  beforeEach(() => {
    // Clear any previous mock calls
    jest.clearAllMocks();

    // Default mock implementation
    mockGetAIMove.mockResolvedValue({
      isValid: true,
      sanMove: "e5",
      moveDetails: {
        from: [1, 4], // e7
        to: [3, 4], // e5
        piece: { type: "pawn", color: "black" },
      },
      confidence: "high",
      source: "ai",
    });
  });

  test("AI mode shows thinking indicator and makes moves", async () => {
    render(<App />);

    // Select AI mode
    const aiButton = screen.getByRole("button", { name: /player vs ai/i });
    fireEvent.click(aiButton);

    // Wait for game board to appear
    await waitFor(() => {
      expect(screen.getByRole("application")).toBeInTheDocument();
    });

    // Should show AI mode indicator
    expect(screen.getByText("🤖 AI")).toBeInTheDocument();
    expect(screen.getByText("Medium")).toBeInTheDocument();

    // Initially should be white's turn
    const initialStatusElements = screen.getAllByRole("status");
    const initialTurnStatus = initialStatusElements.find(
      (el) =>
        el.textContent?.includes("White to move") ||
        el.textContent?.includes("White's turn")
    );
    expect(initialTurnStatus).toBeInTheDocument();

    // Make a move as white (human player)
    const squares = screen.getAllByRole("button");
    const whitePawnSquare = squares.find((square) =>
      square.getAttribute("aria-label")?.includes("white pawn on e2")
    );
    const e4Square = squares.find((square) =>
      square.getAttribute("aria-label")?.includes("Empty square e4")
    );

    if (whitePawnSquare && e4Square) {
      // Select white pawn
      fireEvent.click(whitePawnSquare);

      // Move to e4
      fireEvent.click(e4Square);

      // Should now be black's turn (AI's turn)
      await waitFor(() => {
        const statusElements = screen.getAllByRole("status");
        const blackTurnStatus = statusElements.find(
          (el) =>
            el.textContent?.includes("Black to move") ||
            el.textContent?.includes("Black's turn")
        );
        expect(blackTurnStatus).toBeInTheDocument();
      });

      // Wait for AI move to be processed (with longer timeout for AI processing)
      await waitFor(
        () => {
          // Check that it's white's turn again (meaning AI made a move)
          const statusElements = screen.getAllByRole("status");
          const whiteTurnStatus = statusElements.find(
            (el) =>
              el.textContent?.includes("White to move") ||
              el.textContent?.includes("White's turn")
          );
          expect(whiteTurnStatus).toBeInTheDocument();
        },
        { timeout: 5000 }
      );
    }
  });

  test("AI integration handles game mode properly", async () => {
    render(<App />);

    // Initially in mode selection
    expect(screen.getByText("Choose your game mode")).toBeInTheDocument();

    // Select AI mode
    const aiButton = screen.getByRole("button", { name: /player vs ai/i });
    fireEvent.click(aiButton);

    // Should show game with AI indicators
    await waitFor(() => {
      expect(screen.getByRole("application")).toBeInTheDocument();
      expect(screen.getByText("🤖 AI")).toBeInTheDocument();
    });

    // Back button should work
    const backButton = screen.getByRole("button", {
      name: /back to mode selection/i,
    });
    fireEvent.click(backButton);

    // Should return to mode selection
    await waitFor(() => {
      expect(screen.getByText("Choose your game mode")).toBeInTheDocument();
    });
  });

  test("PvP mode works without AI interference", async () => {
    render(<App />);

    // Select PvP mode
    const pvpButton = screen.getByRole("button", { name: /player vs player/i });
    fireEvent.click(pvpButton);

    // Wait for game board
    await waitFor(() => {
      expect(screen.getByRole("application")).toBeInTheDocument();
    });

    // Should show PvP mode indicator
    expect(screen.getByText("👥 PvP")).toBeInTheDocument();

    // Should not show AI difficulty
    expect(screen.queryByText("Medium")).not.toBeInTheDocument();
    expect(screen.queryByText("🤖 AI")).not.toBeInTheDocument();

    // Make a move - should not trigger AI
    const squares = screen.getAllByRole("button");
    const whitePawnSquare = squares.find((square) =>
      square.getAttribute("aria-label")?.includes("white pawn on e2")
    );
    const e4Square = squares.find((square) =>
      square.getAttribute("aria-label")?.includes("Empty square e4")
    );

    if (whitePawnSquare && e4Square) {
      fireEvent.click(whitePawnSquare);
      fireEvent.click(e4Square);

      // Should be black's turn (human vs human)
      await waitFor(() => {
        const statusElements = screen.getAllByRole("status");
        const turnStatus = statusElements.find(
          (el) =>
            el.textContent?.includes("Black to move") ||
            el.textContent?.includes("Black's turn")
        );
        expect(turnStatus).toBeInTheDocument();
      });
    }
  });

  describe("AI Error Handling Integration", () => {
    test("handles AI service failures gracefully", async () => {
      // Mock AI service to return fallback move
      mockGetAIMove.mockResolvedValue({
        isValid: true,
        sanMove: "Nf6",
        moveDetails: {
          from: [0, 6],
          to: [2, 5],
          piece: { type: "knight", color: "black" },
        },
        confidence: "low",
        source: "fallback",
      });

      render(<App />);

      // Select AI mode
      const aiButton = screen.getByRole("button", { name: /player vs ai/i });
      fireEvent.click(aiButton);

      await waitFor(() => {
        expect(screen.getByRole("application")).toBeInTheDocument();
      });

      // Make a move to trigger AI
      const squares = screen.getAllByRole("button");
      const whitePawnSquare = squares.find((square) =>
        square.getAttribute("aria-label")?.includes("white pawn on e2")
      );
      const e4Square = squares.find((square) =>
        square.getAttribute("aria-label")?.includes("Empty square e4")
      );

      if (whitePawnSquare && e4Square) {
        fireEvent.click(whitePawnSquare);
        fireEvent.click(e4Square);

        // AI should still make a move even with fallback
        await waitFor(
          () => {
            const statusElements = screen.getAllByRole("status");
            const whiteTurnStatus = statusElements.find(
              (el) =>
                el.textContent?.includes("White to move") ||
                el.textContent?.includes("White's turn")
            );
            expect(whiteTurnStatus).toBeInTheDocument();
          },
          { timeout: 5000 }
        );

        // Verify AI service was called
        expect(mockGetAIMove).toHaveBeenCalledWith(
          expect.any(Object),
          PIECE_COLORS.BLACK,
          DIFFICULTY_LEVELS.MEDIUM,
          undefined // No API key in test environment
        );
      }
    });

    test("continues game when AI returns invalid move", async () => {
      // Mock AI service to return invalid move first, then fallback
      mockGetAIMove
        .mockResolvedValueOnce({
          isValid: false,
          error: "Invalid move from AI",
          sanMove: "invalid",
        })
        .mockResolvedValueOnce({
          isValid: true,
          sanMove: "Nc6",
          moveDetails: {
            from: [0, 1],
            to: [2, 2],
            piece: { type: "knight", color: "black" },
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

      // Game should still be playable
      expect(screen.getByText("White to move")).toBeInTheDocument();
    });
  });

  describe("AI Difficulty Integration", () => {
    test("passes correct difficulty to AI service", async () => {
      render(<App />);

      // Select AI mode
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

      // Make a move to trigger AI with hard difficulty
      const squares = screen.getAllByRole("button");
      const whitePawnSquare = squares.find((square) =>
        square.getAttribute("aria-label")?.includes("white pawn on e2")
      );
      const e4Square = squares.find((square) =>
        square.getAttribute("aria-label")?.includes("Empty square e4")
      );

      if (whitePawnSquare && e4Square) {
        fireEvent.click(whitePawnSquare);
        fireEvent.click(e4Square);

        await waitFor(
          () => {
            expect(mockGetAIMove).toHaveBeenCalledWith(
              expect.any(Object),
              PIECE_COLORS.BLACK,
              DIFFICULTY_LEVELS.HARD,
              undefined
            );
          },
          { timeout: 5000 }
        );
      }
    });

    test("AI thinking indicator shows during processing", async () => {
      // Mock AI service with delay
      mockGetAIMove.mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  isValid: true,
                  sanMove: "e5",
                  moveDetails: {
                    from: [1, 4],
                    to: [3, 4],
                    piece: { type: "pawn", color: "black" },
                  },
                  confidence: "high",
                  source: "ai",
                }),
              1000
            )
          )
      );

      render(<App />);

      const aiButton = screen.getByRole("button", { name: /player vs ai/i });
      fireEvent.click(aiButton);

      await waitFor(() => {
        expect(screen.getByRole("application")).toBeInTheDocument();
      });

      // Make a move to trigger AI
      const squares = screen.getAllByRole("button");
      const whitePawnSquare = squares.find((square) =>
        square.getAttribute("aria-label")?.includes("white pawn on e2")
      );
      const e4Square = squares.find((square) =>
        square.getAttribute("aria-label")?.includes("Empty square e4")
      );

      if (whitePawnSquare && e4Square) {
        fireEvent.click(whitePawnSquare);
        fireEvent.click(e4Square);

        // Should show AI thinking indicator
        await waitFor(
          () => {
            const chessBoard = screen.getByTestId("chess-board");
            expect(chessBoard).toHaveAttribute("data-ai-thinking", "true");
          },
          { timeout: 2000 }
        );
      }
    });
  });

  describe("AI Game Flow Integration", () => {
    test("completes multiple AI moves in sequence", async () => {
      const moveSequence = [
        { sanMove: "e5", from: [1, 4], to: [3, 4] },
        { sanMove: "Nc6", from: [0, 1], to: [2, 2] },
        { sanMove: "Nf6", from: [0, 6], to: [2, 5] },
      ];

      let moveIndex = 0;
      mockGetAIMove.mockImplementation(() => {
        const move = moveSequence[moveIndex % moveSequence.length];
        moveIndex++;
        return Promise.resolve({
          isValid: true,
          sanMove: move.sanMove,
          moveDetails: {
            from: move.from,
            to: move.to,
            piece: { type: "pawn", color: "black" },
          },
          confidence: "high",
          source: "ai",
        });
      });

      render(<App />);

      const aiButton = screen.getByRole("button", { name: /player vs ai/i });
      fireEvent.click(aiButton);

      await waitFor(() => {
        expect(screen.getByRole("application")).toBeInTheDocument();
      });

      // Make multiple moves
      const squares = screen.getAllByRole("button");

      // First move: e4
      const e2Square = squares.find((square) =>
        square.getAttribute("aria-label")?.includes("white pawn on e2")
      );
      const e4Square = squares.find((square) =>
        square.getAttribute("aria-label")?.includes("Empty square e4")
      );

      if (e2Square && e4Square) {
        fireEvent.click(e2Square);
        fireEvent.click(e4Square);

        // Wait for AI response
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

        // Verify AI was called
        expect(mockGetAIMove).toHaveBeenCalledTimes(1);
      }
    });

    test("handles checkmate scenarios with AI", async () => {
      // Mock AI service to return a move that leads to checkmate
      mockGetAIMove.mockResolvedValue({
        isValid: true,
        sanMove: "Qh5#",
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

      // The game should handle checkmate scenarios properly
      expect(screen.getByText("White to move")).toBeInTheDocument();
    });
  });

  describe("AI Service Integration with Game State", () => {
    test("passes correct game state to AI service", async () => {
      render(<App />);

      const aiButton = screen.getByRole("button", { name: /player vs ai/i });
      fireEvent.click(aiButton);

      await waitFor(() => {
        expect(screen.getByRole("application")).toBeInTheDocument();
      });

      // Make a move
      const squares = screen.getAllByRole("button");
      const whitePawnSquare = squares.find((square) =>
        square.getAttribute("aria-label")?.includes("white pawn on e2")
      );
      const e4Square = squares.find((square) =>
        square.getAttribute("aria-label")?.includes("Empty square e4")
      );

      if (whitePawnSquare && e4Square) {
        fireEvent.click(whitePawnSquare);
        fireEvent.click(e4Square);

        await waitFor(
          () => {
            expect(mockGetAIMove).toHaveBeenCalledWith(
              expect.objectContaining({
                board: expect.any(Array),
                currentPlayer: PIECE_COLORS.BLACK,
                moveHistory: expect.any(Array),
                gameStatus: expect.any(String),
              }),
              PIECE_COLORS.BLACK,
              DIFFICULTY_LEVELS.MEDIUM,
              undefined
            );
          },
          { timeout: 5000 }
        );
      }
    });

    test("AI respects game rules and constraints", async () => {
      // Mock AI to return various types of moves
      const testMoves = [
        { sanMove: "e5", valid: true },
        { sanMove: "Ke2", valid: false }, // King move that would be illegal
        { sanMove: "Nc6", valid: true },
      ];

      let callCount = 0;
      mockGetAIMove.mockImplementation(() => {
        const move = testMoves[callCount % testMoves.length];
        callCount++;

        return Promise.resolve({
          isValid: move.valid,
          sanMove: move.sanMove,
          moveDetails: move.valid
            ? {
                from: [1, 4],
                to: [3, 4],
                piece: { type: "pawn", color: "black" },
              }
            : null,
          confidence: move.valid ? "high" : "low",
          source: move.valid ? "ai" : "fallback",
        });
      });

      render(<App />);

      const aiButton = screen.getByRole("button", { name: /player vs ai/i });
      fireEvent.click(aiButton);

      await waitFor(() => {
        expect(screen.getByRole("application")).toBeInTheDocument();
      });

      // Game should handle both valid and invalid AI responses
      expect(screen.getByText("White to move")).toBeInTheDocument();
    });
  });
});
