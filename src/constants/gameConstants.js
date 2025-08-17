// Game Constants and Interfaces
// Core data structures and constants for the chess game

// Piece Types
export const PIECE_TYPES = {
  PAWN: "pawn",
  ROOK: "rook",
  KNIGHT: "knight",
  BISHOP: "bishop",
  QUEEN: "queen",
  KING: "king",
};

// Piece Colors
export const PIECE_COLORS = {
  WHITE: "white",
  BLACK: "black",
};

// Game Status
export const GAME_STATUS = {
  PLAYING: "playing",
  CHECK: "check",
  CHECKMATE: "checkmate",
  STALEMATE: "stalemate",
};

// Board dimensions
export const BOARD_SIZE = 8;

// Unicode chess pieces for display
export const UNICODE_PIECES = {
  [PIECE_COLORS.WHITE]: {
    [PIECE_TYPES.KING]: "♔",
    [PIECE_TYPES.QUEEN]: "♕",
    [PIECE_TYPES.ROOK]: "♖",
    [PIECE_TYPES.BISHOP]: "♗",
    [PIECE_TYPES.KNIGHT]: "♘",
    [PIECE_TYPES.PAWN]: "♙",
  },
  [PIECE_COLORS.BLACK]: {
    [PIECE_TYPES.KING]: "♚",
    [PIECE_TYPES.QUEEN]: "♛",
    [PIECE_TYPES.ROOK]: "♜",
    [PIECE_TYPES.BISHOP]: "♝",
    [PIECE_TYPES.KNIGHT]: "♞",
    [PIECE_TYPES.PAWN]: "♟",
  },
};

// Initial board setup - standard chess starting position
export const INITIAL_BOARD_SETUP = [
  // Row 0 (Black back rank)
  [
    { type: PIECE_TYPES.ROOK, color: PIECE_COLORS.BLACK, hasMoved: false },
    { type: PIECE_TYPES.KNIGHT, color: PIECE_COLORS.BLACK, hasMoved: false },
    { type: PIECE_TYPES.BISHOP, color: PIECE_COLORS.BLACK, hasMoved: false },
    { type: PIECE_TYPES.QUEEN, color: PIECE_COLORS.BLACK, hasMoved: false },
    { type: PIECE_TYPES.KING, color: PIECE_COLORS.BLACK, hasMoved: false },
    { type: PIECE_TYPES.BISHOP, color: PIECE_COLORS.BLACK, hasMoved: false },
    { type: PIECE_TYPES.KNIGHT, color: PIECE_COLORS.BLACK, hasMoved: false },
    { type: PIECE_TYPES.ROOK, color: PIECE_COLORS.BLACK, hasMoved: false },
  ],
  // Row 1 (Black pawns)
  Array(8)
    .fill(null)
    .map(() => ({
      type: PIECE_TYPES.PAWN,
      color: PIECE_COLORS.BLACK,
      hasMoved: false,
    })),
  // Rows 2-5 (Empty squares)
  Array(8).fill(null),
  Array(8).fill(null),
  Array(8).fill(null),
  Array(8).fill(null),
  // Row 6 (White pawns)
  Array(8)
    .fill(null)
    .map(() => ({
      type: PIECE_TYPES.PAWN,
      color: PIECE_COLORS.WHITE,
      hasMoved: false,
    })),
  // Row 7 (White back rank)
  [
    { type: PIECE_TYPES.ROOK, color: PIECE_COLORS.WHITE, hasMoved: false },
    { type: PIECE_TYPES.KNIGHT, color: PIECE_COLORS.WHITE, hasMoved: false },
    { type: PIECE_TYPES.BISHOP, color: PIECE_COLORS.WHITE, hasMoved: false },
    { type: PIECE_TYPES.QUEEN, color: PIECE_COLORS.WHITE, hasMoved: false },
    { type: PIECE_TYPES.KING, color: PIECE_COLORS.WHITE, hasMoved: false },
    { type: PIECE_TYPES.BISHOP, color: PIECE_COLORS.WHITE, hasMoved: false },
    { type: PIECE_TYPES.KNIGHT, color: PIECE_COLORS.WHITE, hasMoved: false },
    { type: PIECE_TYPES.ROOK, color: PIECE_COLORS.WHITE, hasMoved: false },
  ],
];

