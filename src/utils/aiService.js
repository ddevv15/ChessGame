// AIService module - Google Gemini AI integration for chess moves
import {
  GAME_MODES,
  DIFFICULTY_LEVELS,
  PIECE_COLORS,
} from "../constants/gameConstants";
import { generateFEN } from "./fenUtils.js";
import { parseSANMove, validateSANMove, moveToSAN } from "./sanUtils.js";
import { getAllLegalMovesForColor } from "./gameLogic.js";

/**
 * AIService handles all interactions with Google Gemini AI for chess move calculation
 */

// Gemini API configuration
const GEMINI_API_BASE_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent";
const GEMINI_API_KEY_HEADER = "x-goog-api-key";

/**
 * Initialize Gemini API client
 * @param {string} apiKey - Google Gemini API key
 * @returns {Object} API client configuration
 */
export const initializeGemini = (apiKey) => {
  if (!apiKey || typeof apiKey !== "string") {
    throw new Error("Valid API key is required for Gemini integration");
  }

  return {
    apiKey: apiKey.trim(),
    baseUrl: GEMINI_API_BASE_URL,
    headers: {
      "Content-Type": "application/json",
      [GEMINI_API_KEY_HEADER]: apiKey.trim(),
    },
  };
};

/**
 * Generate FEN string from game state for AI communication
 * @param {Object} gameState - Current game state
 * @returns {string} FEN string representing the current position
 */
export const generateFENForAI = (gameState) => {
  try {
    return generateFEN(gameState);
  } catch (error) {
    console.error("Error generating FEN for AI:", error);
    throw new Error("Failed to generate FEN string for AI communication");
  }
};

/**
 * Format chess board state for AI consumption using FEN
 * @param {Object} gameState - Current game state
 * @returns {string} Formatted board representation for AI
 */
export const formatBoardForAI = (gameState) => {
  const fenString = generateFENForAI(gameState);
  const { currentPlayer, moveHistory = [] } = gameState;

  let boardText = `Current chess position in FEN notation:\n${fenString}\n\n`;
  boardText += `It is ${currentPlayer}'s turn to move.\n\n`;

  // Add move history context
  if (moveHistory.length > 0) {
    boardText += "Recent moves: ";
    const recentMoves = moveHistory
      .slice(-5)
      .map((move) => move.notation)
      .join(", ");
    boardText += recentMoves + "\n\n";
  }

  return boardText;
};

/**
 * Create AI prompt based on difficulty level
 * @param {string} difficulty - AI difficulty level
 * @param {string} boardText - Formatted board representation with FEN
 * @param {string} playerColor - Color the AI is playing
 * @returns {string} Complete prompt for AI
 */
export const createAIPrompt = (difficulty, boardText, playerColor) => {
  const difficultyInstructions = {
    [DIFFICULTY_LEVELS.EASY]:
      "Make a simple, straightforward move. Focus on basic piece development and avoid complex tactics.",
    [DIFFICULTY_LEVELS.MEDIUM]:
      "Make a solid, positional move. Consider piece coordination and basic tactical opportunities.",
    [DIFFICULTY_LEVELS.HARD]:
      "Make the best move available. Look for tactical opportunities, positional advantages, and consider multiple move sequences.",
  };

  const basePrompt = `You are a chess AI playing as ${playerColor}. Analyze the current position from the FEN string and suggest the best move.

${boardText}

${difficultyInstructions[difficulty]}

IMPORTANT: Respond with ONLY the move in Standard Algebraic Notation (SAN). Examples:
- Pawn moves: "e4", "d5", "exd5" (for captures)
- Piece moves: "Nf3", "Bb5", "Qh5", "Rook takes on d1" should be "Rxd1"
- Castling: "O-O" (kingside) or "O-O-O" (queenside)
- Promotion: "e8=Q" (pawn promotes to queen)
- Check: "Qh5+" (add + for check)
- Checkmate: "Qh7#" (add # for checkmate)

Do not include any explanations, analysis, or additional text - just the move notation.
The move must be legal in the current position.`;

  return basePrompt;
};

