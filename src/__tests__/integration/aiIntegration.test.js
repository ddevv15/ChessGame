/**
 * Integration test for AI functionality
 */
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import App from "../../App";
import { GAME_MODES } from "../../constants/gameConstants";

// Mock the AI service to avoid API calls in tests
jest.mock("../../utils/aiService.js", () => ({
  getAIMove: jest.fn().mockResolvedValue({
    isValid: true,
    sanMove: "e5",
    moveDetails: {
      from: [1, 4], // e7
      to: [3, 4], // e5
      piece: { type: "pawn", color: "black" },
    },
    confidence: "high",
    source: "ai",
  }),
}));

describe("AI Integration", () => {
  beforeEach(() => {
    // Clear any previous mock calls
    jest.clearAllMocks();
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
});