// Game Actions for useReducer
export const GAME_ACTIONS = {
  SELECT_SQUARE: "SELECT_SQUARE",
  MAKE_MOVE: "MAKE_MOVE",
  RESET_GAME: "RESET_GAME",
  SET_GAME_STATUS: "SET_GAME_STATUS",
  SET_BOARD_STATE: "SET_BOARD_STATE",
  START_PROMOTION: "START_PROMOTION",
  COMPLETE_PROMOTION: "COMPLETE_PROMOTION",
  CANCEL_PROMOTION: "CANCEL_PROMOTION",
};

/**
 * Piece Interface (for documentation)
 * @typedef {Object} Piece
 * @property {string} type - One of PIECE_TYPES values
 * @property {string} color - One of PIECE_COLORS values
 * @property {boolean} hasMoved - Whether piece has moved (for castling/en passant)
 */

/**
 * Move Interface (for documentation)
 * @typedef {Object} Move
 * @property {number[]} from - [row, col] starting position
 * @property {number[]} to - [row, col] ending position
 * @property {Piece} piece - The piece that moved
 * @property {Piece|null} capturedPiece - Piece that was captured (if any)
 * @property {string} notation - Algebraic notation of the move
 * @property {number} timestamp - When the move was made
 */

/**
 * GameState Interface (for documentation)
 * @typedef {Object} GameState
 * @property {(Piece|null)[][]} board - 8x8 array of pieces
 * @property {string} currentPlayer - Current player (white/black)
 * @property {number[]|null} selectedSquare - Currently selected square [row, col]
 * @property {Move[]} moveHistory - Array of all moves made
 * @property {string} gameStatus - Current game status
 * @property {number[][]} validMoves - Array of valid move positions for selected piece
 */

// Piece creation helper functions
export const createPiece = (type, color, hasMoved = false) => ({
  type,
  color,
  hasMoved,
});

// Move creation helper function
export const createMove = (
  from,
  to,
  piece,
  capturedPiece = null,
  notation = "",
  timestamp = Date.now()
) => ({
  from,
  to,
  piece,
  capturedPiece,
  notation,
  timestamp,
});

// Initial game state factory
export const createInitialGameState = () => ({
  board: INITIAL_BOARD_SETUP.map((row) =>
    row.map((piece) => (piece ? { ...piece } : null))
  ),
  currentPlayer: PIECE_COLORS.WHITE,
  selectedSquare: null,
  moveHistory: [],
  gameStatus: GAME_STATUS.PLAYING,
  validMoves: [],
  promotionState: null, // { fromRow, fromCol, toRow, toCol, playerColor }
});

// Piece validation helpers
export const isValidPieceType = (type) =>
  Object.values(PIECE_TYPES).includes(type);

export const isValidPieceColor = (color) =>
  Object.values(PIECE_COLORS).includes(color);

export const isValidGameStatus = (status) =>
  Object.values(GAME_STATUS).includes(status);

// Position validation helpers
export const isValidPosition = (row, col) =>
  row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE;

export const isValidSquare = (square) =>
  Array.isArray(square) &&
  square.length === 2 &&
  isValidPosition(square[0], square[1]);

// Piece comparison helpers
export const isSamePiece = (piece1, piece2) =>
  piece1 &&
  piece2 &&
  piece1.type === piece2.type &&
  piece1.color === piece2.color;

export const isSameColor = (piece1, piece2) =>
  piece1 && piece2 && piece1.color === piece2.color;

export const isOppositeColor = (piece1, piece2) =>
  piece1 && piece2 && piece1.color !== piece2.color;

// Game state helpers
export const getOpponentColor = (color) =>
  color === PIECE_COLORS.WHITE ? PIECE_COLORS.BLACK : PIECE_COLORS.WHITE;

export const isPlayerTurn = (gameState, color) =>
  gameState.currentPlayer === color;

// Board position helpers
export const positionToString = (row, col) => `${row},${col}`;

export const stringToPosition = (posStr) => posStr.split(",").map(Number);

export const isSamePosition = (pos1, pos2) =>
  pos1[0] === pos2[0] && pos1[1] === pos2[1];
