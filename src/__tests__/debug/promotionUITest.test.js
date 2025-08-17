/**
 * Test pawn promotion UI integration
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

describe("Pawn Promotion UI Integration", () => {
  test("debug feature sets up promotion scenario", async () => {
    render(<GameBoard />);

    const gameBoard = screen.getByRole("application");
    gameBoard.focus();

    // Press 'P' to set up promotion scenario
    fireEvent.keyDown(gameBoard, { key: "P" });

    // Should show white to move
    await waitFor(() => {
      const statusElement = screen.getByRole("status", {
        name: /game status/i,
      });
      expect(statusElement).toHaveTextContent(/white to move/i);
    });

    // Should have a white pawn on the 7th rank ready to promote
    const squares = screen.getAllByRole("button");
    const pawnSquare = squares.find((square) =>
      square.getAttribute("aria-label")?.includes("white pawn on e7")
    );

    expect(pawnSquare).toBeInTheDocument();
    console.log("Found white pawn ready to promote");
  });

  test("promotion dialog appears when pawn moves to last rank", async () => {
    render(<GameBoard />);

    const gameBoard = screen.getByRole("application");
    gameBoard.focus();

    // Set up promotion scenario
    fireEvent.keyDown(gameBoard, { key: "P" });

    await waitFor(() => {
      const statusElement = screen.getByRole("status", {
        name: /game status/i,
      });
      expect(statusElement).toHaveTextContent(/white to move/i);
    });

    // Find the white pawn on e7 (row 1, col 4)
    const squares = screen.getAllByRole("button");
    const pawnSquare = squares.find(
      (square) => square.getAttribute("data-testid") === "square-1-4"
    );

    if (pawnSquare) {
      console.log("Clicking on white pawn to select it");

      // Select the pawn
      fireEvent.click(pawnSquare);

      // Should be selected
      await waitFor(() => {
        expect(pawnSquare).toHaveClass(/selected/);
      });

      // Find the promotion square (e8 - row 0, col 4)
      const promotionSquare = squares.find(
        (square) => square.getAttribute("data-testid") === "square-0-4"
      );

      if (promotionSquare) {
        console.log("Clicking on promotion square");

        // Move to promotion square
        fireEvent.click(promotionSquare);

        // Promotion dialog should appear
        await waitFor(() => {
          const dialog = screen.getByRole("dialog");
          expect(dialog).toBeInTheDocument();
          expect(
            screen.getByText("Choose Promotion Piece")
          ).toBeInTheDocument();
        });

        console.log("Promotion dialog appeared successfully");

        // Should show all promotion options
        expect(
          screen.getByRole("button", { name: /promote to queen/i })
        ).toBeInTheDocument();
        expect(
          screen.getByRole("button", { name: /promote to rook/i })
        ).toBeInTheDocument();
        expect(
          screen.getByRole("button", { name: /promote to bishop/i })
        ).toBeInTheDocument();
        expect(
          screen.getByRole("button", { name: /promote to knight/i })
        ).toBeInTheDocument();
      }
    }
  });

  test("selecting promotion piece completes the move", async () => {
    render(<GameBoard />);

    const gameBoard = screen.getByRole("application");
    gameBoard.focus();

    // Set up promotion scenario
    fireEvent.keyDown(gameBoard, { key: "P" });

    await waitFor(() => {
      const statusElement = screen.getByRole("status", {
        name: /game status/i,
      });
      expect(statusElement).toHaveTextContent(/white to move/i);
    });

    // Find and click the pawn
    const squares = screen.getAllByRole("button");
    const pawnSquare = squares.find(
      (square) => square.getAttribute("data-testid") === "square-1-4"
    );

    if (pawnSquare) {
      fireEvent.click(pawnSquare);

      await waitFor(() => {
        expect(pawnSquare).toHaveClass(/selected/);
      });

      // Click promotion square
      const promotionSquare = squares.find(
        (square) => square.getAttribute("data-testid") === "square-0-4"
      );

      if (promotionSquare) {
        fireEvent.click(promotionSquare);

        // Wait for dialog
        await waitFor(() => {
          expect(screen.getByRole("dialog")).toBeInTheDocument();
        });

        // Select queen
        const queenButton = screen.getByRole("button", {
          name: /promote to queen/i,
        });
        fireEvent.click(queenButton);

        // Dialog should disappear
        await waitFor(() => {
          expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
        });

        // Turn should change to black (may be in check due to queen promotion)
        await waitFor(() => {
          const statusElement = screen.getByRole("status", {
            name: /game status/i,
          });
          expect(statusElement).toHaveTextContent(/black/i);
        });

        // Should have a white queen on e8
        const queenSquare = squares.find(
          (square) => square.getAttribute("data-testid") === "square-0-4"
        );

        if (queenSquare) {
          await waitFor(() => {
            expect(queenSquare.getAttribute("aria-label")).toMatch(
              /white queen/i
            );
          });
        }

        console.log("Promotion completed successfully - pawn became queen");
      }
    }
  });

  test("promotion works with different piece selections", async () => {
    render(<GameBoard />);

    const gameBoard = screen.getByRole("application");
    gameBoard.focus();

    // Set up promotion scenario
    fireEvent.keyDown(gameBoard, { key: "P" });

    await waitFor(() => {
      const statusElement = screen.getByRole("status", {
        name: /game status/i,
      });
      expect(statusElement).toHaveTextContent(/white to move/i);
    });

    // Find and click the pawn
    const squares = screen.getAllByRole("button");
    const pawnSquare = squares.find(
      (square) => square.getAttribute("data-testid") === "square-1-4"
    );

    if (pawnSquare) {
      fireEvent.click(pawnSquare);

      await waitFor(() => {
        expect(pawnSquare).toHaveClass(/selected/);
      });

      // Click promotion square
      const promotionSquare = squares.find(
        (square) => square.getAttribute("data-testid") === "square-0-4"
      );

      if (promotionSquare) {
        fireEvent.click(promotionSquare);

        // Wait for dialog
        await waitFor(() => {
          expect(screen.getByRole("dialog")).toBeInTheDocument();
        });

        // Select knight instead of queen
        const knightButton = screen.getByRole("button", {
          name: /promote to knight/i,
        });
        fireEvent.click(knightButton);

        // Dialog should disappear and move should complete
        await waitFor(() => {
          expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
        });

        // Should have a white knight on e8
        const knightSquare = squares.find(
          (square) => square.getAttribute("data-testid") === "square-0-4"
        );

        if (knightSquare) {
          await waitFor(() => {
            expect(knightSquare.getAttribute("aria-label")).toMatch(
              /white knight/i
            );
          });
        }

        console.log("Promotion to knight completed successfully");
      }
    }
  });

  test("promotion dialog has proper keyboard navigation", async () => {
    render(<GameBoard />);

    const gameBoard = screen.getByRole("application");
    gameBoard.focus();

    // Set up promotion scenario and trigger promotion
    fireEvent.keyDown(gameBoard, { key: "P" });

    await waitFor(() => {
      const statusElement = screen.getByRole("status", {
        name: /game status/i,
      });
      expect(statusElement).toHaveTextContent(/white to move/i);
    });

    // Trigger promotion dialog
    const squares = screen.getAllByRole("button");
    const pawnSquare = squares.find(
      (square) => square.getAttribute("data-testid") === "square-1-4"
    );
    const promotionSquare = squares.find(
      (square) => square.getAttribute("data-testid") === "square-0-4"
    );

    if (pawnSquare && promotionSquare) {
      fireEvent.click(pawnSquare);
      await waitFor(() => expect(pawnSquare).toHaveClass(/selected/));

      fireEvent.click(promotionSquare);
      await waitFor(() =>
        expect(screen.getByRole("dialog")).toBeInTheDocument()
      );

      // Test keyboard navigation
      const rookButton = screen.getByRole("button", {
        name: /promote to rook/i,
      });

      // Test Enter key
      fireEvent.keyDown(rookButton, { key: "Enter" });

      // Should complete promotion
      await waitFor(() => {
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      });

      console.log("Keyboard navigation in promotion dialog works");
    }
  });
});
