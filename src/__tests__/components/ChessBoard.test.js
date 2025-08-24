// ChessBoard component tests
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import ChessBoard from "../../components/ChessBoard/ChessBoard.js";
import { initializeBoard } from "../../utils/boardUtils.js";
import {
  PIECE_TYPES,
  PIECE_COLORS,
  createPiece,
} from "../../constants/gameConstants.js";

describe("ChessBoard Component", () => {
  let testBoard;
  const mockOnSquareClick = jest.fn();

  beforeEach(() => {
    testBoard = initializeBoard();
    mockOnSquareClick.mockClear();
  });

  describe("Basic Rendering", () => {
    test("should render 8x8 grid of squares", () => {
      render(
        <ChessBoard board={testBoard} onSquareClick={mockOnSquareClick} />
      );

      const chessBoard = screen.getByTestId("chess-board");
      expect(chessBoard).toBeInTheDocument();
      expect(chessBoard).toHaveAttribute("role", "grid");
      expect(chessBoard).toHaveAttribute(
        "aria-label",
        "Chess board - PvP mode"
      );

      // Should have 64 squares (8x8)
      const squares = screen.getAllByRole("button");
      expect(squares).toHaveLength(64);
    });

    test("should render pieces in correct positions", () => {
      render(
        <ChessBoard board={testBoard} onSquareClick={mockOnSquareClick} />
      );

      // Check some specific pieces
      expect(screen.getByTestId("piece-white-king")).toBeInTheDocument();
      expect(screen.getByTestId("piece-black-king")).toBeInTheDocument();
      expect(screen.getAllByTestId(/piece-white-pawn/)).toHaveLength(8);
      expect(screen.getAllByTestId(/piece-black-pawn/)).toHaveLength(8);
    });

    test("should render rank and file labels", () => {
      render(
        <ChessBoard board={testBoard} onSquareClick={mockOnSquareClick} />
      );

      // Check for rank labels (1-8)
      for (let rank = 1; rank <= 8; rank++) {
        const rankLabels = screen.getAllByText(rank.toString());
        expect(rankLabels.length).toBeGreaterThan(0);
      }

      // Check for file labels (a-h)
      for (let file = 0; file < 8; file++) {
        const letter = String.fromCharCode("a".charCodeAt(0) + file);
        const fileLabels = screen.getAllByText(letter);
        expect(fileLabels.length).toBeGreaterThan(0);
      }
    });
  });

  describe("Square Interactions", () => {
    test("should call onSquareClick when square is clicked", () => {
      render(
        <ChessBoard board={testBoard} onSquareClick={mockOnSquareClick} />
      );

      const square = screen.getByTestId("square-3-4");
      fireEvent.click(square);

      expect(mockOnSquareClick).toHaveBeenCalledWith(3, 4);
    });

    test("should handle clicks on different squares", () => {
      render(
        <ChessBoard board={testBoard} onSquareClick={mockOnSquareClick} />
      );

      const positions = [
        [0, 0],
        [7, 7],
        [3, 4],
        [1, 2],
      ];

      positions.forEach(([row, col]) => {
        const square = screen.getByTestId(`square-${row}-${col}`);
        fireEvent.click(square);
        expect(mockOnSquareClick).toHaveBeenCalledWith(row, col);
      });

      expect(mockOnSquareClick).toHaveBeenCalledTimes(positions.length);
    });

    test("should not crash when onSquareClick is not provided", () => {
      render(<ChessBoard board={testBoard} />);

      const square = screen.getByTestId("square-0-0");
      expect(() => fireEvent.click(square)).not.toThrow();
    });
  });

  describe("Visual States", () => {
    test("should highlight selected square", () => {
      render(
        <ChessBoard
          board={testBoard}
          selectedSquare={[3, 4]}
          onSquareClick={mockOnSquareClick}
        />
      );

      const selectedSquare = screen.getByTestId("square-3-4");
      expect(selectedSquare).toHaveClass("selected");
    });

    test("should show valid move indicators", () => {
      const validMoves = [
        [2, 4],
        [4, 4],
        [3, 3],
        [3, 5],
      ];

      render(
        <ChessBoard
          board={testBoard}
          validMoves={validMoves}
          onSquareClick={mockOnSquareClick}
        />
      );

      validMoves.forEach(([row, col]) => {
        const square = screen.getByTestId(`square-${row}-${col}`);
        expect(square).toHaveClass("validMove");
      });
    });

    test("should highlight king in check", () => {
      render(
        <ChessBoard
          board={testBoard}
          kingInCheck={[0, 4]}
          onSquareClick={mockOnSquareClick}
        />
      );

      const kingSquare = screen.getByTestId("square-0-4");
      expect(kingSquare).toHaveClass("inCheck");
    });

    test("should combine multiple visual states", () => {
      render(
        <ChessBoard
          board={testBoard}
          selectedSquare={[0, 4]}
          validMoves={[
            [0, 4],
            [1, 4],
          ]}
          kingInCheck={[0, 4]}
          onSquareClick={mockOnSquareClick}
        />
      );

      const square = screen.getByTestId("square-0-4");
      expect(square).toHaveClass("selected", "validMove", "inCheck");
    });
  });

  describe("Board Flipping", () => {
    test("should apply flipped class when isFlipped is true", () => {
      render(
        <ChessBoard
          board={testBoard}
          isFlipped={true}
          onSquareClick={mockOnSquareClick}
        />
      );

      const chessBoard = screen.getByTestId("chess-board");
      expect(chessBoard).toHaveClass("flipped");
    });

    test("should not apply flipped class when isFlipped is false", () => {
      render(
        <ChessBoard
          board={testBoard}
          isFlipped={false}
          onSquareClick={mockOnSquareClick}
        />
      );

      const chessBoard = screen.getByTestId("chess-board");
      expect(chessBoard).not.toHaveClass("flipped");
    });
  });

  describe("Square Colors", () => {
    test("should alternate square colors correctly", () => {
      render(
        <ChessBoard board={testBoard} onSquareClick={mockOnSquareClick} />
      );

      // Test some known light and dark squares
      const lightSquares = [
        [0, 0],
        [0, 2],
        [0, 4],
        [0, 6],
        [1, 1],
        [1, 3],
        [1, 5],
        [1, 7],
      ];

      const darkSquares = [
        [0, 1],
        [0, 3],
        [0, 5],
        [0, 7],
        [1, 0],
        [1, 2],
        [1, 4],
        [1, 6],
      ];

      lightSquares.forEach(([row, col]) => {
        const square = screen.getByTestId(`square-${row}-${col}`);
        expect(square).toHaveClass("lightSquare");
      });

      darkSquares.forEach(([row, col]) => {
        const square = screen.getByTestId(`square-${row}-${col}`);
        expect(square).toHaveClass("darkSquare");
      });
    });
  });

  describe("Error Handling", () => {
    // Suppress console.error for these tests
    const originalError = console.error;
    beforeEach(() => {
      console.error = jest.fn();
    });
    afterEach(() => {
      console.error = originalError;
    });

    test("should handle invalid board prop gracefully", () => {
      render(<ChessBoard board={null} onSquareClick={mockOnSquareClick} />);

      expect(console.error).toHaveBeenCalledWith(
        "ChessBoard: Invalid board prop - must be 8x8 array"
      );
      expect(screen.getByText("Invalid board state")).toBeInTheDocument();
    });

    test("should handle board with wrong dimensions", () => {
      const invalidBoard = Array(6)
        .fill(null)
        .map(() => Array(6).fill(null));

      render(
        <ChessBoard board={invalidBoard} onSquareClick={mockOnSquareClick} />
      );

      expect(console.error).toHaveBeenCalledWith(
        "ChessBoard: Invalid board prop - must be 8x8 array"
      );
      expect(screen.getByText("Invalid board state")).toBeInTheDocument();
    });

    test("should handle undefined board", () => {
      render(<ChessBoard onSquareClick={mockOnSquareClick} />);

      expect(console.error).toHaveBeenCalledWith(
        "ChessBoard: Invalid board prop - must be 8x8 array"
      );
      expect(screen.getByText("Invalid board state")).toBeInTheDocument();
    });
  });

  describe("Custom Board States", () => {
    test("should render empty board correctly", () => {
      const emptyBoard = Array(8)
        .fill(null)
        .map(() => Array(8).fill(null));

      render(
        <ChessBoard board={emptyBoard} onSquareClick={mockOnSquareClick} />
      );

      const chessBoard = screen.getByTestId("chess-board");
      expect(chessBoard).toBeInTheDocument();

      // Should not have any pieces
      expect(screen.queryByTestId(/piece-/)).not.toBeInTheDocument();
    });

    test("should render board with custom piece placement", () => {
      const customBoard = Array(8)
        .fill(null)
        .map(() => Array(8).fill(null));
      customBoard[3][3] = createPiece(PIECE_TYPES.QUEEN, PIECE_COLORS.WHITE);
      customBoard[4][4] = createPiece(PIECE_TYPES.KING, PIECE_COLORS.BLACK);

      render(
        <ChessBoard board={customBoard} onSquareClick={mockOnSquareClick} />
      );

      expect(screen.getByTestId("piece-white-queen")).toBeInTheDocument();
      expect(screen.getByTestId("piece-black-king")).toBeInTheDocument();

      // Should only have these 2 pieces
      const allPieces = screen.getAllByTestId(/piece-/);
      expect(allPieces).toHaveLength(2);
    });
  });

  describe("Default Props", () => {
    test("should use default values when props are not provided", () => {
      render(<ChessBoard board={testBoard} />);

      const chessBoard = screen.getByTestId("chess-board");
      expect(chessBoard).not.toHaveClass("flipped");

      // Should not have any selected or highlighted squares
      const squares = screen.getAllByRole("button");
      squares.forEach((square) => {
        expect(square).not.toHaveClass("selected");
        expect(square).not.toHaveClass("validMove");
        expect(square).not.toHaveClass("inCheck");
      });
    });
  });
});
