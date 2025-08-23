// Tests for SAN (Standard Algebraic Notation) utilities
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
import {
  PIECE_TYPES,
  PIECE_COLORS,
  createInitialGameState,
} from "../../constants/gameConstants.js";
import { initializeBoard, setPieceAt } from "../../utils/boardUtils.js";

describe("SAN Utilities", () => {
  describe("parseSANComponents", () => {
    test("parses simple pawn move", () => {
      const components = parseSANComponents("e4");
      expect(components).toEqual({
        piece: PIECE_TYPES.PAWN,
        fromFile: null,
        fromRank: null,
        toSquare: "e4",
        isCapture: false,
        isCheck: false,
        isCheckmate: false,
        isKingsideCastle: false,
        isQueensideCastle: false,
        promotionPiece: null,
        originalMove: "e4",
      });
    });

    test("parses piece move with check", () => {
      const components = parseSANComponents("Nf3+");
      expect(components).toEqual({
        piece: PIECE_TYPES.KNIGHT,
        fromFile: null,
        fromRank: null,
        toSquare: "f3",
        isCapture: false,
        isCheck: true,
        isCheckmate: false,
        isKingsideCastle: false,
        isQueensideCastle: false,
        promotionPiece: null,
        originalMove: "Nf3+",
      });
    });

    test("parses capture move with checkmate", () => {
      const components = parseSANComponents("Qxd7#");
      expect(components).toEqual({
        piece: PIECE_TYPES.QUEEN,
        fromFile: null,
        fromRank: null,
        toSquare: "d7",
        isCapture: true,
        isCheck: false,
        isCheckmate: true,
        isKingsideCastle: false,
        isQueensideCastle: false,
        promotionPiece: null,
        originalMove: "Qxd7#",
      });
    });

    test("parses pawn capture", () => {
      const components = parseSANComponents("exd5");
      expect(components).toEqual({
        piece: PIECE_TYPES.PAWN,
        fromFile: "e",
        fromRank: null,
        toSquare: "d5",
        isCapture: true,
        isCheck: false,
        isCheckmate: false,
        isKingsideCastle: false,
        isQueensideCastle: false,
        promotionPiece: null,
        originalMove: "exd5",
      });
    });

    test("parses move with file disambiguation", () => {
      const components = parseSANComponents("Nbd2");
      expect(components).toEqual({
        piece: PIECE_TYPES.KNIGHT,
        fromFile: "b",
        fromRank: null,
        toSquare: "d2",
        isCapture: false,
        isCheck: false,
        isCheckmate: false,
        isKingsideCastle: false,
        isQueensideCastle: false,
        promotionPiece: null,
        originalMove: "Nbd2",
      });
    });

    test("parses move with rank disambiguation", () => {
      const components = parseSANComponents("R1a3");
      expect(components).toEqual({
        piece: PIECE_TYPES.ROOK,
        fromFile: null,
        fromRank: 1,
        toSquare: "a3",
        isCapture: false,
        isCheck: false,
        isCheckmate: false,
        isKingsideCastle: false,
        isQueensideCastle: false,
        promotionPiece: null,
        originalMove: "R1a3",
      });
    });

    test("parses pawn promotion", () => {
      const components = parseSANComponents("e8=Q+");
      expect(components).toEqual({
        piece: PIECE_TYPES.PAWN,
        fromFile: null,
        fromRank: null,
        toSquare: "e8",
        isCapture: false,
        isCheck: true,
        isCheckmate: false,
        isKingsideCastle: false,
        isQueensideCastle: false,
        promotionPiece: PIECE_TYPES.QUEEN,
        originalMove: "e8=Q+",
      });
    });

    test("parses kingside castling", () => {
      const components = parseSANComponents("O-O");
      expect(components.isKingsideCastle).toBe(true);
      expect(components.isQueensideCastle).toBe(false);
    });

    test("parses queenside castling", () => {
      const components = parseSANComponents("O-O-O");
      expect(components.isQueensideCastle).toBe(true);
      expect(components.isKingsideCastle).toBe(false);
    });

    test("parses castling with alternative notation", () => {
      const components1 = parseSANComponents("0-0");
      const components2 = parseSANComponents("0-0-0");
      expect(components1.isKingsideCastle).toBe(true);
      expect(components2.isQueensideCastle).toBe(true);
    });

    test("throws error for invalid SAN strings", () => {
      expect(() => parseSANComponents("")).toThrow("Invalid SAN move string");
      expect(() => parseSANComponents(null)).toThrow("Invalid SAN move string");
      expect(() => parseSANComponents("invalid")).toThrow(
        "Invalid SAN move: no valid destination square found"
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

    test("finds source square with file disambiguation", () => {
      // Create a board with two knights that can move to the same square
      const board = Array(8)
        .fill(null)
        .map(() => Array(8).fill(null));
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
      board[5][1] = {
        type: PIECE_TYPES.KNIGHT,
        color: PIECE_COLORS.WHITE,
        hasMoved: false,
      }; // b3
      board[5][5] = {
        type: PIECE_TYPES.KNIGHT,
        color: PIECE_COLORS.WHITE,
        hasMoved: false,
      }; // f3

      const components = parseSANComponents("Nbd2");
      const source = findSourceSquare(board, components, PIECE_COLORS.WHITE);
      expect(source).toEqual([5, 1]); // b3
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
      // Create a board with two knights that can move to the same square
      const board = Array(8)
        .fill(null)
        .map(() => Array(8).fill(null));
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
      board[5][1] = {
        type: PIECE_TYPES.KNIGHT,
        color: PIECE_COLORS.WHITE,
        hasMoved: false,
      }; // b3
      board[5][5] = {
        type: PIECE_TYPES.KNIGHT,
        color: PIECE_COLORS.WHITE,
        hasMoved: false,
      }; // f3

      const components = parseSANComponents("Nd2"); // Ambiguous - both knights can move to d2

      expect(() =>
        findSourceSquare(board, components, PIECE_COLORS.WHITE)
      ).toThrow("Ambiguous move: multiple knights can move to d2");
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
      expect(move.to).toEqual([5, 5]); // f3 is [5,5] not [5,2]
      expect(move.piece.type).toBe(PIECE_TYPES.KNIGHT);
      expect(move.isCapture).toBe(false);
    });

    test("parses capture move", () => {
      // Set up a board with a capture opportunity
      const board = initializeBoard();
      // Move white pawn to e4 and black pawn to d5
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
      // Set up a board with a pawn ready to promote
      const board = Array(8)
        .fill(null)
        .map(() => Array(8).fill(null));
      board[7][4] = {
        type: PIECE_TYPES.KING,
        color: PIECE_COLORS.WHITE,
        hasMoved: false,
      };
      board[0][3] = {
        type: PIECE_TYPES.KING,
        color: PIECE_COLORS.BLACK,
        hasMoved: false,
      }; // Move black king away from e8
      board[1][4] = {
        type: PIECE_TYPES.PAWN,
        color: PIECE_COLORS.WHITE,
        hasMoved: true,
      }; // e7

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
      expect(validateSANMove("Ke2", board, PIECE_COLORS.WHITE)).toBe(false); // King blocked by pawn
    });

    test("rejects moves with incorrect check indicators", () => {
      const board = initializeBoard();

      // e4 doesn't give check
      expect(validateSANMove("e4+", board, PIECE_COLORS.WHITE)).toBe(false);
    });

    test.skip("validates castling moves", () => {
      const board = initializeBoard();
      // Clear squares for castling
      board[7][5] = null; // f1
      board[7][6] = null; // g1
      board[7][1] = null; // b1
      board[7][2] = null; // c1
      board[7][3] = null; // d1

      expect(validateSANMove("O-O", board, PIECE_COLORS.WHITE)).toBe(true);
      expect(validateSANMove("O-O-O", board, PIECE_COLORS.WHITE)).toBe(true);
    });
  });

  describe("moveToSAN", () => {
    test("converts simple pawn move to SAN", () => {
      const board = initializeBoard();
      const san = moveToSAN(board, 6, 4, 4, 4); // e2 to e4
      expect(san).toBe("e4");
    });

    test("converts knight move to SAN", () => {
      const board = initializeBoard();
      const san = moveToSAN(board, 7, 6, 5, 5); // g1 to f3 (f3 is [5,5])
      expect(san).toBe("Nf3");
    });

    test("converts capture move to SAN", () => {
      // Set up a capture scenario
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

      const san = moveToSAN(board, 4, 4, 3, 3); // exd5
      expect(san).toBe("exd5");
    });

    test("converts castling moves to SAN", () => {
      const board = initializeBoard();
      // Clear squares for castling
      board[7][5] = null; // f1
      board[7][6] = null; // g1

      const kingsideSAN = moveToSAN(board, 7, 4, 7, 6); // O-O
      expect(kingsideSAN).toBe("O-O");

      // Clear squares for queenside castling
      board[7][1] = null; // b1
      board[7][2] = null; // c1
      board[7][3] = null; // d1

      const queensideSAN = moveToSAN(board, 7, 4, 7, 2); // O-O-O
      expect(queensideSAN).toBe("O-O-O");
    });

    test("includes disambiguation when needed", () => {
      // Create a board with two knights that can move to the same square
      const board = Array(8)
        .fill(null)
        .map(() => Array(8).fill(null));
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
      board[5][1] = {
        type: PIECE_TYPES.KNIGHT,
        color: PIECE_COLORS.WHITE,
        hasMoved: false,
      }; // b3
      board[5][5] = {
        type: PIECE_TYPES.KNIGHT,
        color: PIECE_COLORS.WHITE,
        hasMoved: false,
      }; // f3

      const san = moveToSAN(board, 5, 1, 6, 3); // Nbd2 (d2 is [6,3])
      expect(san).toBe("Nbd2");
    });
  });

  describe("getDisambiguation", () => {
    test("returns empty string when no disambiguation needed", () => {
      const board = initializeBoard();
      const piece = { type: PIECE_TYPES.KNIGHT, color: PIECE_COLORS.WHITE };
      const disambiguation = getDisambiguation(board, piece, 7, 6, 5, 5); // Nf3 (f3 is [5,5])
      expect(disambiguation).toBe("");
    });

    test("returns file disambiguation when needed", () => {
      // Create a board with two knights that can move to the same square
      const board = Array(8)
        .fill(null)
        .map(() => Array(8).fill(null));
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
      board[5][1] = {
        type: PIECE_TYPES.KNIGHT,
        color: PIECE_COLORS.WHITE,
        hasMoved: false,
      }; // b3
      board[5][5] = {
        type: PIECE_TYPES.KNIGHT,
        color: PIECE_COLORS.WHITE,
        hasMoved: false,
      }; // f3

      const piece = { type: PIECE_TYPES.KNIGHT, color: PIECE_COLORS.WHITE };
      const disambiguation = getDisambiguation(board, piece, 5, 1, 6, 3); // Nbd2 (d2 is [6,3])
      expect(disambiguation).toBe("b");
    });

    test("returns rank disambiguation when file is not sufficient", () => {
      // Create a board with two rooks on the same file that can both move to the same square
      const board = Array(8)
        .fill(null)
        .map(() => Array(8).fill(null));
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
      board[7][3] = {
        type: PIECE_TYPES.ROOK,
        color: PIECE_COLORS.WHITE,
        hasMoved: false,
      }; // d1
      board[0][3] = {
        type: PIECE_TYPES.ROOK,
        color: PIECE_COLORS.WHITE,
        hasMoved: false,
      }; // d8 - same file, both can move to d4

      const piece = { type: PIECE_TYPES.ROOK, color: PIECE_COLORS.WHITE };
      const disambiguation = getDisambiguation(board, piece, 7, 3, 4, 3); // R1d5 (d5 is [3,3], but we want d4 which is [4,3])
      expect(disambiguation).toBe("1");
    });
  });

  describe("parseMoveList", () => {
    test("parses simple move list", () => {
      const moves = parseMoveList("1. e4 e5 2. Nf3 Nc6");
      expect(moves).toEqual(["e4", "e5", "Nf3", "Nc6"]);
    });

    test("handles extra whitespace", () => {
      const moves = parseMoveList("  1.  e4   e5   2.  Nf3  Nc6  ");
      expect(moves).toEqual(["e4", "e5", "Nf3", "Nc6"]);
    });

    test("returns empty array for empty input", () => {
      expect(parseMoveList("")).toEqual([]);
      expect(parseMoveList(null)).toEqual([]);
      expect(parseMoveList("   ")).toEqual([]);
    });

    test("handles moves without numbers", () => {
      const moves = parseMoveList("e4 e5 Nf3 Nc6");
      expect(moves).toEqual(["e4", "e5", "Nf3", "Nc6"]);
    });
  });

  describe("validateMoveSequence", () => {
    test("validates legal move sequence", () => {
      const board = initializeBoard();
      const moves = ["e4", "e5", "Nf3", "Nc6"];
      const result = validateMoveSequence(moves, board);

      expect(result.success).toBe(true);
      expect(result.validatedMoves).toHaveLength(4);
      expect(result.finalBoard).toBeDefined();
      expect(result.finalPlayer).toBe(PIECE_COLORS.WHITE);
    });

    test("rejects sequence with illegal move", () => {
      const board = initializeBoard();
      const moves = ["e4", "e5", "Nf6"]; // Nf6 is illegal for white from starting position
      const result = validateMoveSequence(moves, board);

      expect(result.success).toBe(false);
      expect(result.error).toContain("Invalid move at position 3: Nf6");
      expect(result.validatedMoves).toHaveLength(2); // Only first two moves validated
    });

    test("handles empty move sequence", () => {
      const board = initializeBoard();
      const result = validateMoveSequence([], board);

      expect(result.success).toBe(true);
      expect(result.validatedMoves).toHaveLength(0);
      expect(result.finalBoard).toBe(board);
      expect(result.finalPlayer).toBe(PIECE_COLORS.WHITE);
    });

    test("alternates players correctly", () => {
      const board = initializeBoard();
      const moves = ["e4", "e5"];
      const result = validateMoveSequence(moves, board, PIECE_COLORS.WHITE);

      expect(result.success).toBe(true);
      expect(result.finalPlayer).toBe(PIECE_COLORS.WHITE); // After 2 moves, back to white
    });
  });
});
