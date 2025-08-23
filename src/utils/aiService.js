// AIService module - Google Gemini AI integration for chess moves
import { GAME_MODES, DIFFICULTY_LEVELS } from "../constants/gameConstants";

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
 * Format chess board state for AI consumption
 * @param {(Object|null)[][]} board - 8x8 chess board
 * @param {string} currentPlayer - Current player color
 * @param {Array} moveHistory - Array of previous moves
 * @returns {string} Formatted board representation for AI
 */
export const formatBoardForAI = (board, currentPlayer, moveHistory = []) => {
  const pieceSymbols = {
    white: {
      king: "♔",
      queen: "♕",
      rook: "♖",
      bishop: "♗",
      knight: "♘",
      pawn: "♙",
    },
    black: {
      king: "♚",
      queen: "♛",
      rook: "♜",
      bishop: "♝",
      knight: "♞",
      pawn: "♟",
    },
  };

  let boardText = `Current chess position (${currentPlayer}'s turn to move):\n\n`;

  // Add board representation
  boardText += "  a b c d e f g h\n";
  for (let row = 0; row < 8; row++) {
    boardText += `${8 - row} `;
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece) {
        const symbol = pieceSymbols[piece.color][piece.type];
        boardText += symbol + " ";
      } else {
        boardText += ". ";
      }
    }
    boardText += `${8 - row}\n`;
  }
  boardText += "  a b c d e f g h\n\n";

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
 * @param {string} boardText - Formatted board representation
 * @returns {string} Complete prompt for AI
 */
export const createAIPrompt = (difficulty, boardText) => {
  const difficultyInstructions = {
    [DIFFICULTY_LEVELS.EASY]:
      "Make a simple, straightforward move. Focus on basic piece development and avoid complex tactics.",
    [DIFFICULTY_LEVELS.MEDIUM]:
      "Make a solid, positional move. Consider piece coordination and basic tactical opportunities.",
    [DIFFICULTY_LEVELS.HARD]:
      "Make the best move available. Look for tactical opportunities, positional advantages, and consider multiple move sequences.",
  };

  const basePrompt = `You are a chess AI playing as Black. Analyze the current position and suggest the best move.

${boardText}

${difficultyInstructions[difficulty]}

Respond with ONLY the move in algebraic notation (e.g., "e5", "Nf6", "O-O", "exd5"). 
Do not include any explanations, analysis, or additional text - just the move notation.

If you see a checkmate opportunity, take it. If you see a winning tactic, play it.`;

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
 * Parse AI response to extract valid move
 * @param {Object} aiResponse - Response from Gemini API
 * @param {Array} validMoves - Array of valid moves for current position
 * @returns {Object} Parsed move result
 */
export const parseAIResponse = (aiResponse, validMoves) => {
  if (!aiResponse.success) {
    return {
      isValid: false,
      error: aiResponse.error,
      fallbackMove: null,
    };
  }

  const moveText = aiResponse.move;

  // Basic move text cleaning
  const cleanMove = moveText.replace(/[^\w\-x=+#]/g, "").toLowerCase();

  // Try to find exact match in valid moves
  const exactMatch = validMoves.find(
    (move) =>
      move.notation.toLowerCase() === cleanMove ||
      move.notation.toLowerCase().replace(/[^\w\-x=+#]/g, "") === cleanMove
  );

  if (exactMatch) {
    return {
      isValid: true,
      move: exactMatch,
      confidence: "high",
      source: "ai",
    };
  }

  // Try to find partial matches
  const partialMatches = validMoves.filter((move) => {
    const moveNotation = move.notation.toLowerCase();
    return cleanMove.includes(moveNotation) || moveNotation.includes(cleanMove);
  });

  if (partialMatches.length > 0) {
    // Return the first partial match (usually the most common interpretation)
    return {
      isValid: true,
      move: partialMatches[0],
      confidence: "medium",
      source: "ai",
    };
  }

  return {
    isValid: false,
    error: `AI suggested move "${moveText}" is not valid in current position`,
    fallbackMove: null,
  };
};

/**
 * Generate fallback move when AI fails
 * @param {Array} validMoves - Array of valid moves
 * @param {string} difficulty - AI difficulty level
 * @returns {Object} Fallback move
 */
export const generateFallbackMove = (validMoves, difficulty) => {
  if (!validMoves || validMoves.length === 0) {
    return null;
  }

  // Simple fallback strategy based on difficulty
  let selectedMove;

  switch (difficulty) {
    case DIFFICULTY_LEVELS.EASY:
      // Random move for easy difficulty
      selectedMove = validMoves[Math.floor(Math.random() * validMoves.length)];
      break;

    case DIFFICULTY_LEVELS.MEDIUM:
      // Prefer captures and center moves for medium difficulty
      const captures = validMoves.filter((move) => move.capturedPiece);
      const centerMoves = validMoves.filter((move) => {
        const [toRow, toCol] = move.to;
        return toRow >= 2 && toRow <= 5 && toCol >= 2 && toCol <= 5;
      });

      if (captures.length > 0) {
        selectedMove = captures[Math.floor(Math.random() * captures.length)];
      } else if (centerMoves.length > 0) {
        selectedMove =
          centerMoves[Math.floor(Math.random() * centerMoves.length)];
      } else {
        selectedMove =
          validMoves[Math.floor(Math.random() * validMoves.length)];
      }
      break;

    case DIFFICULTY_LEVELS.HARD:
      // Try to find the most "aggressive" move for hard difficulty
      const aggressiveMoves = validMoves.filter(
        (move) =>
          move.capturedPiece ||
          move.notation.includes("+") || // Check moves
          move.notation.includes("#") // Checkmate moves
      );

      if (aggressiveMoves.length > 0) {
        selectedMove =
          aggressiveMoves[Math.floor(Math.random() * aggressiveMoves.length)];
      } else {
        selectedMove =
          validMoves[Math.floor(Math.random() * validMoves.length)];
      }
      break;

    default:
      selectedMove = validMoves[Math.floor(Math.random() * validMoves.length)];
  }

  return {
    isValid: true,
    move: selectedMove,
    confidence: "low",
    source: "fallback",
  };
};

/**
 * Main function to get AI move
 * @param {Object} board - Current board state
 * @param {string} currentPlayer - Current player color
 * @param {Array} moveHistory - Move history
 * @param {string} difficulty - AI difficulty level
 * @param {string} apiKey - Gemini API key
 * @param {Array} validMoves - Valid moves for current position
 * @returns {Promise<Object>} AI move result
 */
export const getAIMove = async (
  board,
  currentPlayer,
  moveHistory,
  difficulty,
  apiKey,
  validMoves
) => {
  try {
    // Initialize Gemini client
    const config = initializeGemini(apiKey);

    // Format board for AI
    const boardText = formatBoardForAI(board, currentPlayer, moveHistory);

    // Create AI prompt
    const prompt = createAIPrompt(difficulty, boardText);

    // Request move from AI
    const aiResponse = await requestAIMove(config, prompt);

    // Parse AI response
    const parsedMove = parseAIResponse(aiResponse, validMoves);

    if (parsedMove.isValid) {
      return parsedMove;
    }

    // If AI move is invalid, generate fallback
    console.warn("AI move invalid, using fallback:", parsedMove.error);
    return generateFallbackMove(validMoves, difficulty);
  } catch (error) {
    console.error("Error in getAIMove:", error);

    // Return fallback move on any error
    return generateFallbackMove(validMoves, difficulty);
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
  } else if (
    error.message.includes("quota") ||
    error.message.includes("limit")
  ) {
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
