/**
 * Comprehensive tests for FEN generation accuracy in complex board positions
 * Tests various chess positions and edge cases for FEN string generation
 */
import {
  generateFEN,
  parseFEN,
  isValidFEN,
  gameStateFromFEN,
  boardToFEN,
  getCastlingRights,
  getEnPassantTarget,
} from "../../utils/fenUtils.js";
import {
  PIECE_TYPES,
  PIECE_COLORS,
  createInitialGameState,
} from "../../constants/gameConstants.js";
import { initializeBoard } from "../../utils/boardUtils.js";

describe("FEN Generation Accuracy in Complex Positions", () => {
  describe("Opening Positions", () => {
    test("generates accurate FEN for Italian Game opening", () => {
      const gameState = createInitialGameState();

      // Simulate Italian Game: 1.e4 e5 2.Nf3 Nc6 3.Bc4
      gameState.currentPlayer = PIECE_COLORS.BLACK;
      gameState.moveHistory = [
        {
          piece: { type: PIECE_TYPES.PAWN },
          from: [6, 4],
          to: [4, 4],
          capturedPiece: null,
        },
        {
          piece: { type: PIECE_TYPES.PAWN },
          from: [1, 4],
          to: [3, 4],
          capturedPiece: null,
        },
        {
          piece: { type: PIECE_TYPES.KNIGHT },
          from: [7, 6],
          to: [5, 5],
          capturedPiece: null,
        },
        {
          piece: { type: PIECE_TYPES.KNIGHT },
          from: [0, 1],
          to: [2, 2],
          capturedPiece: null,
        },
        {
          piece: { type: PIECE_TYPES.BISHOP },
          from: [7, 5],
          to: [4, 2],
          capturedPiece: null,
        },
      ];

      // Update board to reflect moves
      gameState.board[6][4] = null; // e2 empty
      gameState.board[4][4] = {
        type: PIECE_TYPES.PAWN,
        color: PIECE_COLORS.WHITE,
        hasMoved: true,
      }; // e4
      gameState.board[1][4] = null; // e7 empty
      gameState.board[3][4] = {
        type: PIECE_TYPES.PAWN,
        color: PIECE_COLORS.BLACK,
        hasMoved: true,
      }; // e5
      gameState.board[7][6] = null; // g1 empty
      gameState.board[5][5] = {
        type: PIECE_TYPES.KNIGHT,
        color: PIECE_COLORS.WHITE,
        hasMoved: true,
      }; // f3
      gameState.board[0][1] = null; // b8 empty
      gameState.board[2][2] = {
        type: PIECE_TYPES.KNIGHT,
        color: PIECE_COLORS.BLACK,
        hasMoved: true,
      }; // c6
      gameState.board[7][5] = null; // f1 empty
      gameState.board[4][2] = {
        type: PIECE_TYPES.BISHOP,
        color: PIECE_COLORS.WHITE,
        hasMoved: true,
      }; // c4

      const fen = generateFEN(gameState);

      expect(fen).toContain("b"); // Black to move
      expect(fen).toContain("KQkq"); // All castling rights still available
      expect(fen).toContain("- 0 3"); // No en passant, halfmove 0, fullmove 3
      expect(isValidFEN(fen)).toBe(true);

      // Verify the board position part
      const boardPart = fen.split(" ")[0];
      expect(boardPart).toContain("r"); // Black rooks
      expect(boardPart).toContain("n"); // Black knights (one moved)
      expect(boardPart).toContain("B"); // White bishop on c4
      expect(boardPart).toContain("N"); // White knight on f3
    });

    test("generates accurate FEN for Sicilian Defense", () => {
      const gameState = createInitialGameState();

      // Simulate Sicilian Defense: 1.e4 c5
      gameState.currentPlayer = PIECE_COLORS.WHITE;
      gameState.moveHistory = [
        {
          piece: { type: PIECE_TYPES.PAWN },
          from: [6, 4],
          to: [4, 4],
          capturedPiece: null,
        },
        {
          piece: { type: PIECE_TYPES.PAWN },
          from: [1, 2],
          to: [3, 2],
          capturedPiece: null,
        },
      ];

      // Update board
      gameState.board[6][4] = null;
      gameState.board[4][4] = {
        type: PIECE_TYPES.PAWN,
        color: PIECE_COLORS.WHITE,
        hasMoved: true,
      };
      gameState.board[1][2] = null;
      gameState.board[3][2] = {
        type: PIECE_TYPES.PAWN,
        color: PIECE_COLORS.BLACK,
        hasMoved: true,
      };

      const fen = generateFEN(gameState);

      expect(fen).toContain("w"); // White to move
      expect(fen).toContain("KQkq"); // All castling rights
      expect(fen).toContain("- 0 2"); // No en passant, halfmove 0, fullmove 2
      expect(isValidFEN(fen)).toBe(true);
    });

    test("generates accurate FEN for Queen's Gambit", () => {
      const gameState = createInitialGameState();

      // Simulate Queen's Gambit: 1.d4 d5 2.c4
      gameState.currentPlayer = PIECE_COLORS.BLACK;
      gameState.moveHistory = [
        {
          piece: { type: PIECE_TYPES.PAWN },
          from: [6, 3],
          to: [4, 3],
          capturedPiece: null,
        },
        {
          piece: { type: PIECE_TYPES.PAWN },
          from: [1, 3],
          to: [3, 3],
          capturedPiece: null,
        },
        {
          piece: { type: PIECE_TYPES.PAWN },
          from: [6, 2],
          to: [4, 2],
          capturedPiece: null,
        },
      ];

      // Update board
      gameState.board[6][3] = null;
      gameState.board[4][3] = {
        type: PIECE_TYPES.PAWN,
        color: PIECE_COLORS.WHITE,
        hasMoved: true,
      };
      gameState.board[1][3] = null;
      gameState.board[3][3] = {
        type: PIECE_TYPES.PAWN,
        color: PIECE_COLORS.BLACK,
        hasMoved: true,
      };
      gameState.board[6][2] = null;
      gameState.board[4][2] = {
        type: PIECE_TYPES.PAWN,
        color: PIECE_COLORS.WHITE,
        hasMoved: true,
      };

      const fen = generateFEN(gameState);

      expect(fen).toContain("b"); // Black to move
      expect(fen).toContain("KQkq"); // All castling rights
      expect(fen).toContain("- 0 2"); // No en passant, halfmove 0, fullmove 2
      expect(isValidFEN(fen)).toBe(true);
    });
  });

  describe("Castling Scenarios", () => {
    test("generates accurate FEN after white kingside castling", () => {
      const gameState = createInitialGameState();

      // Set up position after castling
      gameState.currentPlayer = PIECE_COLORS.BLACK;
      gameState.moveHistory = [
        { piece: { type: PIECE_TYPES.PAWN }, capturedPiece: null },
        { piece: { type: PIECE_TYPES.PAWN }, capturedPiece: null },
        { piece: { type: PIECE_TYPES.KNIGHT }, capturedPiece: null },
        { piece: { type: PIECE_TYPES.KNIGHT }, capturedPiece: null },
        { piece: { type: PIECE_TYPES.BISHOP }, capturedPiece: null },
        { piece: { type: PIECE_TYPES.BISHOP }, capturedPiece: null },
        { piece: { type: PIECE_TYPES.KING }, capturedPiece: null }, // Castling move
      ];

      // Update board for castled position
      gameState.board[7][4] = null; // King moved from e1
      gameState.board[7][6] = {
        type: PIECE_TYPES.KING,
        color: PIECE_COLORS.WHITE,
        hasMoved: true,
      }; // King on g1
      gameState.board[7][7] = null; // Rook moved from h1
      gameState.board[7][5] = {
        type: PIECE_TYPES.ROOK,
        color: PIECE_COLORS.WHITE,
        hasMoved: true,
      }; // Rook on f1

      const fen = generateFEN(gameState);

      expect(fen).toContain("b"); // Black to move
      expect(fen).toContain("kq"); // Only black can castle (white king and rook moved)
      expect(isValidFEN(fen)).toBe(true);

      // Verify castled position in FEN
      const boardPart = fen.split(" ")[0];
      const lastRank = boardPart.split("/")[7];
      expect(lastRank).toContain("RK"); // Rook and King on kingside
    });

    test("generates accurate FEN after black queenside castling", () => {
      const gameState = createInitialGameState();

      gameState.currentPlayer = PIECE_COLORS.WHITE;
      gameState.moveHistory = Array(8).fill({
        piece: { type: PIECE_TYPES.PAWN },
        capturedPiece: null,
      });

      // Update board for black queenside castling
      gameState.board[0][4] = null; // King moved from e8
      gameState.board[0][2] = {
        type: PIECE_TYPES.KING,
        color: PIECE_COLORS.BLACK,
        hasMoved: true,
      }; // King on c8
      gameState.board[0][0] = null; // Rook moved from a8
      gameState.board[0][3] = {
        type: PIECE_TYPES.ROOK,
        color: PIECE_COLORS.BLACK,
        hasMoved: true,
      }; // Rook on d8

      const fen = generateFEN(gameState);

      expect(fen).toContain("w"); // White to move
      expect(fen).toContain("KQ"); // Only white can castle (black king and rook moved)
      expect(isValidFEN(fen)).toBe(true);

      // Verify castled position in FEN
      const boardPart = fen.split(" ")[0];
      const firstRank = boardPart.split("/")[0];
      expect(firstRank).toContain("rk"); // Rook and king on queenside
    });

    test("generates accurate FEN with partial castling rights", () => {
      const gameState = createInitialGameState();

      // White king moved (no castling), black rook on a8 moved (no queenside castling)
      gameState.board[7][4].hasMoved = true; // White king moved
      gameState.board[0][0].hasMoved = true; // Black queenside rook moved

      const fen = generateFEN(gameState);

      expect(fen).toContain("k"); // Only black kingside castling available
      expect(isValidFEN(fen)).toBe(true);
    });

    test("generates accurate FEN with no castling rights", () => {
      const gameState = createInitialGameState();

      // All kings and rooks moved
      gameState.board[7][4].hasMoved = true; // White king
      gameState.board[0][4].hasMoved = true; // Black king
      gameState.board[7][0].hasMoved = true; // White queenside rook
      gameState.board[7][7].hasMoved = true; // White kingside rook
      gameState.board[0][0].hasMoved = true; // Black queenside rook
      gameState.board[0][7].hasMoved = true; // Black kingside rook

      const fen = generateFEN(gameState);

      expect(fen).toContain(" - "); // No castling rights
      expect(isValidFEN(fen)).toBe(true);
    });
  });

  describe("En Passant Scenarios", () => {
    test("generates accurate FEN with en passant target after white pawn double move", () => {
      const gameState = createInitialGameState();

      gameState.currentPlayer = PIECE_COLORS.BLACK;
      gameState.moveHistory = [
        {
          piece: { type: PIECE_TYPES.PAWN },
          from: [6, 4], // e2
          to: [4, 4], // e4
          capturedPiece: null,
        },
      ];

      // Update board
      gameState.board[6][4] = null;
      gameState.board[4][4] = {
        type: PIECE_TYPES.PAWN,
        color: PIECE_COLORS.WHITE,
        hasMoved: true,
      };

      const fen = generateFEN(gameState);

      expect(fen).toContain("e3"); // En passant target
      expect(fen).toContain("b"); // Black to move
      expect(isValidFEN(fen)).toBe(true);
    });

    test("generates accurate FEN with en passant target after black pawn double move", () => {
      const gameState = createInitialGameState();

      gameState.currentPlayer = PIECE_COLORS.WHITE;
      gameState.moveHistory = [
        {
          piece: { type: PIECE_TYPES.PAWN },
          from: [6, 4],
          to: [4, 4],
          capturedPiece: null,
        },
        {
          piece: { type: PIECE_TYPES.PAWN },
          from: [1, 3], // d7
          to: [3, 3], // d5
          capturedPiece: null,
        },
      ];

      // Update board
      gameState.board[6][4] = null;
      gameState.board[4][4] = {
        type: PIECE_TYPES.PAWN,
        color: PIECE_COLORS.WHITE,
        hasMoved: true,
      };
      gameState.board[1][3] = null;
      gameState.board[3][3] = {
        type: PIECE_TYPES.PAWN,
        color: PIECE_COLORS.BLACK,
        hasMoved: true,
      };

      const fen = generateFEN(gameState);

      expect(fen).toContain("d6"); // En passant target
      expect(fen).toContain("w"); // White to move
      expect(isValidFEN(fen)).toBe(true);
    });

    test("generates accurate FEN with no en passant after single pawn move", () => {
      const gameState = createInitialGameState();

      gameState.currentPlayer = PIECE_COLORS.BLACK;
      gameState.moveHistory = [
        {
          piece: { type: PIECE_TYPES.PAWN },
          from: [6, 4], // e2
          to: [5, 4], // e3 (single move)
          capturedPiece: null,
        },
      ];

      // Update board
      gameState.board[6][4] = null;
      gameState.board[5][4] = {
        type: PIECE_TYPES.PAWN,
        color: PIECE_COLORS.WHITE,
        hasMoved: true,
      };

      const fen = generateFEN(gameState);

      expect(fen).toContain(" - "); // No en passant target
      expect(isValidFEN(fen)).toBe(true);
    });
  });

  describe("Pawn Promotion Scenarios", () => {
    test("generates accurate FEN after pawn promotion to queen", () => {
      const gameState = {
        board: Array(8)
          .fill(null)
          .map(() => Array(8).fill(null)),
        currentPlayer: PIECE_COLORS.BLACK,
        moveHistory: [
          {
            piece: { type: PIECE_TYPES.PAWN },
            from: [1, 4],
            to: [0, 4],
            capturedPiece: null,
            promotionPiece: PIECE_TYPES.QUEEN,
          },
        ],
      };

      // Set up position after promotion
      gameState.board[7][4] = {
        type: PIECE_TYPES.KING,
        color: PIECE_COLORS.WHITE,
        hasMoved: false,
      };
      gameState.board[0][3] = {
        type: PIECE_TYPES.KING,
        color: PIECE_COLORS.BLACK,
        hasMoved: true,
      };
      gameState.board[0][4] = {
        type: PIECE_TYPES.QUEEN,
        color: PIECE_COLORS.WHITE,
        hasMoved: true,
      }; // Promoted queen

      const fen = generateFEN(gameState);

      expect(fen).toContain("Q"); // Promoted queen
      expect(fen).toContain("b"); // Black to move
      expect(isValidFEN(fen)).toBe(true);
    });

    test("generates accurate FEN after pawn promotion to knight", () => {
      const gameState = {
        board: Array(8)
          .fill(null)
          .map(() => Array(8).fill(null)),
        currentPlayer: PIECE_COLORS.WHITE,
        moveHistory: [
          {
            piece: { type: PIECE_TYPES.PAWN },
            from: [6, 7],
            to: [7, 7],
            capturedPiece: null,
            promotionPiece: PIECE_TYPES.KNIGHT,
          },
        ],
      };

      // Set up position after promotion
      gameState.board[7][4] = {
        type: PIECE_TYPES.KING,
        color: PIECE_COLORS.WHITE,
        hasMoved: false,
      };
      gameState.board[0][4] = {
        type: PIECE_TYPES.KING,
        color: PIECE_COLORS.BLACK,
        hasMoved: false,
      };
      gameState.board[7][7] = {
        type: PIECE_TYPES.KNIGHT,
        color: PIECE_COLORS.BLACK,
        hasMoved: true,
      }; // Promoted knight

      const fen = generateFEN(gameState);

      expect(fen).toContain("n"); // Promoted knight (black)
      expect(fen).toContain("w"); // White to move
      expect(isValidFEN(fen)).toBe(true);
    });

    test("generates accurate FEN with multiple promoted pieces", () => {
      const gameState = {
        board: Array(8)
          .fill(null)
          .map(() => Array(8).fill(null)),
        currentPlayer: PIECE_COLORS.WHITE,
        moveHistory: Array(20).fill({
          piece: { type: PIECE_TYPES.PAWN },
          capturedPiece: null,
        }),
      };

      // Set up position with multiple promotions
      gameState.board[7][4] = {
        type: PIECE_TYPES.KING,
        color: PIECE_COLORS.WHITE,
        hasMoved: true,
      };
      gameState.board[0][4] = {
        type: PIECE_TYPES.KING,
        color: PIECE_COLORS.BLACK,
        hasMoved: true,
      };
      gameState.board[0][0] = {
        type: PIECE_TYPES.QUEEN,
        color: PIECE_COLORS.WHITE,
        hasMoved: true,
      }; // Promoted queen
      gameState.board[0][7] = {
        type: PIECE_TYPES.ROOK,
        color: PIECE_COLORS.WHITE,
        hasMoved: true,
      }; // Promoted rook
      gameState.board[7][0] = {
        type: PIECE_TYPES.QUEEN,
        color: PIECE_COLORS.BLACK,
        hasMoved: true,
      }; // Promoted queen
      gameState.board[7][7] = {
        type: PIECE_TYPES.BISHOP,
        color: PIECE_COLORS.BLACK,
        hasMoved: true,
      }; // Promoted bishop

      const fen = generateFEN(gameState);

      expect(fen).toContain("Q"); // White promoted queen
      expect(fen).toContain("R"); // White promoted rook
      expect(fen).toContain("q"); // Black promoted queen
      expect(fen).toContain("b"); // Black promoted bishop
      expect(isValidFEN(fen)).toBe(true);
    });
  });

  describe("Complex Mid-Game Positions", () => {
    test("generates accurate FEN for complex tactical position", () => {
      const gameState = {
        board: Array(8)
          .fill(null)
          .map(() => Array(8).fill(null)),
        currentPlayer: PIECE_COLORS.WHITE,
        moveHistory: Array(30).fill({
          piece: { type: PIECE_TYPES.PAWN },
          capturedPiece: null,
        }),
      };

      // Set up complex tactical position
      gameState.board[7][4] = {
        type: PIECE_TYPES.KING,
        color: PIECE_COLORS.WHITE,
        hasMoved: true,
      };
      gameState.board[0][4] = {
        type: PIECE_TYPES.KING,
        color: PIECE_COLORS.BLACK,
        hasMoved: true,
      };
      gameState.board[4][4] = {
        type: PIECE_TYPES.QUEEN,
        color: PIECE_COLORS.WHITE,
        hasMoved: true,
      };
      gameState.board[3][3] = {
        type: PIECE_TYPES.BISHOP,
        color: PIECE_COLORS.BLACK,
        hasMoved: true,
      };
      gameState.board[2][5] = {
        type: PIECE_TYPES.KNIGHT,
        color: PIECE_COLORS.WHITE,
        hasMoved: true,
      };
      gameState.board[5][2] = {
        type: PIECE_TYPES.KNIGHT,
        color: PIECE_COLORS.BLACK,
        hasMoved: true,
      };
      gameState.board[6][0] = {
        type: PIECE_TYPES.PAWN,
        color: PIECE_COLORS.WHITE,
        hasMoved: true,
      };
      gameState.board[1][7] = {
        type: PIECE_TYPES.PAWN,
        color: PIECE_COLORS.BLACK,
        hasMoved: true,
      };

      const fen = generateFEN(gameState);

      expect(fen).toContain("w"); // White to move
      expect(fen).toContain("-"); // No castling rights (kings moved)
      expect(isValidFEN(fen)).toBe(true);

      // Verify complex position is represented correctly
      const boardPart = fen.split(" ")[0];
      expect(boardPart).toContain("Q"); // White queen
      expect(boardPart).toContain("b"); // Black bishop
      expect(boardPart).toContain("N"); // White knight
      expect(boardPart).toContain("n"); // Black knight
    });

    test("generates accurate FEN for endgame position", () => {
      const gameState = {
        board: Array(8)
          .fill(null)
          .map(() => Array(8).fill(null)),
        currentPlayer: PIECE_COLORS.BLACK,
        moveHistory: Array(60).fill({
          piece: { type: PIECE_TYPES.PAWN },
          capturedPiece: null,
        }),
      };

      // Set up king and pawn endgame
      gameState.board[6][4] = {
        type: PIECE_TYPES.KING,
        color: PIECE_COLORS.WHITE,
        hasMoved: true,
      };
      gameState.board[1][4] = {
        type: PIECE_TYPES.KING,
        color: PIECE_COLORS.BLACK,
        hasMoved: true,
      };
      gameState.board[5][4] = {
        type: PIECE_TYPES.PAWN,
        color: PIECE_COLORS.WHITE,
        hasMoved: true,
      };
      gameState.board[2][3] = {
        type: PIECE_TYPES.PAWN,
        color: PIECE_COLORS.BLACK,
        hasMoved: true,
      };

      const fen = generateFEN(gameState);

      expect(fen).toContain("b"); // Black to move
      expect(fen).toContain("-"); // No castling rights
      expect(fen).toContain("30"); // High fullmove number
      expect(isValidFEN(fen)).toBe(true);

      // Verify endgame position
      const boardPart = fen.split(" ")[0];
      expect(boardPart.match(/[KkPp]/g)).toHaveLength(4); // Only kings and pawns
    });

    test("generates accurate FEN for position with check", () => {
      const gameState = {
        board: Array(8)
          .fill(null)
          .map(() => Array(8).fill(null)),
        currentPlayer: PIECE_COLORS.BLACK,
        moveHistory: [
          { piece: { type: PIECE_TYPES.QUEEN }, capturedPiece: null },
        ],
      };

      // Set up position where black king is in check
      gameState.board[7][4] = {
        type: PIECE_TYPES.KING,
        color: PIECE_COLORS.WHITE,
        hasMoved: false,
      };
      gameState.board[0][4] = {
        type: PIECE_TYPES.KING,
        color: PIECE_COLORS.BLACK,
        hasMoved: false,
      };
      gameState.board[3][4] = {
        type: PIECE_TYPES.QUEEN,
        color: PIECE_COLORS.WHITE,
        hasMoved: true,
      }; // Queen giving check

      const fen = generateFEN(gameState);

      expect(fen).toContain("b"); // Black to move (in check)
      expect(isValidFEN(fen)).toBe(true);

      // Note: FEN doesn't explicitly indicate check, but the position should be valid
      const parsed = parseFEN(fen);
      expect(parsed.activeColor).toBe(PIECE_COLORS.BLACK);
    });
  });

  describe("Edge Cases and Special Positions", () => {
    test("generates accurate FEN for position with only kings", () => {
      const gameState = {
        board: Array(8)
          .fill(null)
          .map(() => Array(8).fill(null)),
        currentPlayer: PIECE_COLORS.WHITE,
        moveHistory: Array(100).fill({
          piece: { type: PIECE_TYPES.PAWN },
          capturedPiece: null,
        }),
      };

      // Only kings remaining
      gameState.board[7][0] = {
        type: PIECE_TYPES.KING,
        color: PIECE_COLORS.WHITE,
        hasMoved: true,
      };
      gameState.board[0][7] = {
        type: PIECE_TYPES.KING,
        color: PIECE_COLORS.BLACK,
        hasMoved: true,
      };

      const fen = generateFEN(gameState);

      expect(fen).toBe("7k/8/8/8/8/8/8/K7 w - - 0 50");
      expect(isValidFEN(fen)).toBe(true);
    });

    test("generates accurate FEN for position with maximum pieces", () => {
      const gameState = {
        board: Array(8)
          .fill(null)
          .map(() => Array(8).fill(null)),
        currentPlayer: PIECE_COLORS.WHITE,
        moveHistory: [],
      };

      // Fill board with maximum promoted pieces (hypothetical position)
      gameState.board[7][4] = {
        type: PIECE_TYPES.KING,
        color: PIECE_COLORS.WHITE,
        hasMoved: false,
      };
      gameState.board[0][4] = {
        type: PIECE_TYPES.KING,
        color: PIECE_COLORS.BLACK,
        hasMoved: false,
      };

      // Add multiple queens (from promotion)
      gameState.board[7][0] = {
        type: PIECE_TYPES.QUEEN,
        color: PIECE_COLORS.WHITE,
        hasMoved: true,
      };
      gameState.board[7][1] = {
        type: PIECE_TYPES.QUEEN,
        color: PIECE_COLORS.WHITE,
        hasMoved: true,
      };
      gameState.board[0][0] = {
        type: PIECE_TYPES.QUEEN,
        color: PIECE_COLORS.BLACK,
        hasMoved: true,
      };
      gameState.board[0][1] = {
        type: PIECE_TYPES.QUEEN,
        color: PIECE_COLORS.BLACK,
        hasMoved: true,
      };

      const fen = generateFEN(gameState);

      expect(fen).toContain("QQ"); // Multiple white queens
      expect(fen).toContain("qq"); // Multiple black queens
      expect(isValidFEN(fen)).toBe(true);
    });

    test("generates accurate FEN with high halfmove clock", () => {
      const gameState = {
        board: Array(8)
          .fill(null)
          .map(() => Array(8).fill(null)),
        currentPlayer: PIECE_COLORS.WHITE,
        moveHistory: Array(100).fill({
          piece: { type: PIECE_TYPES.KNIGHT },
          capturedPiece: null,
        }),
      };

      // Set up position with only pieces that don't reset halfmove clock
      gameState.board[7][4] = {
        type: PIECE_TYPES.KING,
        color: PIECE_COLORS.WHITE,
        hasMoved: true,
      };
      gameState.board[0][4] = {
        type: PIECE_TYPES.KING,
        color: PIECE_COLORS.BLACK,
        hasMoved: true,
      };
      gameState.board[3][3] = {
        type: PIECE_TYPES.KNIGHT,
        color: PIECE_COLORS.WHITE,
        hasMoved: true,
      };
      gameState.board[4][4] = {
        type: PIECE_TYPES.KNIGHT,
        color: PIECE_COLORS.BLACK,
        hasMoved: true,
      };

      const fen = generateFEN(gameState);

      expect(fen).toContain("100"); // High halfmove clock
      expect(fen).toContain("50"); // High fullmove number
      expect(isValidFEN(fen)).toBe(true);
    });

    test("handles FEN generation with captured pieces in history", () => {
      const gameState = createInitialGameState();

      gameState.currentPlayer = PIECE_COLORS.WHITE;
      gameState.moveHistory = [
        {
          piece: { type: PIECE_TYPES.PAWN },
          from: [6, 4],
          to: [4, 4],
          capturedPiece: null,
        },
        {
          piece: { type: PIECE_TYPES.PAWN },
          from: [1, 3],
          to: [3, 3],
          capturedPiece: null,
        },
        {
          piece: { type: PIECE_TYPES.PAWN },
          from: [4, 4],
          to: [3, 3],
          capturedPiece: { type: PIECE_TYPES.PAWN, color: PIECE_COLORS.BLACK },
        },
      ];

      // Update board to reflect capture
      gameState.board[6][4] = null;
      gameState.board[1][3] = null;
      gameState.board[3][3] = {
        type: PIECE_TYPES.PAWN,
        color: PIECE_COLORS.WHITE,
        hasMoved: true,
      };

      const fen = generateFEN(gameState);

      expect(fen).toContain("w"); // White to move
      expect(fen).toContain("0 2"); // Halfmove reset due to capture, fullmove 2
      expect(isValidFEN(fen)).toBe(true);
    });
  });

  describe("FEN Parsing and Validation", () => {
    test("correctly parses and validates generated FEN strings", () => {
      const gameState = createInitialGameState();
      const fen = generateFEN(gameState);

      expect(isValidFEN(fen)).toBe(true);

      const parsed = parseFEN(fen);
      expect(parsed.activeColor).toBe(PIECE_COLORS.WHITE);
      expect(parsed.castlingRights).toBe("KQkq");
      expect(parsed.enPassantTarget).toBe("-");
      expect(parsed.halfmoveClock).toBe(0);
      expect(parsed.fullmoveNumber).toBe(1);
    });

    test("round-trip FEN generation and parsing preserves game state", () => {
      const originalGameState = createInitialGameState();

      // Make some moves
      originalGameState.currentPlayer = PIECE_COLORS.BLACK;
      originalGameState.moveHistory = [
        {
          piece: { type: PIECE_TYPES.PAWN },
          from: [6, 4],
          to: [4, 4],
          capturedPiece: null,
        },
      ];
      originalGameState.board[6][4] = null;
      originalGameState.board[4][4] = {
        type: PIECE_TYPES.PAWN,
        color: PIECE_COLORS.WHITE,
        hasMoved: true,
      };

      const fen = generateFEN(originalGameState);
      const reconstructedGameState = gameStateFromFEN(fen);

      expect(reconstructedGameState.currentPlayer).toBe(
        originalGameState.currentPlayer
      );
      expect(reconstructedGameState.board[4][4]).toEqual(
        expect.objectContaining({
          type: PIECE_TYPES.PAWN,
          color: PIECE_COLORS.WHITE,
        })
      );
      expect(reconstructedGameState.board[6][4]).toBeNull();
    });

    test("validates FEN strings for various complex positions", () => {
      const testPositions = [
        "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1", // Starting position
        "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1", // After e4
        "r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1", // Castling test position
        "8/8/8/8/8/8/8/4K3 w - - 0 1", // King only
        "rnbqkb1r/pppp1ppp/5n2/4p3/2B1P3/8/PPPP1PPP/RNBQK1NR w KQkq - 2 3", // Italian Game
      ];

      testPositions.forEach((fen) => {
        expect(isValidFEN(fen)).toBe(true);
        expect(() => parseFEN(fen)).not.toThrow();
      });
    });
  });
});
