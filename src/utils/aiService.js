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
 * Request AI move from Google Gemini with timeout and enhanced error handling
 * @param {Object} config - Gemini API configuration
 * @param {string} prompt - AI prompt
 * @param {AbortSignal} signal - Abort signal for timeout handling
 * @returns {Promise<Object>} AI response
 */
export const requestAIMove = async (config, prompt, signal = null) => {
  try {
    const fetchOptions = {
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
    };

    // Add abort signal if provided
    if (signal) {
      fetchOptions.signal = signal;
    }

    const response = await fetch(config.baseUrl, fetchOptions);

    if (!response.ok) {
      // Provide more detailed error information
      let errorMessage = `Gemini API error: ${response.status} ${response.statusText}`;

      try {
        const errorData = await response.json();
        if (errorData.error && errorData.error.message) {
          errorMessage += ` - ${errorData.error.message}`;
        }
      } catch (parseError) {
        // Ignore JSON parsing errors for error responses
      }

      throw new Error(errorMessage);
    }

    const data = await response.json();

    // Validate response structure
    if (
      !data.candidates ||
      !Array.isArray(data.candidates) ||
      data.candidates.length === 0
    ) {
      throw new Error("No candidates in Gemini API response");
    }

    const candidate = data.candidates[0];
    if (
      !candidate.content ||
      !candidate.content.parts ||
      !Array.isArray(candidate.content.parts)
    ) {
      throw new Error("Invalid candidate structure in Gemini API response");
    }

    const part = candidate.content.parts[0];
    if (!part || !part.text) {
      throw new Error("No text content in Gemini API response");
    }

    const moveText = part.text.trim();
    if (!moveText) {
      throw new Error("Empty move text in Gemini API response");
    }

    return {
      success: true,
      move: moveText,
      rawResponse: data,
      responseTime: Date.now(),
    };
  } catch (error) {
    console.error("Error requesting AI move:", error);

    // Classify the error for better handling
    let errorType = "UNKNOWN_ERROR";
    if (error.name === "AbortError") {
      errorType = "TIMEOUT_ERROR";
    } else if (error.message.includes("fetch")) {
      errorType = "NETWORK_ERROR";
    } else if (error.message.includes("401")) {
      errorType = "API_KEY_INVALID";
    } else if (error.message.includes("429")) {
      errorType = "RATE_LIMIT";
    } else if (error.message.includes("quota")) {
      errorType = "QUOTA_EXCEEDED";
    } else if (
      error.message.includes("500") ||
      error.message.includes("502") ||
      error.message.includes("503") ||
      error.message.includes("504")
    ) {
      errorType = "SERVER_ERROR";
    }

    return {
      success: false,
      error: error.message,
      errorType,
      timestamp: Date.now(),
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
 * Main function to get AI move using FEN-to-SAN communication with comprehensive error handling
 * @param {Object} gameState - Current game state
 * @param {string} aiPlayerColor - Color the AI is playing
 * @param {string} difficulty - AI difficulty level
 * @param {string} apiKey - Gemini API key
 * @param {Object} options - Additional options for error handling
 * @returns {Promise<Object>} AI move result with comprehensive error information
 */
export const getAIMove = async (
  gameState,
  aiPlayerColor,
  difficulty,
  apiKey,
  options = {}
) => {
  const { maxRetries = 3, enableRetry = true, onError = null } = options;

  // Check AI service health first
  const healthCheck = checkAIServiceHealth(apiKey);
  if (!healthCheck.isHealthy) {
    const criticalIssue = healthCheck.issues.find(
      (issue) => issue.severity === "critical"
    );
    if (criticalIssue) {
      const errorResult = {
        isValid: false,
        error: criticalIssue.message,
        errorType: criticalIssue.type,
        severity: "critical",
        canRetry: false,
        fallbackMove: null,
        userMessage: createUserErrorMessage({
          type: criticalIssue.type,
          message: criticalIssue.message,
          severity: "critical",
          isRetryable: false,
          retryCount: 0,
        }),
      };

      if (onError) {
        onError(errorResult);
      }

      // Try to generate fallback move even with critical errors
      try {
        const fallback = generateFallbackMove(
          gameState.board,
          aiPlayerColor,
          difficulty
        );
        return {
          ...errorResult,
          fallbackMove: fallback.isValid ? fallback : null,
        };
      } catch (fallbackError) {
        return errorResult;
      }
    }
  }

  // Create the AI request function for retry mechanism
  const makeAIRequest = async () => {
    try {
      // Initialize Gemini client
      const config = initializeGemini(apiKey);

      // Format board for AI using FEN
      const boardText = formatBoardForAI(gameState);

      // Create AI prompt
      const prompt = createAIPrompt(difficulty, boardText, aiPlayerColor);

      // Request move from AI with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      try {
        const aiResponse = await requestAIMove(
          config,
          prompt,
          controller.signal
        );
        clearTimeout(timeoutId);

        // Parse AI response and validate SAN move
        const parsedMove = parseAIResponse(
          aiResponse,
          gameState.board,
          aiPlayerColor
        );

        if (parsedMove.isValid) {
          return {
            success: true,
            isValid: true,
            ...parsedMove,
            source: "ai",
            retryCount: 0,
          };
        }

        // AI move is invalid, but this is a "soft" error that should trigger fallback
        throw new Error(`Invalid AI move: ${parsedMove.error}`);
      } catch (requestError) {
        clearTimeout(timeoutId);
        throw requestError;
      }
    } catch (error) {
      // Re-throw with more context
      throw new Error(`AI request failed: ${error.message}`);
    }
  };

  try {
    let result;

    if (enableRetry && maxRetries > 0) {
      // Use retry mechanism
      result = await retryWithBackoff(makeAIRequest, maxRetries, 1000);
    } else {
      // Single attempt
      result = await makeAIRequest();
    }

    if (result.success && result.isValid) {
      return result;
    }

    // AI failed after retries, generate fallback
    console.warn("AI move failed after retries, using fallback:", result.error);

    const fallbackMove = generateFallbackMove(
      gameState.board,
      aiPlayerColor,
      difficulty
    );
    const errorResult = {
      isValid: fallbackMove.isValid,
      error: result.error || "AI service failed",
      errorType: result.errorType || "UNKNOWN_ERROR",
      retryCount: result.retryCount || 0,
      fallbackUsed: true,
      userMessage: createUserErrorMessage(result, "AI move"),
      ...fallbackMove,
    };

    if (onError) {
      onError(errorResult);
    }

    return errorResult;
  } catch (error) {
    console.error("Critical error in getAIMove:", error);

    // Handle critical errors
    const errorResult = handleAPIError(error, "AI move request", maxRetries);
    const fallbackMove = generateFallbackMove(
      gameState.board,
      aiPlayerColor,
      difficulty
    );

    const finalResult = {
      isValid: fallbackMove.isValid,
      error: errorResult.message,
      errorType: errorResult.type,
      severity: errorResult.severity,
      retryCount: maxRetries,
      fallbackUsed: true,
      userMessage: createUserErrorMessage(errorResult, "AI move"),
      ...fallbackMove,
    };

    if (onError) {
      onError(finalResult);
    }

    return finalResult;
  }
};

/**
 * Enhanced error handling with retry mechanisms and detailed error classification
 * @param {Error} error - API error
 * @param {string} context - Error context
 * @param {number} retryCount - Current retry attempt
 * @returns {Object} Error handling result
 */
export const handleAPIError = (
  error,
  context = "AI move request",
  retryCount = 0
) => {
  console.error(`${context} (attempt ${retryCount + 1}):`, error);

  const errorMessages = {
    API_KEY_INVALID:
      "Invalid API key. Please check your Gemini API key and try again.",
    API_KEY_MISSING:
      "No API key provided. AI mode requires a valid Gemini API key.",
    RATE_LIMIT:
      "API rate limit exceeded. The AI is taking a short break. Please wait a moment.",
    QUOTA_EXCEEDED:
      "API quota exceeded. Please check your usage limits or try again later.",
    NETWORK_ERROR:
      "Network connection failed. Please check your internet connection.",
    TIMEOUT_ERROR: "AI request timed out. The AI might be busy - trying again.",
    INVALID_RESPONSE: "AI provided an invalid response. Using fallback move.",
    SERVER_ERROR: "AI service is temporarily unavailable. Using fallback move.",
    UNKNOWN_ERROR: "An unexpected error occurred. Using fallback move.",
  };

  let errorType = "UNKNOWN_ERROR";
  let isRetryable = false;
  let suggestedDelay = 1000; // Default 1 second delay

  // Classify error types and determine retry strategy
  if (!error) {
    errorType = "UNKNOWN_ERROR";
  } else if (
    error.message.includes("API key") ||
    error.message.includes("apiKey")
  ) {
    errorType = "API_KEY_MISSING";
  } else if (
    error.message.includes("401") ||
    error.message.includes("unauthorized")
  ) {
    errorType = "API_KEY_INVALID";
  } else if (
    error.message.includes("429") ||
    error.message.includes("rate limit")
  ) {
    errorType = "RATE_LIMIT";
    isRetryable = true;
    suggestedDelay = Math.min(5000 * Math.pow(2, retryCount), 30000); // Exponential backoff, max 30s
  } else if (error.message.toLowerCase().includes("quota")) {
    errorType = "QUOTA_EXCEEDED";
    isRetryable = false; // Don't retry quota errors
  } else if (
    error.message.includes("fetch") ||
    error.message.includes("network") ||
    error.message.includes("NetworkError") ||
    error.message.includes("Failed to fetch")
  ) {
    errorType = "NETWORK_ERROR";
    isRetryable = true;
    suggestedDelay = Math.min(2000 * Math.pow(1.5, retryCount), 10000); // Exponential backoff, max 10s
  } else if (
    error.message.includes("timeout") ||
    error.message.includes("AbortError")
  ) {
    errorType = "TIMEOUT_ERROR";
    isRetryable = true;
    suggestedDelay = Math.min(3000 * Math.pow(1.5, retryCount), 15000); // Exponential backoff, max 15s
  } else if (
    error.message.includes("500") ||
    error.message.includes("502") ||
    error.message.includes("503") ||
    error.message.includes("504")
  ) {
    errorType = "SERVER_ERROR";
    isRetryable = true;
    suggestedDelay = Math.min(5000 * Math.pow(2, retryCount), 30000); // Exponential backoff, max 30s
  } else if (
    error.message.includes("Invalid response") ||
    error.message.includes("candidates")
  ) {
    errorType = "INVALID_RESPONSE";
    isRetryable = true;
    suggestedDelay = 1000; // Quick retry for invalid responses
  }

  return {
    error: true,
    message: errorMessages[errorType],
    type: errorType,
    isRetryable,
    suggestedDelay,
    retryCount,
    fallback: true,
    severity:
      errorType === "API_KEY_INVALID" || errorType === "API_KEY_MISSING"
        ? "critical"
        : "recoverable",
  };
};

/**
 * Retry mechanism for AI requests with exponential backoff
 * @param {Function} requestFunction - Function to retry
 * @param {number} maxRetries - Maximum number of retry attempts
 * @param {number} baseDelay - Base delay between retries in milliseconds
 * @returns {Promise<Object>} Result of the request or final error
 */
export const retryWithBackoff = async (
  requestFunction,
  maxRetries = 3,
  baseDelay = 1000
) => {
  let lastError = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const result = await requestFunction();

      // If successful, return the result
      if (result.success || result.isValid) {
        return result;
      }

      // If not successful but not an error, treat as error for retry logic
      lastError = new Error(result.error || "Request failed");
    } catch (error) {
      lastError = error;
    }

    // If this was the last attempt, break
    if (attempt === maxRetries) {
      break;
    }

    // Calculate delay with exponential backoff and jitter
    const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 1000;
    const maxDelay = 30000; // Maximum 30 seconds
    const actualDelay = Math.min(delay, maxDelay);

    console.log(
      `Retrying AI request in ${actualDelay}ms (attempt ${attempt + 1}/${
        maxRetries + 1
      })`
    );

    // Wait before retrying
    await new Promise((resolve) => setTimeout(resolve, actualDelay));
  }

  // All retries failed, return error result
  const errorResult = handleAPIError(
    lastError,
    "AI request after retries",
    maxRetries
  );
  return {
    success: false,
    isValid: false,
    error: errorResult.message,
    errorType: errorResult.type,
    retryCount: maxRetries,
    ...errorResult,
  };
};

