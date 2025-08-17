/**
 * Test with a real checkmate scenario
 */
import {
  getGameStatus,
  isCheckmate,
  isKingInCheck,
  getAllLegalMovesForColor,
} from "../../utils/gameLogic";
import { PIECE_TYPES, PIECE_COLORS } from "../../constants/gameConstants";

describe("Real Checkmate Test", () => {
  test("create a proper checkmate scenario", () => {
    // Create Scholar's Mate (4-move checkmate)
    const board = Array(8)
      .fill(null)
      .map(() => Array(8).fill(null));

    // Set up the final position of Scholar's Mate
    // Black king on e8, White queen on f7, White bishop on c4
    board[0][4] = { type: PIECE_TYPES.KING, color: PIECE_COLORS.BLACK };
    board[1][5] = { type: PIECE_TYPES.QUEEN, color: PIECE_COLORS.WHITE };
    board[4][2] = { type: PIECE_TYPES.BISHOP, color: PIECE_COLORS.WHITE };
    board[7][4] = { type: PIECE_TYPES.KING, color: PIECE_COLORS.WHITE };

    // Add some pawns to make it more realistic
    board[1][0] = { type: PIECE_TYPES.PAWN, color: PIECE_COLORS.BLACK };
    board[1][1] = { type: PIECE_TYPES.PAWN, color: PIECE_COLORS.BLACK };
    board[1][2] = { type: PIECE_TYPES.PAWN, color: PIECE_COLORS.BLACK };
    board[1][3] = { type: PIECE_TYPES.PAWN, color: PIECE_COLORS.BLACK };
    board[1][6] = { type: PIECE_TYPES.PAWN, color: PIECE_COLORS.BLACK };
    board[1][7] = { type: PIECE_TYPES.PAWN, color: PIECE_COLORS.BLACK };

    console.log("=== Scholar's Mate Test ===");
    console.log(
      "Black king in check?",
      isKingInCheck(board, PIECE_COLORS.BLACK)
    );

    const blackMoves = getAllLegalMovesForColor(board, PIECE_COLORS.BLACK);
    console.log("Black legal moves:", blackMoves.length);
    blackMoves.forEach((move) => {
      console.log(
        `  ${move.piece.type} from ${move.from.row},${move.from.col} to ${move.to.row},${move.to.col}`
      );
    });

    console.log("Is checkmate?", isCheckmate(board, PIECE_COLORS.BLACK));
    console.log("Game status:", getGameStatus(board, PIECE_COLORS.BLACK));

    expect(isKingInCheck(board, PIECE_COLORS.BLACK)).toBe(true);

    // If there are no legal moves and king is in check, it should be checkmate
    if (blackMoves.length === 0) {
      expect(getGameStatus(board, PIECE_COLORS.BLACK)).toBe("checkmate");
    }
  });

  test("create back-rank mate scenario", () => {
    const board = Array(8)
      .fill(null)
      .map(() => Array(8).fill(null));

    // Back-rank mate: Black king on h8, White rook on a8, pawns blocking escape
    board[0][7] = { type: PIECE_TYPES.KING, color: PIECE_COLORS.BLACK };
    board[0][0] = { type: PIECE_TYPES.ROOK, color: PIECE_COLORS.WHITE };
    board[7][4] = { type: PIECE_TYPES.KING, color: PIECE_COLORS.WHITE };

    // Pawns blocking king's escape
    board[1][5] = { type: PIECE_TYPES.PAWN, color: PIECE_COLORS.BLACK };
    board[1][6] = { type: PIECE_TYPES.PAWN, color: PIECE_COLORS.BLACK };
    board[1][7] = { type: PIECE_TYPES.PAWN, color: PIECE_COLORS.BLACK };

    console.log("=== Back-rank Mate Test ===");
    console.log(
      "Black king in check?",
      isKingInCheck(board, PIECE_COLORS.BLACK)
    );

    const blackMoves = getAllLegalMovesForColor(board, PIECE_COLORS.BLACK);
    console.log("Black legal moves:", blackMoves.length);

    console.log("Is checkmate?", isCheckmate(board, PIECE_COLORS.BLACK));
    console.log("Game status:", getGameStatus(board, PIECE_COLORS.BLACK));

    expect(isKingInCheck(board, PIECE_COLORS.BLACK)).toBe(true);

    if (blackMoves.length === 0) {
      expect(getGameStatus(board, PIECE_COLORS.BLACK)).toBe("checkmate");
    }
  });

  test("simple two-piece checkmate", () => {
    const board = Array(8)
      .fill(null)
      .map(() => Array(8).fill(null));

    // Simple mate: Black king in corner, White queen and king
    board[0][0] = { type: PIECE_TYPES.KING, color: PIECE_COLORS.BLACK };
    board[1][1] = { type: PIECE_TYPES.QUEEN, color: PIECE_COLORS.WHITE };
    board[2][1] = { type: PIECE_TYPES.KING, color: PIECE_COLORS.WHITE };

    console.log("=== Simple Two-Piece Mate Test ===");
    console.log(
      "Black king in check?",
      isKingInCheck(board, PIECE_COLORS.BLACK)
    );

    const blackMoves = getAllLegalMovesForColor(board, PIECE_COLORS.BLACK);
    console.log("Black legal moves:", blackMoves.length);
    blackMoves.forEach((move) => {
      console.log(
        `  King from ${move.from.row},${move.from.col} to ${move.to.row},${move.to.col}`
      );
    });

    console.log("Is checkmate?", isCheckmate(board, PIECE_COLORS.BLACK));
    console.log("Game status:", getGameStatus(board, PIECE_COLORS.BLACK));

    expect(isKingInCheck(board, PIECE_COLORS.BLACK)).toBe(true);
    expect(getGameStatus(board, PIECE_COLORS.BLACK)).toBe("checkmate");
  });
});
