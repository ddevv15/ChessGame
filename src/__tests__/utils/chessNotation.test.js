import {
  pieceTypeToSymbol,
  symbolToPieceType,
  moveToAlgebraic,
  parseAlgebraic,
  formatMoveForDisplay,
  createMoveHistoryEntry,
  isValidAlgebraicNotation,
  getMoveType,
  getDisambiguation,
} from "../../utils/chessNotation.js";
import { PIECE_TYPES, PIECE_COLORS } from "../../constants/gameConstants.js";
import { initializeBoard } from "../../utils/boardUtils.js";

describe("Chess Notation Utilities", () => {
  describe("pieceTypeToSymbol", () => {
    test("should convert piece types to correct symbols", () => {
      expect(pieceTypeToSymbol(PIECE_TYPES.KING)).toBe("K");
      expect(pieceTypeToSymbol(PIECE_TYPES.QUEEN)).toBe("Q");
      expect(pieceTypeToSymbol(PIECE_TYPES.ROOK)).toBe("R");
      expect(pieceTypeToSymbol(PIECE_TYPES.BISHOP)).toBe("B");
      expect(pieceTypeToSymbol(PIECE_TYPES.KNIGHT)).toBe("N");
      expect(pieceTypeToSymbol(PIECE_TYPES.PAWN)).toBe("");
    });

    test("should return empty string for unknown piece type", () => {
      expect(pieceTypeToSymbol("unknown")).toBe("");
    });
  });

  describe("symbolToPieceType", () => {
    test("should convert symbols to correct piece types", () => {
      expect(symbolToPieceType("K")).toBe(PIECE_TYPES.KING);
      expect(symbolToPieceType("Q")).toBe(PIECE_TYPES.QUEEN);
      expect(symbolToPieceType("R")).toBe(PIECE_TYPES.ROOK);
      expect(symbolToPieceType("B")).toBe(PIECE_TYPES.BISHOP);
      expect(symbolToPieceType("N")).toBe(PIECE_TYPES.KNIGHT);
      expect(symbolToPieceType("")).toBe(PIECE_TYPES.PAWN);
    });

    test("should return pawn for unknown symbol", () => {
      expect(symbolToPieceType("X")).toBe(PIECE_TYPES.PAWN);
    });
  });

  describe("moveToAlgebraic", () => {
    let board;

    beforeEach(() => {
      board = initializeBoard();
    });

    test("should convert simple pawn move", () => {
      const move = {
        from: { row: 6, col: 4 },
        to: { row: 4, col: 4 },
        piece: { type: PIECE_TYPES.PAWN, color: PIECE_COLORS.WHITE },
        capturedPiece: null,
        promotedPiece: null,
      };

      const newBoard = [...board];
      const notation = moveToAlgebraic(
        move,
        board,
        newBoard,
        PIECE_COLORS.WHITE
      );
      expect(notation).toBe("e4");
    });

    test("should convert pawn capture", () => {
      const move = {
        from: { row: 6, col: 4 },
        to: { row: 5, col: 3 },
        piece: { type: PIECE_TYPES.PAWN, color: PIECE_COLORS.WHITE },
        capturedPiece: { type: PIECE_TYPES.PAWN, color: PIECE_COLORS.BLACK },
        promotedPiece: null,
      };

      const newBoard = [...board];
      const notation = moveToAlgebraic(
        move,
        board,
        newBoard,
        PIECE_COLORS.WHITE
      );
      expect(notation).toBe("exd3");
    });

    test("should convert knight move", () => {
      const move = {
        from: { row: 7, col: 1 },
        to: { row: 5, col: 2 },
        piece: { type: PIECE_TYPES.KNIGHT, color: PIECE_COLORS.WHITE },
        capturedPiece: null,
        promotedPiece: null,
      };

      const newBoard = [...board];
      const notation = moveToAlgebraic(
        move,
        board,
        newBoard,
        PIECE_COLORS.WHITE
      );
      expect(notation).toBe("Nc3");
    });

    test("should convert piece capture", () => {
      const move = {
        from: { row: 7, col: 3 },
        to: { row: 4, col: 6 },
        piece: { type: PIECE_TYPES.QUEEN, color: PIECE_COLORS.WHITE },
        capturedPiece: { type: PIECE_TYPES.PAWN, color: PIECE_COLORS.BLACK },
        promotedPiece: null,
      };

      const newBoard = [...board];
      const notation = moveToAlgebraic(
        move,
        board,
        newBoard,
        PIECE_COLORS.WHITE
      );
      expect(notation).toBe("Qxg4");
    });

    test("should convert pawn promotion", () => {
      const move = {
        from: { row: 1, col: 4 },
        to: { row: 0, col: 4 },
        piece: { type: PIECE_TYPES.PAWN, color: PIECE_COLORS.WHITE },
        capturedPiece: null,
        promotedPiece: { type: PIECE_TYPES.QUEEN, color: PIECE_COLORS.WHITE },
      };

      const newBoard = [...board];
      const notation = moveToAlgebraic(
        move,
        board,
        newBoard,
        PIECE_COLORS.WHITE
      );
      expect(notation).toBe("e8=Q");
    });

    test("should convert kingside castling", () => {
      const move = {
        from: { row: 7, col: 4 },
        to: { row: 7, col: 6 },
        piece: { type: PIECE_TYPES.KING, color: PIECE_COLORS.WHITE },
        capturedPiece: null,
        promotedPiece: null,
      };

      const newBoard = [...board];
      const notation = moveToAlgebraic(
        move,
        board,
        newBoard,
        PIECE_COLORS.WHITE
      );
      expect(notation).toBe("O-O");
    });

    test("should convert queenside castling", () => {
      const move = {
        from: { row: 7, col: 4 },
        to: { row: 7, col: 2 },
        piece: { type: PIECE_TYPES.KING, color: PIECE_COLORS.WHITE },
        capturedPiece: null,
        promotedPiece: null,
      };

      const newBoard = [...board];
      const notation = moveToAlgebraic(
        move,
        board,
        newBoard,
        PIECE_COLORS.WHITE
      );
      expect(notation).toBe("O-O-O");
    });
  });

  describe("parseAlgebraic", () => {
    test("should parse simple pawn move", () => {
      const result = parseAlgebraic("e4");
      expect(result).toEqual({
        type: "normal",
        piece: PIECE_TYPES.PAWN,
        disambiguationFile: undefined,
        disambiguationRank: undefined,
        isCapture: false,
        destination: "e4",
        promotion: PIECE_TYPES.PAWN,
      });
    });

    test("should parse pawn capture", () => {
      const result = parseAlgebraic("exd5");
      expect(result).toEqual({
        type: "normal",
        piece: PIECE_TYPES.PAWN,
        disambiguationFile: "e",
        disambiguationRank: undefined,
        isCapture: true,
        destination: "d5",
        promotion: PIECE_TYPES.PAWN,
      });
    });

    test("should parse knight move", () => {
      const result = parseAlgebraic("Nf3");
      expect(result).toEqual({
        type: "normal",
        piece: PIECE_TYPES.KNIGHT,
        disambiguationFile: undefined,
        disambiguationRank: undefined,
        isCapture: false,
        destination: "f3",
        promotion: PIECE_TYPES.PAWN,
      });
    });

    test("should parse piece capture", () => {
      const result = parseAlgebraic("Qxd8");
      expect(result).toEqual({
        type: "normal",
        piece: PIECE_TYPES.QUEEN,
        disambiguationFile: undefined,
        disambiguationRank: undefined,
        isCapture: true,
        destination: "d8",
        promotion: PIECE_TYPES.PAWN,
      });
    });

    test("should parse promotion", () => {
      const result = parseAlgebraic("e8=Q");
      expect(result).toEqual({
        type: "normal",
        piece: PIECE_TYPES.PAWN,
        disambiguationFile: undefined,
        disambiguationRank: undefined,
        isCapture: false,
        destination: "e8",
        promotion: PIECE_TYPES.QUEEN,
      });
    });

    test("should parse kingside castling", () => {
      const result = parseAlgebraic("O-O");
      expect(result).toEqual({
        type: "castling",
        side: "kingside",
      });
    });

    test("should parse queenside castling", () => {
      const result = parseAlgebraic("O-O-O");
      expect(result).toEqual({
        type: "castling",
        side: "queenside",
      });
    });

    test("should handle check and checkmate indicators", () => {
      const checkResult = parseAlgebraic("Qh5+");
      expect(checkResult.destination).toBe("h5");

      const checkmateResult = parseAlgebraic("Qh7#");
      expect(checkmateResult.destination).toBe("h7");
    });

    test("should return null for invalid notation", () => {
      expect(parseAlgebraic("")).toBeNull();
      expect(parseAlgebraic(null)).toBeNull();
      expect(parseAlgebraic("invalid")).toBeNull();
      expect(parseAlgebraic("z9")).toBeNull();
    });
  });

  describe("formatMoveForDisplay", () => {
    test("should format white move correctly", () => {
      const move = { notation: "e4" };
      const result = formatMoveForDisplay(move, 1, PIECE_COLORS.WHITE);
      expect(result).toBe("1. e4");
    });

    test("should format black move correctly", () => {
      const move = { notation: "e5" };
      const result = formatMoveForDisplay(move, 1, PIECE_COLORS.BLACK);
      expect(result).toBe("1... e5");
    });
  });

  describe("createMoveHistoryEntry", () => {
    test("should create complete move history entry", () => {
      const move = {
        from: { row: 6, col: 4 },
        to: { row: 4, col: 4 },
        piece: { type: PIECE_TYPES.PAWN, color: PIECE_COLORS.WHITE },
        capturedPiece: null,
        promotedPiece: null,
      };

      const board = initializeBoard();
      const newBoard = [...board];

      const entry = createMoveHistoryEntry(
        move,
        board,
        newBoard,
        PIECE_COLORS.WHITE,
        1
      );

      expect(entry).toMatchObject({
        from: { row: 6, col: 4 },
        to: { row: 4, col: 4 },
        piece: { type: PIECE_TYPES.PAWN, color: PIECE_COLORS.WHITE },
        notation: "e4",
        moveNumber: 1,
        player: PIECE_COLORS.WHITE,
        displayText: "1. e4",
      });
      expect(entry.timestamp).toBeDefined();
    });
  });

  describe("isValidAlgebraicNotation", () => {
    test("should validate correct notation formats", () => {
      expect(isValidAlgebraicNotation("e4")).toBe(true);
      expect(isValidAlgebraicNotation("Nf3")).toBe(true);
      expect(isValidAlgebraicNotation("Qxd8+")).toBe(true);
      expect(isValidAlgebraicNotation("O-O")).toBe(true);
      expect(isValidAlgebraicNotation("O-O-O")).toBe(true);
      expect(isValidAlgebraicNotation("e8=Q#")).toBe(true);
      expect(isValidAlgebraicNotation("Nbd7")).toBe(true);
      expect(isValidAlgebraicNotation("R1a3")).toBe(true);
    });

    test("should reject invalid notation formats", () => {
      expect(isValidAlgebraicNotation("")).toBe(false);
      expect(isValidAlgebraicNotation(null)).toBe(false);
      expect(isValidAlgebraicNotation("z9")).toBe(false);
      expect(isValidAlgebraicNotation("invalid")).toBe(false);
      expect(isValidAlgebraicNotation("e9")).toBe(false);
      expect(isValidAlgebraicNotation("i4")).toBe(false);
    });
  });

  describe("getMoveType", () => {
    test("should identify move types correctly", () => {
      expect(getMoveType("O-O")).toBe("castling");
      expect(getMoveType("O-O-O")).toBe("castling");
      expect(getMoveType("Qxd8")).toBe("capture");
      expect(getMoveType("e8=Q")).toBe("promotion");
      expect(getMoveType("Nf3+")).toBe("check");
      expect(getMoveType("Qh7#")).toBe("checkmate");
      expect(getMoveType("e4")).toBe("normal");
      expect(getMoveType("")).toBe("unknown");
      expect(getMoveType(null)).toBe("unknown");
    });
  });

  describe("getDisambiguation", () => {
    test("should not require disambiguation for pawns and kings", () => {
      const board = initializeBoard();
      const pawnMove = {
        from: { row: 6, col: 4 },
        to: { row: 4, col: 4 },
        piece: { type: PIECE_TYPES.PAWN, color: PIECE_COLORS.WHITE },
      };

      const result = getDisambiguation(board, pawnMove);
      expect(result).toEqual({ needsFile: false, needsRank: false });
    });

    test("should not require disambiguation when no conflicts exist", () => {
      const board = initializeBoard();
      const knightMove = {
        from: { row: 7, col: 1 },
        to: { row: 5, col: 2 },
        piece: { type: PIECE_TYPES.KNIGHT, color: PIECE_COLORS.WHITE },
      };

      const result = getDisambiguation(board, knightMove);
      expect(result).toEqual({ needsFile: false, needsRank: false });
    });
  });
});
