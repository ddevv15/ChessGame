import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import MoveHistory from "../../components/MoveHistory/MoveHistory.js";
import { PIECE_COLORS, PIECE_TYPES } from "../../constants/gameConstants.js";

describe("MoveHistory Component", () => {
  const mockMoves = [
    {
      from: { row: 6, col: 4 },
      to: { row: 4, col: 4 },
      piece: { type: PIECE_TYPES.PAWN, color: PIECE_COLORS.WHITE },
      notation: "e4",
      moveNumber: 1,
      player: PIECE_COLORS.WHITE,
      timestamp: Date.now(),
      displayText: "1. e4",
    },
    {
      from: { row: 1, col: 4 },
      to: { row: 3, col: 4 },
      piece: { type: PIECE_TYPES.PAWN, color: PIECE_COLORS.BLACK },
      notation: "e5",
      moveNumber: 1,
      player: PIECE_COLORS.BLACK,
      timestamp: Date.now(),
      displayText: "1... e5",
    },
    {
      from: { row: 7, col: 1 },
      to: { row: 5, col: 2 },
      piece: { type: PIECE_TYPES.KNIGHT, color: PIECE_COLORS.WHITE },
      notation: "Nc3",
      moveNumber: 2,
      player: PIECE_COLORS.WHITE,
      timestamp: Date.now(),
      displayText: "2. Nc3",
    },
  ];

  test("should render move history header", () => {
    render(<MoveHistory moves={[]} />);

    expect(screen.getByText("Move History")).toBeInTheDocument();
  });

  test("should display empty state when no moves", () => {
    render(<MoveHistory moves={[]} />);

    expect(screen.getByText("No moves yet")).toBeInTheDocument();
  });

  test("should display moves in chronological order", () => {
    render(<MoveHistory moves={mockMoves} />);

    // Check that move numbers are displayed
    expect(screen.getByText("1.")).toBeInTheDocument();
    expect(screen.getByText("2.")).toBeInTheDocument();

    // Check that move notations are displayed
    expect(screen.getByText("e4")).toBeInTheDocument();
    expect(screen.getByText("e5")).toBeInTheDocument();
    expect(screen.getByText("Nc3")).toBeInTheDocument();
  });

  test("should group moves by pairs (white and black)", () => {
    render(<MoveHistory moves={mockMoves} />);

    // Should have 2 move pairs (1. e4 e5, 2. Nc3)
    const movePairs = screen.getAllByText(/^\d+\.$/);
    expect(movePairs).toHaveLength(2);
  });

  test("should display move count in footer", () => {
    render(<MoveHistory moves={mockMoves} />);

    expect(screen.getByText("3 moves")).toBeInTheDocument();
  });

  test("should display singular move count correctly", () => {
    const singleMove = [mockMoves[0]];
    render(<MoveHistory moves={singleMove} />);

    expect(screen.getByText("1 move")).toBeInTheDocument();
  });

  test("should highlight current move when currentMoveIndex is provided", () => {
    render(<MoveHistory moves={mockMoves} currentMoveIndex={1} />);

    // The second move (e5) should have the current move class
    const e5Move = screen.getByText("e5");
    expect(e5Move).toHaveClass("currentMove");
  });

  test("should handle odd number of moves correctly", () => {
    const oddMoves = mockMoves.slice(0, 1); // Just one move
    render(<MoveHistory moves={oddMoves} />);

    expect(screen.getByText("1.")).toBeInTheDocument();
    expect(screen.getByText("e4")).toBeInTheDocument();
    expect(screen.getByText("1 move")).toBeInTheDocument();
  });

  test("should apply correct CSS classes to white and black moves", () => {
    render(<MoveHistory moves={mockMoves} />);

    const e4Move = screen.getByText("e4");
    const e5Move = screen.getByText("e5");

    expect(e4Move).toHaveClass("whiteMove");
    expect(e5Move).toHaveClass("blackMove");
  });

  test("should render without crashing when moves prop is undefined", () => {
    render(<MoveHistory />);

    expect(screen.getByText("Move History")).toBeInTheDocument();
    expect(screen.getByText("No moves yet")).toBeInTheDocument();
  });

  test("should handle currentMoveIndex of -1 (no current move)", () => {
    render(<MoveHistory moves={mockMoves} currentMoveIndex={-1} />);

    // No moves should have the current move class
    const moves = screen.getAllByText(/^(e4|e5|Nc3)$/);
    moves.forEach((move) => {
      expect(move).not.toHaveClass("currentMove");
    });
  });

  test("should display moves with proper structure", () => {
    render(<MoveHistory moves={mockMoves} />);

    // Check that the component structure is correct
    expect(screen.getByRole("heading", { level: 3 })).toHaveTextContent(
      "Move History"
    );

    // Check that moves are clickable (have cursor pointer style)
    const e4Move = screen.getByText("e4");
    expect(e4Move).toHaveClass("move");
  });

  test("should handle empty moves array", () => {
    render(<MoveHistory moves={[]} currentMoveIndex={0} />);

    expect(screen.getByText("No moves yet")).toBeInTheDocument();
    expect(screen.queryByText(/\d+ moves?/)).not.toBeInTheDocument();
  });
});
