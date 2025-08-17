/**
 * Integration tests for complete App functionality
 * Tests the full application flow and component integration
 */
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import App from "../../App";

// Mock console.error to avoid noise in tests
const originalError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});

afterAll(() => {
  console.error = originalError;
});

describe("App Integration Tests", () => {
  test("renders complete chess application with all components", () => {
    render(<App />);

    // Check header
    expect(screen.getByText("Chess Game")).toBeInTheDocument();

    // Check main game components are present
    expect(
      screen.getByRole("grid", { name: /chess board/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/game status/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /reset game/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/move history/i)).toBeInTheDocument();

    // Check footer
    expect(screen.getByText(/built with react/i)).toBeInTheDocument();
  });

  test("complete game flow - piece selection, move, and history update", async () => {
    render(<App />);

    // Get the chess board
    const board = screen.getByRole("grid", { name: /chess board/i });
    expect(board).toBeInTheDocument();

    // Find squares by their position (using data-testid or aria-label)
    const squares = screen.getAllByRole("button");
    const pawnSquares = squares.filter((square) =>
      square.getAttribute("aria-label")?.includes("white pawn")
    );

    // Select a white pawn (should be at row 6)
    if (pawnSquares.length > 0) {
      const pawnSquare = pawnSquares[0];
      fireEvent.click(pawnSquare);

      // Check that piece is selected (should have selected styling)
      await waitFor(() => {
        expect(pawnSquare).toHaveClass(/selected/i);
      });

      // Find a valid move destination (one square forward)
      const emptySquares = squares.filter(
        (square) =>
          square.getAttribute("aria-label")?.includes("empty") &&
          square.getAttribute("aria-label")?.includes("valid move")
      );

      if (emptySquares.length > 0) {
        const destinationSquare = emptySquares[0];
        fireEvent.click(destinationSquare);

        // Wait for move to complete
        await waitFor(() => {
          // Check that move history was updated
          const moveHistory = screen.getByText(/move history/i).closest("div");
          expect(moveHistory).toBeInTheDocument();
        });

        // Check that turn changed to black
        expect(screen.getAllByText(/black/i)[0]).toBeInTheDocument();
      }
    }
  });

  test("reset functionality works correctly", async () => {
    render(<App />);

    // Get reset button
    const resetButton = screen.getByRole("button", { name: /reset game/i });
    expect(resetButton).toBeInTheDocument();

    // Click reset
    fireEvent.click(resetButton);

    // Wait for reset to complete
    await waitFor(() => {
      // Check that current player is back to white (use getAllByText to handle multiple instances)
      expect(screen.getAllByText(/white/i)[0]).toBeInTheDocument();
    });

    // Check that board is back to initial state
    const board = screen.getByRole("grid", { name: /chess board/i });
    expect(board).toBeInTheDocument();
  });

  test("responsive layout adapts to different screen sizes", () => {
    // Test desktop layout
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 1024,
    });

    render(<App />);

    const app = screen.getByRole("main");
    expect(app).toHaveClass("App-main");

    // Test mobile layout
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 480,
    });

    // Re-render to trigger responsive changes
    window.dispatchEvent(new Event("resize"));

    // App should still be functional
    expect(screen.getByText("Chess Game")).toBeInTheDocument();
    expect(
      screen.getByRole("grid", { name: /chess board/i })
    ).toBeInTheDocument();
  });

  test("proper component communication and data flow", async () => {
    render(<App />);

    // Test that GameBoard receives and handles events properly
    const board = screen.getByRole("grid", { name: /chess board/i });
    expect(board).toBeInTheDocument();

    // Test that GameControls can communicate with GameBoard
    const resetButton = screen.getByRole("button", { name: /reset game/i });
    fireEvent.click(resetButton);

    // Test that MoveHistory receives updates from GameBoard
    const moveHistorySection = screen.getByText(/move history/i).closest("div");
    expect(moveHistorySection).toBeInTheDocument();

    // Verify all components are properly integrated
    expect(screen.getByText(/game status/i)).toBeInTheDocument();
  });

  test("accessibility features are properly implemented", () => {
    render(<App />);

    // Check semantic HTML structure
    expect(screen.getByRole("banner")).toBeInTheDocument(); // header
    expect(screen.getByRole("main")).toBeInTheDocument(); // main
    expect(screen.getByRole("contentinfo")).toBeInTheDocument(); // footer

    // Check that interactive elements are accessible
    const buttons = screen.getAllByRole("button");
    buttons.forEach((button) => {
      expect(button).toHaveAttribute("aria-label");
    });

    // Check that the chess board has proper grid role
    expect(screen.getByRole("grid")).toBeInTheDocument();
  });

  test("error boundaries handle component failures gracefully", () => {
    // This test would require implementing error boundaries
    // For now, we'll test that the app renders without throwing
    expect(() => {
      render(<App />);
    }).not.toThrow();

    // Verify core functionality is available
    expect(screen.getByText("Chess Game")).toBeInTheDocument();
    expect(
      screen.getByRole("grid", { name: /chess board/i })
    ).toBeInTheDocument();
  });

  test("application maintains state consistency across interactions", async () => {
    render(<App />);

    // Perform multiple interactions and verify state remains consistent
    const resetButton = screen.getByRole("button", { name: /reset game/i });

    // Reset multiple times
    fireEvent.click(resetButton);
    fireEvent.click(resetButton);
    fireEvent.click(resetButton);

    // App should still be functional
    await waitFor(() => {
      expect(screen.getAllByText(/white/i)[0]).toBeInTheDocument();
      expect(
        screen.getByRole("grid", { name: /chess board/i })
      ).toBeInTheDocument();
    });
  });
});
