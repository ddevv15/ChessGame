// Tests for FEN (Forsyth-Edwards Notation) utilities
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
  createMove,
} from "../../constants/gameConstants.js";
import { initializeBoard } from "../../utils/boardUtils.js";

describe("FEN Utilities", () => {
  describe("pieceToFENChar", () => {
    test("converts white pieces to uppercase FEN characters", () => {
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

    test("converts black pieces to lowercase FEN characters", () => {
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
    test("converts uppercase FEN characters to white pieces", () => {
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
    });

    test("converts lowercase FEN characters to black pieces", () => {
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
    });

    test("returns null for invalid characters", () => {
      expect(fenCharToPiece("X")).toBeNull();
      expect(fenCharToPiece("1")).toBeNull();
      expect(fenCharToPiece("")).toBeNull();
      expect(fenCharToPiece(null)).toBeNull();
    });
  });

  describe("boardToFEN", () => {
    test("converts starting position board to correct FEN", () => {
      const board = initializeBoard();
      const fenBoard = boardToFEN(board);
      expect(fenBoard).toBe("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR");
    });

    test("handles empty board correctly", () => {
      const emptyBoard = Array(8)
        .fill(null)
        .map(() => Array(8).fill(null));
      const fenBoard = boardToFEN(emptyBoard);
      expect(fenBoard).toBe("8/8/8/8/8/8/8/8");
    });

    test("handles mixed pieces and empty squares", () => {
      const board = Array(8)
        .fill(null)
        .map(() => Array(8).fill(null));
      // Place a white king on e1 and black king on e8
      board[7][4] = {
        type: PIECE_TYPES.KING,
        color: PIECE_COLORS.WHITE,
        hasMoved: false,
      };
      board[0][4] = {
        type: PIECE_TYPES.KING,
        color: PIECE_COLORS.BLACK,
        hasMoved: false,
      };

      const fenBoard = boardToFEN(board);
      expect(fenBoard).toBe("4k3/8/8/8/8/8/8/4K3");
    });

    test("handles consecutive empty squares correctly", () => {
      const board = Array(8)
        .fill(null)
        .map(() => Array(8).fill(null));
      // Place pieces with gaps
      board[0][0] = {
        type: PIECE_TYPES.ROOK,
        color: PIECE_COLORS.BLACK,
        hasMoved: false,
      };
      board[0][7] = {
        type: PIECE_TYPES.ROOK,
        color: PIECE_COLORS.BLACK,
        hasMoved: false,
      };

      const fenBoard = boardToFEN(board);
      expect(fenBoard).toBe("r6r/8/8/8/8/8/8/8");
    });
  });

  describe("fenToBoard", () => {
    test("converts starting position FEN to correct board", () => {
      const fenBoard = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR";
      const board = fenToBoard(fenBoard);
      const expectedBoard = initializeBoard();

      expect(board).toEqual(expectedBoard);
    });

    test("converts empty board FEN correctly", () => {
      const fenBoard = "8/8/8/8/8/8/8/8";
      const board = fenToBoard(fenBoard);
      const expectedBoard = Array(8)
        .fill(null)
        .map(() => Array(8).fill(null));

      expect(board).toEqual(expectedBoard);
    });

    test("handles mixed pieces and empty squares", () => {
      const fenBoard = "4k3/8/8/8/8/8/8/4K3";
      const board = fenToBoard(fenBoard);

      expect(board[0][4]).toEqual({
        type: PIECE_TYPES.KING,
        color: PIECE_COLORS.BLACK,
        hasMoved: false,
      });
      expect(board[7][4]).toEqual({
        type: PIECE_TYPES.KING,
        color: PIECE_COLORS.WHITE,
        hasMoved: false,
      });
      expect(board[0][0]).toBeNull();
      expect(board[4][4]).toBeNull();
    });

    test("throws error for invalid FEN board strings", () => {
      expect(() => fenToBoard("")).toThrow("Invalid FEN board string");
      expect(() => fenToBoard(null)).toThrow("Invalid FEN board string");
      expect(() => fenToBoard("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP")).toThrow(
        "FEN board must have exactly 8 rows"
      );
      expect(() =>
        fenToBoard("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR/extra")
      ).toThrow("FEN board must have exactly 8 rows");
      expect(() =>
        fenToBoard("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNX")
      ).toThrow("Invalid FEN piece character: X");
    });
  });

  describe("getCastlingRights", () => {
    test("returns full castling rights for starting position", () => {
      const board = initializeBoard();
      const castlingRights = getCastlingRights(board);
      expect(castlingRights).toBe("KQkq");
    });

    test("returns no castling rights when kings have moved", () => {
      const board = initializeBoard();
      // Mark kings as moved
      board[7][4].hasMoved = true; // White king
      board[0][4].hasMoved = true; // Black king

      const castlingRights = getCastlingRights(board);
      expect(castlingRights).toBe("-");
    });

    test("returns partial castling rights when some rooks have moved", () => {
      const board = initializeBoard();
      // Mark white queenside rook as moved
      board[7][0].hasMoved = true;
      // Mark black kingside rook as moved
      board[0][7].hasMoved = true;

      const castlingRights = getCastlingRights(board);
      expect(castlingRights).toBe("Kq");
    });

    test("returns no castling rights when kings are not in starting positions", () => {
      const board = initializeBoard();
      // Move kings to different positions
      board[7][3] = board[7][4]; // Move white king
      board[7][4] = null;
      board[0][3] = board[0][4]; // Move black king
      board[0][4] = null;

      const castlingRights = getCastlingRights(board);
      expect(castlingRights).toBe("-");
    });
  });

  describe("getEnPassantTarget", () => {
    test("returns '-' for empty move history", () => {
      expect(getEnPassantTarget([])).toBe("-");
      expect(getEnPassantTarget(null)).toBe("-");
      expect(getEnPassantTarget(undefined)).toBe("-");
    });

    test("returns '-' when last move was not a pawn double move", () => {
      const moves = [
        createMove([6, 4], [4, 4], {
          type: PIECE_TYPES.PAWN,
          color: PIECE_COLORS.WHITE,
        }),
        createMove([1, 4], [3, 4], {
          type: PIECE_TYPES.PAWN,
          color: PIECE_COLORS.BLACK,
        }),
        createMove([7, 1], [5, 2], {
          type: PIECE_TYPES.KNIGHT,
          color: PIECE_COLORS.WHITE,
        }),
      ];

      expect(getEnPassantTarget(moves)).toBe("-");
    });

    test("returns correct en passant target for white pawn double move", () => {
      const moves = [
        createMove([6, 4], [4, 4], {
          type: PIECE_TYPES.PAWN,
          color: PIECE_COLORS.WHITE,
        }),
      ];

      expect(getEnPassantTarget(moves)).toBe("e3");
    });

    test("returns correct en passant target for black pawn double move", () => {
      const moves = [
        createMove([6, 4], [4, 4], {
          type: PIECE_TYPES.PAWN,
          color: PIECE_COLORS.WHITE,
        }),
        createMove([1, 3], [3, 3], {
          type: PIECE_TYPES.PAWN,
          color: PIECE_COLORS.BLACK,
        }),
      ];

      expect(getEnPassantTarget(moves)).toBe("d6");
    });

    test("returns correct en passant target for different files", () => {
      const moves = [
        createMove([1, 0], [3, 0], {
          type: PIECE_TYPES.PAWN,
          color: PIECE_COLORS.BLACK,
        }),
      ];

      expect(getEnPassantTarget(moves)).toBe("a6");
    });
  });

  describe("getHalfmoveClock", () => {
    test("returns 0 for empty move history", () => {
      expect(getHalfmoveClock([])).toBe(0);
      expect(getHalfmoveClock(null)).toBe(0);
      expect(getHalfmoveClock(undefined)).toBe(0);
    });

    test("returns 0 when last move was a pawn move", () => {
      const moves = [
        createMove([7, 1], [5, 2], {
          type: PIECE_TYPES.KNIGHT,
          color: PIECE_COLORS.WHITE,
        }),
        createMove([6, 4], [4, 4], {
          type: PIECE_TYPES.PAWN,
          color: PIECE_COLORS.WHITE,
        }),
      ];

      expect(getHalfmoveClock(moves)).toBe(0);
    });

    test("returns 0 when last move was a capture", () => {
      const capturedPiece = {
        type: PIECE_TYPES.PAWN,
        color: PIECE_COLORS.BLACK,
      };
      const moves = [
        createMove([7, 1], [5, 2], {
          type: PIECE_TYPES.KNIGHT,
          color: PIECE_COLORS.WHITE,
        }),
        createMove(
          [5, 2],
          [3, 4],
          { type: PIECE_TYPES.KNIGHT, color: PIECE_COLORS.WHITE },
          capturedPiece
        ),
      ];

      expect(getHalfmoveClock(moves)).toBe(0);
    });

    test("counts moves since last pawn move or capture", () => {
      const moves = [
        createMove([6, 4], [4, 4], {
          type: PIECE_TYPES.PAWN,
          color: PIECE_COLORS.WHITE,
        }),
        createMove([7, 1], [5, 2], {
          type: PIECE_TYPES.KNIGHT,
          color: PIECE_COLORS.WHITE,
        }),
        createMove([0, 1], [2, 2], {
          type: PIECE_TYPES.KNIGHT,
          color: PIECE_COLORS.BLACK,
        }),
        createMove([7, 6], [5, 5], {
          type: PIECE_TYPES.KNIGHT,
          color: PIECE_COLORS.WHITE,
        }),
      ];

      expect(getHalfmoveClock(moves)).toBe(3);
    });
  });

  describe("getFullmoveNumber", () => {
    test("returns 1 for empty move history", () => {
      expect(getFullmoveNumber([])).toBe(1);
      expect(getFullmoveNumber(null)).toBe(1);
      expect(getFullmoveNumber(undefined)).toBe(1);
    });

    test("returns 1 for first move (white)", () => {
      const moves = [
        createMove([6, 4], [4, 4], {
          type: PIECE_TYPES.PAWN,
          color: PIECE_COLORS.WHITE,
        }),
      ];

      expect(getFullmoveNumber(moves)).toBe(1);
    });

    test("returns 2 after both players have moved once", () => {
      const moves = [
        createMove([6, 4], [4, 4], {
          type: PIECE_TYPES.PAWN,
          color: PIECE_COLORS.WHITE,
        }),
        createMove([1, 4], [3, 4], {
          type: PIECE_TYPES.PAWN,
          color: PIECE_COLORS.BLACK,
        }),
      ];

      expect(getFullmoveNumber(moves)).toBe(2);
    });

    test("returns correct number for multiple moves", () => {
      const moves = [
        createMove([6, 4], [4, 4], {
          type: PIECE_TYPES.PAWN,
          color: PIECE_COLORS.WHITE,
        }),
        createMove([1, 4], [3, 4], {
          type: PIECE_TYPES.PAWN,
          color: PIECE_COLORS.BLACK,
        }),
        createMove([7, 1], [5, 2], {
          type: PIECE_TYPES.KNIGHT,
          color: PIECE_COLORS.WHITE,
        }),
        createMove([0, 1], [2, 2], {
          type: PIECE_TYPES.KNIGHT,
          color: PIECE_COLORS.BLACK,
        }),
        createMove([7, 6], [5, 5], {
          type: PIECE_TYPES.KNIGHT,
          color: PIECE_COLORS.WHITE,
        }),
      ];

      expect(getFullmoveNumber(moves)).toBe(3);
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

    test("generates correct FEN after first move", () => {
      const gameState = createInitialGameState();
      gameState.currentPlayer = PIECE_COLORS.BLACK;
      gameState.moveHistory = [
        createMove([6, 4], [4, 4], {
          type: PIECE_TYPES.PAWN,
          color: PIECE_COLORS.WHITE,
        }),
      ];
      // Update board to reflect the move
      gameState.board[4][4] = {
        type: PIECE_TYPES.PAWN,
        color: PIECE_COLORS.WHITE,
        hasMoved: true,
      };
      gameState.board[6][4] = null;

      const fen = generateFEN(gameState);
      expect(fen).toBe(
        "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1"
      );
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
    test("parses starting position FEN correctly", () => {
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
      expect(parsed.board).toEqual(initializeBoard());
    });

    test("parses FEN with black to move", () => {
      const fen = "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e6 0 1";
      const parsed = parseFEN(fen);

      expect(parsed.activeColor).toBe(PIECE_COLORS.BLACK);
      expect(parsed.enPassantTarget).toBe("e6");
    });

    test("throws error for invalid FEN strings", () => {
      expect(() => parseFEN("")).toThrow("Invalid FEN string provided");
      expect(() => parseFEN(null)).toThrow("Invalid FEN string provided");
      expect(() =>
        parseFEN("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq")
      ).toThrow("FEN string must have exactly 6 components");
      expect(() =>
        parseFEN("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR x KQkq - 0 1")
      ).toThrow("Invalid active color in FEN string");
      expect(() =>
        parseFEN("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkqX - 0 1")
      ).toThrow("Invalid castling rights in FEN string");
      expect(() =>
        parseFEN("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq z9 0 1")
      ).toThrow("Invalid en passant target in FEN string");
      expect(() =>
        parseFEN("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - -1 1")
      ).toThrow("Invalid halfmove clock in FEN string");
      expect(() =>
        parseFEN("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 0")
      ).toThrow("Invalid fullmove number in FEN string");
    });
  });

  describe("isValidFEN", () => {
    test("returns true for valid FEN strings", () => {
      expect(
        isValidFEN("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1")
      ).toBe(true);
      expect(
        isValidFEN(
          "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e6 0 1"
        )
      ).toBe(true);
      expect(isValidFEN("8/8/8/8/8/8/8/8 w - - 0 1")).toBe(true);
    });

    test("returns false for invalid FEN strings", () => {
      expect(isValidFEN("")).toBe(false);
      expect(isValidFEN(null)).toBe(false);
      expect(isValidFEN("invalid")).toBe(false);
      expect(
        isValidFEN("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq")
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
    test("creates correct game state from starting position FEN", () => {
      const fen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
      const gameState = gameStateFromFEN(fen);

      expect(gameState.board).toEqual(initializeBoard());
      expect(gameState.currentPlayer).toBe(PIECE_COLORS.WHITE);
      expect(gameState.moveHistory).toEqual([]);
      expect(gameState.gameStatus).toBe("playing");
      expect(gameState.selectedSquare).toBeNull();
      expect(gameState.validMoves).toEqual([]);
      expect(gameState.promotionState).toBeNull();
      expect(gameState.fenMetadata).toEqual({
        castlingRights: "KQkq",
        enPassantTarget: "-",
        halfmoveClock: 0,
        fullmoveNumber: 1,
      });
    });

    test("creates correct game state from mid-game FEN", () => {
      const fen = "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e6 0 1";
      const gameState = gameStateFromFEN(fen);

      expect(gameState.currentPlayer).toBe(PIECE_COLORS.BLACK);
      expect(gameState.fenMetadata.enPassantTarget).toBe("e6");
    });
  });
});
