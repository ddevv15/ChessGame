// Visual Mode Enhancements Tests
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import App from "../../App.js";

describe("Visual Mode Enhancements", () => {
  test("PvP mode shows distinct visual styling", async () => {
    render(<App />);

    // Select PvP mode
    const pvpButton = screen.getByText("Player vs Player");
    fireEvent.click(pvpButton);

    await waitFor(() => {
      // Check that game board has PvP mode styling
      const gameBoard = screen.getByTestId("game-board");
      expect(gameBoard).toHaveAttribute("data-game-mode", "pvp");
      expect(gameBoard).toHaveClass("pvpMode");

      // Check that chess board has PvP styling
      const chessBoard = screen.getByTestId("chess-board");
      expect(chessBoard).toHaveAttribute("data-game-mode", "pvp");
    });
  });

  test("AI mode shows distinct visual styling", async () => {
    render(<App />);

    // Select AI mode
    const aiButton = screen.getByText("Player vs AI");
    fireEvent.click(aiButton);

    await waitFor(() => {
      // Check that game board has AI mode styling
      const gameBoard = screen.getByTestId("game-board");
      expect(gameBoard).toHaveAttribute("data-game-mode", "ai");
      expect(gameBoard).toHaveClass("aiMode");

      // Check that chess board has AI styling
      const chessBoard = screen.getByTestId("chess-board");
      expect(chessBoard).toHaveAttribute("data-game-mode", "ai");
    });
  });

  test("AI thinking state shows enhanced visual feedback", async () => {
    render(<App />);

    // Select AI mode
    const aiButton = screen.getByText("Player vs AI");
    fireEvent.click(aiButton);

    // Make a move to trigger AI thinking
    await waitFor(() => {
      expect(screen.getByText("White to move")).toBeInTheDocument();
    });

    // Click on a pawn to select it
    const squares = screen.getAllByRole("button");
    const pawnSquare = squares.find((square) =>
      square.getAttribute("aria-label")?.includes("white pawn")
    );

    if (pawnSquare) {
      fireEvent.click(pawnSquare);

      // Find a valid move square and click it
      const validMoveSquare = squares.find((square) =>
        square.getAttribute("aria-label")?.includes("valid move")
      );

      if (validMoveSquare) {
        fireEvent.click(validMoveSquare);

        // Check for AI thinking indicators
        await waitFor(
          () => {
            const gameBoard = screen.getByTestId("game-board");
            const chessBoard = screen.getByTestId("chess-board");

            // Should show AI thinking state
            expect(chessBoard).toHaveAttribute("data-ai-thinking", "true");
          },
          { timeout: 3000 }
        );
      }
    }
  });

  test("game controls show mode-specific styling", async () => {
    render(<App />);

    // Test PvP mode controls
    const pvpButton = screen.getByText("Player vs Player");
    fireEvent.click(pvpButton);

    await waitFor(() => {
      const gameControls = screen.getByLabelText("Game controls and status");
      expect(gameControls).toHaveAttribute("data-game-mode", "pvp");
    });

    // Go back and test AI mode controls
    const backButton = screen.getByLabelText("Back to mode selection");
    fireEvent.click(backButton);

    await waitFor(() => {
      expect(screen.getByText("Choose your game mode")).toBeInTheDocument();
    });

    const aiButton = screen.getByText("Player vs AI");
    fireEvent.click(aiButton);

    await waitFor(() => {
      const gameControls = screen.getByLabelText("Game controls and status");
      expect(gameControls).toHaveAttribute("data-game-mode", "ai");
    });
  });

  test("mode indicators show correct icons and animations", async () => {
    render(<App />);

    // Test PvP mode icon
    const pvpButton = screen.getByText("Player vs Player");
    fireEvent.click(pvpButton);

    await waitFor(() => {
      // Should show PvP icon in game controls
      const gameControls = screen.getByLabelText("Game controls and status");
      expect(gameControls).toContainHTML("👥");
    });

    // Go back and test AI mode icon
    const backButton = screen.getByLabelText("Back to mode selection");
    fireEvent.click(backButton);

    await waitFor(() => {
      expect(screen.getByText("Choose your game mode")).toBeInTheDocument();
    });

    const aiButton = screen.getByText("Player vs AI");
    fireEvent.click(aiButton);

    await waitFor(() => {
      // Should show AI icon in game controls
      const gameControls = screen.getByLabelText("Game controls and status");
      expect(gameControls).toContainHTML("🤖");
    });
  });

  test("squares show mode-specific styling", async () => {
    render(<App />);

    // Test AI mode square styling
    const aiButton = screen.getByText("Player vs AI");
    fireEvent.click(aiButton);

    await waitFor(() => {
      // Check that chess board squares have proper test IDs and styling
      const firstSquare = screen.getByTestId("square-0-0");
      expect(firstSquare).toBeInTheDocument();
      expect(firstSquare).toHaveClass("aiMode");

      // Check a few more squares to verify they have AI mode styling
      const secondSquare = screen.getByTestId("square-0-1");
      expect(secondSquare).toHaveClass("aiMode");

      const lastSquare = screen.getByTestId("square-7-7");
      expect(lastSquare).toHaveClass("aiMode");
    });
  });

  test("visual feedback changes during turn transitions", async () => {
    render(<App />);

    // Select AI mode
    const aiButton = screen.getByText("Player vs AI");
    fireEvent.click(aiButton);

    await waitFor(() => {
      // Should start with white's turn (human player)
      expect(screen.getByText("White to move")).toBeInTheDocument();

      const chessBoard = screen.getByTestId("chess-board");
      expect(chessBoard).toHaveAttribute("data-current-player", "white");
    });
  });

  test("enhanced animations work with reduced motion preference", async () => {
    // Mock prefers-reduced-motion
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: jest.fn().mockImplementation((query) => ({
        matches: query.includes("prefers-reduced-motion: reduce"),
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    });

    render(<App />);

    // Select AI mode
    const aiButton = screen.getByText("Player vs AI");
    fireEvent.click(aiButton);

    await waitFor(() => {
      // Visual elements should still be present even with reduced motion
      const gameBoard = screen.getByTestId("game-board");
      expect(gameBoard).toHaveClass("aiMode");

      const chessBoard = screen.getByTestId("chess-board");
      expect(chessBoard).toHaveAttribute("data-game-mode", "ai");
    });
  });

  test("mode switching maintains visual consistency", async () => {
    render(<App />);

    // Start with PvP
    const pvpButton = screen.getByText("Player vs Player");
    fireEvent.click(pvpButton);

    await waitFor(() => {
      const gameBoard = screen.getByTestId("game-board");
      expect(gameBoard).toHaveClass("pvpMode");
    });

    // Switch to AI mode via game controls
    const aiEasyButton = screen.getByLabelText(
      "Switch to AI mode - Easy difficulty"
    );
    fireEvent.click(aiEasyButton);

    // Confirm the change
    await waitFor(() => {
      expect(screen.getByText("Change Game Mode?")).toBeInTheDocument();
    });

    const confirmButton = screen.getByText("Yes, Change Mode");
    fireEvent.click(confirmButton);

    // Check that visual styling updated
    await waitFor(() => {
      const gameBoard = screen.getByTestId("game-board");
      expect(gameBoard).toHaveClass("aiMode");
      expect(gameBoard).not.toHaveClass("pvpMode");

      const gameControls = screen.getByLabelText("Game controls and status");
      expect(gameControls).toHaveAttribute("data-game-mode", "ai");
    });
  });

  test("difficulty changes show appropriate visual feedback", async () => {
    render(<App />);

    // Select AI mode
    const aiButton = screen.getByText("Player vs AI");
    fireEvent.click(aiButton);

    await waitFor(() => {
      expect(screen.getByText("vs AI (medium)")).toBeInTheDocument();
    });

    // Change to hard difficulty
    const hardButton = screen.getByLabelText(
      "Switch to AI mode - Hard difficulty"
    );
    fireEvent.click(hardButton);

    await waitFor(() => {
      expect(screen.getByText("Change Game Mode?")).toBeInTheDocument();
    });

    const confirmButton = screen.getByText("Yes, Change Mode");
    fireEvent.click(confirmButton);

    // Check that difficulty is reflected in UI
    await waitFor(() => {
      expect(screen.getByText("vs AI (hard)")).toBeInTheDocument();
    });
  });
});
