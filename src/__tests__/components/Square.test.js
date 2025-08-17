// Square component tests
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import Square from "../../components/Square/Square.js";
import {
  PIECE_TYPES,
  PIECE_COLORS,
  createPiece,
} from "../../constants/gameConstants.js";

describe("Square Component", () => {
  const mockOnClick = jest.fn();
  const defaultProps = {
    row: 3,
    col: 4,
    isLight: true,
    onClick: mockOnClick,
  };

  beforeEach(() => {
    mockOnClick.mockClear();
  });

  describe("Basic Rendering", () => {
    test("should render empty light square", () => {
      render(<Square {...defaultProps} />);

      const square = screen.getByTestId("square-3-4");
      expect(square).toBeInTheDocument();
      expect(square).toHaveClass("square", "lightSquare");
    });

    test("should render empty dark square", () => {
      render(<Square {...defaultProps} isLight={false} />);

      const square = screen.getByTestId("square-3-4");
      expect(square).toHaveClass("square", "darkSquare");
    });

    test("should render square with piece", () => {
      const piece = createPiece(PIECE_TYPES.KING, PIECE_COLORS.WHITE);
      render(<Square {...defaultProps} piece={piece} />);

      const pieceElement = screen.getByTestId("piece-white-king");
      expect(pieceElement).toBeInTheDocument();
    });
  });

  describe("Visual States", () => {
    test("should apply selected styling", () => {
      render(<Square {...defaultProps} isSelected={true} />);

      const square = screen.getByTestId("square-3-4");
      expect(square).toHaveClass("selected");
    });

    test("should show move indicator for valid move on empty square", () => {
      render(<Square {...defaultProps} isValidMove={true} />);

      const square = screen.getByTestId("square-3-4");
      expect(square).toHaveClass("validMove");

      const moveIndicator = square.querySelector(".moveIndicator");
      expect(moveIndicator).toBeInTheDocument();
    });

    test("should show capture indicator for valid move on occupied square", () => {
      const piece = createPiece(PIECE_TYPES.PAWN, PIECE_COLORS.BLACK);
      render(<Square {...defaultProps} piece={piece} isValidMove={true} />);

      const square = screen.getByTestId("square-3-4");
      const captureIndicator = square.querySelector(".captureIndicator");
      expect(captureIndicator).toBeInTheDocument();
    });

    test("should apply check styling", () => {
      const piece = createPiece(PIECE_TYPES.KING, PIECE_COLORS.WHITE);
      render(<Square {...defaultProps} piece={piece} isInCheck={true} />);

      const square = screen.getByTestId("square-3-4");
      expect(square).toHaveClass("inCheck");
    });

    test("should combine multiple visual states", () => {
      const piece = createPiece(PIECE_TYPES.QUEEN, PIECE_COLORS.BLACK);
      render(
        <Square
          {...defaultProps}
          piece={piece}
          isSelected={true}
          isValidMove={true}
          isInCheck={true}
        />
      );

      const square = screen.getByTestId("square-3-4");
      expect(square).toHaveClass("selected", "validMove", "inCheck");
    });
  });

  describe("Interaction", () => {
    test("should call onClick when clicked", () => {
      render(<Square {...defaultProps} />);

      const square = screen.getByTestId("square-3-4");
      fireEvent.click(square);

      expect(mockOnClick).toHaveBeenCalledWith(3, 4);
    });

    test("should call onClick when Enter key is pressed", () => {
      render(<Square {...defaultProps} />);

      const square = screen.getByTestId("square-3-4");
      fireEvent.keyDown(square, { key: "Enter" });

      expect(mockOnClick).toHaveBeenCalledWith(3, 4);
    });

    test("should call onClick when Space key is pressed", () => {
      render(<Square {...defaultProps} />);

      const square = screen.getByTestId("square-3-4");
      fireEvent.keyDown(square, { key: " " });

      expect(mockOnClick).toHaveBeenCalledWith(3, 4);
    });

    test("should not call onClick for other keys", () => {
      render(<Square {...defaultProps} />);

      const square = screen.getByTestId("square-3-4");
      fireEvent.keyDown(square, { key: "a" });

      expect(mockOnClick).not.toHaveBeenCalled();
    });

    test("should not call onClick when onClick prop is not provided", () => {
      render(<Square {...defaultProps} onClick={undefined} />);

      const square = screen.getByTestId("square-3-4");
      fireEvent.click(square);

      // Should not throw error
      expect(mockOnClick).not.toHaveBeenCalled();
    });
  });

  describe("Accessibility", () => {
    test("should have proper ARIA attributes", () => {
      render(<Square {...defaultProps} />);

      const square = screen.getByTestId("square-3-4");
      expect(square).toHaveAttribute("role", "button");
      expect(square).toHaveAttribute("tabIndex", "0");
    });

    test("should have accessible label for empty square", () => {
      render(<Square {...defaultProps} />);

      const square = screen.getByTestId("square-3-4");
      expect(square).toHaveAttribute("aria-label", "Empty square e5");
    });

    test("should have accessible label for square with piece", () => {
      const piece = createPiece(PIECE_TYPES.KNIGHT, PIECE_COLORS.BLACK);
      render(<Square {...defaultProps} piece={piece} />);

      const square = screen.getByTestId("square-3-4");
      expect(square).toHaveAttribute("aria-label", "black knight on e5");
    });

    test("should include selection state in accessible label", () => {
      const piece = createPiece(PIECE_TYPES.ROOK, PIECE_COLORS.WHITE);
      render(<Square {...defaultProps} piece={piece} isSelected={true} />);

      const square = screen.getByTestId("square-3-4");
      expect(square).toHaveAttribute(
        "aria-label",
        "white rook on e5, selected"
      );
    });

    test("should include valid move state in accessible label", () => {
      render(<Square {...defaultProps} isValidMove={true} />);

      const square = screen.getByTestId("square-3-4");
      expect(square).toHaveAttribute(
        "aria-label",
        "Empty square e5, valid move"
      );
    });

    test("should include both selection and valid move in accessible label", () => {
      const piece = createPiece(PIECE_TYPES.BISHOP, PIECE_COLORS.BLACK);
      render(
        <Square
          {...defaultProps}
          piece={piece}
          isSelected={true}
          isValidMove={true}
        />
      );

      const square = screen.getByTestId("square-3-4");
      expect(square).toHaveAttribute(
        "aria-label",
        "black bishop on e5, selected, valid move"
      );
    });
  });

  describe("Animation Handling", () => {
    test("should render animated piece when animationData is provided", () => {
      const piece = createPiece(PIECE_TYPES.QUEEN, PIECE_COLORS.WHITE);
      const animationData = {
        type: "move",
        piece: piece,
        fromRow: 0,
        fromCol: 0,
        toRow: 3,
        toCol: 4,
      };

      render(<Square {...defaultProps} animationData={animationData} />);

      const pieceElement = screen.getByTestId("piece-white-queen");
      expect(pieceElement).toBeInTheDocument();
      expect(pieceElement).toHaveClass("animateMove");
    });

    test("should render capture animation", () => {
      const piece = createPiece(PIECE_TYPES.PAWN, PIECE_COLORS.BLACK);
      const animationData = {
        type: "capture",
        piece: piece,
        row: 3,
        col: 4,
      };

      render(<Square {...defaultProps} animationData={animationData} />);

      const pieceElement = screen.getByTestId("piece-black-pawn");
      expect(pieceElement).toHaveClass("animateCapture");
    });

    test("should call onAnimationEnd when animation completes", async () => {
      const mockOnAnimationEnd = jest.fn();
      const piece = createPiece(PIECE_TYPES.ROOK, PIECE_COLORS.WHITE);
      const animationData = {
        type: "move",
        piece: piece,
        fromRow: 0,
        fromCol: 0,
        toRow: 3,
        toCol: 4,
      };

      render(
        <Square
          {...defaultProps}
          animationData={animationData}
          onAnimationEnd={mockOnAnimationEnd}
        />
      );

      // Wait for animation to complete
      await new Promise((resolve) => setTimeout(resolve, 350));

      expect(mockOnAnimationEnd).toHaveBeenCalledWith("3-4");
    });

    test("should not show move indicators during animation", () => {
      const piece = createPiece(PIECE_TYPES.KNIGHT, PIECE_COLORS.BLACK);
      const animationData = {
        type: "move",
        piece: piece,
        fromRow: 0,
        fromCol: 0,
        toRow: 3,
        toCol: 4,
      };

      render(
        <Square
          {...defaultProps}
          animationData={animationData}
          isValidMove={true}
        />
      );

      const square = screen.getByTestId("square-3-4");
      const moveIndicator = square.querySelector(".moveIndicator");
      const captureIndicator = square.querySelector(".captureIndicator");

      expect(moveIndicator).not.toBeInTheDocument();
      expect(captureIndicator).not.toBeInTheDocument();
    });

    test("should hide regular piece when animationData is provided", () => {
      const regularPiece = createPiece(PIECE_TYPES.BISHOP, PIECE_COLORS.WHITE);
      const animatedPiece = createPiece(PIECE_TYPES.QUEEN, PIECE_COLORS.BLACK);
      const animationData = {
        type: "capture",
        piece: animatedPiece,
        row: 3,
        col: 4,
      };

      render(
        <Square
          {...defaultProps}
          piece={regularPiece}
          animationData={animationData}
        />
      );

      // Should only show the animated piece, not the regular piece
      expect(
        screen.queryByTestId("piece-white-bishop")
      ).not.toBeInTheDocument();
      expect(screen.getByTestId("piece-black-queen")).toBeInTheDocument();
    });
  });

  describe("Position Conversion", () => {
    test("should convert position to correct algebraic notation", () => {
      // Test various positions
      const positions = [
        { row: 0, col: 0, expected: "a8" },
        { row: 7, col: 7, expected: "h1" },
        { row: 3, col: 4, expected: "e5" },
        { row: 1, col: 2, expected: "c7" },
      ];

      positions.forEach(({ row, col, expected }) => {
        render(<Square {...defaultProps} row={row} col={col} />);

        const square = screen.getByTestId(`square-${row}-${col}`);
        expect(square).toHaveAttribute(
          "aria-label",
          `Empty square ${expected}`
        );
      });
    });
  });
});
