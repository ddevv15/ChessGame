// Tests for AI Service with FEN-to-SAN communication
import {
  initializeGemini,
  generateFENForAI,
  formatBoardForAI,
  createAIPrompt,
  parseAIResponse,
  generateFallbackMove,
  getAIMove,
  handleAPIError,
} from "../../utils/aiService.js";
import {
  DIFFICULTY_LEVELS,
  PIECE_COLORS,
  createInitialGameState,
} from "../../constants/gameConstants.js";
import { initializeBoard } from "../../utils/boardUtils.js";

// Mock the fetch function for API tests
global.fetch = jest.fn();

describe("AI Service", () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  describe("initializeGemini", () => {
    test("initializes Gemini client with valid API key", () => {
      const apiKey = "test-api-key-123";
      const config = initializeGemini(apiKey);

      expect(config.apiKey).toBe(apiKey);
      expect(config.baseUrl).toContain("generativelanguage.googleapis.com");
      expect(config.headers["Content-Type"]).toBe("application/json");
      expect(config.headers["x-goog-api-key"]).toBe(apiKey);
    });

    test("throws error for invalid API key", () => {
      expect(() => initializeGemini("")).toThrow("Valid API key is required");
      expect(() => initializeGemini(null)).toThrow("Valid API key is required");
      expect(() => initializeGemini(123)).toThrow("Valid API key is required");
    });

    test("trims whitespace from API key", () => {
      const apiKey = "  test-key  ";
      const config = initializeGemini(apiKey);
      expect(config.apiKey).toBe("test-key");
    });
  });

  describe("generateFENForAI", () => {
    test("generates FEN string from game state", () => {
      const gameState = createInitialGameState();
      const fen = generateFENForAI(gameState);

      expect(typeof fen).toBe("string");
      expect(fen).toContain("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR");
      expect(fen).toContain("w KQkq - 0 1");
    });

    test("throws error for invalid game state", () => {
      expect(() => generateFENForAI(null)).toThrow(
        "Failed to generate FEN string"
      );
      expect(() => generateFENForAI({})).toThrow(
        "Failed to generate FEN string"
      );
    });
  });

  describe("formatBoardForAI", () => {
    test("formats board with FEN notation", () => {
      const gameState = createInitialGameState();
      const formatted = formatBoardForAI(gameState);

      expect(formatted).toContain("Current chess position in FEN notation:");
      expect(formatted).toContain(
        "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
      );
      expect(formatted).toContain("It is white's turn to move");
    });

    test("includes move history when available", () => {
      const gameState = createInitialGameState();
      gameState.moveHistory = [
        {
          notation: "e4",
          from: [6, 4],
          to: [4, 4],
          piece: { type: "pawn", color: "white" },
          capturedPiece: null,
        },
        {
          notation: "e5",
          from: [1, 4],
          to: [3, 4],
          piece: { type: "pawn", color: "black" },
          capturedPiece: null,
        },
        {
          notation: "Nf3",
          from: [7, 6],
          to: [5, 5],
          piece: { type: "knight", color: "white" },
          capturedPiece: null,
        },
      ];

      const formatted = formatBoardForAI(gameState);
      expect(formatted).toContain("Recent moves: e4, e5, Nf3");
    });

    test("handles empty move history", () => {
      const gameState = createInitialGameState();
      gameState.moveHistory = [];

      const formatted = formatBoardForAI(gameState);
      expect(formatted).not.toContain("Recent moves:");
    });
  });

  describe("createAIPrompt", () => {
    test("creates prompt with difficulty instructions", () => {
      const boardText =
        "FEN: rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

      const easyPrompt = createAIPrompt(
        DIFFICULTY_LEVELS.EASY,
        boardText,
        PIECE_COLORS.BLACK
      );
      const mediumPrompt = createAIPrompt(
        DIFFICULTY_LEVELS.MEDIUM,
        boardText,
        PIECE_COLORS.BLACK
      );
      const hardPrompt = createAIPrompt(
        DIFFICULTY_LEVELS.HARD,
        boardText,
        PIECE_COLORS.BLACK
      );

      expect(easyPrompt).toContain("simple, straightforward move");
      expect(mediumPrompt).toContain("solid, positional move");
      expect(hardPrompt).toContain("best move available");

      expect(easyPrompt).toContain("playing as black");
      expect(easyPrompt).toContain("Standard Algebraic Notation");
      expect(easyPrompt).toContain(boardText);
    });

    test("includes SAN notation examples", () => {
      const boardText = "FEN: test";
      const prompt = createAIPrompt(
        DIFFICULTY_LEVELS.MEDIUM,
        boardText,
        PIECE_COLORS.WHITE
      );

      expect(prompt).toContain("e4");
      expect(prompt).toContain("Nf3");
      expect(prompt).toContain("O-O");
      expect(prompt).toContain("exd5");
      expect(prompt).toContain("e8=Q");
    });
  });

  describe("parseAIResponse", () => {
    const board = initializeBoard();

    test("parses valid AI response", () => {
      const aiResponse = {
        success: true,
        move: "e4",
      };

      const result = parseAIResponse(aiResponse, board, PIECE_COLORS.WHITE);

      expect(result.isValid).toBe(true);
      expect(result.sanMove).toBe("e4");
      expect(result.moveDetails).toBeDefined();
      expect(result.confidence).toBe("high");
      expect(result.source).toBe("ai");
    });

    test("handles AI response with quotes", () => {
      const aiResponse = {
        success: true,
        move: '"Nf3"',
      };

      const result = parseAIResponse(aiResponse, board, PIECE_COLORS.WHITE);

      expect(result.isValid).toBe(true);
      expect(result.sanMove).toBe("Nf3");
    });

    test("rejects invalid moves", () => {
      const aiResponse = {
        success: true,
        move: "e5", // Invalid for white from starting position
      };

      const result = parseAIResponse(aiResponse, board, PIECE_COLORS.WHITE);

      expect(result.isValid).toBe(false);
      expect(result.error).toContain("not valid in current position");
      expect(result.sanMove).toBe("e5");
    });

    test("handles failed AI response", () => {
      const aiResponse = {
        success: false,
        error: "API error",
      };

      const result = parseAIResponse(aiResponse, board, PIECE_COLORS.WHITE);

      expect(result.isValid).toBe(false);
      expect(result.error).toBe("API error");
      expect(result.sanMove).toBeNull();
    });

    test("handles malformed SAN notation", () => {
      const aiResponse = {
        success: true,
        move: "invalid-move",
      };

      const result = parseAIResponse(aiResponse, board, PIECE_COLORS.WHITE);

      expect(result.isValid).toBe(false);
      expect(result.error).toContain("not valid in current position");
    });
  });

  describe("generateFallbackMove", () => {
    const board = initializeBoard();

    test("generates random move for easy difficulty", () => {
      const result = generateFallbackMove(
        board,
        PIECE_COLORS.WHITE,
        DIFFICULTY_LEVELS.EASY
      );

      expect(result.isValid).toBe(true);
      expect(result.sanMove).toBeDefined();
      expect(result.moveDetails).toBeDefined();
      expect(result.confidence).toBe("low");
      expect(result.source).toBe("fallback");
    });

    test("prefers captures for medium difficulty", () => {
      // Create a board with a capture opportunity
      const boardWithCapture = initializeBoard();
      boardWithCapture[4][4] = {
        type: "pawn",
        color: PIECE_COLORS.WHITE,
        hasMoved: true,
      };
      boardWithCapture[6][4] = null;
      boardWithCapture[3][3] = {
        type: "pawn",
        color: PIECE_COLORS.BLACK,
        hasMoved: true,
      };
      boardWithCapture[1][3] = null;

      const result = generateFallbackMove(
        boardWithCapture,
        PIECE_COLORS.WHITE,
        DIFFICULTY_LEVELS.MEDIUM
      );

      expect(result.isValid).toBe(true);
      expect(result.sanMove).toBeDefined();
    });

    test("handles board with no legal moves", () => {
      // Create an empty board with only kings (stalemate-like situation)
      const emptyBoard = Array(8)
        .fill(null)
        .map(() => Array(8).fill(null));
      emptyBoard[7][4] = {
        type: "king",
        color: PIECE_COLORS.WHITE,
        hasMoved: false,
      };
      emptyBoard[0][4] = {
        type: "king",
        color: PIECE_COLORS.BLACK,
        hasMoved: false,
      };

      // This should still work as kings can move
      const result = generateFallbackMove(
        emptyBoard,
        PIECE_COLORS.WHITE,
        DIFFICULTY_LEVELS.EASY
      );
      expect(result.isValid).toBe(true);
    });
  });

  describe("getAIMove", () => {
    const gameState = createInitialGameState();
    const apiKey = "test-api-key";

    test("successfully gets AI move", async () => {
      // Mock successful API response
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          candidates: [
            {
              content: {
                parts: [{ text: "e4" }],
              },
            },
          ],
        }),
      });

      const result = await getAIMove(
        gameState,
        PIECE_COLORS.WHITE,
        DIFFICULTY_LEVELS.MEDIUM,
        apiKey
      );

      expect(result.isValid).toBe(true);
      expect(result.sanMove).toBe("e4");
      expect(result.source).toBe("ai");
    });

    test("falls back on API error", async () => {
      // Mock API error
      fetch.mockRejectedValueOnce(new Error("Network error"));

      const result = await getAIMove(
        gameState,
        PIECE_COLORS.WHITE,
        DIFFICULTY_LEVELS.EASY,
        apiKey
      );

      expect(result.isValid).toBe(true);
      expect(result.source).toBe("fallback");
      expect(result.confidence).toBe("low");
    });

    test("falls back on invalid AI move", async () => {
      // Mock API response with invalid move
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          candidates: [
            {
              content: {
                parts: [{ text: "invalid-move" }],
              },
            },
          ],
        }),
      });

      const result = await getAIMove(
        gameState,
        PIECE_COLORS.WHITE,
        DIFFICULTY_LEVELS.MEDIUM,
        apiKey
      );

      expect(result.isValid).toBe(true);
      expect(result.source).toBe("fallback");
    });

    test("handles malformed API response", async () => {
      // Mock malformed API response
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          // Missing candidates
        }),
      });

      const result = await getAIMove(
        gameState,
        PIECE_COLORS.WHITE,
        DIFFICULTY_LEVELS.HARD,
        apiKey
      );

      expect(result.isValid).toBe(true);
      expect(result.source).toBe("fallback");
    });
  });

  describe("handleAPIError", () => {
    test("identifies API key errors", () => {
      const error = new Error("401 Unauthorized");
      const result = handleAPIError(error);

      expect(result.error).toBe(true);
      expect(result.type).toBe("API_KEY_INVALID");
      expect(result.message).toContain("Invalid API key");
    });

    test("identifies rate limit errors", () => {
      const error = new Error("429 Too Many Requests");
      const result = handleAPIError(error);

      expect(result.type).toBe("RATE_LIMIT");
      expect(result.message).toContain("rate limit");
    });

    test("identifies quota errors", () => {
      const error = new Error("Quota exceeded");
      const result = handleAPIError(error);

      expect(result.type).toBe("QUOTA_EXCEEDED");
      expect(result.message).toContain("quota");
    });

    test("identifies network errors", () => {
      const error = new Error("fetch failed");
      const result = handleAPIError(error);

      expect(result.type).toBe("NETWORK_ERROR");
      expect(result.message).toContain("Network error");
    });

    test("handles unknown errors", () => {
      const error = new Error("Unknown error");
      const result = handleAPIError(error);

      expect(result.type).toBe("UNKNOWN_ERROR");
      expect(result.message).toContain("unexpected error");
    });
  });
});
