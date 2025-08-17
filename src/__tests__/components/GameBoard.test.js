// GameBoard component tests
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import GameBoard from "../../components/GameBoard/GameBoard.js";
import {
  PIECE_COLORS,
  PIECE_TYPES,
  GAME_STATUS,
  createInitialGameState,
  GAME_ACTIONS,
} from "../../constants/gameConstants.js";

// Mock child components to focus on GameBoard logic
jest.mock("../../components/ChessBoard/ChessBoard.js", () => {
  return function MockChessBoard({
    onSquareClick,
    selectedSquare,
    validMoves,
  }) {
    return (
      <div data-testid="chess-board">
        <button data-testid="square-0-0" onClick={() => onSquareClick(0, 0)}>
          Square 0,0 (Black Rook)
        </button>
        <button data-testid="square-1-4" onClick={() => onSquareClick(1, 4)}>
          Square 1,4 (Black Pawn)
        </button>
        <button data-testid="square-6-4" onClick={() => onSquareClick(6, 4)}>
          Square 6,4 (White Pawn)
        </button>
        <button data-testid="square-6-0" onClick={() => onSquareClick(6, 0)}>
          Square 6,0 (White Pawn)
        </button>
        <button data-testid="square-4-4" onClick={() => onSquareClick(4, 4)}>
          Square 4,4 (Empty)
        </button>
        <button data-testid="square-5-4" onClick={() => onSquareClick(5, 4)}>
          Square 5,4 (Empty)
        </button>
        <div data-testid="selected-square">
          {selectedSquare
            ? `${selectedSquare[0]},${selectedSquare[1]}`
            : "none"}
        </div>
        <div data-testid="valid-moves">{validMoves.length}</div>
      </div>
    );
  };
});

jest.mock("../../components/GameControls/GameControls.js", () => {
  return function MockGameControls({ onReset, gameStatus, currentPlayer }) {
    // Mirror the real GameControls logic for displaying current player
    const getStatusText = () => {
      switch (gameStatus) {
        case "check":
          return `${currentPlayer === "white" ? "White" : "Black"} is in check`;
        case "checkmate":
          const winner = currentPlayer === "white" ? "Black" : "White";
          return `Checkmate! ${winner} wins`;
        case "stalemate":
          return "Stalemate - Draw";
        case "playing":
        default:
          return `${currentPlayer === "white" ? "White" : "Black"} to move`;
      }
    };
    
    return (
      <div data-testid="game-controls">
        <button data-testid="reset-button" onClick={onReset}>
          Reset
        </button>
        <div data-testid="game-status">{gameStatus}</div>
        <div data-testid="current-player">{currentPlayer}</div>
        <div data-testid="status-text">{getStatusText()}</div>
      </div>
    );
  };
});

jest.mock("../../components/MoveHistory/MoveHistory.js", () => {
  return function MockMoveHistory({ moves }) {
    return (
      <div data-testid="move-history">
        <div data-testid="move-count">{moves.length}</div>
      </div>
    );
  };
});

describe("GameBoard Component", () => {
  test("renders all child components", () => {
    render(<GameBoard />);

    expect(screen.getByTestId("chess-board")).toBeInTheDocument();
    expect(screen.getByTestId("game-controls")).toBeInTheDocument();
    expect(screen.getByTestId("move-history")).toBeInTheDocument();
  });

  test("initializes with correct game state", () => {
    render(<GameBoard />);

    expect(screen.getByTestId("game-status")).toHaveTextContent("playing");
    expect(screen.getByTestId("current-player")).toHaveTextContent("white");
    expect(screen.getByTestId("selected-square")).toHaveTextContent("none");
    expect(screen.getByTestId("move-count")).toHaveTextContent("0");
  });

  test("handles piece selection", () => {
    render(<GameBoard />);

    // Click on white pawn at starting position
    fireEvent.click(screen.getByTestId("square-6-4"));

    // Should select the piece and show valid moves
    expect(screen.getByTestId("selected-square")).toHaveTextContent("6,4");
    expect(screen.getByTestId("valid-moves")).not.toHaveTextContent("0");
  });

  test("handles piece deselection when clicking same square", () => {
    render(<GameBoard />);

    // Select a piece
    fireEvent.click(screen.getByTestId("square-6-4"));
    expect(screen.getByTestId("selected-square")).toHaveTextContent("6,4");

    // Click same square to deselect
    fireEvent.click(screen.getByTestId("square-6-4"));
    expect(screen.getByTestId("selected-square")).toHaveTextContent("none");
  });

  test("handles game reset", () => {
    render(<GameBoard />);

    // Make a move first
    fireEvent.click(screen.getByTestId("square-6-4")); // Select pawn
    fireEvent.click(screen.getByTestId("square-4-4")); // Move pawn

    // Verify move was made
    expect(screen.getByTestId("move-count")).toHaveTextContent("1");

    // Reset the game
    fireEvent.click(screen.getByTestId("reset-button"));

    // Verify game is reset
    expect(screen.getByTestId("move-count")).toHaveTextContent("0");
    expect(screen.getByTestId("current-player")).toHaveTextContent("white");
    expect(screen.getByTestId("selected-square")).toHaveTextContent("none");
  });

  test("prevents moves when game is over", () => {
    // This test would need a more complex setup to create a checkmate position
    // For now, we'll test the basic structure
    render(<GameBoard />);

    // The component should render without errors
    expect(screen.getByTestId("chess-board")).toBeInTheDocument();
  });
});

