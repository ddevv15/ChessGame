// Comprehensive FEN (Forsyth-Edwards Notation) utilities tests
import {
  pieceToFENChar,
  fenCharToPiece,
  boardToFEN,
  fenToBoard,
  getCastlingRights,
  getEnPassantTarget,
  getHalfmoveClock,
  getFullmoveNumber,
  generateFEN,
  parseFEN,
  isValidFEN,
  getStartingPositionFEN,
  gameStateFromFEN,
} from "../../utils/fenUtils.js";
import {
  PIECE_TYPES,
  PIECE_COLORS,
  createInitialGameState,
} from "../../constants/gameConstants.js";
import { initializeBoard } from "../../utils/boardUtils.js";

describe("FEN Utilities", () => {
  describe("pieceToFENChar", () => {
    test("converts white pieces to uppercase", () => {
      expect(
        pieceToFENChar({ type: PIECE_TYPES.KING, color: PIECE_COLORS.WHITE })
      ).toBe("K");
      expect(
        pieceToFENChar({ type: PIECE_TYPES.QUEEN, color: PIECE_COLORS.WHITE })
      ).toBe("Q");
      expect(
        pieceToFENChar({ type: PIECE_TYPES.ROOK, color: PIECE_COLORS.WHITE })
      ).toBe("R");
      expect(
        pieceToFENChar({ type: PIECE_TYPES.BISHOP, color: PIECE_COLORS.WHITE })
      ).toBe("B");
      expect(
        pieceToFENChar({ type: PIECE_TYPES.KNIGHT, color: PIECE_COLORS.WHITE })
      ).toBe("N");
      expect(
        pieceToFENChar({ type: PIECE_TYPES.PAWN, color: PIECE_COLORS.WHITE })
      ).toBe("P");
    });

    test("converts black pieces to lowercase", () => {
      expect(
        pieceToFENChar({ type: PIECE_TYPES.KING, color: PIECE_COLORS.BLACK })
      ).toBe("k");
      expect(
        pieceToFENChar({ type: PIECE_TYPES.QUEEN, color: PIECE_COLORS.BLACK })
      ).toBe("q");
      expect(
        pieceToFENChar({ type: PIECE_TYPES.ROOK, color: PIECE_COLORS.BLACK })
      ).toBe("r");
      expect(
        pieceToFENChar({ type: PIECE_TYPES.BISHOP, color: PIECE_COLORS.BLACK })
      ).toBe("b");
      expect(
        pieceToFENChar({ type: PIECE_TYPES.KNIGHT, color: PIECE_COLORS.BLACK })
      ).toBe("n");
      expect(
        pieceToFENChar({ type: PIECE_TYPES.PAWN, color: PIECE_COLORS.BLACK })
      ).toBe("p");
    });

    test("returns empty string for null piece", () => {
      expect(pieceToFENChar(null)).toBe("");
      expect(pieceToFENChar(undefined)).toBe("");
    });
  });

  describe("fenCharToPiece", () => {
    test("converts uppercase chars to white pieces", () => {
      expect(fenCharToPiece("K")).toEqual({
        type: PIECE_TYPES.KING,
        color: PIECE_COLORS.WHITE,
        hasMoved: false,
      });
      expect(fenCharToPiece("Q")).toEqual({
        type: PIECE_TYPES.QUEEN,
        color: PIECE_COLORS.WHITE,
        hasMoved: false,
      });
      expect(fenCharToPiece("R")).toEqual({
        type: PIECE_TYPES.ROOK,
        color: PIECE_COLORS.WHITE,
        hasMoved: false,
      });
      expect(fenCharToPiece("B")).toEqual({
        type: PIECE_TYPES.BISHOP,
        color: PIECE_COLORS.WHITE,
        hasMoved: false,
      });
      expect(fenCharToPiece("N")).toEqual({
        type: PIECE_TYPES.KNIGHT,
        color: PIECE_COLORS.WHITE,
        hasMoved: false,
      });
      expect(fenCharToPiece("P")).toEqual({
        type: PIECE_TYPES.PAWN,
        color: PIECE_COLORS.WHITE,
        hasMoved: false,
      });
    });

    test("converts lowercase chars to black pieces", () => {
      expect(fenCharToPiece("k")).toEqual({
        type: PIECE_TYPES.KING,
        color: PIECE_COLORS.BLACK,
        hasMoved: false,
      });
      expect(fenCharToPiece("q")).toEqual({
        type: PIECE_TYPES.QUEEN,
        color: PIECE_COLORS.BLACK,
        hasMoved: false,
      });
      expect(fenCharToPiece("r")).toEqual({
        type: PIECE_TYPES.ROOK,
        color: PIECE_COLORS.BLACK,
        hasMoved: false,
      });
      expect(fenCharToPiece("b")).toEqual({
        type: PIECE_TYPES.BISHOP,
        color: PIECE_COLORS.BLACK,
        hasMoved: false,
      });
      expect(fenCharToPiece("n")).toEqual({
        type: PIECE_TYPES.KNIGHT,
        color: PIECE_COLORS.BLACK,
        hasMoved: false,
      });
      expect(fenCharToPiece("p")).toEqual({
        type: PIECE_TYPES.PAWN,
        color: PIECE_COLORS.BLACK,
        hasMoved: false,
      });
    });

    test("returns null for invalid characters", () => {
      expect(fenCharToPiece("X")).toBeNull();
      expect(fenCharToPiece("1")).toBeNull();
      expect(fenCharToPiece("")).toBeNull();
      expect(fenCharToPiece(null)).toBeNull();
    });
  });

  describe("boardToFEN", () => {
    test("converts starting position correctly", () => {
      const board = initializeBoard();
      const fen = boardToFEN(board);
      expect(fen).toBe("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR");
    });

    test("handles empty board", () => {
      const emptyBoard = Array(8)
        .fill(null)
        .map(() => Array(8).fill(null));
      const fen = boardToFEN(emptyBoard);
      expect(fen).toBe("8/8/8/8/8/8/8/8");
    });

    test("handles mixed pieces and empty squares", () => {
      const board = Array(8)
        .fill(null)
        .map(() => Array(8).fill(null));
      board[0][0] = { type: PIECE_TYPES.ROOK, color: PIECE_COLORS.BLACK };
      board[0][4] = { type: PIECE_TYPES.KING, color: PIECE_COLORS.BLACK };
      board[0][7] = { type: PIECE_TYPES.ROOK, color: PIECE_COLORS.BLACK };
      board[7][0] = { type: PIECE_TYPES.ROOK, color: PIECE_COLORS.WHITE };
      board[7][4] = { type: PIECE_TYPES.KING, color: PIECE_COLORS.WHITE };
      board[7][7] = { type: PIECE_TYPES.ROOK, color: PIECE_COLORS.WHITE };

      const fen = boardToFEN(board);
      expect(fen).toBe("r3k2r/8/8/8/8/8/8/R3K2R");
    });

    test("handles consecutive empty squares", () => {
      const board = Array(8)
        .fill(null)
        .map(() => Array(8).fill(null));
      board[4][4] = { type: PIECE_TYPES.KING, color: PIECE_COLORS.WHITE };

      const fen = boardToFEN(board);
      expect(fen).toBe("8/8/8/8/4K3/8/8/8");
    });
  });

  describe("fenToBoard", () => {
    test("converts starting position FEN to board", () => {
      const fen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR";
      const board = fenToBoard(fen);

      expect(board[0][0]).toEqual({
        type: PIECE_TYPES.ROOK,
        color: PIECE_COLORS.BLACK,
        hasMoved: false,
      });
      expect(board[0][4]).toEqual({
        type: PIECE_TYPES.KING,
        color: PIECE_COLORS.BLACK,
        hasMoved: false,
      });
      expect(board[1][0]).toEqual({
        type: PIECE_TYPES.PAWN,
        color: PIECE_COLORS.BLACK,
        hasMoved: false,
      });
      expect(board[6][0]).toEqual({
        type: PIECE_TYPES.PAWN,
        color: PIECE_COLORS.WHITE,
        hasMoved: false,
      });
      expect(board[7][0]).toEqual({
        type: PIECE_TYPES.ROOK,
        color: PIECE_COLORS.WHITE,
        hasMoved: false,
      });
      expect(board[7][4]).toEqual({
        type: PIECE_TYPES.KING,
        color: PIECE_COLORS.WHITE,
        hasMoved: false,
      });
    });

    test("handles empty squares correctly", () => {
      const fen = "8/8/8/8/4K3/8/8/8";
      const board = fenToBoard(fen);

      expect(board[4][4]).toEqual({
        type: PIECE_TYPES.KING,
        color: PIECE_COLORS.WHITE,
        hasMoved: false,
      });

      // Check that other squares are empty
      expect(board[0][0]).toBeNull();
      expect(board[3][3]).toBeNull();
      expect(board[7][7]).toBeNull();
    });

    test("throws error for invalid FEN", () => {
      expect(() => fenToBoard("")).toThrow("Invalid FEN board string");
      expect(() => fenToBoard(null)).toThrow("Invalid FEN board string");
      expect(() => fenToBoard("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP")).toThrow(
        "FEN board must have exactly 8 rows"
      );
      expect(() =>
        fenToBoard("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR/extra")
      ).toThrow("FEN board must have exactly 8 rows");
    });

    test("throws error for invalid piece characters", () => {
      expect(() =>
        fenToBoard("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBXR")
      ).toThrow("Invalid FEN piece character: X");
    });

    test("throws error for incorrect row length", () => {
      expect(() =>
        fenToBoard("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNRR")
      ).toThrow("FEN row 8 must have exactly 8 squares");
    });
  });

  describe("getCastlingRights", () => {
    test("returns full castling rights for starting position", () => {
      const board = initializeBoard();
      const rights = getCastlingRights(board);
      expect(rights).toBe("KQkq");
    });

    test("returns no castling rights when kings have moved", () => {
      const board = initializeBoard();
      board[7][4].hasMoved = true; // White king moved
      board[0][4].hasMoved = true; // Black king moved

      const rights = getCastlingRights(board);
      expect(rights).toBe("-");
    });

    test("returns partial castling rights when some rooks have moved", () => {
      const board = initializeBoard();
      board[7][0].hasMoved = true; // White queenside rook moved
      board[0][7].hasMoved = true; // Black kingside rook moved

      const rights = getCastlingRights(board);
      expect(rights).toBe("Kq");
    });

    test("handles missing pieces correctly", () => {
      const board = initializeBoard();
      board[7][0] = null; // Remove white queenside rook
      board[0][0] = null; // Remove black queenside rook

      const rights = getCastlingRights(board);
      expect(rights).toBe("Kk");
    });
  });

  describe("getEnPassantTarget", () => {
    test("returns - for no move history", () => {
      expect(getEnPassantTarget([])).toBe("-");
      expect(getEnPassantTarget(null)).toBe("-");
    });

    test("returns - for non-pawn last move", () => {
      const moveHistory = [
        {
          piece: { type: PIECE_TYPES.KNIGHT },
          from: [7, 1],
          to: [5, 2],
        },
      ];
      expect(getEnPassantTarget(moveHistory)).toBe("-");
    });

    test("returns - for single square pawn move", () => {
      const moveHistory = [
        {
          piece: { type: PIECE_TYPES.PAWN },
          from: [6, 4],
          to: [5, 4],
        },
      ];
      expect(getEnPassantTarget(moveHistory)).toBe("-");
    });

    test("returns correct target for white pawn two-square move", () => {
      const moveHistory = [
        {
          piece: { type: PIECE_TYPES.PAWN },
          from: [6, 4], // e2
          to: [4, 4], // e4
        },
      ];
      expect(getEnPassantTarget(moveHistory)).toBe("e3");
    });

    test("returns correct target for black pawn two-square move", () => {
      const moveHistory = [
        {
          piece: { type: PIECE_TYPES.PAWN },
          from: [1, 3], // d7
          to: [3, 3], // d5
        },
      ];
      expect(getEnPassantTarget(moveHistory)).toBe("d6");
    });
  });

  describe("getHalfmoveClock", () => {
    test("returns 0 for empty move history", () => {
      expect(getHalfmoveClock([])).toBe(0);
      expect(getHalfmoveClock(null)).toBe(0);
    });

    test("returns 0 after pawn move", () => {
      const moveHistory = [
        { piece: { type: PIECE_TYPES.KNIGHT }, capturedPiece: null },
        { piece: { type: PIECE_TYPES.PAWN }, capturedPiece: null },
      ];
      expect(getHalfmoveClock(moveHistory)).toBe(0);
    });

    test("returns 0 after capture", () => {
      const moveHistory = [
        { piece: { type: PIECE_TYPES.KNIGHT }, capturedPiece: null },
        {
          piece: { type: PIECE_TYPES.QUEEN },
          capturedPiece: { type: PIECE_TYPES.PAWN },
        },
      ];
      expect(getHalfmoveClock(moveHistory)).toBe(0);
    });

    test("counts moves since last pawn move or capture", () => {
      const moveHistory = [
        { piece: { type: PIECE_TYPES.PAWN }, capturedPiece: null },
        { piece: { type: PIECE_TYPES.KNIGHT }, capturedPiece: null },
        { piece: { type: PIECE_TYPES.BISHOP }, capturedPiece: null },
        { piece: { type: PIECE_TYPES.QUEEN }, capturedPiece: null },
      ];
      expect(getHalfmoveClock(moveHistory)).toBe(3);
    });
  });

  describe("getFullmoveNumber", () => {
    test("returns 1 for empty move history", () => {
      expect(getFullmoveNumber([])).toBe(1);
      expect(getFullmoveNumber(null)).toBe(1);
    });

    test("returns 1 for first move", () => {
      const moveHistory = [{ piece: { type: PIECE_TYPES.PAWN } }];
      expect(getFullmoveNumber(moveHistory)).toBe(1);
    });

    test("returns 2 after both players move", () => {
      const moveHistory = [
        { piece: { type: PIECE_TYPES.PAWN } },
        { piece: { type: PIECE_TYPES.PAWN } },
      ];
      expect(getFullmoveNumber(moveHistory)).toBe(2);
    });

    test("calculates correctly for multiple moves", () => {
      const moveHistory = new Array(10).fill({
        piece: { type: PIECE_TYPES.PAWN },
      });
      expect(getFullmoveNumber(moveHistory)).toBe(6); // 10/2 + 1 = 6
    });
  });

  describe("generateFEN", () => {
    test("generates correct FEN for starting position", () => {
      const gameState = createInitialGameState();
      const fen = generateFEN(gameState);
      expect(fen).toBe(
        "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
      );
    });

    test("generates correct FEN after moves", () => {
      const gameState = createInitialGameState();
      gameState.currentPlayer = PIECE_COLORS.BLACK;
      gameState.moveHistory = [
        {
          piece: { type: PIECE_TYPES.PAWN },
          from: [6, 4],
          to: [4, 4],
          capturedPiece: null,
        },
      ];

      // Move the pawn on the board
      gameState.board[6][4] = null;
      gameState.board[4][4] = {
        type: PIECE_TYPES.PAWN,
        color: PIECE_COLORS.WHITE,
        hasMoved: true,
      };

      const fen = generateFEN(gameState);
      expect(fen).toContain("b"); // Black to move
      expect(fen).toContain("e3"); // En passant target
      expect(fen).toContain("0 1"); // Halfmove and fullmove
    });

    test("throws error for invalid game state", () => {
      expect(() => generateFEN(null)).toThrow("Invalid game state provided");
      expect(() => generateFEN({})).toThrow("Invalid game state provided");
      expect(() => generateFEN({ board: null })).toThrow(
        "Invalid game state provided"
      );
    });
  });

  describe("parseFEN", () => {
    test("parses starting position correctly", () => {
      const fen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
      const parsed = parseFEN(fen);

      expect(parsed.boardPosition).toBe(
        "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR"
      );
      expect(parsed.activeColor).toBe(PIECE_COLORS.WHITE);
      expect(parsed.castlingRights).toBe("KQkq");
      expect(parsed.enPassantTarget).toBe("-");
      expect(parsed.halfmoveClock).toBe(0);
      expect(parsed.fullmoveNumber).toBe(1);
      expect(parsed.board).toBeDefined();
      expect(parsed.board.length).toBe(8);
    });

    test("parses FEN with black to move", () => {
      const fen = "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1";
      const parsed = parseFEN(fen);

      expect(parsed.activeColor).toBe(PIECE_COLORS.BLACK);
      expect(parsed.enPassantTarget).toBe("e3");
    });

    test("throws error for invalid FEN format", () => {
      expect(() => parseFEN("")).toThrow("Invalid FEN string provided");
      expect(() => parseFEN(null)).toThrow("Invalid FEN string provided");
      expect(() =>
        parseFEN("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w")
      ).toThrow("FEN string must have exactly 6 components");
    });

    test("throws error for invalid active color", () => {
      expect(() =>
        parseFEN("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR x KQkq - 0 1")
      ).toThrow("Invalid active color");
    });

    test("throws error for invalid castling rights", () => {
      expect(() =>
        parseFEN("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w XYZ - 0 1")
      ).toThrow("Invalid castling rights");
    });

    test("throws error for invalid en passant target", () => {
      expect(() =>
        parseFEN("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq z9 0 1")
      ).toThrow("Invalid en passant target");
    });

    test("throws error for invalid halfmove clock", () => {
      expect(() =>
        parseFEN("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - -1 1")
      ).toThrow("Invalid halfmove clock");
      expect(() =>
        parseFEN("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - abc 1")
      ).toThrow("Invalid halfmove clock");
    });

    test("throws error for invalid fullmove number", () => {
      expect(() =>
        parseFEN("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 0")
      ).toThrow("Invalid fullmove number");
      expect(() =>
        parseFEN("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 xyz")
      ).toThrow("Invalid fullmove number");
    });
  });

  describe("isValidFEN", () => {
    test("returns true for valid FEN strings", () => {
      expect(
        isValidFEN("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1")
      ).toBe(true);
      expect(isValidFEN("r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1")).toBe(true);
      expect(isValidFEN("8/8/8/8/4K3/8/8/8 w - - 0 1")).toBe(true);
    });

    test("returns false for invalid FEN strings", () => {
      expect(isValidFEN("")).toBe(false);
      expect(isValidFEN("invalid")).toBe(false);
      expect(isValidFEN("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w")).toBe(
        false
      );
      expect(
        isValidFEN("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR x KQkq - 0 1")
      ).toBe(false);
    });
  });

  describe("getStartingPositionFEN", () => {
    test("returns correct starting position FEN", () => {
      const fen = getStartingPositionFEN();
      expect(fen).toBe(
        "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
      );
    });
  });

  describe("gameStateFromFEN", () => {
    test("creates game state from starting position FEN", () => {
      const fen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
      const gameState = gameStateFromFEN(fen);

      expect(gameState.board).toBeDefined();
      expect(gameState.board.length).toBe(8);
      expect(gameState.currentPlayer).toBe(PIECE_COLORS.WHITE);
      expect(gameState.moveHistory).toEqual([]);
      expect(gameState.gameStatus).toBe("playing");
      expect(gameState.selectedSquare).toBeNull();
      expect(gameState.validMoves).toEqual([]);
      expect(gameState.promotionState).toBeNull();
      expect(gameState.fenMetadata).toBeDefined();
      expect(gameState.fenMetadata.castlingRights).toBe("KQkq");
      expect(gameState.fenMetadata.enPassantTarget).toBe("-");
      expect(gameState.fenMetadata.halfmoveClock).toBe(0);
      expect(gameState.fenMetadata.fullmoveNumber).toBe(1);
    });

    test("creates game state with black to move", () => {
      const fen = "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1";
      const gameState = gameStateFromFEN(fen);

      expect(gameState.currentPlayer).toBe(PIECE_COLORS.BLACK);
      expect(gameState.fenMetadata.enPassantTarget).toBe("e3");
    });
  });

  describe("Complex FEN scenarios", () => {
    test("handles Scholar's Mate position", () => {
      const scholarsMate =
        "rnb1kbnr/pppp1ppp/8/4p3/2B1P3/8/PPPP1PPP/RNBQK1NR w KQkq - 2 3";
      expect(isValidFEN(scholarsMate)).toBe(true);

      const parsed = parseFEN(scholarsMate);
      expect(parsed.halfmoveClock).toBe(2);
      expect(parsed.fullmoveNumber).toBe(3);
    });

    test("handles position with limited castling rights", () => {
      const limitedCastling = "r3k2r/8/8/8/8/8/8/R3K2R w Kq - 0 1";
      expect(isValidFEN(limitedCastling)).toBe(true);

      const parsed = parseFEN(limitedCastling);
      expect(parsed.castlingRights).toBe("Kq");
    });

    test("handles endgame position", () => {
      const endgame = "8/8/8/8/8/8/k7/K7 w - - 50 100";
      expect(isValidFEN(endgame)).toBe(true);

      const parsed = parseFEN(endgame);
      expect(parsed.halfmoveClock).toBe(50);
      expect(parsed.fullmoveNumber).toBe(100);
      expect(parsed.castlingRights).toBe("-");
      expect(parsed.enPassantTarget).toBe("-");
    });
  });
});
