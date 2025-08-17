// ChessPiece component tests
import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import ChessPiece from "../../components/ChessPiece/ChessPiece.js";
import {
  PIECE_TYPES,
  PIECE_COLORS,
  UNICODE_PIECES,
} from "../../constants/gameConstants.js";

describe("ChessPiece Component", () => {
  describe("Basic Rendering", () => {
    test("should render white king with correct Unicode symbol", () => {
      render(<ChessPiece type={PIECE_TYPES.KING} color={PIECE_COLORS.WHITE} />);

      const piece = screen.getByTestId("piece-white-king");
      expect(piece).toBeInTheDocument();
      expect(piece).toHaveTextContent(
        UNICODE_PIECES[PIECE_COLORS.WHITE][PIECE_TYPES.KING]
      );
      expect(piece).toHaveClass("piece", "white", "king");
    });

    test("should render black queen with correct Unicode symbol", () => {
      render(
        <ChessPiece type={PIECE_TYPES.QUEEN} color={PIECE_COLORS.BLACK} />
      );

      const piece = screen.getByTestId("piece-black-queen");
      expect(piece).toBeInTheDocument();
      expect(piece).toHaveTextContent(
        UNICODE_PIECES[PIECE_COLORS.BLACK][PIECE_TYPES.QUEEN]
      );
      expect(piece).toHaveClass("piece", "black", "queen");
    });

    test("should render all piece types correctly", () => {
      const pieces = [
        { type: PIECE_TYPES.PAWN, color: PIECE_COLORS.WHITE },
        { type: PIECE_TYPES.ROOK, color: PIECE_COLORS.BLACK },
        { type: PIECE_TYPES.KNIGHT, color: PIECE_COLORS.WHITE },
        { type: PIECE_TYPES.BISHOP, color: PIECE_COLORS.BLACK },
        { type: PIECE_TYPES.QUEEN, color: PIECE_COLORS.WHITE },
        { type: PIECE_TYPES.KING, color: PIECE_COLORS.BLACK },
      ];

      pieces.forEach(({ type, color }) => {
        const { unmount } = render(<ChessPiece type={type} color={color} />);

        const piece = screen.getByTestId(`piece-${color}-${type}`);
        expect(piece).toBeInTheDocument();
        expect(piece).toHaveTextContent(UNICODE_PIECES[color][type]);
        expect(piece).toHaveClass("piece", color, type);

        unmount();
      });
    });
  });

  describe("Visual States", () => {
    test("should apply selected styling", () => {
      render(
        <ChessPiece
          type={PIECE_TYPES.ROOK}
          color={PIECE_COLORS.WHITE}
          isSelected={true}
        />
      );

      const piece = screen.getByTestId("piece-white-rook");
      expect(piece).toHaveClass("selected");
    });

    test("should apply dragging styling", () => {
      render(
        <ChessPiece
          type={PIECE_TYPES.KNIGHT}
          color={PIECE_COLORS.BLACK}
          isDragging={true}
        />
      );

      const piece = screen.getByTestId("piece-black-knight");
      expect(piece).toHaveClass("dragging");
    });

    test("should combine multiple visual states", () => {
      render(
        <ChessPiece
          type={PIECE_TYPES.BISHOP}
          color={PIECE_COLORS.WHITE}
          isSelected={true}
          isDragging={true}
          isAnimating={true}
        />
      );

      const piece = screen.getByTestId("piece-white-bishop");
      expect(piece).toHaveClass("selected", "dragging");
    });
  });

  describe("Animation Handling", () => {
    test("should apply animation class when animating", () => {
      render(
        <ChessPiece
          type={PIECE_TYPES.PAWN}
          color={PIECE_COLORS.BLACK}
          isAnimating={true}
          animationType="move"
        />
      );

      const piece = screen.getByTestId("piece-black-pawn");
      expect(piece).toHaveClass("animateMove");
    });

    test("should handle different animation types", () => {
      const animationTypes = ["move", "capture", "appear", "disappear"];

      animationTypes.forEach((animationType) => {
        const { unmount } = render(
          <ChessPiece
            type={PIECE_TYPES.QUEEN}
            color={PIECE_COLORS.WHITE}
            isAnimating={true}
            animationType={animationType}
          />
        );

        const piece = screen.getByTestId("piece-white-queen");
        const expectedClass = `animate${
          animationType.charAt(0).toUpperCase() + animationType.slice(1)
        }`;
        expect(piece).toHaveClass(expectedClass);

        unmount();
      });
    });

    test("should call onAnimationEnd callback after animation", async () => {
      const mockCallback = jest.fn();

      render(
        <ChessPiece
          type={PIECE_TYPES.KING}
          color={PIECE_COLORS.WHITE}
          isAnimating={true}
          onAnimationEnd={mockCallback}
        />
      );

      // Wait for animation to complete (300ms timeout in component)
      await waitFor(
        () => {
          expect(mockCallback).toHaveBeenCalled();
        },
        { timeout: 400 }
      );
    });

    test("should remove animation class after animation completes", async () => {
      const { rerender } = render(
        <ChessPiece
          type={PIECE_TYPES.ROOK}
          color={PIECE_COLORS.BLACK}
          isAnimating={true}
          animationType="capture"
        />
      );

      const piece = screen.getByTestId("piece-black-rook");
      expect(piece).toHaveClass("animateCapture");

      // Wait for animation to complete
      await waitFor(
        () => {
          expect(piece).not.toHaveClass("animateCapture");
        },
        { timeout: 400 }
      );
    });
  });

  describe("Accessibility", () => {
    test("should have aria-hidden attribute", () => {
      render(<ChessPiece type={PIECE_TYPES.PAWN} color={PIECE_COLORS.WHITE} />);

      const piece = screen.getByTestId("piece-white-pawn");
      expect(piece).toHaveAttribute("aria-hidden", "true");
    });

    test("should have descriptive data attributes", () => {
      render(
        <ChessPiece type={PIECE_TYPES.KNIGHT} color={PIECE_COLORS.BLACK} />
      );

      const piece = screen.getByTestId("piece-black-knight");
      expect(piece).toHaveAttribute("data-piece-name", "Black Knight");
      expect(piece).toHaveAttribute("title", "Black Knight");
    });

    test("should have correct data attributes for all pieces", () => {
      const testCases = [
        {
          type: PIECE_TYPES.KING,
          color: PIECE_COLORS.WHITE,
          expected: "White King",
        },
        {
          type: PIECE_TYPES.QUEEN,
          color: PIECE_COLORS.BLACK,
          expected: "Black Queen",
        },
        {
          type: PIECE_TYPES.ROOK,
          color: PIECE_COLORS.WHITE,
          expected: "White Rook",
        },
        {
          type: PIECE_TYPES.BISHOP,
          color: PIECE_COLORS.BLACK,
          expected: "Black Bishop",
        },
        {
          type: PIECE_TYPES.KNIGHT,
          color: PIECE_COLORS.WHITE,
          expected: "White Knight",
        },
        {
          type: PIECE_TYPES.PAWN,
          color: PIECE_COLORS.BLACK,
          expected: "Black Pawn",
        },
      ];

      testCases.forEach(({ type, color, expected }) => {
        const { unmount } = render(<ChessPiece type={type} color={color} />);

        const piece = screen.getByTestId(`piece-${color}-${type}`);
        expect(piece).toHaveAttribute("data-piece-name", expected);
        expect(piece).toHaveAttribute("title", expected);

        unmount();
      });
    });
  });

  describe("Error Handling", () => {
    // Suppress console.warn for these tests
    const originalWarn = console.warn;
    beforeEach(() => {
      console.warn = jest.fn();
    });
    afterEach(() => {
      console.warn = originalWarn;
    });

    test("should handle invalid piece type gracefully", () => {
      render(<ChessPiece type="invalid" color={PIECE_COLORS.WHITE} />);

      expect(console.warn).toHaveBeenCalledWith("Invalid piece: white invalid");
      expect(
        screen.queryByTestId("piece-white-invalid")
      ).not.toBeInTheDocument();
    });

    test("should handle invalid piece color gracefully", () => {
      render(<ChessPiece type={PIECE_TYPES.KING} color="invalid" />);

      expect(console.warn).toHaveBeenCalledWith("Invalid piece: invalid king");
      expect(
        screen.queryByTestId("piece-invalid-king")
      ).not.toBeInTheDocument();
    });

    test("should handle both invalid type and color", () => {
      render(<ChessPiece type="invalid" color="invalid" />);

      expect(console.warn).toHaveBeenCalledWith(
        "Invalid piece: invalid invalid"
      );
      expect(
        screen.queryByTestId("piece-invalid-invalid")
      ).not.toBeInTheDocument();
    });
  });

  describe("Default Props", () => {
    test("should use default props when not provided", () => {
      render(<ChessPiece type={PIECE_TYPES.PAWN} color={PIECE_COLORS.WHITE} />);

      const piece = screen.getByTestId("piece-white-pawn");
      expect(piece).not.toHaveClass("selected", "dragging");
    });

    test("should override default props when provided", () => {
      render(
        <ChessPiece
          type={PIECE_TYPES.PAWN}
          color={PIECE_COLORS.WHITE}
          isSelected={true}
          isDragging={true}
        />
      );

      const piece = screen.getByTestId("piece-white-pawn");
      expect(piece).toHaveClass("selected", "dragging");
    });
  });
});
