// Integration tests for comprehensive error handling
import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import "@testing-library/jest-dom";
import GameBoard from "../../components/GameBoard/GameBoard.js";
import { GAME_MODES, PIECE_COLORS } from "../../constants/gameConstants.js";
import * as aiService from "../../utils/aiService.js";

// Mock the AI service
jest.mock("../../utils/aiService.js");

// Mock console methods to avoid noise in tests
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

beforeAll(() => {
  console.error = jest.fn();
  console.warn = jest.fn();
});

afterAll(() => {
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
});

describe("Error Handling Integration", () => {
  const mockProps = {
    gameMode: GAME_MODES.AI,
    aiDifficulty: "medium",
    onBackToModeSelection: jest.fn(),
    onModeChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Set up environment variable
    process.env.REACT_APP_GEMINI_API_KEY = "test-api-key";
  });

  afterEach(() => {
    delete process.env.REACT_APP_GEMINI_API_KEY;
  });

  describe("AI Service Failures", () => {
    test("handles API key invalid error with user-friendly message", async () => {
      // Mock AI service to return API key error
      aiService.getAIMove.mockResolvedValue({
        isValid: false,
        error: "Invalid API key",
        errorType: "API_KEY_INVALID",
        severity: "critical",
        userMessage: {
          title: "AI Configuration Issue",
          message:
            "The AI service is not properly configured. Would you like to continue in Player vs Player mode?",
          action: "Switch to PvP",
          canRetry: false,
          canContinue: true,
          severity: "critical",
        },
      });

      render(<GameBoard {...mockProps} />);

      // Make a move to trigger AI turn
      const square = screen.getByTestId("square-6-4"); // e2 pawn
      fireEvent.click(square);

      const targetSquare = screen.getByTestId("square-4-4"); // e4
      fireEvent.click(targetSquare);

      // Wait for AI service to be called
      await waitFor(
        () => {
          expect(aiService.getAIMove).toHaveBeenCalled();
        },
        { timeout: 5000 }
      );

      // Wait for error modal to appear
      await waitFor(
        () => {
          expect(screen.getByTestId("error-modal")).toBeInTheDocument();
        },
        { timeout: 5000 }
      );

      expect(screen.getByText(/AI Configuration Issue/)).toBeInTheDocument();
      expect(screen.getByText(/not properly configured/)).toBeInTheDocument();
      expect(screen.getByTestId("error-modal-switch-pvp")).toBeInTheDocument();
    });

    test("handles network error with retry option", async () => {
      // Mock AI service to return network error
      aiService.getAIMove.mockResolvedValue({
        isValid: false,
        error: "Network connection failed",
        errorType: "NETWORK_ERROR",
        severity: "recoverable",
        retryCount: 0,
        userMessage: {
          title: "Connection Problem",
          message:
            "Unable to connect to the AI service. Check your internet connection and try again, or continue in PvP mode.",
          action: "Try Again",
          canRetry: true,
          canContinue: true,
          severity: "recoverable",
        },
      });

      render(<GameBoard {...mockProps} />);

      // Make a move to trigger AI turn
      const square = screen.getByTestId("square-6-4");
      fireEvent.click(square);

      const targetSquare = screen.getByTestId("square-4-4");
      fireEvent.click(targetSquare);

      // Wait for error modal to appear
      await waitFor(() => {
        expect(screen.getByTestId("error-modal")).toBeInTheDocument();
      });

      expect(screen.getByText("Connection Problem")).toBeInTheDocument();
      expect(screen.getByTestId("error-modal-retry")).toBeInTheDocument();
      expect(screen.getByTestId("error-modal-switch-pvp")).toBeInTheDocument();
    });

    test("handles rate limit error with appropriate message", async () => {
      aiService.getAIMove.mockResolvedValue({
        isValid: false,
        error: "Rate limit exceeded",
        errorType: "RATE_LIMIT",
        severity: "recoverable",
        retryCount: 0,
        userMessage: {
          title: "AI Taking a Break",
          message:
            "The AI service is busy right now. You can wait and try again, or switch to Player vs Player mode.",
          action: "Try Again",
          canRetry: true,
          canContinue: true,
          severity: "recoverable",
        },
      });

      render(<GameBoard {...mockProps} />);

      // Trigger AI turn
      const square = screen.getByTestId("square-6-4");
      fireEvent.click(square);

      const targetSquare = screen.getByTestId("square-4-4");
      fireEvent.click(targetSquare);

      await waitFor(() => {
        expect(screen.getByTestId("error-modal")).toBeInTheDocument();
      });

      expect(screen.getByText("AI Taking a Break")).toBeInTheDocument();
      expect(screen.getByText(/busy right now/)).toBeInTheDocument();
    });

    test("switches to PvP mode after multiple failures", async () => {
      // Mock AI service to return error after multiple retries
      aiService.getAIMove.mockResolvedValue({
        isValid: false,
        error: "Network error after retries",
        errorType: "NETWORK_ERROR",
        severity: "recoverable",
        retryCount: 3,
        userMessage: {
          title: "Connection Problem",
          message:
            "Unable to connect to the AI service. Check your internet connection and try again, or continue in PvP mode.",
          action: "Switch to PvP",
          canRetry: false,
          canContinue: true,
          severity: "recoverable",
        },
      });

      render(<GameBoard {...mockProps} />);

      // Trigger AI turn
      const square = screen.getByTestId("square-6-4");
      fireEvent.click(square);

      const targetSquare = screen.getByTestId("square-4-4");
      fireEvent.click(targetSquare);

      await waitFor(() => {
        expect(screen.getByTestId("error-modal")).toBeInTheDocument();
      });

      // Should show switch to PvP option instead of retry
      expect(screen.getByTestId("error-modal-switch-pvp")).toBeInTheDocument();
      expect(screen.queryByTestId("error-modal-retry")).not.toBeInTheDocument();
    });
  });

  describe("Error Recovery Actions", () => {
    test("retry button triggers new AI request", async () => {
      // First call fails, second succeeds
      aiService.getAIMove
        .mockResolvedValueOnce({
          isValid: false,
          error: "Temporary failure",
          errorType: "TIMEOUT_ERROR",
          severity: "recoverable",
          retryCount: 0,
          userMessage: {
            title: "AI Response Timeout",
            message:
              "The AI is taking longer than expected to respond. You can try again or continue in PvP mode.",
            action: "Try Again",
            canRetry: true,
            canContinue: true,
            severity: "recoverable",
          },
        })
        .mockResolvedValueOnce({
          isValid: true,
          sanMove: "e5",
          moveDetails: {
            from: [1, 4],
            to: [3, 4],
            piece: { type: "pawn", color: "black" },
          },
          source: "ai",
        });

      render(<GameBoard {...mockProps} />);

      // Trigger AI turn
      const square = screen.getByTestId("square-6-4");
      fireEvent.click(square);

      const targetSquare = screen.getByTestId("square-4-4");
      fireEvent.click(targetSquare);

      // Wait for error modal
      await waitFor(() => {
        expect(screen.getByTestId("error-modal")).toBeInTheDocument();
      });

      // Click retry
      fireEvent.click(screen.getByTestId("error-modal-retry"));

      // Error modal should disappear
      await waitFor(() => {
        expect(screen.queryByTestId("error-modal")).not.toBeInTheDocument();
      });

      // AI should make a move
      await waitFor(() => {
        expect(aiService.getAIMove).toHaveBeenCalledTimes(2);
      });
    });

    test("switch to PvP button changes game mode", async () => {
      aiService.getAIMove.mockResolvedValue({
        isValid: false,
        error: "Critical API error",
        errorType: "API_KEY_INVALID",
        severity: "critical",
        userMessage: {
          title: "AI Configuration Issue",
          message:
            "The AI service is not properly configured. Would you like to continue in Player vs Player mode?",
          action: "Switch to PvP",
          canRetry: false,
          canContinue: true,
          severity: "critical",
        },
      });

      render(<GameBoard {...mockProps} />);

      // Trigger AI turn
      const square = screen.getByTestId("square-6-4");
      fireEvent.click(square);

      const targetSquare = screen.getByTestId("square-4-4");
      fireEvent.click(targetSquare);

      await waitFor(() => {
        expect(screen.getByTestId("error-modal")).toBeInTheDocument();
      });

      // Click switch to PvP
      fireEvent.click(screen.getByTestId("error-modal-switch-pvp"));

      // Should call onModeChange with PvP mode
      expect(mockProps.onModeChange).toHaveBeenCalledWith(GAME_MODES.PVP);
    });

    test("dismiss button closes error modal", async () => {
      aiService.getAIMove.mockResolvedValue({
        isValid: true,
        sanMove: "e5",
        moveDetails: {
          from: [1, 4],
          to: [3, 4],
          piece: { type: "pawn", color: "black" },
        },
        source: "fallback",
        fallbackUsed: true,
        userMessage: {
          title: "AI Response Error",
          message:
            "The AI provided an unexpected response. The game will continue with a fallback move.",
          action: "Continue",
          canRetry: false,
          canContinue: true,
          severity: "recoverable",
        },
      });

      render(<GameBoard {...mockProps} />);

      // Trigger AI turn
      const square = screen.getByTestId("square-6-4");
      fireEvent.click(square);

      const targetSquare = screen.getByTestId("square-4-4");
      fireEvent.click(targetSquare);

      await waitFor(() => {
        expect(screen.getByTestId("error-modal")).toBeInTheDocument();
      });

      // Click dismiss
      fireEvent.click(screen.getByTestId("error-modal-dismiss"));

      // Error modal should disappear
      await waitFor(() => {
        expect(screen.queryByTestId("error-modal")).not.toBeInTheDocument();
      });
    });
  });

  describe("Fallback Move Handling", () => {
    test("continues game with fallback move when AI fails", async () => {
      aiService.getAIMove.mockResolvedValue({
        isValid: true,
        sanMove: "e5",
        moveDetails: {
          from: [1, 4],
          to: [3, 4],
          piece: { type: "pawn", color: "black" },
        },
        source: "fallback",
        fallbackUsed: true,
        confidence: "low",
      });

      render(<GameBoard {...mockProps} />);

      // Make initial move
      const square = screen.getByTestId("square-6-4");
      fireEvent.click(square);

      const targetSquare = screen.getByTestId("square-4-4");
      fireEvent.click(targetSquare);

      // Wait for AI move to be executed
      await waitFor(() => {
        expect(aiService.getAIMove).toHaveBeenCalled();
      });

      // Game should continue normally with fallback move
      // Check that the move was made (black pawn should be on e5)
      await waitFor(() => {
        const e5Square = screen.getByTestId("square-3-4");
        expect(e5Square).toHaveTextContent("♟"); // Black pawn
      });
    });

    test("shows error modal for critical failures even with fallback", async () => {
      aiService.getAIMove.mockResolvedValue({
        isValid: true,
        sanMove: "e5",
        moveDetails: {
          from: [1, 4],
          to: [3, 4],
          piece: { type: "pawn", color: "black" },
        },
        source: "fallback",
        fallbackUsed: true,
        error: "Critical API failure",
        errorType: "API_KEY_INVALID",
        severity: "critical",
        userMessage: {
          title: "AI Configuration Issue",
          message:
            "The AI service is not properly configured. Would you like to continue in Player vs Player mode?",
          action: "Switch to PvP",
          canRetry: false,
          canContinue: true,
          severity: "critical",
        },
      });

      render(<GameBoard {...mockProps} />);

      // Trigger AI turn
      const square = screen.getByTestId("square-6-4");
      fireEvent.click(square);

      const targetSquare = screen.getByTestId("square-4-4");
      fireEvent.click(targetSquare);

      // Should show error modal even though move was made
      await waitFor(() => {
        expect(screen.getByTestId("error-modal")).toBeInTheDocument();
      });

      expect(screen.getByText("AI Configuration Issue")).toBeInTheDocument();
    });
  });

  describe("Game State Preservation", () => {
    test("preserves game state during error recovery", async () => {
      // Mock sequence: error, then success
      aiService.getAIMove
        .mockResolvedValueOnce({
          isValid: false,
          error: "Temporary error",
          errorType: "NETWORK_ERROR",
          severity: "recoverable",
          retryCount: 0,
          userMessage: {
            title: "Connection Problem",
            message: "Network error occurred",
            action: "Try Again",
            canRetry: true,
            canContinue: true,
            severity: "recoverable",
          },
        })
        .mockResolvedValueOnce({
          isValid: true,
          sanMove: "e5",
          moveDetails: {
            from: [1, 4],
            to: [3, 4],
            piece: { type: "pawn", color: "black" },
          },
          source: "ai",
        });

      render(<GameBoard {...mockProps} />);

      // Make initial move
      const square = screen.getByTestId("square-6-4");
      fireEvent.click(square);

      const targetSquare = screen.getByTestId("square-4-4");
      fireEvent.click(targetSquare);

      // Wait for error modal
      await waitFor(() => {
        expect(screen.getByTestId("error-modal")).toBeInTheDocument();
      });

      // Verify the human move was made
      const e4Square = screen.getByTestId("square-4-4");
      expect(e4Square).toHaveTextContent("♙"); // White pawn

      // Retry
      fireEvent.click(screen.getByTestId("error-modal-retry"));

      // Wait for error modal to disappear and AI move to complete
      await waitFor(() => {
        expect(screen.queryByTestId("error-modal")).not.toBeInTheDocument();
      });

      await waitFor(() => {
        const e5Square = screen.getByTestId("square-3-4");
        expect(e5Square).toHaveTextContent("♟"); // Black pawn
      });

      // Both moves should be preserved
      expect(e4Square).toHaveTextContent("♙");
    });

    test("resets error state on game reset", async () => {
      aiService.getAIMove.mockResolvedValue({
        isValid: false,
        error: "Persistent error",
        errorType: "API_KEY_INVALID",
        severity: "critical",
        userMessage: {
          title: "AI Configuration Issue",
          message: "Critical error",
          action: "Switch to PvP",
          canRetry: false,
          canContinue: true,
          severity: "critical",
        },
      });

      render(<GameBoard {...mockProps} />);

      // Trigger error
      const square = screen.getByTestId("square-6-4");
      fireEvent.click(square);

      const targetSquare = screen.getByTestId("square-4-4");
      fireEvent.click(targetSquare);

      await waitFor(() => {
        expect(screen.getByTestId("error-modal")).toBeInTheDocument();
      });

      // Reset game
      const resetButton = screen.getByText("Reset Game");
      fireEvent.click(resetButton);

      // Error modal should disappear
      await waitFor(() => {
        expect(screen.queryByTestId("error-modal")).not.toBeInTheDocument();
      });

      // Board should be reset
      const e4Square = screen.getByTestId("square-4-4");
      expect(e4Square).not.toHaveTextContent("♙");
    });
  });

  describe("Missing API Key Handling", () => {
    test("handles missing API key gracefully", async () => {
      delete process.env.REACT_APP_GEMINI_API_KEY;

      aiService.getAIMove.mockResolvedValue({
        isValid: true,
        sanMove: "e5",
        moveDetails: {
          from: [1, 4],
          to: [3, 4],
          piece: { type: "pawn", color: "black" },
        },
        source: "fallback",
        fallbackUsed: true,
        error: "No API key provided",
        errorType: "API_KEY_MISSING",
        severity: "critical",
        userMessage: {
          title: "AI Service Unavailable",
          message:
            "AI mode requires an API key. Would you like to play against another human instead?",
          action: "Switch to PvP",
          canRetry: false,
          canContinue: true,
          severity: "critical",
        },
      });

      render(<GameBoard {...mockProps} />);

      // Trigger AI turn
      const square = screen.getByTestId("square-6-4");
      fireEvent.click(square);

      const targetSquare = screen.getByTestId("square-4-4");
      fireEvent.click(targetSquare);

      // Should show appropriate error message
      await waitFor(() => {
        expect(screen.getByTestId("error-modal")).toBeInTheDocument();
      });

      expect(screen.getByText("AI Service Unavailable")).toBeInTheDocument();
      expect(screen.getByText(/requires an API key/)).toBeInTheDocument();
    });
  });

  describe("Error Prevention", () => {
    test("does not trigger AI during error state", async () => {
      aiService.getAIMove.mockResolvedValue({
        isValid: false,
        error: "Test error",
        errorType: "NETWORK_ERROR",
        severity: "recoverable",
        retryCount: 0,
        userMessage: {
          title: "Connection Problem",
          message: "Network error",
          action: "Try Again",
          canRetry: true,
          canContinue: true,
          severity: "recoverable",
        },
      });

      render(<GameBoard {...mockProps} />);

      // Make first move to trigger AI
      const square = screen.getByTestId("square-6-4");
      fireEvent.click(square);

      const targetSquare = screen.getByTestId("square-4-4");
      fireEvent.click(targetSquare);

      await waitFor(() => {
        expect(screen.getByTestId("error-modal")).toBeInTheDocument();
      });

      // Clear the mock to verify no additional calls
      aiService.getAIMove.mockClear();

      // Make another move while error modal is open
      const anotherSquare = screen.getByTestId("square-6-0");
      fireEvent.click(anotherSquare);

      const anotherTarget = screen.getByTestId("square-5-0");
      fireEvent.click(anotherTarget);

      // Wait a bit to ensure no AI call is made
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));
      });

      // AI should not be called while error modal is open
      expect(aiService.getAIMove).not.toHaveBeenCalled();
    });

    test("prevents moves during AI error recovery", async () => {
      aiService.getAIMove.mockResolvedValue({
        isValid: false,
        error: "Recovery test",
        errorType: "TIMEOUT_ERROR",
        severity: "recoverable",
        retryCount: 0,
        userMessage: {
          title: "AI Response Timeout",
          message: "Timeout occurred",
          action: "Try Again",
          canRetry: true,
          canContinue: true,
          severity: "recoverable",
        },
      });

      render(<GameBoard {...mockProps} />);

      // Trigger error
      const square = screen.getByTestId("square-6-4");
      fireEvent.click(square);

      const targetSquare = screen.getByTestId("square-4-4");
      fireEvent.click(targetSquare);

      await waitFor(() => {
        expect(screen.getByTestId("error-modal")).toBeInTheDocument();
      });

      // Start retry
      fireEvent.click(screen.getByTestId("error-modal-retry"));

      // Try to make another move during recovery
      const recoverySquare = screen.getByTestId("square-6-0");
      fireEvent.click(recoverySquare);

      // Square should not be selected during recovery
      expect(recoverySquare).not.toHaveClass("selected");
    });
  });
});