/**
 * Check if AI service is available and properly configured
 * @param {string} apiKey - Gemini API key
 * @returns {Object} Service availability status
 */
export const checkAIServiceHealth = (apiKey) => {
  const issues = [];

  if (!apiKey) {
    issues.push({
      type: "API_KEY_MISSING",
      message: "No Gemini API key provided",
      severity: "critical",
    });
  } else if (typeof apiKey !== "string" || apiKey.trim().length === 0) {
    issues.push({
      type: "API_KEY_INVALID",
      message: "Invalid API key format",
      severity: "critical",
    });
  }

  // Check network connectivity (basic check)
  if (!navigator.onLine) {
    issues.push({
      type: "NETWORK_ERROR",
      message: "No internet connection detected",
      severity: "critical",
    });
  }

  return {
    isHealthy: issues.length === 0,
    issues,
    canFallback: true, // Always allow fallback to PvP mode
  };
};

/**
 * Create user-friendly error messages for different error scenarios
 * @param {Object} errorResult - Error result from handleAPIError
 * @param {string} gameContext - Current game context
 * @returns {Object} User-friendly error information
 */
export const createUserErrorMessage = (errorResult, gameContext = "game") => {
  const { type, message, isRetryable, retryCount, severity } = errorResult;

  const userMessages = {
    API_KEY_INVALID: {
      title: "AI Configuration Issue",
      message:
        "The AI service is not properly configured. Would you like to continue in Player vs Player mode?",
      action: "Switch to PvP",
      canRetry: false,
      canContinue: true,
    },
    API_KEY_MISSING: {
      title: "AI Service Unavailable",
      message:
        "AI mode requires an API key. Would you like to play against another human instead?",
      action: "Switch to PvP",
      canRetry: false,
      canContinue: true,
    },
    RATE_LIMIT: {
      title: "AI Taking a Break",
      message:
        "The AI service is busy right now. You can wait and try again, or switch to Player vs Player mode.",
      action: retryCount < 2 ? "Try Again" : "Switch to PvP",
      canRetry: retryCount < 2,
      canContinue: true,
    },
    QUOTA_EXCEEDED: {
      title: "AI Service Limit Reached",
      message:
        "The AI service has reached its usage limit. Would you like to continue in Player vs Player mode?",
      action: "Switch to PvP",
      canRetry: false,
      canContinue: true,
    },
    NETWORK_ERROR: {
      title: "Connection Problem",
      message:
        "Unable to connect to the AI service. Check your internet connection and try again, or continue in PvP mode.",
      action: retryCount < 3 ? "Try Again" : "Switch to PvP",
      canRetry: retryCount < 3,
      canContinue: true,
    },
    TIMEOUT_ERROR: {
      title: "AI Response Timeout",
      message:
        "The AI is taking longer than expected to respond. You can try again or continue in PvP mode.",
      action: retryCount < 2 ? "Try Again" : "Switch to PvP",
      canRetry: retryCount < 2,
      canContinue: true,
    },
    SERVER_ERROR: {
      title: "AI Service Unavailable",
      message:
        "The AI service is temporarily unavailable. You can try again in a moment or switch to PvP mode.",
      action: retryCount < 2 ? "Try Again" : "Switch to PvP",
      canRetry: retryCount < 2,
      canContinue: true,
    },
    INVALID_RESPONSE: {
      title: "AI Response Error",
      message:
        "The AI provided an unexpected response. The game will continue with a fallback move.",
      action: "Continue",
      canRetry: false,
      canContinue: true,
    },
    UNKNOWN_ERROR: {
      title: "Unexpected Error",
      message:
        "Something unexpected happened with the AI service. The game will continue with a fallback move.",
      action: "Continue",
      canRetry: false,
      canContinue: true,
    },
  };

  const userMessage = userMessages[type] || userMessages.UNKNOWN_ERROR;

  return {
    ...userMessage,
    originalError: message,
    severity,
    timestamp: Date.now(),
  };
};