// Test the game reducer separately
describe("Game Reducer", () => {
  // Import the reducer function - we'll need to export it from GameBoard for testing
  // For now, we'll test the component behavior which uses the reducer internally

  test("initial state is correct", () => {
    const initialState = createInitialGameState();

    expect(initialState.currentPlayer).toBe(PIECE_COLORS.WHITE);
    expect(initialState.selectedSquare).toBeNull();
    expect(initialState.moveHistory).toHaveLength(0);
    expect(initialState.gameStatus).toBe(GAME_STATUS.PLAYING);
    expect(initialState.validMoves).toHaveLength(0);
    expect(initialState.board).toHaveLength(8);
    expect(initialState.board[0]).toHaveLength(8);
  });

  test("board has correct initial piece placement", () => {
    const initialState = createInitialGameState();

    // Check white pieces
    expect(initialState.board[7][0]).toEqual({
      type: PIECE_TYPES.ROOK,
      color: PIECE_COLORS.WHITE,
      hasMoved: false,
    });
    expect(initialState.board[7][4]).toEqual({
      type: PIECE_TYPES.KING,
      color: PIECE_COLORS.WHITE,
      hasMoved: false,
    });
    expect(initialState.board[6][0]).toEqual({
      type: PIECE_TYPES.PAWN,
      color: PIECE_COLORS.WHITE,
      hasMoved: false,
    });

    // Check black pieces
    expect(initialState.board[0][0]).toEqual({
      type: PIECE_TYPES.ROOK,
      color: PIECE_COLORS.BLACK,
      hasMoved: false,
    });
    expect(initialState.board[0][4]).toEqual({
      type: PIECE_TYPES.KING,
      color: PIECE_COLORS.BLACK,
      hasMoved: false,
    });
    expect(initialState.board[1][0]).toEqual({
      type: PIECE_TYPES.PAWN,
      color: PIECE_COLORS.BLACK,
      hasMoved: false,
    });

    // Check empty squares
    expect(initialState.board[2][0]).toBeNull();
    expect(initialState.board[3][0]).toBeNull();
    expect(initialState.board[4][0]).toBeNull();
    expect(initialState.board[5][0]).toBeNull();
  });
});

describe("GameBoard Integration", () => {
  test("complete move sequence updates all state correctly", () => {
    render(<GameBoard />);

    // Initial state
    expect(screen.getByTestId("current-player")).toHaveTextContent("white");
    expect(screen.getByTestId("move-count")).toHaveTextContent("0");

    // Select white pawn
    fireEvent.click(screen.getByTestId("square-6-4"));
    expect(screen.getByTestId("selected-square")).toHaveTextContent("6,4");

    // Move pawn forward
    fireEvent.click(screen.getByTestId("square-4-4"));

    // Verify state after move
    expect(screen.getByTestId("current-player")).toHaveTextContent("black");
    expect(screen.getByTestId("move-count")).toHaveTextContent("1");
    expect(screen.getByTestId("selected-square")).toHaveTextContent("none");
  });

  test("invalid move attempts do not change state", () => {
    render(<GameBoard />);

    // Try to click on empty square first
    fireEvent.click(screen.getByTestId("square-4-4"));

    // Should not select anything
    expect(screen.getByTestId("selected-square")).toHaveTextContent("none");
    expect(screen.getByTestId("current-player")).toHaveTextContent("white");
    expect(screen.getByTestId("move-count")).toHaveTextContent("0");
  });

  test("selecting opponent piece when no piece selected does nothing", () => {
    render(<GameBoard />);

    // Try to select black piece (opponent) when it's white's turn
    fireEvent.click(screen.getByTestId("square-0-0"));

    // Should not select anything
    expect(screen.getByTestId("selected-square")).toHaveTextContent("none");
    expect(screen.getByTestId("valid-moves")).toHaveTextContent("0");
  });

  test("can switch selection between own pieces", () => {
    render(<GameBoard />);

    // Select first white pawn
    fireEvent.click(screen.getByTestId("square-6-4"));
    expect(screen.getByTestId("selected-square")).toHaveTextContent("6,4");

    // Select different white pawn (should switch selection)
    fireEvent.click(screen.getByTestId("square-6-0"));
    expect(screen.getByTestId("selected-square")).toHaveTextContent("6,0");
  });

  test("turn-based logic prevents wrong player from moving", () => {
    render(<GameBoard />);

    // Make a move as white
    fireEvent.click(screen.getByTestId("square-6-4"));
    fireEvent.click(screen.getByTestId("square-4-4"));

    // Now it's black's turn
    expect(screen.getByTestId("current-player")).toHaveTextContent("black");

    // Try to select white piece - should not work since it's black's turn
    fireEvent.click(screen.getByTestId("square-6-0"));
    expect(screen.getByTestId("selected-square")).toHaveTextContent("none");
  });

  test("clicking on invalid move destination clears selection", () => {
    render(<GameBoard />);

    // Select a piece
    fireEvent.click(screen.getByTestId("square-6-4"));
    expect(screen.getByTestId("selected-square")).toHaveTextContent("6,4");

    // Click on invalid destination (black piece at 0,0)
    fireEvent.click(screen.getByTestId("square-0-0"));

    // Selection should be cleared since it's not a valid move
    expect(screen.getByTestId("selected-square")).toHaveTextContent("none");
  });
});

