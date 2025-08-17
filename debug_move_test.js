/**
 * Debug test to isolate the move execution issue
 */
import { makeMove, isLegalMove, getValidMoves } from "./src/utils/gameLogic.js";
import { initializeBoard } from "./src/utils/boardUtils.js";
import { PIECE_COLORS, getOpponentColor } from "./src/constants/gameConstants.js";

// Test basic pawn move
const board = initializeBoard();
console.log("Initial board setup complete");

// Check if pawn move from (6,4) to (4,4) is legal
const isLegal = isLegalMove(board, 6, 4, 4, 4);
console.log("Is pawn move (6,4) to (4,4) legal?", isLegal);

// Get valid moves for the pawn
const validMoves = getValidMoves(board, 6, 4);
console.log("Valid moves for pawn at (6,4):", validMoves);

// Try to execute the move
if (isLegal) {
  try {
    const moveResult = makeMove(board, 6, 4, 4, 4);
    console.log("Move executed successfully");
    console.log("Move details:", moveResult.move);
    
    // Test player switching
    const currentPlayer = PIECE_COLORS.WHITE;
    const newPlayer = getOpponentColor(currentPlayer);
    console.log("Current player:", currentPlayer);
    console.log("New player after move:", newPlayer);
    
  } catch (error) {
    console.error("Move execution failed:", error.message);
  }
} else {
  console.log("Move is not legal, cannot execute");
}