// GameModeManager utility module - Handles game mode state management
import {
  GAME_MODES,
  DIFFICULTY_LEVELS,
  PLAYER_TYPES,
} from "../constants/gameConstants";

/**
 * GameModeManager utility functions for managing game modes and player types
 */

/**
 * Switch between different game modes
 * @param {string} currentMode - Current game mode
 * @param {string} newMode - New game mode to switch to
 * @param {string} difficulty - AI difficulty level (only for AI mode)
 * @returns {Object} New game mode configuration
 */
export const switchGameMode = (currentMode, newMode, difficulty = "medium") => {
  if (!Object.values(GAME_MODES).includes(newMode)) {
    throw new Error(`Invalid game mode: ${newMode}`);
  }

  if (
    newMode === GAME_MODES.AI &&
    !Object.values(DIFFICULTY_LEVELS).includes(difficulty)
  ) {
    throw new Error(`Invalid difficulty level: ${difficulty}`);
  }

  return {
    mode: newMode,
    difficulty: newMode === GAME_MODES.AI ? difficulty : undefined,
    humanPlayerColor: newMode === GAME_MODES.AI ? "white" : undefined, // Human always plays white in AI mode
    previousMode: currentMode,
  };
};

/**
 * Determine if it's currently the AI's turn
 * @param {string} currentPlayer - Current player color ('white' | 'black')
 * @param {string} gameMode - Current game mode
 * @param {string} humanPlayerColor - Color the human player is playing (for AI mode)
 * @returns {boolean} True if it's AI's turn
 */
export const isAITurn = (
  currentPlayer,
  gameMode,
  humanPlayerColor = "white"
) => {
  if (gameMode !== GAME_MODES.AI) {
    return false;
  }

  return currentPlayer !== humanPlayerColor;
};

/**
 * Get the player type for a specific color
 * @param {string} color - Player color ('white' | 'black')
 * @param {string} gameMode - Current game mode
 * @param {string} humanPlayerColor - Color the human player is playing (for AI mode)
 * @returns {string} Player type ('human' | 'ai')
 */
export const getPlayerType = (color, gameMode, humanPlayerColor = "white") => {
  if (gameMode === GAME_MODES.PVP) {
    return PLAYER_TYPES.HUMAN;
  }

  if (gameMode === GAME_MODES.AI) {
    return color === humanPlayerColor ? PLAYER_TYPES.HUMAN : PLAYER_TYPES.AI;
  }

  return PLAYER_TYPES.HUMAN; // Default fallback
};

/**
 * Validate game mode configuration
 * @param {Object} config - Game mode configuration object
 * @returns {Object} Validation result with isValid and errors
 */
export const validateGameMode = (config) => {
  const errors = [];

  if (!config.mode) {
    errors.push("Game mode is required");
  } else if (!Object.values(GAME_MODES).includes(config.mode)) {
    errors.push(`Invalid game mode: ${config.mode}`);
  }

  if (config.mode === GAME_MODES.AI) {
    if (!config.difficulty) {
      errors.push("Difficulty level is required for AI mode");
    } else if (!Object.values(DIFFICULTY_LEVELS).includes(config.difficulty)) {
      errors.push(`Invalid difficulty level: ${config.difficulty}`);
    }

    if (!config.humanPlayerColor) {
      errors.push("Human player color is required for AI mode");
    } else if (!["white", "black"].includes(config.humanPlayerColor)) {
      errors.push(`Invalid human player color: ${config.humanPlayerColor}`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Get default configuration for a game mode
 * @param {string} mode - Game mode
 * @returns {Object} Default configuration for the mode
 */
export const getDefaultModeConfig = (mode) => {
  switch (mode) {
    case GAME_MODES.PVP:
      return {
        mode: GAME_MODES.PVP,
        difficulty: undefined,
        humanPlayerColor: undefined,
      };

    case GAME_MODES.AI:
      return {
        mode: GAME_MODES.AI,
        difficulty: DIFFICULTY_LEVELS.MEDIUM,
        humanPlayerColor: "white",
      };

    default:
      throw new Error(`Unknown game mode: ${mode}`);
  }
};

/**
 * Check if a game mode change is allowed during gameplay
 * @param {string} currentMode - Current game mode
 * @param {string} newMode - New game mode to switch to
 * @param {boolean} isGameInProgress - Whether a game is currently in progress
 * @returns {Object} Result with isAllowed and reason
 */
export const canSwitchMode = (currentMode, newMode, isGameInProgress) => {
  if (currentMode === newMode) {
    return {
      isAllowed: false,
      reason: "Already in the selected game mode",
    };
  }

  if (isGameInProgress) {
    return {
      isAllowed: false,
      reason:
        "Cannot switch game modes while a game is in progress. Please reset the game first.",
    };
  }

  return {
    isAllowed: true,
    reason: null,
  };
};

/**
 * Get display name for a game mode
 * @param {string} mode - Game mode
 * @returns {string} Human-readable display name
 */
export const getModeDisplayName = (mode) => {
  switch (mode) {
    case GAME_MODES.PVP:
      return "Player vs Player";
    case GAME_MODES.AI:
      return "Player vs AI";
    default:
      return "Unknown Mode";
  }
};

/**
 * Get display name for a difficulty level
 * @param {string} difficulty - Difficulty level
 * @returns {string} Human-readable display name
 */
export const getDifficultyDisplayName = (difficulty) => {
  switch (difficulty) {
    case DIFFICULTY_LEVELS.EASY:
      return "Easy";
    case DIFFICULTY_LEVELS.MEDIUM:
      return "Medium";
    case DIFFICULTY_LEVELS.HARD:
      return "Hard";
    default:
      return "Unknown";
  }
};

/**
 * Get AI thinking time estimate based on difficulty
 * @param {string} difficulty - Difficulty level
 * @returns {number} Estimated thinking time in milliseconds
 */
export const getAIThinkingTime = (difficulty) => {
  switch (difficulty) {
    case DIFFICULTY_LEVELS.EASY:
      return 1000; // 1 second
    case DIFFICULTY_LEVELS.MEDIUM:
      return 2000; // 2 seconds
    case DIFFICULTY_LEVELS.HARD:
      return 4000; // 4 seconds
    default:
      return 2000; // Default to medium
  }
};