/**
 * Request AI move from Google Gemini
 * @param {Object} config - Gemini API configuration
 * @param {string} prompt - AI prompt
 * @returns {Promise<Object>} AI response
 */
export const requestAIMove = async (config, prompt) => {
  try {
    const response = await fetch(config.baseUrl, {
      method: "POST",
      headers: config.headers,
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(
        `Gemini API error: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();

    if (
      !data.candidates ||
      !data.candidates[0] ||
      !data.candidates[0].content
    ) {
      throw new Error("Invalid response format from Gemini API");
    }

    return {
      success: true,
      move: data.candidates[0].content.parts[0].text.trim(),
      rawResponse: data,
    };
  } catch (error) {
    console.error("Error requesting AI move:", error);
    return {
      success: false,
      error: error.message,
      fallbackMove: null,
    };
  }
};

/**
 * Parse AI response and validate SAN move
 * @param {Object} aiResponse - Response from Gemini API
 * @param {(Piece|null)[][]} board - Current board state
 * @param {string} playerColor - Color of the AI player
 * @returns {Object} Parsed move result
 */
export const parseAIResponse = (aiResponse, board, playerColor) => {
  if (!aiResponse.success) {
    return {
      isValid: false,
      error: aiResponse.error,
      sanMove: null,
    };
  }

  const moveText = aiResponse.move.trim();

  // Clean the move text - remove quotes, extra spaces, etc.
  const cleanMove = moveText.replace(/['"]/g, "").trim();

  try {
    // Validate the SAN move against the current board position
    if (validateSANMove(cleanMove, board, playerColor)) {
      // Parse the SAN move to get move details
      const parsedMove = parseSANMove(cleanMove, board, playerColor);

      return {
        isValid: true,
        sanMove: cleanMove,
        moveDetails: parsedMove,
        confidence: "high",
        source: "ai",
      };
    } else {
      return {
        isValid: false,
        error: `AI suggested move "${cleanMove}" is not valid in current position`,
        sanMove: cleanMove,
      };
    }
  } catch (error) {
    return {
      isValid: false,
      error: `Failed to parse AI move "${cleanMove}": ${error.message}`,
      sanMove: cleanMove,
    };
  }
};

/**
 * Generate fallback move when AI fails
 * @param {(Piece|null)[][]} board - Current board state
 * @param {string} playerColor - Color of the AI player
 * @param {string} difficulty - AI difficulty level
 * @returns {Object} Fallback move
 */
export const generateFallbackMove = (board, playerColor, difficulty) => {
  try {
    // Get all legal moves for the AI player
    const legalMoves = getAllLegalMovesForColor(board, playerColor);

    if (!legalMoves || legalMoves.length === 0) {
      return {
        isValid: false,
        error: "No legal moves available",
        sanMove: null,
      };
    }

    // Simple fallback strategy based on difficulty
    let selectedMove;

    switch (difficulty) {
      case DIFFICULTY_LEVELS.EASY:
        // Random move for easy difficulty
        selectedMove =
          legalMoves[Math.floor(Math.random() * legalMoves.length)];
        break;

      case DIFFICULTY_LEVELS.MEDIUM:
        // Prefer captures and center moves for medium difficulty
        const captures = legalMoves.filter((move) => {
          const targetPiece = board[move.to.row][move.to.col];
          return targetPiece !== null;
        });

        const centerMoves = legalMoves.filter((move) => {
          const { row, col } = move.to;
          return row >= 2 && row <= 5 && col >= 2 && col <= 5;
        });

        if (captures.length > 0) {
          selectedMove = captures[Math.floor(Math.random() * captures.length)];
        } else if (centerMoves.length > 0) {
          selectedMove =
            centerMoves[Math.floor(Math.random() * centerMoves.length)];
        } else {
          selectedMove =
            legalMoves[Math.floor(Math.random() * legalMoves.length)];
        }
        break;

      case DIFFICULTY_LEVELS.HARD:
        // Try to find captures first for hard difficulty
        const hardCaptures = legalMoves.filter((move) => {
          const targetPiece = board[move.to.row][move.to.col];
          return targetPiece !== null;
        });

        if (hardCaptures.length > 0) {
          selectedMove =
            hardCaptures[Math.floor(Math.random() * hardCaptures.length)];
        } else {
          selectedMove =
            legalMoves[Math.floor(Math.random() * legalMoves.length)];
        }
        break;

      default:
        selectedMove =
          legalMoves[Math.floor(Math.random() * legalMoves.length)];
    }

    // Convert the selected move to SAN notation
    const sanMove = moveToSAN(
      board,
      selectedMove.from.row,
      selectedMove.from.col,
      selectedMove.to.row,
      selectedMove.to.col
    );

    return {
      isValid: true,
      sanMove,
      moveDetails: {
        from: [selectedMove.from.row, selectedMove.from.col],
        to: [selectedMove.to.row, selectedMove.to.col],
        piece: selectedMove.piece,
      },
      confidence: "low",
      source: "fallback",
    };
  } catch (error) {
    console.error("Error generating fallback move:", error);
    return {
      isValid: false,
      error: `Failed to generate fallback move: ${error.message}`,
      sanMove: null,
    };
  }
};

/**
 * Main function to get AI move using FEN-to-SAN communication
 * @param {Object} gameState - Current game state
 * @param {string} aiPlayerColor - Color the AI is playing
 * @param {string} difficulty - AI difficulty level
 * @param {string} apiKey - Gemini API key
 * @returns {Promise<Object>} AI move result
 */
export const getAIMove = async (
  gameState,
  aiPlayerColor,
  difficulty,
  apiKey
) => {
  try {
    // Initialize Gemini client
    const config = initializeGemini(apiKey);

    // Format board for AI using FEN
    const boardText = formatBoardForAI(gameState);

    // Create AI prompt
    const prompt = createAIPrompt(difficulty, boardText, aiPlayerColor);

    // Request move from AI
    const aiResponse = await requestAIMove(config, prompt);

    // Parse AI response and validate SAN move
    const parsedMove = parseAIResponse(
      aiResponse,
      gameState.board,
      aiPlayerColor
    );

    if (parsedMove.isValid) {
      return parsedMove;
    }

    // If AI move is invalid, generate fallback
    console.warn("AI move invalid, using fallback:", parsedMove.error);
    return generateFallbackMove(gameState.board, aiPlayerColor, difficulty);
  } catch (error) {
    console.error("Error in getAIMove:", error);

    // Return fallback move on any error
    return generateFallbackMove(gameState.board, aiPlayerColor, difficulty);
  }
};

/**
 * Handle API errors gracefully
 * @param {Error} error - API error
 * @param {string} context - Error context
 * @returns {Object} Error handling result
 */
export const handleAPIError = (error, context = "AI move request") => {
  console.error(`${context}:`, error);

  const errorMessages = {
    API_KEY_INVALID: "Invalid API key. Please check your Gemini API key.",
    RATE_LIMIT: "API rate limit exceeded. Please try again later.",
    QUOTA_EXCEEDED: "API quota exceeded. Please check your usage limits.",
    NETWORK_ERROR: "Network error. Please check your internet connection.",
    UNKNOWN_ERROR: "An unexpected error occurred. Please try again.",
  };

  let errorType = "UNKNOWN_ERROR";

  if (error.message.includes("401") || error.message.includes("unauthorized")) {
    errorType = "API_KEY_INVALID";
  } else if (
    error.message.includes("429") ||
    error.message.includes("rate limit")
  ) {
    errorType = "RATE_LIMIT";
  } else if (error.message.toLowerCase().includes("quota")) {
    errorType = "QUOTA_EXCEEDED";
  } else if (
    error.message.includes("fetch") ||
    error.message.includes("network")
  ) {
    errorType = "NETWORK_ERROR";
  }

  return {
    error: true,
    message: errorMessages[errorType],
    type: errorType,
    fallback: true,
  };
};
