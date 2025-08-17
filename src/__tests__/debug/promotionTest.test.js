/**
 * Test pawn promotion functionality with manual setup
 */
import { makeMove, isPromotion, executeMove } from "../../utils/gameLogic";
import { PIECE_TYPES, PIECE_COLORS } from "../../constants/gameConstants";

describe("Pawn Promotion Logic Test", () => {
  test("detects when pawn promotion is needed", () => {
    // Create a board with a white pawn on the 7th rank
    const board = Array(8)
      .fill(null)
      .map(() => Array(8).fill(null));

    // White pawn on 7th rank (row 1)
    board[1][4] = { type: PIECE_TYPES.PAWN, color: PIECE_COLORS.WHITE };

    // Kings for valid board state
    board[0][0] = { type: PIECE_TYPES.KING, color: PIECE_COLORS.BLACK };
    board[7][7] = { type: PIECE_TYPES.KING, color: PIECE_COLORS.WHITE };

    // Check if moving to 8th rank (row 0) would be promotion
    const needsPromotion = isPromotion(board, 1, 4, 0, 4);
    console.log(
      "White pawn moving to 8th rank needs promotion:",
      needsPromotion
    );
    expect(needsPromotion).toBe(true);

    // Check if normal pawn move doesn't need promotion
    const normalMove = isPromotion(board, 1, 4, 0, 3); // diagonal capture
    console.log("White pawn diagonal move needs promotion:", normalMove);
    expect(normalMove).toBe(true); // Still promotion because it's to the 8th rank

    // Test black pawn promotion
    board[6][3] = { type: PIECE_TYPES.PAWN, color: PIECE_COLORS.BLACK };
    const blackPromotion = isPromotion(board, 6, 3, 7, 3);
    console.log(
      "Black pawn moving to 1st rank needs promotion:",
      blackPromotion
    );
    expect(blackPromotion).toBe(true);
  });

  test("executeMove handles promotion correctly", () => {
    const board = Array(8)
      .fill(null)
      .map(() => Array(8).fill(null));

    // White pawn ready to promote
    board[1][4] = { type: PIECE_TYPES.PAWN, color: PIECE_COLORS.WHITE };
    board[0][0] = { type: PIECE_TYPES.KING, color: PIECE_COLORS.BLACK };
    board[7][7] = { type: PIECE_TYPES.KING, color: PIECE_COLORS.WHITE };

    // Execute move without promotion piece (should indicate needs promotion)
    const result1 = executeMove(board, 1, 4, 0, 4);
    console.log(
      "Move without promotion piece - needs promotion:",
      result1.needsPromotion
    );
    expect(result1.needsPromotion).toBe(true);
    expect(result1.promotedPiece).toEqual({
      type: PIECE_TYPES.QUEEN,
      color: PIECE_COLORS.WHITE,
      hasMoved: true,
    });

    // Execute move with promotion piece
    const result2 = executeMove(board, 1, 4, 0, 4, PIECE_TYPES.QUEEN);
    console.log(
      "Move with queen promotion - needs promotion:",
      result2.needsPromotion
    );
    console.log("Promoted piece:", result2.promotedPiece);
    expect(result2.needsPromotion).toBe(false);
    expect(result2.promotedPiece).toEqual({
      type: PIECE_TYPES.QUEEN,
      color: PIECE_COLORS.WHITE,
      hasMoved: true,
    });

    // Check that the piece on the board is the promoted piece
    expect(result2.newBoard[0][4]).toEqual({
      type: PIECE_TYPES.QUEEN,
      color: PIECE_COLORS.WHITE,
      hasMoved: true,
    });
  });

  test("makeMove handles promotion flow", () => {
    const board = Array(8)
      .fill(null)
      .map(() => Array(8).fill(null));

    // White pawn ready to promote
    board[1][4] = { type: PIECE_TYPES.PAWN, color: PIECE_COLORS.WHITE };
    board[0][0] = { type: PIECE_TYPES.KING, color: PIECE_COLORS.BLACK };
    board[7][7] = { type: PIECE_TYPES.KING, color: PIECE_COLORS.WHITE };

    // Make move without promotion piece
    const result1 = makeMove(board, 1, 4, 0, 4);
    console.log(
      "makeMove without promotion - needs promotion:",
      result1.needsPromotion
    );
    expect(result1.needsPromotion).toBe(true);

    // Make move with promotion piece
    const result2 = makeMove(board, 1, 4, 0, 4, PIECE_TYPES.ROOK);
    console.log(
      "makeMove with rook promotion - needs promotion:",
      result2.needsPromotion
    );
    console.log("Move details:", result2.move);
    expect(result2.needsPromotion).toBe(false);
    expect(result2.move.isPromotion).toBe(true);
    expect(result2.move.promotedPiece.type).toBe(PIECE_TYPES.ROOK);
  });

  test("promotion works with all piece types", () => {
    const board = Array(8)
      .fill(null)
      .map(() => Array(8).fill(null));

    // White pawn ready to promote
    board[1][4] = { type: PIECE_TYPES.PAWN, color: PIECE_COLORS.WHITE };
    board[0][0] = { type: PIECE_TYPES.KING, color: PIECE_COLORS.BLACK };
    board[7][7] = { type: PIECE_TYPES.KING, color: PIECE_COLORS.WHITE };

    const promotionPieces = [
      PIECE_TYPES.QUEEN,
      PIECE_TYPES.ROOK,
      PIECE_TYPES.BISHOP,
      PIECE_TYPES.KNIGHT,
    ];

    promotionPieces.forEach((pieceType) => {
      const result = makeMove(board, 1, 4, 0, 4, pieceType);
      console.log(`Promotion to ${pieceType}:`, result.move.promotedPiece);

      expect(result.needsPromotion).toBe(false);
      expect(result.move.isPromotion).toBe(true);
      expect(result.move.promotedPiece.type).toBe(pieceType);
      expect(result.move.promotedPiece.color).toBe(PIECE_COLORS.WHITE);
      expect(result.newBoard[0][4].type).toBe(pieceType);
    });
  });

  test("black pawn promotion works correctly", () => {
    const board = Array(8)
      .fill(null)
      .map(() => Array(8).fill(null));

    // Black pawn ready to promote
    board[6][3] = { type: PIECE_TYPES.PAWN, color: PIECE_COLORS.BLACK };
    board[0][0] = { type: PIECE_TYPES.KING, color: PIECE_COLORS.BLACK };
    board[7][7] = { type: PIECE_TYPES.KING, color: PIECE_COLORS.WHITE };

    const result = makeMove(board, 6, 3, 7, 3, PIECE_TYPES.KNIGHT);
    console.log("Black pawn promotion to knight:", result.move.promotedPiece);

    expect(result.needsPromotion).toBe(false);
    expect(result.move.isPromotion).toBe(true);
    expect(result.move.promotedPiece.type).toBe(PIECE_TYPES.KNIGHT);
    expect(result.move.promotedPiece.color).toBe(PIECE_COLORS.BLACK);
    expect(result.newBoard[7][3].type).toBe(PIECE_TYPES.KNIGHT);
    expect(result.newBoard[7][3].color).toBe(PIECE_COLORS.BLACK);
  });
});
