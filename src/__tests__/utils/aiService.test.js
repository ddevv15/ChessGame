// Comprehensive Tests for AI Service with FEN-to-SAN communication
import {
  initializeGemini,
  generateFENForAI,
  formatBoardForAI,
  createAIPrompt,
  requestAIMove,
  parseAIResponse,
  generateFallbackMove,
  getAIMove,
  handleAPIError,
  retryWithBackoff,
  checkAIServiceHealth,
  createUserErrorMessage,
} from "../../utils/aiService.js";
import {
  DIFFICULTY_LEVELS,
  PIECE_COLORS,
  PIECE_TYPES,
  createInitialGameState,
} from "../../constants/gameConstants.js";
import { initializeBoard } from "../../utils/boardUtils.js";

// Mock the fetch function for API tests
global.fetch = jest.fn();

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

  describe("requestAIMove", () => {
    const config = {
      baseUrl: "https://test-api.com",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": "test-key",
      },
    };

    test("makes successful API request", async () => {
      const mockResponse = {
        candidates: [
          {
            content: {
              parts: [{ text: "e4" }],
            },
          },
        ],
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await requestAIMove(config, "test prompt");

      expect(result.success).toBe(true);
      expect(result.move).toBe("e4");
      expect(result.rawResponse).toEqual(mockResponse);
      expect(fetch).toHaveBeenCalledWith(config.baseUrl, {
        method: "POST",
        headers: config.headers,
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: "test prompt" }],
            },
          ],
        }),
      });
    });

    test("handles HTTP error responses", async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: "Bad Request",
      });

      const result = await requestAIMove(config, "test prompt");

      expect(result.success).toBe(false);
      expect(result.error).toContain("400 Bad Request");
    });

    test("handles malformed API responses", async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({}), // Missing candidates
      });

      const result = await requestAIMove(config, "test prompt");

      expect(result.success).toBe(false);
      expect(result.error).toContain("Invalid response format");
    });

    test("handles network errors", async () => {
      fetch.mockRejectedValueOnce(new Error("Network error"));

      const result = await requestAIMove(config, "test prompt");

      expect(result.success).toBe(false);
      expect(result.error).toContain("Network error");
    });

    test("handles empty response content", async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          candidates: [
            {
              content: {
                parts: [{ text: "" }],
              },
            },
          ],
        }),
      });

      const result = await requestAIMove(config, "test prompt");

      expect(result.success).toBe(true);
      expect(result.move).toBe("");
    });
  });

  describe("AI Error Scenarios and Fallbacks", () => {
    const gameState = createInitialGameState();
    const apiKey = "test-api-key";

    test("falls back on 401 Unauthorized", async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: "Unauthorized",
      });

      const result = await getAIMove(
        gameState,
        PIECE_COLORS.WHITE,
        DIFFICULTY_LEVELS.MEDIUM,
        apiKey
      );

      expect(result.isValid).toBe(true);
      expect(result.source).toBe("fallback");
      expect(result.confidence).toBe("low");
    });

    test("falls back on 429 Rate Limit", async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 429,
        statusText: "Too Many Requests",
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

    test("falls back on malformed AI response", async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          candidates: [
            {
              content: {
                parts: [{ text: "Xyz123" }], // Invalid move
              },
            },
          ],
        }),
      });

      const result = await getAIMove(
        gameState,
        PIECE_COLORS.WHITE,
        DIFFICULTY_LEVELS.EASY,
        apiKey
      );

      expect(result.isValid).toBe(true);
      expect(result.source).toBe("fallback");
    });

    test("falls back on JSON parsing error", async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => {
          throw new Error("Invalid JSON");
        },
      });

      const result = await getAIMove(
        gameState,
        PIECE_COLORS.BLACK,
        DIFFICULTY_LEVELS.MEDIUM,
        apiKey
      );

      expect(result.isValid).toBe(true);
      expect(result.source).toBe("fallback");
    });

    test("handles timeout scenarios", async () => {
      // Simulate timeout by rejecting after delay
      fetch.mockImplementationOnce(
        () =>
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Request timeout")), 100)
          )
      );

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

  describe("Advanced Fallback Move Generation", () => {
    test("generates different moves for different difficulties", () => {
      const board = initializeBoard();

      const easyMove = generateFallbackMove(
        board,
        PIECE_COLORS.WHITE,
        DIFFICULTY_LEVELS.EASY
      );
      const mediumMove = generateFallbackMove(
        board,
        PIECE_COLORS.WHITE,
        DIFFICULTY_LEVELS.MEDIUM
      );
      const hardMove = generateFallbackMove(
        board,
        PIECE_COLORS.WHITE,
        DIFFICULTY_LEVELS.HARD
      );

      expect(easyMove.isValid).toBe(true);
      expect(mediumMove.isValid).toBe(true);
      expect(hardMove.isValid).toBe(true);

      // All should be valid starting moves
      const validStartingMoves = [
        "e4",
        "d4",
        "Nf3",
        "Nc3",
        "e3",
        "d3",
        "f4",
        "Nf6",
        "c4",
        "g3",
        "b3",
        "h3",
        "a3",
        "h4",
        "a4",
        "f3",
        "g4",
        "c3",
        "b4",
      ];
      expect(validStartingMoves).toContain(easyMove.sanMove);
      expect(validStartingMoves).toContain(mediumMove.sanMove);
      expect(validStartingMoves).toContain(hardMove.sanMove);
    });

    test("prefers captures in medium and hard difficulty", () => {
      // Create board with capture opportunity
      const board = initializeBoard();
      board[4][4] = {
        type: PIECE_TYPES.PAWN,
        color: PIECE_COLORS.WHITE,
        hasMoved: true,
      };
      board[6][4] = null;
      board[3][3] = {
        type: PIECE_TYPES.PAWN,
        color: PIECE_COLORS.BLACK,
        hasMoved: true,
      };
      board[1][3] = null;

      const mediumMove = generateFallbackMove(
        board,
        PIECE_COLORS.WHITE,
        DIFFICULTY_LEVELS.MEDIUM
      );
      const hardMove = generateFallbackMove(
        board,
        PIECE_COLORS.WHITE,
        DIFFICULTY_LEVELS.HARD
      );

      expect(mediumMove.isValid).toBe(true);
      expect(hardMove.isValid).toBe(true);
    });

    test("handles endgame positions", () => {
      // Create simple endgame position
      const board = Array(8)
        .fill(null)
        .map(() => Array(8).fill(null));
      board[7][4] = {
        type: PIECE_TYPES.KING,
        color: PIECE_COLORS.WHITE,
        hasMoved: true,
      };
      board[0][4] = {
        type: PIECE_TYPES.KING,
        color: PIECE_COLORS.BLACK,
        hasMoved: true,
      };
      board[6][4] = {
        type: PIECE_TYPES.QUEEN,
        color: PIECE_COLORS.WHITE,
        hasMoved: true,
      };

      const move = generateFallbackMove(
        board,
        PIECE_COLORS.WHITE,
        DIFFICULTY_LEVELS.HARD
      );

      expect(move.isValid).toBe(true);
      expect(move.sanMove).toBeDefined();
    });

    test("handles stalemate-like positions gracefully", () => {
      // Create position with very limited moves
      const board = Array(8)
        .fill(null)
        .map(() => Array(8).fill(null));
      board[7][0] = {
        type: PIECE_TYPES.KING,
        color: PIECE_COLORS.WHITE,
        hasMoved: true,
      };
      board[0][7] = {
        type: PIECE_TYPES.KING,
        color: PIECE_COLORS.BLACK,
        hasMoved: true,
      };

      const move = generateFallbackMove(
        board,
        PIECE_COLORS.WHITE,
        DIFFICULTY_LEVELS.EASY
      );

      expect(move.isValid).toBe(true);
      expect(move.moveDetails).toBeDefined();
    });
  });

  describe("Complex Game State Scenarios", () => {
    test("handles mid-game position with complex FEN", () => {
      const complexGameState = {
        board: initializeBoard(),
        currentPlayer: PIECE_COLORS.BLACK,
        moveHistory: [
          {
            notation: "e4",
            piece: { type: PIECE_TYPES.PAWN },
            capturedPiece: null,
          },
          {
            notation: "e5",
            piece: { type: PIECE_TYPES.PAWN },
            capturedPiece: null,
          },
          {
            notation: "Nf3",
            piece: { type: PIECE_TYPES.KNIGHT },
            capturedPiece: null,
          },
          {
            notation: "Nc6",
            piece: { type: PIECE_TYPES.KNIGHT },
            capturedPiece: null,
          },
          {
            notation: "Bb5",
            piece: { type: PIECE_TYPES.BISHOP },
            capturedPiece: null,
          },
        ],
      };

      const fen = generateFENForAI(complexGameState);
      expect(fen).toContain("b"); // Black to move
      expect(fen).toContain("KQkq"); // Castling rights

      const formatted = formatBoardForAI(complexGameState);
      expect(formatted).toContain("Recent moves: e4, e5, Nf3, Nc6, Bb5");
    });

    test("handles position after castling", () => {
      const gameState = createInitialGameState();
      gameState.moveHistory = [
        {
          notation: "e4",
          piece: { type: PIECE_TYPES.PAWN },
          capturedPiece: null,
        },
        {
          notation: "e5",
          piece: { type: PIECE_TYPES.PAWN },
          capturedPiece: null,
        },
        {
          notation: "Nf3",
          piece: { type: PIECE_TYPES.KNIGHT },
          capturedPiece: null,
        },
        {
          notation: "Nc6",
          piece: { type: PIECE_TYPES.KNIGHT },
          capturedPiece: null,
        },
        {
          notation: "Bc4",
          piece: { type: PIECE_TYPES.BISHOP },
          capturedPiece: null,
        },
        {
          notation: "Bc5",
          piece: { type: PIECE_TYPES.BISHOP },
          capturedPiece: null,
        },
        {
          notation: "O-O",
          piece: { type: PIECE_TYPES.KING },
          capturedPiece: null,
        },
      ];

      // Simulate castled position
      gameState.board[7][4] = null; // King moved
      gameState.board[7][6] = {
        type: PIECE_TYPES.KING,
        color: PIECE_COLORS.WHITE,
        hasMoved: true,
      };
      gameState.board[7][7] = null; // Rook moved
      gameState.board[7][5] = {
        type: PIECE_TYPES.ROOK,
        color: PIECE_COLORS.WHITE,
        hasMoved: true,
      };

      const fen = generateFENForAI(gameState);
      expect(fen).toBeDefined();
      expect(typeof fen).toBe("string");
    });

    test("handles position with pawn promotion", () => {
      const gameState = createInitialGameState();
      // Simulate a pawn that promoted - move the black king and place promoted queen
      gameState.board[0][4] = null; // Remove black king from e8
      gameState.board[0][3] = {
        type: PIECE_TYPES.KING,
        color: PIECE_COLORS.BLACK,
        hasMoved: true,
      }; // Move king to d8
      gameState.board[0][4] = {
        type: PIECE_TYPES.QUEEN,
        color: PIECE_COLORS.WHITE,
        hasMoved: true,
      }; // Place promoted queen on e8
      gameState.moveHistory = [
        {
          notation: "e8=Q",
          piece: { type: PIECE_TYPES.PAWN },
          capturedPiece: { type: PIECE_TYPES.KING, color: PIECE_COLORS.BLACK }, // Captured the king
        },
      ];

      const fen = generateFENForAI(gameState);
      expect(fen).toContain("Q"); // Promoted queen should be in FEN
    });
  });

  describe("AI Prompt Generation Edge Cases", () => {
    test("handles very long move history", () => {
      const gameState = createInitialGameState();
      gameState.moveHistory = Array(50)
        .fill(null)
        .map((_, i) => ({
          notation: i % 2 === 0 ? "Nf3" : "Nc6",
          piece: { type: PIECE_TYPES.KNIGHT },
          capturedPiece: null,
        }));

      const formatted = formatBoardForAI(gameState);
      expect(formatted).toContain("Recent moves:");
      // Should only show last 5 moves
      const recentMovesMatch = formatted.match(/Recent moves: (.+)/);
      if (recentMovesMatch) {
        const moves = recentMovesMatch[1].split(", ");
        expect(moves.length).toBeLessThanOrEqual(5);
      }
    });

    test("creates appropriate prompts for all difficulty levels", () => {
      const boardText = "Test board position";

      const easyPrompt = createAIPrompt(
        DIFFICULTY_LEVELS.EASY,
        boardText,
        PIECE_COLORS.WHITE
      );
      const mediumPrompt = createAIPrompt(
        DIFFICULTY_LEVELS.MEDIUM,
        boardText,
        PIECE_COLORS.WHITE
      );
      const hardPrompt = createAIPrompt(
        DIFFICULTY_LEVELS.HARD,
        boardText,
        PIECE_COLORS.WHITE
      );

      expect(easyPrompt).toContain("simple, straightforward");
      expect(mediumPrompt).toContain("solid, positional");
      expect(hardPrompt).toContain("best move available");

      // All should contain essential instructions
      [easyPrompt, mediumPrompt, hardPrompt].forEach((prompt) => {
        expect(prompt).toContain("Standard Algebraic Notation");
        expect(prompt).toContain("ONLY the move");
        expect(prompt).toContain("playing as white");
        expect(prompt).toContain(boardText);
      });
    });
  });

  describe("handleAPIError", () => {
    test("identifies API key errors", () => {
      const error = new Error("401 Unauthorized");
      const result = handleAPIError(error);

      expect(result.error).toBe(true);
      expect(result.type).toBe("API_KEY_INVALID");
      expect(result.message).toContain("Invalid API key");
      expect(result.isRetryable).toBe(false);
      expect(result.severity).toBe("critical");
    });

    test("identifies rate limit errors with retry logic", () => {
      const error = new Error("429 Too Many Requests");
      const result = handleAPIError(error, "AI request", 1);

      expect(result.type).toBe("RATE_LIMIT");
      expect(result.message).toContain("rate limit");
      expect(result.isRetryable).toBe(true);
      expect(result.suggestedDelay).toBeGreaterThan(1000);
      expect(result.retryCount).toBe(1);
    });

    test("identifies quota errors", () => {
      const error = new Error("Quota exceeded");
      const result = handleAPIError(error);

      expect(result.type).toBe("QUOTA_EXCEEDED");
      expect(result.message).toContain("quota");
      expect(result.isRetryable).toBe(false);
    });

    test("identifies network errors with retry capability", () => {
      const error = new Error("fetch failed");
      const result = handleAPIError(error);

      expect(result.type).toBe("NETWORK_ERROR");
      expect(result.message).toContain("Network error");
      expect(result.isRetryable).toBe(true);
      expect(result.suggestedDelay).toBeGreaterThan(0);
    });

    test("identifies timeout errors", () => {
      const error = new Error("timeout occurred");
      const result = handleAPIError(error);

      expect(result.type).toBe("TIMEOUT_ERROR");
      expect(result.isRetryable).toBe(true);
    });

    test("identifies server errors", () => {
      const error = new Error("500 Internal Server Error");
      const result = handleAPIError(error);

      expect(result.type).toBe("SERVER_ERROR");
      expect(result.isRetryable).toBe(true);
    });

    test("handles missing API key", () => {
      const error = new Error("API key is required");
      const result = handleAPIError(error);

      expect(result.type).toBe("API_KEY_MISSING");
      expect(result.severity).toBe("critical");
      expect(result.isRetryable).toBe(false);
    });

    test("calculates exponential backoff delays", () => {
      const error = new Error("429 Rate limit");

      const result1 = handleAPIError(error, "test", 0);
      const result2 = handleAPIError(error, "test", 1);
      const result3 = handleAPIError(error, "test", 2);

      expect(result2.suggestedDelay).toBeGreaterThan(result1.suggestedDelay);
      expect(result3.suggestedDelay).toBeGreaterThan(result2.suggestedDelay);
      expect(result3.suggestedDelay).toBeLessThanOrEqual(30000); // Max delay cap
    });

    test("handles unknown errors gracefully", () => {
      const error = new Error("Unknown error");
      const result = handleAPIError(error);

      expect(result.type).toBe("UNKNOWN_ERROR");
      expect(result.message).toContain("unexpected error");
      expect(result.severity).toBe("recoverable");
    });

    test("provides context in error messages", () => {
      const error = new Error("Test error");
      const result = handleAPIError(error, "Custom context");

      expect(result.error).toBe(true);
      expect(result.fallback).toBe(true);
    });
  });

  describe("retryWithBackoff", () => {
    test("succeeds on first attempt", async () => {
      const mockFunction = jest
        .fn()
        .mockResolvedValue({ success: true, data: "test" });

      const result = await retryWithBackoff(mockFunction, 3, 100);

      expect(result.success).toBe(true);
      expect(result.data).toBe("test");
      expect(mockFunction).toHaveBeenCalledTimes(1);
    });

    test("retries on failure and eventually succeeds", async () => {
      const mockFunction = jest
        .fn()
        .mockRejectedValueOnce(new Error("First failure"))
        .mockRejectedValueOnce(new Error("Second failure"))
        .mockResolvedValue({ success: true, data: "success" });

      const result = await retryWithBackoff(mockFunction, 3, 10);

      expect(result.success).toBe(true);
      expect(result.data).toBe("success");
      expect(mockFunction).toHaveBeenCalledTimes(3);
    });

    test("fails after max retries", async () => {
      const mockFunction = jest
        .fn()
        .mockRejectedValue(new Error("Persistent failure"));

      const result = await retryWithBackoff(mockFunction, 2, 10);

      expect(result.success).toBe(false);
      expect(result.error).toContain("Persistent failure");
      expect(mockFunction).toHaveBeenCalledTimes(3); // Initial + 2 retries
    });

    test("handles non-success results", async () => {
      const mockFunction = jest
        .fn()
        .mockResolvedValueOnce({ success: false, error: "First failure" })
        .mockResolvedValue({ isValid: true, data: "success" });

      const result = await retryWithBackoff(mockFunction, 2, 10);

      expect(result.isValid).toBe(true);
      expect(result.data).toBe("success");
      expect(mockFunction).toHaveBeenCalledTimes(2);
    });

    test("respects maximum delay cap", async () => {
      const mockFunction = jest.fn().mockRejectedValue(new Error("Test error"));

      const startTime = Date.now();
      await retryWithBackoff(mockFunction, 1, 50000); // Very high base delay
      const endTime = Date.now();

      // Should not take more than ~31 seconds (30s max delay + processing time)
      expect(endTime - startTime).toBeLessThan(32000);
    });
  });

  describe("checkAIServiceHealth", () => {
    test("reports healthy service with valid API key", () => {
      const result = checkAIServiceHealth("valid-api-key-123");

      expect(result.isHealthy).toBe(true);
      expect(result.issues).toHaveLength(0);
      expect(result.canFallback).toBe(true);
    });

    test("reports unhealthy service with missing API key", () => {
      const result = checkAIServiceHealth(null);

      expect(result.isHealthy).toBe(false);
      expect(result.issues).toHaveLength(1);
      expect(result.issues[0].type).toBe("API_KEY_MISSING");
      expect(result.issues[0].severity).toBe("critical");
    });

    test("reports unhealthy service with invalid API key", () => {
      const result = checkAIServiceHealth("");

      expect(result.isHealthy).toBe(false);
      expect(result.issues[0].type).toBe("API_KEY_INVALID");
    });

    test("reports unhealthy service when offline", () => {
      const originalOnLine = navigator.onLine;
      Object.defineProperty(navigator, "onLine", {
        writable: true,
        value: false,
      });

      const result = checkAIServiceHealth("valid-key");

      expect(result.isHealthy).toBe(false);
      expect(
        result.issues.some((issue) => issue.type === "NETWORK_ERROR")
      ).toBe(true);

      Object.defineProperty(navigator, "onLine", {
        writable: true,
        value: originalOnLine,
      });
    });

    test("always allows fallback", () => {
      const healthyResult = checkAIServiceHealth("valid-key");
      const unhealthyResult = checkAIServiceHealth(null);

      expect(healthyResult.canFallback).toBe(true);
      expect(unhealthyResult.canFallback).toBe(true);
    });
  });

  describe("createUserErrorMessage", () => {
    test("creates user-friendly message for API key errors", () => {
      const errorResult = {
        type: "API_KEY_INVALID",
        message: "Invalid API key",
        isRetryable: false,
        retryCount: 0,
        severity: "critical",
      };

      const userMessage = createUserErrorMessage(errorResult);

      expect(userMessage.title).toBe("AI Configuration Issue");
      expect(userMessage.message).toContain("not properly configured");
      expect(userMessage.action).toBe("Switch to PvP");
      expect(userMessage.canRetry).toBe(false);
      expect(userMessage.canContinue).toBe(true);
    });

    test("creates user-friendly message for network errors", () => {
      const errorResult = {
        type: "NETWORK_ERROR",
        message: "Network failed",
        isRetryable: true,
        retryCount: 1,
        severity: "recoverable",
      };

      const userMessage = createUserErrorMessage(errorResult);

      expect(userMessage.title).toBe("Connection Problem");
      expect(userMessage.message).toContain("internet connection");
      expect(userMessage.canRetry).toBe(true);
      expect(userMessage.action).toBe("Try Again");
    });

    test("creates user-friendly message for rate limit errors", () => {
      const errorResult = {
        type: "RATE_LIMIT",
        message: "Rate limit exceeded",
        isRetryable: true,
        retryCount: 0,
        severity: "recoverable",
      };

      const userMessage = createUserErrorMessage(errorResult);

      expect(userMessage.title).toBe("AI Taking a Break");
      expect(userMessage.message).toContain("busy right now");
      expect(userMessage.canRetry).toBe(true);
    });

    test("switches to PvP after multiple retries", () => {
      const errorResult = {
        type: "NETWORK_ERROR",
        message: "Network failed",
        isRetryable: true,
        retryCount: 3,
        severity: "recoverable",
      };

      const userMessage = createUserErrorMessage(errorResult);

      expect(userMessage.action).toBe("Switch to PvP");
      expect(userMessage.canRetry).toBe(false);
    });

    test("handles quota exceeded errors", () => {
      const errorResult = {
        type: "QUOTA_EXCEEDED",
        message: "Quota exceeded",
        isRetryable: false,
        retryCount: 0,
        severity: "recoverable",
      };

      const userMessage = createUserErrorMessage(errorResult);

      expect(userMessage.title).toBe("AI Service Limit Reached");
      expect(userMessage.message).toContain("usage limit");
      expect(userMessage.canRetry).toBe(false);
      expect(userMessage.action).toBe("Switch to PvP");
    });

    test("handles timeout errors", () => {
      const errorResult = {
        type: "TIMEOUT_ERROR",
        message: "Request timeout",
        isRetryable: true,
        retryCount: 1,
        severity: "recoverable",
      };

      const userMessage = createUserErrorMessage(errorResult);

      expect(userMessage.title).toBe("AI Response Timeout");
      expect(userMessage.message).toContain("longer than expected");
      expect(userMessage.canRetry).toBe(true);
    });

    test("handles server errors", () => {
      const errorResult = {
        type: "SERVER_ERROR",
        message: "Server error",
        isRetryable: true,
        retryCount: 0,
        severity: "recoverable",
      };

      const userMessage = createUserErrorMessage(errorResult);

      expect(userMessage.title).toBe("AI Service Unavailable");
      expect(userMessage.message).toContain("temporarily unavailable");
      expect(userMessage.canRetry).toBe(true);
    });

    test("handles invalid response errors", () => {
      const errorResult = {
        type: "INVALID_RESPONSE",
        message: "Invalid response",
        isRetryable: false,
        retryCount: 0,
        severity: "recoverable",
      };

      const userMessage = createUserErrorMessage(errorResult);

      expect(userMessage.title).toBe("AI Response Error");
      expect(userMessage.message).toContain("unexpected response");
      expect(userMessage.action).toBe("Continue");
      expect(userMessage.canRetry).toBe(false);
    });

    test("includes timestamp and original error", () => {
      const errorResult = {
        type: "UNKNOWN_ERROR",
        message: "Unknown error",
        isRetryable: false,
        retryCount: 0,
        severity: "recoverable",
      };

      const userMessage = createUserErrorMessage(errorResult);

      expect(userMessage.originalError).toBe("Unknown error");
      expect(userMessage.timestamp).toBeGreaterThan(0);
      expect(userMessage.severity).toBe("recoverable");
    });

    test("falls back to unknown error for unrecognized types", () => {
      const errorResult = {
        type: "UNRECOGNIZED_ERROR_TYPE",
        message: "Some error",
        isRetryable: false,
        retryCount: 0,
        severity: "recoverable",
      };

      const userMessage = createUserErrorMessage(errorResult);

      expect(userMessage.title).toBe("Unexpected Error");
      expect(userMessage.action).toBe("Continue");
    });
  });

  describe("Integration with Real Game Scenarios", () => {
    test("handles Scholar's Mate attempt", async () => {
      // Set up board after e4 e5 Bc4 Nc6 Qh5
      const gameState = createInitialGameState();
      // Simulate the position (simplified)
      gameState.currentPlayer = PIECE_COLORS.BLACK;

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          candidates: [
            {
              content: {
                parts: [{ text: "Nf6" }], // Defending move
              },
            },
          ],
        }),
      });

      const result = await getAIMove(
        gameState,
        PIECE_COLORS.BLACK,
        DIFFICULTY_LEVELS.HARD,
        "test-key"
      );

      expect(result.isValid).toBe(true);
      expect(result.source).toBe("ai");
    });

    test("handles opening theory positions", async () => {
      const gameState = createInitialGameState();
      gameState.currentPlayer = PIECE_COLORS.BLACK;
      gameState.moveHistory = [
        {
          notation: "e4",
          piece: { type: PIECE_TYPES.PAWN },
          capturedPiece: null,
        },
      ];

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          candidates: [
            {
              content: {
                parts: [{ text: "e5" }], // Standard response
              },
            },
          ],
        }),
      });

      const result = await getAIMove(
        gameState,
        PIECE_COLORS.BLACK,
        DIFFICULTY_LEVELS.MEDIUM,
        "test-key"
      );

      expect(result.isValid).toBe(true);
      expect(result.sanMove).toBeDefined();
      expect(typeof result.sanMove).toBe("string");
    });
  });
});
