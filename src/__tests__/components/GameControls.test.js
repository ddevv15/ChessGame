import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import GameControls from "../../components/GameControls/GameControls.js";
import { PIECE_COLORS } from "../../constants/gameConstants.js";

describe("GameControls Component", () => {
  const mockOnReset = jest.fn();

  beforeEach(() => {
    mockOnReset.mockClear();
  });

  test("should render game status title", () => {
    render(<GameControls onReset={mockOnReset} />);

    expect(screen.getByText("Game Status")).toBeInTheDocument();
  });

  test("should display default playing status for white", () => {
    render(
      <GameControls
        gameStatus="playing"
        currentPlayer={PIECE_COLORS.WHITE}
        onReset={mockOnReset}
      />
    );

    expect(screen.getByText("White to move")).toBeInTheDocument();
  });

  test("should display playing status for black", () => {
    render(
      <GameControls
        gameStatus="playing"
        currentPlayer={PIECE_COLORS.BLACK}
        onReset={mockOnReset}
      />
    );

    expect(screen.getByText("Black to move")).toBeInTheDocument();
  });

  test("should display check status correctly", () => {
    render(
      <GameControls
        gameStatus="check"
        currentPlayer={PIECE_COLORS.WHITE}
        onReset={mockOnReset}
      />
    );

    expect(screen.getByText("White is in check")).toBeInTheDocument();
  });

  test("should display checkmate status correctly", () => {
    render(
      <GameControls
        gameStatus="checkmate"
        currentPlayer={PIECE_COLORS.WHITE}
        onReset={mockOnReset}
      />
    );

    expect(screen.getByText("Checkmate! Black wins")).toBeInTheDocument();
  });

  test("should display stalemate status correctly", () => {
    render(
      <GameControls
        gameStatus="stalemate"
        currentPlayer={PIECE_COLORS.WHITE}
        onReset={mockOnReset}
      />
    );

    expect(screen.getByText("Stalemate - Draw")).toBeInTheDocument();
  });

  test("should render reset button", () => {
    render(<GameControls onReset={mockOnReset} />);

    const resetButton = screen.getByRole("button", {
      name: /reset game to starting position/i,
    });
    expect(resetButton).toBeInTheDocument();
    expect(resetButton).toHaveTextContent("New Game");
  });

  test("should call onReset when reset button is clicked", () => {
    render(<GameControls onReset={mockOnReset} />);

    const resetButton = screen.getByRole("button", {
      name: /reset game to starting position/i,
    });
    fireEvent.click(resetButton);

    expect(mockOnReset).toHaveBeenCalledTimes(1);
  });

  test("should not crash when onReset is not provided", () => {
    render(<GameControls />);

    const resetButton = screen.getByRole("button", {
      name: /reset game to starting position/i,
    });
    expect(() => fireEvent.click(resetButton)).not.toThrow();
  });

  test("should display current player indicator during play", () => {
    render(
      <GameControls
        gameStatus="playing"
        currentPlayer={PIECE_COLORS.WHITE}
        onReset={mockOnReset}
      />
    );

    expect(screen.getByText("White's turn")).toBeInTheDocument();
  });

  test("should display current player indicator for black", () => {
    render(
      <GameControls
        gameStatus="playing"
        currentPlayer={PIECE_COLORS.BLACK}
        onReset={mockOnReset}
      />
    );

    expect(screen.getByText("Black's turn")).toBeInTheDocument();
  });

  test("should not display player indicator when game is over", () => {
    render(
      <GameControls
        gameStatus="checkmate"
        currentPlayer={PIECE_COLORS.WHITE}
        onReset={mockOnReset}
      />
    );

    expect(screen.queryByText("White's turn")).not.toBeInTheDocument();
    expect(screen.queryByText("Black's turn")).not.toBeInTheDocument();
  });

  test("should display game over message for checkmate", () => {
    render(
      <GameControls
        gameStatus="checkmate"
        currentPlayer={PIECE_COLORS.WHITE}
        onReset={mockOnReset}
      />
    );

    expect(screen.getByText("Game Over")).toBeInTheDocument();
    expect(
      screen.getByText('Click "New Game" to start again')
    ).toBeInTheDocument();
  });

  test("should display game over message for stalemate", () => {
    render(
      <GameControls
        gameStatus="stalemate"
        currentPlayer={PIECE_COLORS.WHITE}
        onReset={mockOnReset}
      />
    );

    expect(screen.getByText("Game Over")).toBeInTheDocument();
    expect(
      screen.getByText('Click "New Game" to start again')
    ).toBeInTheDocument();
  });

  test("should not display game over message during play", () => {
    render(
      <GameControls
        gameStatus="playing"
        currentPlayer={PIECE_COLORS.WHITE}
        onReset={mockOnReset}
      />
    );

    expect(screen.queryByText("Game Over")).not.toBeInTheDocument();
  });

  test("should apply correct CSS classes for different game states", () => {
    const { rerender } = render(
      <GameControls gameStatus="playing" onReset={mockOnReset} />
    );

    let statusElement = screen.getByText("White to move");
    expect(statusElement).toHaveClass("statusPlaying");

    rerender(
      <GameControls
        gameStatus="check"
        currentPlayer={PIECE_COLORS.WHITE}
        onReset={mockOnReset}
      />
    );
    statusElement = screen.getByText("White is in check");
    expect(statusElement).toHaveClass("statusCheck");

    rerender(
      <GameControls
        gameStatus="checkmate"
        currentPlayer={PIECE_COLORS.WHITE}
        onReset={mockOnReset}
      />
    );
    statusElement = screen.getByText("Checkmate! Black wins");
    expect(statusElement).toHaveClass("statusCheckmate");

    rerender(<GameControls gameStatus="stalemate" onReset={mockOnReset} />);
    statusElement = screen.getByText("Stalemate - Draw");
    expect(statusElement).toHaveClass("statusStalemate");
  });

  test("should handle default props correctly", () => {
    render(<GameControls onReset={mockOnReset} />);

    // Should default to playing status with white player
    expect(screen.getByText("White to move")).toBeInTheDocument();
    expect(screen.getByText("White's turn")).toBeInTheDocument();
  });

  test("should render reset icon", () => {
    render(<GameControls onReset={mockOnReset} />);

    const resetButton = screen.getByRole("button", {
      name: /reset game to starting position/i,
    });
    expect(resetButton).toHaveTextContent("↻");
  });

  test("should have proper accessibility attributes", () => {
    render(<GameControls onReset={mockOnReset} />);

    const resetButton = screen.getByRole("button", {
      name: /reset game to starting position/i,
    });
    expect(resetButton).toHaveAttribute("type", "button");
    expect(resetButton).toHaveAttribute(
      "aria-label",
      "Reset game to starting position"
    );
  });

  describe("Visual Indicators", () => {
    test("should display check visual indicator", () => {
      render(
        <GameControls
          gameStatus="check"
          currentPlayer={PIECE_COLORS.WHITE}
          onReset={mockOnReset}
        />
      );

      expect(screen.getByText("Check!")).toBeInTheDocument();
      expect(screen.getByText("⚠️")).toBeInTheDocument();
    });

    test("should display checkmate visual indicator", () => {
      render(
        <GameControls
          gameStatus="checkmate"
          currentPlayer={PIECE_COLORS.WHITE}
          onReset={mockOnReset}
        />
      );

      expect(screen.getByText("Checkmate")).toBeInTheDocument();
      expect(screen.getByText("🏁")).toBeInTheDocument();
    });

    test("should display stalemate visual indicator", () => {
      render(
        <GameControls
          gameStatus="stalemate"
          currentPlayer={PIECE_COLORS.WHITE}
          onReset={mockOnReset}
        />
      );

      expect(screen.getByText("Draw")).toBeInTheDocument();
      expect(screen.getByText("🤝")).toBeInTheDocument();
    });

    test("should show player in check indicator", () => {
      render(
        <GameControls
          gameStatus="check"
          currentPlayer={PIECE_COLORS.BLACK}
          onReset={mockOnReset}
        />
      );

      expect(screen.getByText("Black's turn (in check!)")).toBeInTheDocument();
    });

    test("should not show visual indicators during normal play", () => {
      render(
        <GameControls
          gameStatus="playing"
          currentPlayer={PIECE_COLORS.WHITE}
          onReset={mockOnReset}
        />
      );

      expect(screen.queryByText("Check!")).not.toBeInTheDocument();
      expect(screen.queryByText("Game Over")).not.toBeInTheDocument();
      expect(screen.queryByText("Draw")).not.toBeInTheDocument();
    });

    test("should apply correct CSS classes for visual states", () => {
      const { rerender } = render(
        <GameControls
          gameStatus="check"
          currentPlayer={PIECE_COLORS.WHITE}
          onReset={mockOnReset}
        />
      );

      let statusElement = screen.getByText("White is in check");
      expect(statusElement).toHaveClass("statusCheck");

      rerender(
        <GameControls
          gameStatus="checkmate"
          currentPlayer={PIECE_COLORS.WHITE}
          onReset={mockOnReset}
        />
      );
      statusElement = screen.getByText("Checkmate! Black wins");
      expect(statusElement).toHaveClass("statusCheckmate");
    });
  });
});
