/**
 * Test checkmate functionality in the actual UI
 */
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import GameBoard from "../../components/GameBoard/GameBoard";
import { PIECE_TYPES, PIECE_COLORS } from "../../constants/gameConstants";

// Mock the initial game state to create a checkmate scenario
jest.mock("../../constants/gameConstants", () => {
  const originalModule = jest.requireActual("../../constants/gameConstants");
  const { PIECE_TYPES, PIECE_COLORS } = originalModule;

  return {
    ...originalModule,
    createInitialGameState: () => {
      // Create a board with a checkmate scenario
      const board = Array(8)
        .fill(null)
        .map(() => Array(8).fill(null));

      // Simple checkmate: Black king in corner, White queen and king
      board[0][0] = { type: PIECE_TYPES.KING, color: PIECE_COLORS.BLACK };
      board[1][1] = { type: PIECE_TYPES.QUEEN, color: PIECE_COLORS.WHITE };
      board[2][1] = { type: PIECE_TYPES.KING, color: PIECE_COLORS.WHITE };

      return {
        board,
        currentPlayer: PIECE_COLORS.BLACK, // Black to move (in checkmate)
        selectedSquare: null,
        validMoves: [],
        moveHistory: [],
        gameStatus: "checkmate", // Set to checkmate
      };
    },
  };
});

describe("Checkmate UI Test", () => {
  test("game board shows checkmate status and prevents moves", async () => {
    render(<GameBoard />);

    // Should show checkmate status
    await waitFor(() => {
      const statusElement = screen.getByRole("status", {
        name: /game status/i,
      });
      expect(statusElement).toHaveTextContent(/checkmate/i);
    });

    // Should show game over message
    const gameOverMessage = screen.getByText(/game over/i);
    expect(gameOverMessage).toBeInTheDocument();

    // Should show winner (get the first one from status text)
    const winnerMessage = screen.getAllByText(/white wins/i)[0];
    expect(winnerMessage).toBeInTheDocument();

    // Try to click on squares - should not allow moves
    const squares = screen.getAllByRole("button");
    const boardSquares = squares.filter((square) =>
      square.getAttribute("data-testid")?.startsWith("square-")
    );

    // Click on the black king (should not allow selection)
    const blackKingSquare = boardSquares.find((square) =>
      square.getAttribute("aria-label")?.includes("black king")
    );

    if (blackKingSquare) {
      fireEvent.click(blackKingSquare);

      // Should not be selected (game is over)
      expect(blackKingSquare).not.toHaveClass(/selected/);
    }

    // Reset button should be available
    const resetButton = screen.getByRole("button", { name: /reset game/i });
    expect(resetButton).toBeInTheDocument();
    expect(resetButton).not.toBeDisabled();
  });
});
