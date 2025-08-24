// Comprehensive SAN (Standard Algebraic Notation) utilities tests
import {
  parseSANComponents,
  findSourceSquare,
  parseSANMove,
  validateSANMove,
  moveToSAN,
  getDisambiguation,
  parseMoveList,
  validateMoveSequence,
} from "../../utils/sanUtils.js";
import { PIECE_TYPES, PIECE_COLORS } from "../../constants/gameConstants.js";
import { initializeBoard } from "../../utils/boardUtils.js";

describe("SAN Utilities", () => {
  describe("parseSANComponents", () => {
    test("parses simple pawn moves", () => {
      const components = parseSANComponents("e4");
      expect(components.piece).toBe(PIECE_TYPES.PAWN);
      expect(components.toSquare).toBe("e4");
      expect(components.isCapture).toBe(false);
      expect(components.isCheck).toBe(false);
      expect(components.isCheckmate).toBe(false);
    });

    test("parses piece moves", () => {
      const components = parseSANComponents("Nf3");
      expect(components.piece).toBe(PIECE_TYPES.KNIGHT);
      expect(components.toSquare).toBe("f3");
      expect(components.isCapture).toBe(false);
    });

    test("parses captures", () => {
      const components = parseSANComponents("exd5");
      expect(components.piece).toBe(PIECE_TYPES.PAWN);
      expect(components.toSquare).toBe("d5");
      expect(components.isCapture).toBe(true);
      expect(components.fromFile).toBe("e");
    });

    test("parses piece captures", () => {
      const components = parseSANComponents("Nxf7");
      expect(components.piece).toBe(PIECE_TYPES.KNIGHT);
      expect(components.toSquare).toBe("f7");
      expect(components.isCapture).toBe(true);
    });

    test("parses check moves", () => {
      const components = parseSANComponents("Qh5+");
      expect(components.piece).toBe(PIECE_TYPES.QUEEN);
      expect(components.toSquare).toBe("h5");
      expect(components.isCheck).toBe(true);
      expect(components.isCheckmate).toBe(false);
    });

    test("parses checkmate moves", () => {
      const components = parseSANComponents("Qh7#");
      expect(components.piece).toBe(PIECE_TYPES.QUEEN);
      expect(components.toSquare).toBe("h7");
      expect(components.isCheck).toBe(false);
      expect(components.isCheckmate).toBe(true);
    });

    test("parses kingside castling", () => {
      const components1 = parseSANComponents("O-O");
      expect(components1.isKingsideCastle).toBe(true);
      expect(components1.isQueensideCastle).toBe(false);

      const components2 = parseSANComponents("0-0");
      expect(components2.isKingsideCastle).toBe(true);
    });

    test("parses queenside castling", () => {
      const components1 = parseSANComponents("O-O-O");
      expect(components1.isQueensideCastle).toBe(true);
      expect(components1.isKingsideCastle).toBe(false);

      const components2 = parseSANComponents("0-0-0");
      expect(components2.isQueensideCastle).toBe(true);
    });

    test("parses pawn promotion", () => {
      const components = parseSANComponents("e8=Q");
      expect(components.piece).toBe(PIECE_TYPES.PAWN);
      expect(components.toSquare).toBe("e8");
      expect(components.promotionPiece).toBe(PIECE_TYPES.QUEEN);
    });

    test("parses pawn promotion with capture", () => {
      const components = parseSANComponents("dxe8=R+");
      expect(components.piece).toBe(PIECE_TYPES.PAWN);
      expect(components.toSquare).toBe("e8");
      expect(components.isCapture).toBe(true);
      expect(components.fromFile).toBe("d");
      expect(components.promotionPiece).toBe(PIECE_TYPES.ROOK);
      expect(components.isCheck).toBe(true);
    });

    test("parses disambiguation by file", () => {
      const components = parseSANComponents("Nbd7");
      expect(components.piece).toBe(PIECE_TYPES.KNIGHT);
      expect(components.toSquare).toBe("d7");
      expect(components.fromFile).toBe("b");
      expect(components.fromRank).toBeNull();
    });

    test("parses disambiguation by rank", () => {
      const components = parseSANComponents("R1a3");
      expect(components.piece).toBe(PIECE_TYPES.ROOK);
      expect(components.toSquare).toBe("a3");
      expect(components.fromFile).toBeNull();
      expect(components.fromRank).toBe(1);
    });

    test("parses disambiguation by both file and rank", () => {
      const components = parseSANComponents("Qd1d4");
      expect(components.piece).toBe(PIECE_TYPES.QUEEN);
      expect(components.toSquare).toBe("d4");
      expect(components.fromFile).toBe("d");
      expect(components.fromRank).toBe(1);
    });

    test("throws error for invalid SAN", () => {
      expect(() => parseSANComponents("")).toThrow("Invalid SAN move string");
      expect(() => parseSANComponents(null)).toThrow("Invalid SAN move string");
      expect(() => parseSANComponents("invalid")).toThrow(
        "no valid destination square found"
      );
    });
  });

  describe("findSourceSquare", () => {
    test("finds source square for simple pawn move", () => {
      const board = initializeBoard();
      const components = parseSANComponents("e4");
      const source = findSourceSquare(board, components, PIECE_COLORS.WHITE);
      expect(source).toEqual([6, 4]); // e2
    });

    test("finds source square for knight move", () => {
      const board = initializeBoard();
      const components = parseSANComponents("Nf3");
      const source = findSourceSquare(board, components, PIECE_COLORS.WHITE);
      expect(source).toEqual([7, 6]); // g1
    });

    test("finds source square with disambiguation", () => {
      const board = initializeBoard();
      // Move knights to create ambiguity
      board[5][5] = {
        type: PIECE_TYPES.KNIGHT,
        color: PIECE_COLORS.WHITE,
        hasMoved: true,
      };
      board[5][2] = {
        type: PIECE_TYPES.KNIGHT,
        color: PIECE_COLORS.WHITE,
        hasMoved: true,
      };
      board[7][1] = null; // Remove original knight
      board[7][6] = null; // Remove original knight

      const components = parseSANComponents("Nce4");
      const source = findSourceSquare(board, components, PIECE_COLORS.WHITE);
      expect(source).toEqual([5, 2]); // c6 knight
    });

    test("handles castling moves", () => {
      const board = initializeBoard();
      const kingsideComponents = parseSANComponents("O-O");
      const queensideComponents = parseSANComponents("O-O-O");

      const kingsideSource = findSourceSquare(
        board,
        kingsideComponents,
        PIECE_COLORS.WHITE
      );
      const queensideSource = findSourceSquare(
        board,
        queensideComponents,
        PIECE_COLORS.WHITE
      );

      expect(kingsideSource).toEqual([7, 4]); // e1
      expect(queensideSource).toEqual([7, 4]); // e1
    });

    test("throws error when no piece can make the move", () => {
      const board = initializeBoard();
      const components = parseSANComponents("Nf6"); // No white knight can reach f6 from starting position

      expect(() =>
        findSourceSquare(board, components, PIECE_COLORS.WHITE)
      ).toThrow("No knight can move to f6");
    });

    test("throws error for ambiguous moves without disambiguation", () => {
      const board = Array(8)
        .fill(null)
        .map(() => Array(8).fill(null));
      board[7][4] = { type: PIECE_TYPES.KING, color: PIECE_COLORS.WHITE };
      board[0][4] = { type: PIECE_TYPES.KING, color: PIECE_COLORS.BLACK };
      // Place knights that can both reach e4 (row 4, col 4)
      board[2][5] = { type: PIECE_TYPES.KNIGHT, color: PIECE_COLORS.WHITE }; // f6 knight
      board[2][2] = { type: PIECE_TYPES.KNIGHT, color: PIECE_COLORS.WHITE }; // c6 knight

      const components = parseSANComponents("Ne4");
      expect(() =>
        findSourceSquare(board, components, PIECE_COLORS.WHITE)
      ).toThrow("Ambiguous move");
    });
  });

  describe("parseSANMove", () => {
    test("parses simple pawn move", () => {
      const board = initializeBoard();
      const move = parseSANMove("e4", board, PIECE_COLORS.WHITE);

      expect(move.from).toEqual([6, 4]);
      expect(move.to).toEqual([4, 4]);
      expect(move.piece.type).toBe(PIECE_TYPES.PAWN);
      expect(move.piece.color).toBe(PIECE_COLORS.WHITE);
      expect(move.isCapture).toBe(false);
      expect(move.isCastle).toBe(false);
    });

    test("parses knight move", () => {
      const board = initializeBoard();
      const move = parseSANMove("Nf3", board, PIECE_COLORS.WHITE);

      expect(move.from).toEqual([7, 6]);
      expect(move.to).toEqual([5, 5]);
      expect(move.piece.type).toBe(PIECE_TYPES.KNIGHT);
    });

    test("parses capture move", () => {
      const board = initializeBoard();
      // Place a black pawn for white to capture
      board[3][3] = { type: PIECE_TYPES.PAWN, color: PIECE_COLORS.BLACK };
      // Move white pawn to position for capture
      board[4][4] = {
        type: PIECE_TYPES.PAWN,
        color: PIECE_COLORS.WHITE,
        hasMoved: true,
      };
      board[6][4] = null;

      const move = parseSANMove("exd5", board, PIECE_COLORS.WHITE);

      expect(move.from).toEqual([4, 4]);
      expect(move.to).toEqual([3, 3]);
      expect(move.isCapture).toBe(true);
    });

    test("parses kingside castling", () => {
      const board = initializeBoard();
      // Clear squares between king and rook
      board[7][5] = null; // f1
      board[7][6] = null; // g1

      const move = parseSANMove("O-O", board, PIECE_COLORS.WHITE);

      expect(move.from).toEqual([7, 4]);
      expect(move.to).toEqual([7, 6]);
      expect(move.isCastle).toBe(true);
      expect(move.isKingsideCastle).toBe(true);
    });

    test("parses queenside castling", () => {
      const board = initializeBoard();
      // Clear squares between king and rook
      board[7][1] = null; // b1
      board[7][2] = null; // c1
      board[7][3] = null; // d1

      const move = parseSANMove("O-O-O", board, PIECE_COLORS.WHITE);

      expect(move.from).toEqual([7, 4]);
      expect(move.to).toEqual([7, 2]);
      expect(move.isCastle).toBe(true);
      expect(move.isQueensideCastle).toBe(true);
    });

    test("parses pawn promotion", () => {
      const board = Array(8)
        .fill(null)
        .map(() => Array(8).fill(null));
      board[7][4] = { type: PIECE_TYPES.KING, color: PIECE_COLORS.WHITE };
      board[0][3] = { type: PIECE_TYPES.KING, color: PIECE_COLORS.BLACK }; // Move black king to d8
      board[1][4] = {
        type: PIECE_TYPES.PAWN,
        color: PIECE_COLORS.WHITE,
        hasMoved: true,
      };

      const move = parseSANMove("e8=Q", board, PIECE_COLORS.WHITE);

      expect(move.from).toEqual([1, 4]);
      expect(move.to).toEqual([0, 4]);
      expect(move.promotionPiece).toBe(PIECE_TYPES.QUEEN);
    });
  });

  describe("validateSANMove", () => {
    test("validates legal moves", () => {
      const board = initializeBoard();
      expect(validateSANMove("e4", board, PIECE_COLORS.WHITE)).toBe(true);
      expect(validateSANMove("Nf3", board, PIECE_COLORS.WHITE)).toBe(true);
      expect(validateSANMove("d3", board, PIECE_COLORS.WHITE)).toBe(true);
    });

    test("rejects illegal moves", () => {
      const board = initializeBoard();
      expect(validateSANMove("e5", board, PIECE_COLORS.WHITE)).toBe(false); // Pawn can't move 3 squares
      expect(validateSANMove("Nf6", board, PIECE_COLORS.WHITE)).toBe(false); // Knight can't reach f6
      expect(validateSANMove("Bxf7", board, PIECE_COLORS.WHITE)).toBe(false); // Bishop blocked
    });

    test("validates check indicators", () => {
      // Set up a position where Qh5+ is check
      const board = Array(8)
        .fill(null)
        .map(() => Array(8).fill(null));
      board[7][4] = { type: PIECE_TYPES.KING, color: PIECE_COLORS.WHITE };
      board[0][4] = { type: PIECE_TYPES.KING, color: PIECE_COLORS.BLACK };
      board[7][3] = { type: PIECE_TYPES.QUEEN, color: PIECE_COLORS.WHITE };

      expect(validateSANMove("Qh5+", board, PIECE_COLORS.WHITE)).toBe(true);
      expect(validateSANMove("Qh5", board, PIECE_COLORS.WHITE)).toBe(false); // Missing check indicator
    });

    test("handles invalid SAN format", () => {
      const board = initializeBoard();
      expect(validateSANMove("invalid", board, PIECE_COLORS.WHITE)).toBe(false);
      expect(validateSANMove("", board, PIECE_COLORS.WHITE)).toBe(false);
    });
  });

  describe("moveToSAN", () => {
    test("converts simple pawn move", () => {
      const board = initializeBoard();
      const san = moveToSAN(board, 6, 4, 4, 4); // e2-e4
      expect(san).toBe("e4");
    });

    test("converts knight move", () => {
      const board = initializeBoard();
      const san = moveToSAN(board, 7, 6, 5, 5); // Ng1-f3
      expect(san).toBe("Nf3");
    });

    test("converts capture move", () => {
      const board = initializeBoard();
      // Place a black pawn for capture
      board[3][3] = { type: PIECE_TYPES.PAWN, color: PIECE_COLORS.BLACK };
      // Move white pawn to position
      board[4][4] = {
        type: PIECE_TYPES.PAWN,
        color: PIECE_COLORS.WHITE,
        hasMoved: true,
      };
      board[6][4] = null;

      const san = moveToSAN(board, 4, 4, 3, 3); // exd5
      expect(san).toBe("exd5");
    });

    test("converts castling moves", () => {
      const board = initializeBoard();
      // Clear squares for castling
      board[7][5] = null;
      board[7][6] = null;

      const kingsideSAN = moveToSAN(board, 7, 4, 7, 6); // O-O
      expect(kingsideSAN).toBe("O-O");

      // Set up queenside castling
      board[7][1] = null;
      board[7][2] = null;
      board[7][3] = null;

      const queensideSAN = moveToSAN(board, 7, 4, 7, 2); // O-O-O
      expect(queensideSAN).toBe("O-O-O");
    });

    test("adds check indicator", () => {
      // Set up a position where moving creates check
      const board = Array(8)
        .fill(null)
        .map(() => Array(8).fill(null));
      board[7][4] = { type: PIECE_TYPES.KING, color: PIECE_COLORS.WHITE };
      board[0][4] = { type: PIECE_TYPES.KING, color: PIECE_COLORS.BLACK };
      board[7][3] = { type: PIECE_TYPES.QUEEN, color: PIECE_COLORS.WHITE };

      const san = moveToSAN(board, 7, 3, 3, 7); // Qh5+
      expect(san).toContain("+");
    });

    test("includes disambiguation when needed", () => {
      const board = Array(8)
        .fill(null)
        .map(() => Array(8).fill(null));
      board[7][4] = { type: PIECE_TYPES.KING, color: PIECE_COLORS.WHITE };
      board[0][4] = { type: PIECE_TYPES.KING, color: PIECE_COLORS.BLACK };
      // Place knights that can both reach d4 (row 4, col 3)
      board[2][2] = { type: PIECE_TYPES.KNIGHT, color: PIECE_COLORS.WHITE }; // c6 knight
      board[2][4] = { type: PIECE_TYPES.KNIGHT, color: PIECE_COLORS.WHITE }; // e6 knight

      const san = moveToSAN(board, 2, 2, 4, 3); // Nc6 to d4, should be Ncd4
      expect(san).toContain("c"); // Should include file disambiguation
    });
  });

  describe("getDisambiguation", () => {
    test("returns empty string when no disambiguation needed", () => {
      const board = initializeBoard();
      const piece = { type: PIECE_TYPES.KNIGHT, color: PIECE_COLORS.WHITE };
      const disambiguation = getDisambiguation(board, piece, 7, 6, 5, 5);
      expect(disambiguation).toBe("");
    });

    test("returns file disambiguation", () => {
      const board = Array(8)
        .fill(null)
        .map(() => Array(8).fill(null));
      board[7][4] = { type: PIECE_TYPES.KING, color: PIECE_COLORS.WHITE };
      board[0][4] = { type: PIECE_TYPES.KING, color: PIECE_COLORS.BLACK };
      // Place knights that can both reach d4 (row 4, col 3)
      board[2][2] = { type: PIECE_TYPES.KNIGHT, color: PIECE_COLORS.WHITE }; // c6 knight
      board[2][4] = { type: PIECE_TYPES.KNIGHT, color: PIECE_COLORS.WHITE }; // e6 knight

      const piece = { type: PIECE_TYPES.KNIGHT, color: PIECE_COLORS.WHITE };
      const disambiguation = getDisambiguation(board, piece, 2, 2, 4, 3); // Nc6 to d4
      expect(disambiguation).toBe("c");
    });

    test("returns rank disambiguation", () => {
      const board = Array(8)
        .fill(null)
        .map(() => Array(8).fill(null));
      board[7][4] = { type: PIECE_TYPES.KING, color: PIECE_COLORS.WHITE };
      board[0][4] = { type: PIECE_TYPES.KING, color: PIECE_COLORS.BLACK };
      // Place rooks on same file that can both reach d4 (row 4, col 3)
      board[5][3] = { type: PIECE_TYPES.ROOK, color: PIECE_COLORS.WHITE }; // d3 rook
      board[2][3] = { type: PIECE_TYPES.ROOK, color: PIECE_COLORS.WHITE }; // d6 rook

      const piece = { type: PIECE_TYPES.ROOK, color: PIECE_COLORS.WHITE };
      const disambiguation = getDisambiguation(board, piece, 5, 3, 4, 3); // Rd3 to d4
      expect(disambiguation).toBe("3");
    });

    test("returns both file and rank when needed", () => {
      const board = Array(8)
        .fill(null)
        .map(() => Array(8).fill(null));
      board[7][4] = { type: PIECE_TYPES.KING, color: PIECE_COLORS.WHITE };
      board[0][4] = { type: PIECE_TYPES.KING, color: PIECE_COLORS.BLACK };
      // Place queens that create ambiguity requiring both file and rank
      board[5][3] = { type: PIECE_TYPES.QUEEN, color: PIECE_COLORS.WHITE }; // d3 queen
      board[2][3] = { type: PIECE_TYPES.QUEEN, color: PIECE_COLORS.WHITE }; // d6 queen
      board[5][6] = { type: PIECE_TYPES.QUEEN, color: PIECE_COLORS.WHITE }; // g3 queen

      const piece = { type: PIECE_TYPES.QUEEN, color: PIECE_COLORS.WHITE };
      const disambiguation = getDisambiguation(board, piece, 5, 3, 3, 3);
      expect(disambiguation).toBe("d3");
    });
  });

  describe("parseMoveList", () => {
    test("parses simple move list", () => {
      const moves = parseMoveList("e4 e5 Nf3 Nc6");
      expect(moves).toEqual(["e4", "e5", "Nf3", "Nc6"]);
    });

    test("parses move list with move numbers", () => {
      const moves = parseMoveList("1. e4 e5 2. Nf3 Nc6 3. Bb5");
      expect(moves).toEqual(["e4", "e5", "Nf3", "Nc6", "Bb5"]);
    });

    test("handles extra whitespace", () => {
      const moves = parseMoveList("  e4   e5  Nf3   ");
      expect(moves).toEqual(["e4", "e5", "Nf3"]);
    });

    test("returns empty array for invalid input", () => {
      expect(parseMoveList("")).toEqual([]);
      expect(parseMoveList(null)).toEqual([]);
      expect(parseMoveList("   ")).toEqual([]);
    });
  });

  describe("validateMoveSequence", () => {
    test("validates legal move sequence", () => {
      const board = initializeBoard();
      const moves = ["e4", "e5", "Nf3", "Nc6"];
      const result = validateMoveSequence(moves, board, PIECE_COLORS.WHITE);

      expect(result.success).toBe(true);
      expect(result.validatedMoves).toHaveLength(4);
      expect(result.finalBoard).toBeDefined();
      expect(result.finalPlayer).toBe(PIECE_COLORS.WHITE);
    });

    test("rejects sequence with illegal move", () => {
      const board = initializeBoard();
      const moves = ["e4", "e5", "Nf6"]; // Nf6 is illegal for white
      const result = validateMoveSequence(moves, board, PIECE_COLORS.WHITE);

      expect(result.success).toBe(false);
      expect(result.error).toContain("Invalid move at position 3");
      expect(result.validatedMoves).toHaveLength(2); // Only first two moves validated
    });

    test("handles empty move sequence", () => {
      const board = initializeBoard();
      const result = validateMoveSequence([], board, PIECE_COLORS.WHITE);

      expect(result.success).toBe(true);
      expect(result.validatedMoves).toHaveLength(0);
      expect(result.finalBoard).toBe(board);
      expect(result.finalPlayer).toBe(PIECE_COLORS.WHITE);
    });

    test("validates simple game sequence", () => {
      const board = initializeBoard();
      const moves = ["e4", "e5", "Nf3", "Nc6"];
      const result = validateMoveSequence(moves, board, PIECE_COLORS.WHITE);

      expect(result.success).toBe(true);
      expect(result.validatedMoves).toHaveLength(4);
    });
  });

  describe("Complex SAN scenarios", () => {
    test("handles basic opening moves", () => {
      const board = initializeBoard();

      // Test individual moves from starting position
      expect(validateSANMove("e4", board, PIECE_COLORS.WHITE)).toBe(true);
      expect(validateSANMove("d4", board, PIECE_COLORS.WHITE)).toBe(true);
      expect(validateSANMove("Nf3", board, PIECE_COLORS.WHITE)).toBe(true);
    });

    test("handles en passant notation", () => {
      // Set up en passant scenario
      const board = Array(8)
        .fill(null)
        .map(() => Array(8).fill(null));
      board[7][4] = { type: PIECE_TYPES.KING, color: PIECE_COLORS.WHITE };
      board[0][4] = { type: PIECE_TYPES.KING, color: PIECE_COLORS.BLACK };
      board[3][4] = {
        type: PIECE_TYPES.PAWN,
        color: PIECE_COLORS.WHITE,
        hasMoved: true,
      };
      board[3][3] = {
        type: PIECE_TYPES.PAWN,
        color: PIECE_COLORS.BLACK,
        hasMoved: true,
      };

      // This would be valid if the black pawn just moved two squares
      const components = parseSANComponents("exd6");
      expect(components.isCapture).toBe(true);
      expect(components.fromFile).toBe("e");
      expect(components.toSquare).toBe("d6");
    });

    test("handles promotion with check", () => {
      const components = parseSANComponents("e8=Q+");
      expect(components.promotionPiece).toBe(PIECE_TYPES.QUEEN);
      expect(components.isCheck).toBe(true);
      expect(components.toSquare).toBe("e8");
    });
  });
});