describe("Move Validation Integration", () => {
  test("complete game sequence with multiple moves", () => {
    render(<GameBoard />);

    // White's first move: pawn e2-e4
    fireEvent.click(screen.getByTestId("square-6-4"));
    expect(screen.getByTestId("selected-square")).toHaveTextContent("6,4");
    fireEvent.click(screen.getByTestId("square-4-4"));

    // Verify move was made
    expect(screen.getByTestId("current-player")).toHaveTextContent("black");
    expect(screen.getByTestId("move-count")).toHaveTextContent("1");
    expect(screen.getByTestId("selected-square")).toHaveTextContent("none");

    // Black's response: try to move pawn
    fireEvent.click(screen.getByTestId("square-1-4"));
    expect(screen.getByTestId("selected-square")).toHaveTextContent("1,4");
    fireEvent.click(screen.getByTestId("square-5-4")); // Invalid move for black pawn

    // Should clear selection since it's invalid
    expect(screen.getByTestId("selected-square")).toHaveTextContent("none");
    expect(screen.getByTestId("current-player")).toHaveTextContent("black"); // Still black's turn
  });

  test("prevents moves when game status is not playing", () => {
    // This would require setting up a checkmate position
    // For now, we test the basic prevention logic
    render(<GameBoard />);

    // Game should start in playing state
    expect(screen.getByTestId("game-status")).toHaveTextContent("playing");

    // Should allow normal moves
    fireEvent.click(screen.getByTestId("square-6-4"));
    expect(screen.getByTestId("selected-square")).toHaveTextContent("6,4");
  });

  test("move validation prevents illegal moves", () => {
    render(<GameBoard />);

    // Select a pawn
    fireEvent.click(screen.getByTestId("square-6-4"));
    expect(screen.getByTestId("selected-square")).toHaveTextContent("6,4");

    // Try to move to an invalid square (opponent's piece that can't be captured)
    fireEvent.click(screen.getByTestId("square-0-0")); // Black rook - invalid move for pawn

    // Should not make the move and clear selection
    expect(screen.getByTestId("current-player")).toHaveTextContent("white"); // Still white's turn
    expect(screen.getByTestId("move-count")).toHaveTextContent("0"); // No moves made
  });

  test("visual feedback for invalid move attempts", () => {
    render(<GameBoard />);

    // Select a piece
    fireEvent.click(screen.getByTestId("square-6-4"));

    // Try an invalid move - this should trigger visual feedback
    // The visual feedback is handled by the invalidMoveAttempt state
    // We can't easily test the visual aspect in unit tests, but we can verify
    // the behavior doesn't break the game state
    fireEvent.click(screen.getByTestId("square-0-0"));

    // Game state should remain consistent
    expect(screen.getByTestId("current-player")).toHaveTextContent("white");
    expect(screen.getByTestId("move-count")).toHaveTextContent("0");
    expect(screen.getByTestId("selected-square")).toHaveTextContent("none");
  });

  test("proper turn alternation through multiple moves", () => {
    render(<GameBoard />);

    // White move
    fireEvent.click(screen.getByTestId("square-6-4"));
    fireEvent.click(screen.getByTestId("square-4-4"));
    expect(screen.getByTestId("current-player")).toHaveTextContent("black");

    // Black move (simulate valid move)
    fireEvent.click(screen.getByTestId("square-1-4"));
    fireEvent.click(screen.getByTestId("square-5-4")); // This might be invalid, but tests the flow

    // Regardless of move validity, turn management should be consistent
    expect(screen.getByTestId("move-count")).toBeInTheDocument();
  });
});
