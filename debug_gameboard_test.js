/**
 * Debug test for GameBoard component state changes
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock the child components to isolate GameBoard logic
jest.mock('./src/components/ChessBoard/ChessBoard.js', () => {
  return function MockChessBoard({ onSquareClick, selectedSquare, validMoves }) {
    console.log('ChessBoard render - selectedSquare:', selectedSquare, 'validMoves:', validMoves.length);
    return (
      <div data-testid="chess-board">
        <button data-testid="square-6-4" onClick={() => {
          console.log('Clicking square 6,4 (white pawn)');
          onSquareClick(6, 4);
        }}>
          White Pawn
        </button>
        <button data-testid="square-4-4" onClick={() => {
          console.log('Clicking square 4,4 (empty)');
          onSquareClick(4, 4);
        }}>
          Empty Square
        </button>
        <div data-testid="selected-square">
          {selectedSquare ? `${selectedSquare[0]},${selectedSquare[1]}` : "none"}
        </div>
      </div>
    );
  };
});

jest.mock('./src/components/GameControls/GameControls.js', () => {
  return function MockGameControls({ gameStatus, currentPlayer, onReset }) {
    console.log('GameControls render - gameStatus:', gameStatus, 'currentPlayer:', currentPlayer);
    return (
      <div data-testid="game-controls">
        <div data-testid="current-player">{currentPlayer}</div>
        <div data-testid="game-status">{gameStatus}</div>
        <button data-testid="reset-button" onClick={onReset}>Reset</button>
      </div>
    );
  };
});

jest.mock('./src/components/MoveHistory/MoveHistory.js', () => {
  return function MockMoveHistory({ moves }) {
    console.log('MoveHistory render - moves count:', moves.length);
    return (
      <div data-testid="move-history">
        <div data-testid="move-count">{moves.length}</div>
      </div>
    );
  };
});

// Mock other components
jest.mock('./src/components/PromotionDialog/PromotionDialog.js', () => {
  return function MockPromotionDialog() {
    return <div data-testid="promotion-dialog" />;
  };
});

jest.mock('./src/components/GameOverModal/GameOverModal.js', () => {
  return function MockGameOverModal() {
    return <div data-testid="game-over-modal" />;
  };
});

import GameBoard from './src/components/GameBoard/GameBoard.js';

describe('GameBoard Debug Test', () => {
  test('traces state changes during move', () => {
    console.log('=== Starting GameBoard test ===');
    
    render(<GameBoard />);
    
    console.log('=== Initial render complete ===');
    console.log('Initial current player:', screen.getByTestId('current-player').textContent);
    
    // Select white pawn
    console.log('=== Selecting white pawn at 6,4 ===');
    fireEvent.click(screen.getByTestId('square-6-4'));
    
    console.log('After selection - current player:', screen.getByTestId('current-player').textContent);
    console.log('Selected square:', screen.getByTestId('selected-square').textContent);
    
    // Move pawn
    console.log('=== Moving pawn to 4,4 ===');
    fireEvent.click(screen.getByTestId('square-4-4'));
    
    console.log('After move - current player:', screen.getByTestId('current-player').textContent);
    console.log('Move count:', screen.getByTestId('move-count').textContent);
    console.log('Selected square:', screen.getByTestId('selected-square').textContent);
    
    console.log('=== Test complete ===');
  });
});