/**
 * Test checkmate functionality with debug feature
 */
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import GameBoard from "../../components/GameBoard/GameBoard";

// Mock NODE_ENV to enable debug features
const originalEnv = process.env.NODE_ENV;
beforeAll(() => {
  process.env.NODE_ENV = "development";
});

afterAll(() => {
  process.env.NODE_ENV = originalEnv;
});

describe("Checkmate Debug Test", () => {
  test("debug feature creates checkmate scenario and game ends properly", async () => {
    render(<GameBoard />);

    // Get the game board
    const gameBoard = screen.getByRole("application");
    expect(gameBoard).toBeInTheDocument();

    // Initially should show "White to move"
    const statusElement = screen.getByRole("status", { name: /game status/i });
    expect(statusElement).toHaveTextContent(/white to move/i);

    // Focus the game board and press 'M' to trigger checkmate scenario
    gameBoard.focus();
    fireEvent.keyDown(gameBoard, { key: "M" });

    // Wait for the checkmate scenario to be set up
    await waitFor(
      () => {
        const updatedStatus = screen.getByRole("status", {
          name: /game status/i,
        });
        expect(updatedStatus).toHaveTextContent(/checkmate/i);
      },
      { timeout: 3000 }
    );

    // Should show checkmate message
    expect(screen.getAllByText(/checkmate/i)[0]).toBeInTheDocument();
    expect(screen.getAllByText(/white wins/i)[0]).toBeInTheDocument();

    // Should show game over message
    expect(screen.getByText(/game over/i)).toBeInTheDocument();

    // Try to click on squares - should not allow moves
    const squares = screen.getAllByRole("button");
    const boardSquares = squares.filter((square) =>
      square.getAttribute("data-testid")?.startsWith("square-")
    );

    // Click on the black king (should not allow selection since game is over)
    const blackKingSquare = boardSquares.find((square) =>
      square.getAttribute("aria-label")?.includes("black king")
    );

    if (blackKingSquare) {
      console.log("Clicking on black king in checkmate position");
      fireEvent.click(blackKingSquare);

      // Should not be selected (game is over)
      expect(blackKingSquare).not.toHaveClass(/selected/);
    }

    // Reset should work
    const resetButton = screen.getByRole("button", { name: /reset game/i });
    fireEvent.click(resetButton);

    // Should reset to normal game
    await waitFor(() => {
      const resetStatus = screen.getByRole("status", { name: /game status/i });
      expect(resetStatus).toHaveTextContent(/white to move/i);
    });
  });

  test("verify checkmate prevents keyboard navigation", async () => {
    render(<GameBoard />);

    const gameBoard = screen.getByRole("application");
    gameBoard.focus();

    // Set up checkmate scenario
    fireEvent.keyDown(gameBoard, { key: "M" });

    // Wait for checkmate
    await waitFor(() => {
      const statusElement = screen.getByRole("status", {
        name: /game status/i,
      });
      expect(statusElement).toHaveTextContent(/checkmate/i);
    });

    // Try keyboard navigation - should not work
    fireEvent.keyDown(gameBoard, { key: "ArrowRight" });
    fireEvent.keyDown(gameBoard, { key: "Enter" });

    // Game should still be in checkmate
    const statusElement = screen.getByRole("status", { name: /game status/i });
    expect(statusElement).toHaveTextContent(/checkmate/i);
  });
});
