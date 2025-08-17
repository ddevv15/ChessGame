/**
 * Test game flow leading to checkmate
 */
import {
  getGameStatus,
  isCheckmate,
  getAllLegalMovesForColor,
} from "../../utils/gameLogic";
import {
  createInitialGameState,
  PIECE_COLORS,
  PIECE_TYPES,
} from "../../constants/gameConstants";

describe("Game Flow Checkmate Test", () => {
  test("verify checkmate detection works with manual setup", () => {
    console.log("=== Testing Checkmate Detection ===");

    // Create a simple checkmate position manually
    const board = Array(8)
      .fill(null)
      .map(() => Array(8).fill(null));

    // Black king in corner, White queen and king for mate
    board[0][0] = { type: PIECE_TYPES.KING, color: PIECE_COLORS.BLACK };
    board[1][1] = { type: PIECE_TYPES.QUEEN, color: PIECE_COLORS.WHITE };
    board[2][1] = { type: PIECE_TYPES.KING, color: PIECE_COLORS.WHITE };

    const finalStatus = getGameStatus(board, PIECE_COLORS.BLACK);
    console.log("Final status:", finalStatus);
    console.log("Is checkmate?", isCheckmate(board, PIECE_COLORS.BLACK));

    const blackMoves = getAllLegalMovesForColor(board, PIECE_COLORS.BLACK);
    console.log("Black legal moves:", blackMoves.length);

    // This should be checkmate
    expect(finalStatus).toBe("checkmate");
  });

  test("verify initial game status is playing", () => {
    const gameState = createInitialGameState();
    const status = getGameStatus(gameState.board, PIECE_COLORS.WHITE);

    console.log("Initial game status:", status);
    expect(status).toBe("playing");
  });

  test("test if the issue is in the UI integration", () => {
    // Let's see if the problem is in how the GameBoard component handles status updates
    const gameState = createInitialGameState();

    // Verify the initial state structure
    console.log("Initial game state structure:");
    console.log("- board exists:", !!gameState.board);
    console.log("- currentPlayer:", gameState.currentPlayer);
    console.log("- gameStatus:", gameState.gameStatus);
    console.log("- selectedSquare:", gameState.selectedSquare);
    console.log("- validMoves:", gameState.validMoves);
    console.log("- moveHistory:", gameState.moveHistory);

    expect(gameState.gameStatus).toBe("playing");
    expect(gameState.currentPlayer).toBe(PIECE_COLORS.WHITE);
  });
});
