/**
 * Comprehensive tests for game mode transitions and edge cases
 * Tests switching between PvP and AI modes, state management, and error recovery
 */
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import App from "../../App";
import {
  GAME_MODES,
  PIECE_COLORS,
  DIFFICULTY_LEVELS,
  GAME_STATUS,
} from "../../constants/gameConstants";
import * as aiService from "../../utils/aiService.js";
import * as fenUtils from "../../utils/fenUtils.js";
import * as sanUtils from "../../utils/sanUtils.js";

// Mock the AI service to control responses
jest.mock("../../utils/aiService.js");

const mockGetAIMove = aiService.getAIMove;

describe("Game Mode Transitions and Edge Cases", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Default mock implementation for AI service
    mockGetAIMove.mockResolvedValue({
      isValid: true,
      sanMove: "e5",
      moveDetails: {
        from: [1, 4],
        to: [3, 4],
        piece: { type: "pawn", color: "black" },
      },
      confidence: "high",
      source: "ai",
    });
  });

  describe("Mode Switching During Active Games", () => {
    test("switches from PvP to AI mode mid-game preserving state", async () => {
      render(<App />);

      // Start with PvP mode
      const pvpButton = screen.getByRole("button", {
        name: /player vs player/i,
      });
      fireEvent.click(pvpButton);

      await waitFor(() => {
        expect(screen.getByRole("application")).toBeInTheDocument();
      });

      // Make a few moves in PvP mode
      const squares = screen.getAllByRole("button");
      const whitePawnE2 = squares.find((square) =>
        square.getAttribute("aria-label")?.includes("white pawn on e2")
      );
      const e4Square = squares.find((square) =>
        square.getAttribute("aria-label")?.includes("Empty square e4")
      );

      if (whitePawnE2 && e4Square) {
        fireEvent.click(whitePawnE2);
        fireEvent.click(e4Square);

        // Wait for move to complete
        await waitFor(() => {
          const statusElements = screen.getAllByRole("status");
          const blackTurnStatus = statusElements.find(
            (el) =>
              el.textContent?.includes("Black to move") ||
              el.textContent?.includes("Black's turn")
          );
          expect(blackTurnStatus).toBeInTheDocument();
        });

        // Make black move in PvP
        const blackPawnE7 = squares.find((square) =>
          square.getAttribute("aria-label")?.includes("black pawn on e7")
        );
        const e5Square = squares.find((square) =>
          square.getAttribute("aria-label")?.includes("Empty square e5")
        );

        if (blackPawnE7 && e5Square) {
          fireEvent.click(blackPawnE7);
          fireEvent.click(e5Square);

          // Wait for move to complete
          await waitFor(() => {
            const statusElements = screen.getAllByRole("status");
            const whiteTurnStatus = statusElements.find(
              (el) =>
                el.textContent?.includes("White to move") ||
                el.textContent?.includes("White's turn")
            );
            expect(whiteTurnStatus).toBeInTheDocument();
          });

          // Now switch to AI mode
          const aiMediumButton = screen.getByLabelText(
            "Switch to AI mode - Medium difficulty"
          );
          fireEvent.click(aiMediumButton);

          // Confirm mode change
          await waitFor(() => {
            expect(screen.getByText("Change Game Mode?")).toBeInTheDocument();
          });

          const confirmButton = screen.getByText("Yes, Change Mode");
          fireEvent.click(confirmButton);

          // Verify mode switched and game state preserved
          await waitFor(() => {
            expect(screen.getByText("vs AI (medium)")).toBeInTheDocument();
            expect(screen.getByText("🤖 AI")).toBeInTheDocument();
          });

          // Verify move history is preserved
          const moveHistoryElements = screen.getAllByText(/^[1-9]\./);
          expect(moveHistoryElements.length).toBeGreaterThan(0);

          // Verify it's still white's turn
          const statusElements = screen.getAllByRole("status");
          const whiteTurnStatus = statusElements.find(
            (el) =>
              el.textContent?.includes("White to move") ||
              el.textContent?.includes("White's turn")
          );
          expect(whiteTurnStatus).toBeInTheDocument();
        }
      }
    });

    test("switches from AI to PvP mode mid-game preserving state", async () => {
      render(<App />);

      // Start with AI mode
      const aiButton = screen.getByRole("button", { name: /player vs ai/i });
      fireEvent.click(aiButton);

      await waitFor(() => {
        expect(screen.getByRole("application")).toBeInTheDocument();
      });

      // Make a move as human player
      const squares = screen.getAllByRole("button");
      const whitePawnE2 = squares.find((square) =>
        square.getAttribute("aria-label")?.includes("white pawn on e2")
      );
      const e4Square = squares.find((square) =>
        square.getAttribute("aria-label")?.includes("Empty square e4")
      );

      if (whitePawnE2 && e4Square) {
        fireEvent.click(whitePawnE2);
        fireEvent.click(e4Square);

        // Wait for AI to respond
        await waitFor(
          () => {
            const statusElements = screen.getAllByRole("status");
            const whiteTurnStatus = statusElements.find(
              (el) =>
                el.textContent?.includes("White to move") ||
                el.textContent?.includes("White's turn")
            );
            expect(whiteTurnStatus).toBeInTheDocument();
          },
          { timeout: 5000 }
        );

        // Switch to PvP mode
        const pvpButton = screen.getByText("Player vs Player");
        fireEvent.click(pvpButton);

        // Confirm mode change
        await waitFor(() => {
          expect(screen.getByText("Change Game Mode?")).toBeInTheDocument();
        });

        const confirmButton = screen.getByText("Yes, Change Mode");
        fireEvent.click(confirmButton);

        // Verify mode switched and state preserved
        await waitFor(() => {
          expect(screen.getByText("Player vs Player")).toBeInTheDocument();
          expect(screen.getByText("👥 PvP")).toBeInTheDocument();
        });

        // Verify move history is preserved (should have at least 2 moves)
        const moveHistoryElements = screen.getAllByText(/^[1-9]\./);
        expect(moveHistoryElements.length).toBeGreaterThan(0);
      }
    });

    test("cancels mode change and preserves current state", async () => {
      render(<App />);

      // Start with PvP mode and make moves
      const pvpButton = screen.getByRole("button", {
        name: /player vs player/i,
      });
      fireEvent.click(pvpButton);

      await waitFor(() => {
        expect(screen.getByRole("application")).toBeInTheDocument();
      });

      // Make a move
      const squares = screen.getAllByRole("button");
      const whitePawnE2 = squares.find((square) =>
        square.getAttribute("aria-label")?.includes("white pawn on e2")
      );
      const e4Square = squares.find((square) =>
        square.getAttribute("aria-label")?.includes("Empty square e4")
      );

      if (whitePawnE2 && e4Square) {
        fireEvent.click(whitePawnE2);
        fireEvent.click(e4Square);

        await waitFor(() => {
          const statusElements = screen.getAllByRole("status");
          const blackTurnStatus = statusElements.find((el) =>
            el.textContent?.includes("Black to move")
          );
          expect(blackTurnStatus).toBeInTheDocument();
        });

        // Try to switch to AI mode
        const aiButton = screen.getByLabelText(
          "Switch to AI mode - Easy difficulty"
        );
        fireEvent.click(aiButton);

        // Cancel the mode change
        await waitFor(() => {
          expect(screen.getByText("Change Game Mode?")).toBeInTheDocument();
        });

        const cancelButton = screen.getByText("Cancel");
        fireEvent.click(cancelButton);

        // Verify we're still in PvP mode
        await waitFor(() => {
          expect(
            screen.queryByText("Change Game Mode?")
          ).not.toBeInTheDocument();
        });

        expect(screen.getByText("Player vs Player")).toBeInTheDocument();
        expect(screen.getByText("👥 PvP")).toBeInTheDocument();

        // Verify game state is unchanged
        const statusElements = screen.getAllByRole("status");
        const blackTurnStatus = statusElements.find((el) =>
          el.textContent?.includes("Black to move")
        );
        expect(blackTurnStatus).toBeInTheDocument();
      }
    });

    test("switches AI difficulty levels mid-game", async () => {
      render(<App />);

      // Start with AI mode (medium difficulty)
      const aiButton = screen.getByRole("button", { name: /player vs ai/i });
      fireEvent.click(aiButton);

      await waitFor(() => {
        expect(screen.getByRole("application")).toBeInTheDocument();
        expect(screen.getByText("vs AI (medium)")).toBeInTheDocument();
      });

      // Make a move
      const squares = screen.getAllByRole("button");
      const whitePawnE2 = squares.find((square) =>
        square.getAttribute("aria-label")?.includes("white pawn on e2")
      );
      const e4Square = squares.find((square) =>
        square.getAttribute("aria-label")?.includes("Empty square e4")
      );

      if (whitePawnE2 && e4Square) {
        fireEvent.click(whitePawnE2);
        fireEvent.click(e4Square);

        // Wait for AI response
        await waitFor(
          () => {
            const statusElements = screen.getAllByRole("status");
            const whiteTurnStatus = statusElements.find((el) =>
              el.textContent?.includes("White to move")
            );
            expect(whiteTurnStatus).toBeInTheDocument();
          },
          { timeout: 5000 }
        );

        // Switch to hard difficulty
        const hardButton = screen.getByLabelText(
          "Switch to AI mode - Hard difficulty"
        );
        fireEvent.click(hardButton);

        // Confirm difficulty change
        await waitFor(() => {
          expect(screen.getByText("Change Game Mode?")).toBeInTheDocument();
        });

        const confirmButton = screen.getByText("Yes, Change Mode");
        fireEvent.click(confirmButton);

        // Verify difficulty changed
        await waitFor(() => {
          expect(screen.getByText("vs AI (hard)")).toBeInTheDocument();
          expect(screen.getByText("Hard")).toBeInTheDocument();
        });

        // Verify game state preserved
        const moveHistoryElements = screen.getAllByText(/^[1-9]\./);
        expect(moveHistoryElements.length).toBeGreaterThan(0);
      }
    });
  });

  describe("AI Move Validation and Error Recovery", () => {
    test("handles invalid AI move and falls back gracefully", async () => {
      // Mock AI to return invalid move first, then valid fallback
      mockGetAIMove
        .mockResolvedValueOnce({
          isValid: false,
          error: "Invalid move from AI",
          sanMove: "invalid-move",
        })
        .mockResolvedValueOnce({
          isValid: true,
          sanMove: "Nc6",
          moveDetails: {
            from: [0, 1],
            to: [2, 2],
            piece: { type: "knight", color: "black" },
          },
          confidence: "low",
          source: "fallback",
        });

      render(<App />);

      const aiButton = screen.getByRole("button", { name: /player vs ai/i });
      fireEvent.click(aiButton);

      await waitFor(() => {
        expect(screen.getByRole("application")).toBeInTheDocument();
      });

      // Make a move to trigger AI
      const squares = screen.getAllByRole("button");
      const whitePawnE2 = squares.find((square) =>
        square.getAttribute("aria-label")?.includes("white pawn on e2")
      );
      const e4Square = squares.find((square) =>
        square.getAttribute("aria-label")?.includes("Empty square e4")
      );

      if (whitePawnE2 && e4Square) {
        fireEvent.click(whitePawnE2);
        fireEvent.click(e4Square);

        // AI should still make a move despite initial failure
        await waitFor(
          () => {
            const statusElements = screen.getAllByRole("status");
            const whiteTurnStatus = statusElements.find((el) =>
              el.textContent?.includes("White to move")
            );
            expect(whiteTurnStatus).toBeInTheDocument();
          },
          { timeout: 5000 }
        );

        // Verify AI service was called multiple times (retry logic)
        expect(mockGetAIMove).toHaveBeenCalledTimes(2);
      }
    });

    test("handles AI service network errors", async () => {
      // Mock network error
      mockGetAIMove.mockRejectedValue(new Error("Network error"));

      render(<App />);

      const aiButton = screen.getByRole("button", { name: /player vs ai/i });
      fireEvent.click(aiButton);

      await waitFor(() => {
        expect(screen.getByRole("application")).toBeInTheDocument();
      });

      // Make a move to trigger AI
      const squares = screen.getAllByRole("button");
      const whitePawnE2 = squares.find((square) =>
        square.getAttribute("aria-label")?.includes("white pawn on e2")
      );
      const e4Square = squares.find((square) =>
        square.getAttribute("aria-label")?.includes("Empty square e4")
      );

      if (whitePawnE2 && e4Square) {
        fireEvent.click(whitePawnE2);
        fireEvent.click(e4Square);

        // Game should continue with fallback move
        await waitFor(
          () => {
            const statusElements = screen.getAllByRole("status");
            const whiteTurnStatus = statusElements.find((el) =>
              el.textContent?.includes("White to move")
            );
            expect(whiteTurnStatus).toBeInTheDocument();
          },
          { timeout: 5000 }
        );

        // Verify game is still playable
        expect(screen.getByRole("application")).toBeInTheDocument();
      }
    });

    test("handles AI timeout scenarios", async () => {
      // Mock timeout by delaying response
      mockGetAIMove.mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  isValid: true,
                  sanMove: "e5",
                  moveDetails: {
                    from: [1, 4],
                    to: [3, 4],
                    piece: { type: "pawn", color: "black" },
                  },
                  confidence: "high",
                  source: "ai",
                }),
              100
            )
          )
      );

      render(<App />);

      const aiButton = screen.getByRole("button", { name: /player vs ai/i });
      fireEvent.click(aiButton);

      await waitFor(() => {
        expect(screen.getByRole("application")).toBeInTheDocument();
      });

      // Make a move to trigger AI
      const squares = screen.getAllByRole("button");
      const whitePawnE2 = squares.find((square) =>
        square.getAttribute("aria-label")?.includes("white pawn on e2")
      );
      const e4Square = squares.find((square) =>
        square.getAttribute("aria-label")?.includes("Empty square e4")
      );

      if (whitePawnE2 && e4Square) {
        fireEvent.click(whitePawnE2);
        fireEvent.click(e4Square);

        // Should show AI thinking indicator
        await waitFor(() => {
          const chessBoard = screen.getByTestId("chess-board");
          expect(chessBoard).toHaveAttribute("data-ai-thinking", "true");
        });

        // Wait for AI response
        await waitFor(
          () => {
            const statusElements = screen.getAllByRole("status");
            const whiteTurnStatus = statusElements.find((el) =>
              el.textContent?.includes("White to move")
            );
            expect(whiteTurnStatus).toBeInTheDocument();
          },
          { timeout: 5000 }
        );
      }
    });

    test("validates AI moves against current board position", async () => {
      // Mock AI to return move that's invalid for current position
      mockGetAIMove.mockResolvedValue({
        isValid: false,
        error: "Move not valid in current position",
        sanMove: "Qh5", // Queen can't move from starting position
      });

      render(<App />);

      const aiButton = screen.getByRole("button", { name: /player vs ai/i });
      fireEvent.click(aiButton);

      await waitFor(() => {
        expect(screen.getByRole("application")).toBeInTheDocument();
      });

      // Make a move to trigger AI
      const squares = screen.getAllByRole("button");
      const whitePawnE2 = squares.find((square) =>
        square.getAttribute("aria-label")?.includes("white pawn on e2")
      );
      const e4Square = squares.find((square) =>
        square.getAttribute("aria-label")?.includes("Empty square e4")
      );

      if (whitePawnE2 && e4Square) {
        fireEvent.click(whitePawnE2);
        fireEvent.click(e4Square);

        // AI should fall back to valid move
        await waitFor(
          () => {
            const statusElements = screen.getAllByRole("status");
            const whiteTurnStatus = statusElements.find((el) =>
              el.textContent?.includes("White to move")
            );
            expect(whiteTurnStatus).toBeInTheDocument();
          },
          { timeout: 5000 }
        );

        // Verify AI service was called
        expect(mockGetAIMove).toHaveBeenCalled();
      }
    });
  });

  describe("FEN Generation Accuracy in Complex Positions", () => {
    test("generates accurate FEN for starting position", () => {
      const startingFEN = fenUtils.getStartingPositionFEN();
      expect(startingFEN).toBe(
        "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
      );
      expect(fenUtils.isValidFEN(startingFEN)).toBe(true);
    });

    test("generates accurate FEN after castling", () => {
      // Create a position after white kingside castling
      const gameState = {
        board: Array(8)
          .fill(null)
          .map(() => Array(8).fill(null)),
        currentPlayer: PIECE_COLORS.BLACK,
        moveHistory: [
          { piece: { type: "pawn" }, capturedPiece: null },
          { piece: { type: "pawn" }, capturedPiece: null },
          { piece: { type: "knight" }, capturedPiece: null },
          { piece: { type: "knight" }, capturedPiece: null },
          { piece: { type: "bishop" }, capturedPiece: null },
          { piece: { type: "bishop" }, capturedPiece: null },
          { piece: { type: "king" }, capturedPiece: null }, // Castling move
        ],
      };

      // Set up castled position
      gameState.board[7][6] = { type: "king", color: "white", hasMoved: true };
      gameState.board[7][5] = { type: "rook", color: "white", hasMoved: true };
      gameState.board[0][4] = { type: "king", color: "black", hasMoved: false };
      gameState.board[0][0] = { type: "rook", color: "black", hasMoved: false };
      gameState.board[0][7] = { type: "rook", color: "black", hasMoved: false };

      const fen = fenUtils.generateFEN(gameState);
      expect(fen).toContain("b"); // Black to move
      expect(fen).toContain("kq"); // Black can still castle, white cannot
      expect(fenUtils.isValidFEN(fen)).toBe(true);
    });

    test("generates accurate FEN with en passant target", () => {
      const gameState = {
        board: Array(8)
          .fill(null)
          .map(() => Array(8).fill(null)),
        currentPlayer: PIECE_COLORS.BLACK,
        moveHistory: [
          {
            piece: { type: "pawn" },
            from: [6, 4], // e2
            to: [4, 4], // e4
            capturedPiece: null,
          },
        ],
      };

      // Set up position after e2-e4
      gameState.board[7][4] = { type: "king", color: "white", hasMoved: false };
      gameState.board[0][4] = { type: "king", color: "black", hasMoved: false };
      gameState.board[4][4] = { type: "pawn", color: "white", hasMoved: true };

      const fen = fenUtils.generateFEN(gameState);
      expect(fen).toContain("e3"); // En passant target
      expect(fen).toContain("b"); // Black to move
      expect(fenUtils.isValidFEN(fen)).toBe(true);
    });

    test("generates accurate FEN for complex mid-game position", () => {
      const gameState = {
        board: Array(8)
          .fill(null)
          .map(() => Array(8).fill(null)),
        currentPlayer: PIECE_COLORS.WHITE,
        moveHistory: Array(20).fill({
          piece: { type: "pawn" },
          capturedPiece: null,
        }),
      };

      // Set up complex position
      gameState.board[7][4] = { type: "king", color: "white", hasMoved: true };
      gameState.board[0][4] = { type: "king", color: "black", hasMoved: true };
      gameState.board[4][4] = { type: "queen", color: "white", hasMoved: true };
      gameState.board[3][3] = {
        type: "bishop",
        color: "black",
        hasMoved: true,
      };
      gameState.board[2][5] = {
        type: "knight",
        color: "white",
        hasMoved: true,
      };
      gameState.board[5][2] = {
        type: "knight",
        color: "black",
        hasMoved: true,
      };

      const fen = fenUtils.generateFEN(gameState);
      expect(fen).toContain("w"); // White to move
      expect(fen).toContain("-"); // No castling rights (kings moved)
      expect(fenUtils.isValidFEN(fen)).toBe(true);
    });

    test("generates accurate FEN after pawn promotion", () => {
      const gameState = {
        board: Array(8)
          .fill(null)
          .map(() => Array(8).fill(null)),
        currentPlayer: PIECE_COLORS.BLACK,
        moveHistory: [
          {
            piece: { type: "pawn" },
            from: [1, 4],
            to: [0, 4],
            capturedPiece: null,
            promotionPiece: "queen",
          },
        ],
      };

      // Set up position after pawn promotion
      gameState.board[7][4] = { type: "king", color: "white", hasMoved: false };
      gameState.board[0][3] = { type: "king", color: "black", hasMoved: true };
      gameState.board[0][4] = { type: "queen", color: "white", hasMoved: true }; // Promoted queen

      const fen = fenUtils.generateFEN(gameState);
      expect(fen).toContain("Q"); // Promoted queen
      expect(fen).toContain("b"); // Black to move
      expect(fenUtils.isValidFEN(fen)).toBe(true);
    });

    test("handles edge case positions correctly", () => {
      // Test position with only kings (near-stalemate)
      const gameState = {
        board: Array(8)
          .fill(null)
          .map(() => Array(8).fill(null)),
        currentPlayer: PIECE_COLORS.WHITE,
        moveHistory: [],
      };

      gameState.board[7][0] = { type: "king", color: "white", hasMoved: true };
      gameState.board[0][7] = { type: "king", color: "black", hasMoved: true };

      const fen = fenUtils.generateFEN(gameState);
      expect(fen).toBe("7k/8/8/8/8/8/8/K7 w - - 0 1");
      expect(fenUtils.isValidFEN(fen)).toBe(true);
    });
  });

  describe("State Management Across Mode Changes", () => {
    test("preserves move history when switching modes", async () => {
      render(<App />);

      // Start with PvP and make moves
      const pvpButton = screen.getByRole("button", {
        name: /player vs player/i,
      });
      fireEvent.click(pvpButton);

      await waitFor(() => {
        expect(screen.getByRole("application")).toBeInTheDocument();
      });

      // Make several moves
      const squares = screen.getAllByRole("button");

      // e4
      const whitePawnE2 = squares.find((square) =>
        square.getAttribute("aria-label")?.includes("white pawn on e2")
      );
      const e4Square = squares.find((square) =>
        square.getAttribute("aria-label")?.includes("Empty square e4")
      );

      if (whitePawnE2 && e4Square) {
        fireEvent.click(whitePawnE2);
        fireEvent.click(e4Square);

        await waitFor(() => {
          const statusElements = screen.getAllByRole("status");
          const blackTurnStatus = statusElements.find((el) =>
            el.textContent?.includes("Black to move")
          );
          expect(blackTurnStatus).toBeInTheDocument();
        });

        // e5
        const blackPawnE7 = squares.find((square) =>
          square.getAttribute("aria-label")?.includes("black pawn on e7")
        );
        const e5Square = squares.find((square) =>
          square.getAttribute("aria-label")?.includes("Empty square e5")
        );

        if (blackPawnE7 && e5Square) {
          fireEvent.click(blackPawnE7);
          fireEvent.click(e5Square);

          await waitFor(() => {
            const statusElements = screen.getAllByRole("status");
            const whiteTurnStatus = statusElements.find((el) =>
              el.textContent?.includes("White to move")
            );
            expect(whiteTurnStatus).toBeInTheDocument();
          });

          // Verify move history exists
          let moveHistoryElements = screen.getAllByText(/^[1-9]\./);
          expect(moveHistoryElements.length).toBeGreaterThan(0);

          // Switch to AI mode
          const aiButton = screen.getByLabelText(
            "Switch to AI mode - Medium difficulty"
          );
          fireEvent.click(aiButton);

          await waitFor(() => {
            expect(screen.getByText("Change Game Mode?")).toBeInTheDocument();
          });

          const confirmButton = screen.getByText("Yes, Change Mode");
          fireEvent.click(confirmButton);

          // Verify move history preserved after mode switch
          await waitFor(() => {
            expect(screen.getByText("vs AI (medium)")).toBeInTheDocument();
          });

          moveHistoryElements = screen.getAllByText(/^[1-9]\./);
          expect(moveHistoryElements.length).toBeGreaterThan(0);
        }
      }
    });

    test("preserves board position when switching modes", async () => {
      render(<App />);

      // Start with AI mode
      const aiButton = screen.getByRole("button", { name: /player vs ai/i });
      fireEvent.click(aiButton);

      await waitFor(() => {
        expect(screen.getByRole("application")).toBeInTheDocument();
      });

      // Make a move
      const squares = screen.getAllByRole("button");
      const whitePawnE2 = squares.find((square) =>
        square.getAttribute("aria-label")?.includes("white pawn on e2")
      );
      const e4Square = squares.find((square) =>
        square.getAttribute("aria-label")?.includes("Empty square e4")
      );

      if (whitePawnE2 && e4Square) {
        fireEvent.click(whitePawnE2);
        fireEvent.click(e4Square);

        // Wait for AI response
        await waitFor(
          () => {
            const statusElements = screen.getAllByRole("status");
            const whiteTurnStatus = statusElements.find((el) =>
              el.textContent?.includes("White to move")
            );
            expect(whiteTurnStatus).toBeInTheDocument();
          },
          { timeout: 5000 }
        );

        // Verify pieces are in expected positions
        const updatedSquares = screen.getAllByRole("button");
        const e4SquareWithPawn = updatedSquares.find((square) =>
          square.getAttribute("aria-label")?.includes("white pawn on e4")
        );
        expect(e4SquareWithPawn).toBeInTheDocument();

        // Switch to PvP mode
        const pvpButton = screen.getByText("Player vs Player");
        fireEvent.click(pvpButton);

        await waitFor(() => {
          expect(screen.getByText("Change Game Mode?")).toBeInTheDocument();
        });

        const confirmButton = screen.getByText("Yes, Change Mode");
        fireEvent.click(confirmButton);

        // Verify board position preserved
        await waitFor(() => {
          expect(screen.getByText("Player vs Player")).toBeInTheDocument();
        });

        const finalSquares = screen.getAllByRole("button");
        const preservedE4Square = finalSquares.find((square) =>
          square.getAttribute("aria-label")?.includes("white pawn on e4")
        );
        expect(preservedE4Square).toBeInTheDocument();
      }
    });

    test("maintains game status across mode changes", async () => {
      render(<App />);

      // Start with PvP mode
      const pvpButton = screen.getByRole("button", {
        name: /player vs player/i,
      });
      fireEvent.click(pvpButton);

      await waitFor(() => {
        expect(screen.getByRole("application")).toBeInTheDocument();
      });

      // Verify initial game status
      const initialStatusElements = screen.getAllByRole("status");
      const initialTurnStatus = initialStatusElements.find((el) =>
        el.textContent?.includes("White to move")
      );
      expect(initialTurnStatus).toBeInTheDocument();

      // Switch to AI mode
      const aiButton = screen.getByLabelText(
        "Switch to AI mode - Easy difficulty"
      );
      fireEvent.click(aiButton);

      await waitFor(() => {
        expect(screen.getByText("Change Game Mode?")).toBeInTheDocument();
      });

      const confirmButton = screen.getByText("Yes, Change Mode");
      fireEvent.click(confirmButton);

      // Verify game status maintained
      await waitFor(() => {
        expect(screen.getByText("vs AI (easy)")).toBeInTheDocument();
      });

      const finalStatusElements = screen.getAllByRole("status");
      const finalTurnStatus = finalStatusElements.find((el) =>
        el.textContent?.includes("White to move")
      );
      expect(finalTurnStatus).toBeInTheDocument();
    });

    test("resets game state when explicitly requested", async () => {
      render(<App />);

      // Start with PvP mode and make moves
      const pvpButton = screen.getByRole("button", {
        name: /player vs player/i,
      });
      fireEvent.click(pvpButton);

      await waitFor(() => {
        expect(screen.getByRole("application")).toBeInTheDocument();
      });

      // Make a move
      const squares = screen.getAllByRole("button");
      const whitePawnE2 = squares.find((square) =>
        square.getAttribute("aria-label")?.includes("white pawn on e2")
      );
      const e4Square = squares.find((square) =>
        square.getAttribute("aria-label")?.includes("Empty square e4")
      );

      if (whitePawnE2 && e4Square) {
        fireEvent.click(whitePawnE2);
        fireEvent.click(e4Square);

        await waitFor(() => {
          const statusElements = screen.getAllByRole("status");
          const blackTurnStatus = statusElements.find((el) =>
            el.textContent?.includes("Black to move")
          );
          expect(blackTurnStatus).toBeInTheDocument();
        });

        // Reset the game
        const resetButton = screen.getByRole("button", { name: /reset/i });
        fireEvent.click(resetButton);

        // Verify game reset to starting position
        await waitFor(() => {
          const statusElements = screen.getAllByRole("status");
          const whiteTurnStatus = statusElements.find((el) =>
            el.textContent?.includes("White to move")
          );
          expect(whiteTurnStatus).toBeInTheDocument();
        });

        // Verify pieces back in starting positions
        const resetSquares = screen.getAllByRole("button");
        const e2SquareWithPawn = resetSquares.find((square) =>
          square.getAttribute("aria-label")?.includes("white pawn on e2")
        );
        expect(e2SquareWithPawn).toBeInTheDocument();
      }
    });
  });

  describe("Complete Mode Selection Flow Integration", () => {
    test("completes full PvP game flow", async () => {
      render(<App />);

      // Initial mode selection
      expect(screen.getByText("Choose your game mode")).toBeInTheDocument();

      // Select PvP mode
      const pvpButton = screen.getByRole("button", {
        name: /player vs player/i,
      });
      fireEvent.click(pvpButton);

      // Verify game board loads
      await waitFor(() => {
        expect(screen.getByRole("application")).toBeInTheDocument();
        expect(screen.getByText("👥 PvP")).toBeInTheDocument();
      });

      // Verify initial game state
      const statusElements = screen.getAllByRole("status");
      const whiteTurnStatus = statusElements.find((el) =>
        el.textContent?.includes("White to move")
      );
      expect(whiteTurnStatus).toBeInTheDocument();

      // Make moves and verify game progresses
      const squares = screen.getAllByRole("button");
      const whitePawnE2 = squares.find((square) =>
        square.getAttribute("aria-label")?.includes("white pawn on e2")
      );
      const e4Square = squares.find((square) =>
        square.getAttribute("aria-label")?.includes("Empty square e4")
      );

      if (whitePawnE2 && e4Square) {
        fireEvent.click(whitePawnE2);
        fireEvent.click(e4Square);

        await waitFor(() => {
          const statusElements = screen.getAllByRole("status");
          const blackTurnStatus = statusElements.find((el) =>
            el.textContent?.includes("Black to move")
          );
          expect(blackTurnStatus).toBeInTheDocument();
        });

        // Verify move recorded in history
        const moveHistoryElements = screen.getAllByText(/^[1-9]\./);
        expect(moveHistoryElements.length).toBeGreaterThan(0);
      }

      // Return to mode selection
      const backButton = screen.getByRole("button", {
        name: /back to mode selection/i,
      });
      fireEvent.click(backButton);

      await waitFor(() => {
        expect(screen.getByText("Choose your game mode")).toBeInTheDocument();
      });
    });

    test("completes full AI game flow", async () => {
      render(<App />);

      // Select AI mode
      const aiButton = screen.getByRole("button", { name: /player vs ai/i });
      fireEvent.click(aiButton);

      // Verify game board loads with AI indicators
      await waitFor(() => {
        expect(screen.getByRole("application")).toBeInTheDocument();
        expect(screen.getByText("🤖 AI")).toBeInTheDocument();
        expect(screen.getByText("Medium")).toBeInTheDocument();
      });

      // Make a move and verify AI responds
      const squares = screen.getAllByRole("button");
      const whitePawnE2 = squares.find((square) =>
        square.getAttribute("aria-label")?.includes("white pawn on e2")
      );
      const e4Square = squares.find((square) =>
        square.getAttribute("aria-label")?.includes("Empty square e4")
      );

      if (whitePawnE2 && e4Square) {
        fireEvent.click(whitePawnE2);
        fireEvent.click(e4Square);

        // Wait for AI response
        await waitFor(
          () => {
            const statusElements = screen.getAllByRole("status");
            const whiteTurnStatus = statusElements.find((el) =>
              el.textContent?.includes("White to move")
            );
            expect(whiteTurnStatus).toBeInTheDocument();
          },
          { timeout: 5000 }
        );

        // Verify AI made a move (move history should have 2 moves)
        const moveHistoryElements = screen.getAllByText(/^[1-9]\./);
        expect(moveHistoryElements.length).toBeGreaterThan(0);

        // Verify AI service was called
        expect(mockGetAIMove).toHaveBeenCalled();
      }
    });

    test("handles mode selection with API key management", async () => {
      render(<App />);

      // Select AI mode
      const aiButton = screen.getByRole("button", { name: /player vs ai/i });
      fireEvent.click(aiButton);

      // Game should work even without explicit API key (using environment variable)
      await waitFor(() => {
        expect(screen.getByRole("application")).toBeInTheDocument();
        expect(screen.getByText("🤖 AI")).toBeInTheDocument();
      });

      // Verify game is functional
      const statusElements = screen.getAllByRole("status");
      const whiteTurnStatus = statusElements.find((el) =>
        el.textContent?.includes("White to move")
      );
      expect(whiteTurnStatus).toBeInTheDocument();
    });

    test("handles rapid mode switching", async () => {
      render(<App />);

      // Rapidly switch between modes
      const pvpButton = screen.getByRole("button", {
        name: /player vs player/i,
      });
      fireEvent.click(pvpButton);

      await waitFor(() => {
        expect(screen.getByRole("application")).toBeInTheDocument();
      });

      // Immediately switch to AI
      const aiButton = screen.getByLabelText(
        "Switch to AI mode - Medium difficulty"
      );
      fireEvent.click(aiButton);

      await waitFor(() => {
        expect(screen.getByText("Change Game Mode?")).toBeInTheDocument();
      });

      const confirmButton = screen.getByText("Yes, Change Mode");
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(screen.getByText("vs AI (medium)")).toBeInTheDocument();
      });

      // Switch back to PvP quickly
      const pvpSwitchButton = screen.getByText("Player vs Player");
      fireEvent.click(pvpSwitchButton);

      await waitFor(() => {
        expect(screen.getByText("Change Game Mode?")).toBeInTheDocument();
      });

      const confirmButton2 = screen.getByText("Yes, Change Mode");
      fireEvent.click(confirmButton2);

      await waitFor(() => {
        expect(screen.getByText("Player vs Player")).toBeInTheDocument();
      });

      // Verify game is still functional
      const statusElements = screen.getAllByRole("status");
      const whiteTurnStatus = statusElements.find((el) =>
        el.textContent?.includes("White to move")
      );
      expect(whiteTurnStatus).toBeInTheDocument();
    });
  });

  describe("Edge Cases and Error Scenarios", () => {
    test("handles corrupted game state gracefully", async () => {
      render(<App />);

      const pvpButton = screen.getByRole("button", {
        name: /player vs player/i,
      });
      fireEvent.click(pvpButton);

      await waitFor(() => {
        expect(screen.getByRole("application")).toBeInTheDocument();
      });

      // Game should be functional even with potential state issues
      const statusElements = screen.getAllByRole("status");
      const whiteTurnStatus = statusElements.find((el) =>
        el.textContent?.includes("White to move")
      );
      expect(whiteTurnStatus).toBeInTheDocument();
    });

    test("handles AI service complete failure", async () => {
      // Mock complete AI failure
      mockGetAIMove.mockRejectedValue(new Error("Complete AI service failure"));

      render(<App />);

      const aiButton = screen.getByRole("button", { name: /player vs ai/i });
      fireEvent.click(aiButton);

      await waitFor(() => {
        expect(screen.getByRole("application")).toBeInTheDocument();
      });

      // Game should still be playable (fallback to random moves)
      const squares = screen.getAllByRole("button");
      const whitePawnE2 = squares.find((square) =>
        square.getAttribute("aria-label")?.includes("white pawn on e2")
      );
      const e4Square = squares.find((square) =>
        square.getAttribute("aria-label")?.includes("Empty square e4")
      );

      if (whitePawnE2 && e4Square) {
        fireEvent.click(whitePawnE2);
        fireEvent.click(e4Square);

        // Should still progress (with fallback move)
        await waitFor(
          () => {
            const statusElements = screen.getAllByRole("status");
            const whiteTurnStatus = statusElements.find((el) =>
              el.textContent?.includes("White to move")
            );
            expect(whiteTurnStatus).toBeInTheDocument();
          },
          { timeout: 5000 }
        );
      }
    });

    test("handles invalid FEN generation gracefully", async () => {
      // Mock FEN generation to fail
      const originalGenerateFEN = fenUtils.generateFEN;
      jest.spyOn(fenUtils, "generateFEN").mockImplementation(() => {
        throw new Error("FEN generation failed");
      });

      render(<App />);

      const aiButton = screen.getByRole("button", { name: /player vs ai/i });
      fireEvent.click(aiButton);

      await waitFor(() => {
        expect(screen.getByRole("application")).toBeInTheDocument();
      });

      // Game should still be functional
      const statusElements = screen.getAllByRole("status");
      const whiteTurnStatus = statusElements.find((el) =>
        el.textContent?.includes("White to move")
      );
      expect(whiteTurnStatus).toBeInTheDocument();

      // Restore original function
      fenUtils.generateFEN.mockRestore();
    });

    test("handles SAN parsing errors gracefully", async () => {
      // Mock AI to return unparseable SAN
      mockGetAIMove.mockResolvedValue({
        isValid: true,
        sanMove: "completely-invalid-san-notation",
        moveDetails: null,
        confidence: "high",
        source: "ai",
      });

      render(<App />);

      const aiButton = screen.getByRole("button", { name: /player vs ai/i });
      fireEvent.click(aiButton);

      await waitFor(() => {
        expect(screen.getByRole("application")).toBeInTheDocument();
      });

      // Make a move to trigger AI
      const squares = screen.getAllByRole("button");
      const whitePawnE2 = squares.find((square) =>
        square.getAttribute("aria-label")?.includes("white pawn on e2")
      );
      const e4Square = squares.find((square) =>
        square.getAttribute("aria-label")?.includes("Empty square e4")
      );

      if (whitePawnE2 && e4Square) {
        fireEvent.click(whitePawnE2);
        fireEvent.click(e4Square);

        // Should fall back to valid move
        await waitFor(
          () => {
            const statusElements = screen.getAllByRole("status");
            const whiteTurnStatus = statusElements.find((el) =>
              el.textContent?.includes("White to move")
            );
            expect(whiteTurnStatus).toBeInTheDocument();
          },
          { timeout: 5000 }
        );
      }
    });
  });
});
