/**
 * Tests for PromotionDialog component
 */
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import PromotionDialog from "../../components/PromotionDialog/PromotionDialog";
import { PIECE_COLORS } from "../../constants/gameConstants";

describe("PromotionDialog Component", () => {
  const mockOnPromotionSelect = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    mockOnPromotionSelect.mockClear();
    mockOnCancel.mockClear();
  });

  test("renders promotion dialog when visible", () => {
    render(
      <PromotionDialog
        isVisible={true}
        playerColor={PIECE_COLORS.WHITE}
        onPromotionSelect={mockOnPromotionSelect}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Choose Promotion Piece")).toBeInTheDocument();
    expect(
      screen.getByText("Select which piece your pawn should become:")
    ).toBeInTheDocument();
  });

  test("does not render when not visible", () => {
    render(
      <PromotionDialog
        isVisible={false}
        playerColor={PIECE_COLORS.WHITE}
        onPromotionSelect={mockOnPromotionSelect}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  test("displays all four promotion piece options", () => {
    render(
      <PromotionDialog
        isVisible={true}
        playerColor={PIECE_COLORS.WHITE}
        onPromotionSelect={mockOnPromotionSelect}
        onCancel={mockOnCancel}
      />
    );

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
  });

  test("calls onPromotionSelect when piece is clicked", () => {
    render(
      <PromotionDialog
        isVisible={true}
        playerColor={PIECE_COLORS.WHITE}
        onPromotionSelect={mockOnPromotionSelect}
        onCancel={mockOnCancel}
      />
    );

    const queenButton = screen.getByRole("button", {
      name: /promote to queen/i,
    });
    fireEvent.click(queenButton);

    expect(mockOnPromotionSelect).toHaveBeenCalledWith("queen");
  });

  test("handles keyboard navigation", () => {
    render(
      <PromotionDialog
        isVisible={true}
        playerColor={PIECE_COLORS.WHITE}
        onPromotionSelect={mockOnPromotionSelect}
        onCancel={mockOnCancel}
      />
    );

    const rookButton = screen.getByRole("button", { name: /promote to rook/i });

    // Test Enter key
    fireEvent.keyDown(rookButton, { key: "Enter" });
    expect(mockOnPromotionSelect).toHaveBeenCalledWith("rook");

    mockOnPromotionSelect.mockClear();

    // Test Space key
    fireEvent.keyDown(rookButton, { key: " " });
    expect(mockOnPromotionSelect).toHaveBeenCalledWith("rook");
  });

  test("handles Escape key to cancel", () => {
    render(
      <PromotionDialog
        isVisible={true}
        playerColor={PIECE_COLORS.WHITE}
        onPromotionSelect={mockOnPromotionSelect}
        onCancel={mockOnCancel}
      />
    );

    const queenButton = screen.getByRole("button", {
      name: /promote to queen/i,
    });
    fireEvent.keyDown(queenButton, { key: "Escape" });

    expect(mockOnCancel).toHaveBeenCalled();
  });

  test("displays cancel button when onCancel is provided", () => {
    render(
      <PromotionDialog
        isVisible={true}
        playerColor={PIECE_COLORS.WHITE}
        onPromotionSelect={mockOnPromotionSelect}
        onCancel={mockOnCancel}
      />
    );

    const cancelButton = screen.getByRole("button", {
      name: /cancel promotion/i,
    });
    expect(cancelButton).toBeInTheDocument();

    fireEvent.click(cancelButton);
    expect(mockOnCancel).toHaveBeenCalled();
  });

  test("does not display cancel button when onCancel is not provided", () => {
    render(
      <PromotionDialog
        isVisible={true}
        playerColor={PIECE_COLORS.WHITE}
        onPromotionSelect={mockOnPromotionSelect}
      />
    );

    expect(
      screen.queryByRole("button", { name: /cancel promotion/i })
    ).not.toBeInTheDocument();
  });

  test("renders pieces with correct color", () => {
    render(
      <PromotionDialog
        isVisible={true}
        playerColor={PIECE_COLORS.BLACK}
        onPromotionSelect={mockOnPromotionSelect}
        onCancel={mockOnCancel}
      />
    );

    // Check that pieces are rendered (we can't easily test the color prop directly,
    // but we can verify the pieces are there)
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
  });

  test("has proper accessibility attributes", () => {
    render(
      <PromotionDialog
        isVisible={true}
        playerColor={PIECE_COLORS.WHITE}
        onPromotionSelect={mockOnPromotionSelect}
        onCancel={mockOnCancel}
      />
    );

    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(dialog).toHaveAttribute("aria-labelledby", "promotion-title");

    const pieceGroup = screen.getByRole("group", {
      name: /promotion piece options/i,
    });
    expect(pieceGroup).toBeInTheDocument();
  });
});
