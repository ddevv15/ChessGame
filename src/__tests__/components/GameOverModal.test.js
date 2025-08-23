/**
 * Tests for GameOverModal component
 */
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import GameOverModal from "../../components/GameOverModal/GameOverModal";
import { PIECE_COLORS } from "../../constants/gameConstants";

describe("GameOverModal", () => {
  const mockOnReset = jest.fn();

  beforeEach(() => {
    mockOnReset.mockClear();
  });

  test("renders nothing when not visible", () => {
    render(
      <GameOverModal
        gameStatus="checkmate"
        currentPlayer={PIECE_COLORS.WHITE}
        onReset={mockOnReset}
        isVisible={false}
      />
    );

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  test("renders checkmate modal correctly", () => {
    render(
      <GameOverModal
        gameStatus="checkmate"
        currentPlayer={PIECE_COLORS.WHITE}
        onReset={mockOnReset}
        isVisible={true}
      />
    );

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Checkmate!")).toBeInTheDocument();
    expect(screen.getByText("Black Wins")).toBeInTheDocument();
    expect(screen.getByText("🏆")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /start a new game/i })
    ).toBeInTheDocument();
  });

  test("renders stalemate modal correctly", () => {
    render(
      <GameOverModal
        gameStatus="stalemate"
        currentPlayer={PIECE_COLORS.BLACK}
        onReset={mockOnReset}
        isVisible={true}
      />
    );

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Stalemate")).toBeInTheDocument();
    expect(screen.getByText("It's a Draw")).toBeInTheDocument();
    expect(screen.getByText("🤝")).toBeInTheDocument();
  });

  test("calls onReset when new game button is clicked", () => {
    render(
      <GameOverModal
        gameStatus="checkmate"
        currentPlayer={PIECE_COLORS.WHITE}
        onReset={mockOnReset}
        isVisible={true}
      />
    );

    const newGameButton = screen.getByRole("button", {
      name: /start a new game/i,
    });
    fireEvent.click(newGameButton);

    expect(mockOnReset).toHaveBeenCalledTimes(1);
  });

  test("calls onReset when backdrop is clicked", () => {
    render(
      <GameOverModal
        gameStatus="checkmate"
        currentPlayer={PIECE_COLORS.WHITE}
        onReset={mockOnReset}
        isVisible={true}
      />
    );

    const backdrop = screen.getByRole("dialog");
    fireEvent.click(backdrop);

    expect(mockOnReset).toHaveBeenCalledTimes(1);
  });

  test("has proper accessibility attributes", () => {
    render(
      <GameOverModal
        gameStatus="checkmate"
        currentPlayer={PIECE_COLORS.WHITE}
        onReset={mockOnReset}
        isVisible={true}
      />
    );

    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(dialog).toHaveAttribute("aria-labelledby", "game-over-title");
    expect(dialog).toHaveAttribute("aria-describedby", "game-over-subtitle");
  });

  test("shows correct winner for white checkmate", () => {
    render(
      <GameOverModal
        gameStatus="checkmate"
        currentPlayer={PIECE_COLORS.WHITE}
        onReset={mockOnReset}
        isVisible={true}
      />
    );

    expect(screen.getByText("Black Wins")).toBeInTheDocument();
  });

  test("shows correct winner for black checkmate", () => {
    render(
      <GameOverModal
        gameStatus="checkmate"
        currentPlayer={PIECE_COLORS.BLACK}
        onReset={mockOnReset}
        isVisible={true}
      />
    );

    expect(screen.getByText("White Wins")).toBeInTheDocument();
  });

  test("handles escape key press", () => {
    render(
      <GameOverModal
        gameStatus="checkmate"
        currentPlayer={PIECE_COLORS.WHITE}
        onReset={mockOnReset}
        isVisible={true}
      />
    );

    fireEvent.keyDown(document, { key: "Escape" });

    expect(mockOnReset).toHaveBeenCalledTimes(1);
  });

  test("prevents body scroll when modal is open", () => {
    const { unmount } = render(
      <GameOverModal
        gameStatus="checkmate"
        currentPlayer={PIECE_COLORS.WHITE}
        onReset={mockOnReset}
        isVisible={true}
      />
    );

    expect(document.body.style.overflow).toBe("hidden");

    unmount();

    expect(document.body.style.overflow).toBe("unset");
  });
});
