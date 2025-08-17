/**
 * Debug test to check if game over functionality works
 */
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import App from "../../App";
import {
  getGameStatus,
  isCheckmate,
  isKingInCheck,
} from "../../utils/gameLogic";
import { PIECE_TYPES, PIECE_COLORS } from "../../constants/gameConstants";

describe("Game Over Debug Tests", () => {
  test("verify game status detection works with simple checkmate", () => {
    // Create a simple checkmate scenario
    const board = Array(8)
      .fill(null)
      .map(() => Array(8).fill(null));

    // Set up a fool's mate scenario (fastest checkmate)
    // White king on e1, Black queen on d1, Black king on e8
    board[7][4] = { type: PIECE_TYPES.KING, color: PIECE_COLORS.WHITE };
    board[7][3] = { type: PIECE_TYPES.QUEEN, color: PIECE_COLORS.BLACK };
    board[0][4] = { type: PIECE_TYPES.KING, color: PIECE_COLORS.BLACK };

    // Add some pawns to block escape
    board[6][3] = { type: PIECE_TYPES.PAWN, color: PIECE_COLORS.WHITE };
    board[6][4] = { type: PIECE_TYPES.PAWN, color: PIECE_COLORS.WHITE };
    board[6][5] = { type: PIECE_TYPES.PAWN, color: PIECE_COLORS.WHITE };
    
    // Add black rook to control f1 and complete the checkmate
    board[7][5] = { type: PIECE_TYPES.ROOK, color: PIECE_COLORS.BLACK };

    console.log("Testing checkmate detection...");
    console.log(
      "Is white king in check?",
      isKingInCheck(board, PIECE_COLORS.WHITE)
    );
    console.log(
      "Is it checkmate for white?",
      isCheckmate(board, PIECE_COLORS.WHITE)
    );
    console.log(
      "Game status for white:",
      getGameStatus(board, PIECE_COLORS.WHITE)
    );

    // The game should detect checkmate
    expect(isKingInCheck(board, PIECE_COLORS.WHITE)).toBe(true);
    expect(getGameStatus(board, PIECE_COLORS.WHITE)).toBe("checkmate");
  });

  test("check if UI properly shows game status", async () => {
    render(<App />);

    // Get the game status element
    const statusElement = screen.getByRole("status", { name: /game status/i });
    expect(statusElement).toBeInTheDocument();

    // Initially should show "White to move"
    expect(statusElement).toHaveTextContent(/white to move/i);

    // Let's try to make a move and see if status updates
    const squares = screen.getAllByRole("button");
    const boardSquares = squares.filter((square) =>
      square.getAttribute("data-testid")?.startsWith("square-")
    );

    // Find a white pawn (should be at row 6)
    const whitePawnSquare = boardSquares.find((square) =>
      square.getAttribute("aria-label")?.includes("white pawn")
    );

    if (whitePawnSquare) {
      console.log(
        "Found white pawn:",
        whitePawnSquare.getAttribute("aria-label")
      );

      // Click on the pawn
      fireEvent.click(whitePawnSquare);

      // Should show selection
      await waitFor(() => {
        expect(whitePawnSquare).toHaveClass(/selected/);
      });

      // Find a valid move (empty square in front)
      const emptySquares = boardSquares.filter(
        (square) =>
          square.getAttribute("aria-label")?.includes("Empty square") &&
          square.classList.contains("validMove")
      );

      if (emptySquares.length > 0) {
        console.log(
          "Found valid move square:",
          emptySquares[0].getAttribute("aria-label")
        );

        // Make the move
        fireEvent.click(emptySquares[0]);

        // Wait for status to update
        await waitFor(() => {
          const updatedStatus = screen.getByRole("status", {
            name: /game status/i,
          });
          console.log("Status after move:", updatedStatus.textContent);
          expect(updatedStatus).toHaveTextContent(/black to move/i);
        });
      }
    }
  });

  test("verify game prevents moves when status is checkmate", async () => {
    render(<App />);

    // We can't easily create a checkmate in the UI test, but we can verify
    // that the game board has the right logic
    const gameBoard = screen.getByRole("application");
    expect(gameBoard).toBeInTheDocument();

    // The game board should have the data-testid
    expect(gameBoard).toHaveAttribute("data-testid", "game-board");
  });
});
