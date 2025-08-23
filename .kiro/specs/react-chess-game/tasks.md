# Implementation Plan

- [x] 1. Set up project structure and core interfaces

  - Create directory structure for components, utils, and styles
  - Define TypeScript-style interfaces and constants for game pieces and state
  - Set up CSS modules configuration and global styles
  - _Requirements: 7.3, 7.4, 6.5_

- [ ] 2. Implement core data models and utilities
- [x] 2.1 Create chess piece and game state interfaces

  - Write interfaces for Piece, Move, and GameState objects
  - Create constants for piece types, colors, and initial board setup
  - Implement board initialization utility function
  - _Requirements: 1.2, 7.1, 7.4_

- [x] 2.2 Implement basic board manipulation utilities

  - Write functions for board copying, square validation, and coordinate conversion
  - Create utility functions for checking square occupancy and piece ownership
  - Write unit tests for board utility functions
  - _Requirements: 1.1, 7.4_

- [ ] 3. Create basic UI components with minimal styling
- [x] 3.1 Implement Square component with CSS modules

  - Create Square component that renders individual board squares
  - Implement alternating light/dark square styling using CSS modules
  - Add click handling and visual state management (selected, highlighted)
  - Write unit tests for Square component rendering and interactions
  - _Requirements: 1.1, 6.1, 6.2, 6.3, 7.1_

- [x] 3.2 Implement ChessPiece component with Unicode symbols

  - Create ChessPiece component that displays Unicode chess symbols
  - Implement piece rendering for all 6 piece types in both colors
  - Add basic styling for piece display and positioning
  - Write unit tests for piece rendering with different types and colors
  - _Requirements: 1.3, 6.2, 7.1_

- [x] 3.3 Create ChessBoard component for 8x8 grid rendering

  - Implement ChessBoard component that renders 64 Square components
  - Add responsive grid layout using CSS modules
  - Implement proper square positioning and coordinate mapping
  - Write unit tests for board rendering and grid layout
  - _Requirements: 1.1, 1.4, 6.1, 7.1_

- [ ] 4. Implement basic chess game logic
- [x] 4.1 Create move validation for individual piece types

  - Implement movement rules for pawns (including initial two-square move)
  - Implement movement rules for rooks, bishops, and queens
  - Implement movement rules for knights and kings
  - Write comprehensive unit tests for each piece type's valid moves
  - _Requirements: 3.1, 7.4_

- [x] 4.2 Implement board state validation and check detection

  - Create function to detect if a king is in check
  - Implement validation to prevent moves that would put own king in check
  - Add logic to determine if a move is blocked by other pieces
  - Write unit tests for check detection and move blocking scenarios
  - _Requirements: 3.2, 3.5, 7.4_

- [x] 4.3 Create move execution and capture logic

  - Implement function to execute valid moves and update board state
  - Add logic for capturing opponent pieces and removing them from board
  - Implement basic pawn promotion to queen functionality
  - Write unit tests for move execution and piece capture scenarios
  - _Requirements: 3.3, 3.4, 7.4_

- [x] 5. Implement main game state management
- [x] 5.1 Create GameBoard component with useReducer for state management

  - Implement GameBoard component using useReducer for complex state management
  - Create reducer function to handle game actions (select piece, make move, reset)
  - Initialize game state with standard chess starting position
  - Write unit tests for state management and reducer actions
  - _Requirements: 1.2, 2.5, 7.1, 7.4_

- [x] 5.2 Implement piece selection and move highlighting

  - Add logic to handle piece selection on square clicks
  - Implement highlighting of selected pieces and valid move destinations
  - Add turn-based logic to only allow current player to move their pieces
  - Write unit tests for piece selection and turn management
  - _Requirements: 2.1, 2.5, 7.1_

- [x] 5.3 Integrate move validation with user interactions

  - Connect click handlers to move validation logic
  - Implement move execution when user clicks on valid destination
  - Add visual feedback for invalid move attempts
  - Write integration tests for complete move sequences
  - _Requirements: 2.2, 2.3, 3.1, 7.1_

- [x] 6. Create move history and game controls
- [x] 6.1 Implement chess notation conversion utilities

  - Create functions to convert moves to algebraic notation
  - Implement move history tracking in game state
  - Add logic to generate proper chess notation for different move types
  - Write unit tests for notation conversion with various move scenarios
  - _Requirements: 4.1, 7.4_

- [x] 6.2 Create MoveHistory component for displaying move list

  - Implement MoveHistory component with scrollable move list
  - Add minimal styling using CSS modules for clean appearance
  - Display moves in chronological order with proper formatting
  - Write unit tests for move history rendering and scrolling
  - _Requirements: 4.2, 4.3, 4.4, 6.3, 7.1_

- [x] 6.3 Implement GameControls component with reset functionality

  - Create GameControls component with reset button
  - Implement reset action to return game to initial state
  - Add minimal styling consistent with overall design
  - Write unit tests for reset functionality and state clearing
  - _Requirements: 5.1, 5.2, 5.3, 6.1, 6.2, 7.1_

- [x] 7. Add animations and visual enhancements
- [x] 7.1 Implement smooth piece movement animations

  - Add CSS transitions for piece movements between squares
  - Implement animation state management in components
  - Create smooth visual feedback for piece selection and moves
  - Write tests to verify animation classes are applied correctly
  - _Requirements: 2.4, 6.2, 6.4_

- [x] 7.2 Add visual indicators for check and game status

  - Implement visual highlighting when king is in check
  - Add game status display in GameControls component
  - Create visual feedback for different game states
  - Write unit tests for visual state indicators
  - _Requirements: 3.5, 6.1, 6.2_

- [x] 8. Integrate all components and finalize application
- [x] 8.1 Create main App component and integrate all features

  - Implement App component that renders GameBoard with all child components
  - Add responsive layout for board, controls, and move history
  - Ensure proper component communication and data flow
  - Write integration tests for complete application functionality
  - _Requirements: 6.1, 1.4, 7.2, 7.3_

- [x] 8.2 Implement responsive design and mobile optimization

  - Add responsive breakpoints and mobile-friendly layouts
  - Optimize touch interactions for mobile devices
  - Ensure board scales properly on different screen sizes
  - Write tests for responsive behavior across different viewports
  - _Requirements: 1.4, 6.1, 6.4_

- [x] 8.3 Add final styling polish and accessibility features

  - Apply final minimal styling touches and color scheme
  - Add keyboard navigation support for accessibility
  - Implement proper ARIA labels and semantic HTML
  - Write accessibility tests and verify compliance
  - _Requirements: 6.2, 6.3, 6.4, 7.1_

- [-] 9. Fix and enhance checkmate/game over functionality
- [x] 9.1 Debug and fix checkmate detection in actual gameplay

  - Investigate why checkmate scenarios don't properly end the game
  - Ensure game status updates correctly after each move
  - Verify that UI properly displays checkmate/stalemate messages
  - Test with real checkmate scenarios to ensure game ends properly
  - _Requirements: 3.5, 5.1, 5.2_

- [ ] 9.2 Add visual feedback for game over states

  - Enhance checkmate/stalemate visual indicators
  - Add game over overlay or modal for clear end-game communication
  - Implement proper game over animations and transitions
  - Ensure reset button is prominently displayed when game ends
  - _Requirements: 6.1, 6.2, 7.2_

- [ ] 9.3 Create comprehensive end-game testing scenarios

  - Create test scenarios that lead to actual checkmate positions
  - Write integration tests that verify complete game over flow
  - Test edge cases like stalemate and insufficient material
  - Verify that all game over states prevent further moves
  - _Requirements: 7.4, 5.3_

- [-] 10. Implement pawn promotion choice functionality
- [x] 10.1 Create pawn promotion UI component

  - Design and implement a promotion selection modal/dialog
  - Allow player to choose between queen, rook, bishop, or knight
  - Add proper styling and accessibility features for the promotion UI
  - Ensure the promotion dialog appears when pawn reaches the last rank
  - _Requirements: 3.4, 6.1, 6.2, 7.1_

- [x] 10.2 Update game logic to handle promotion choices

  - Modify the move execution to pause for promotion selection
  - Update the game state to handle pending promotion moves
  - Implement promotion piece selection and move completion
  - Ensure proper game flow continues after promotion choice
  - _Requirements: 3.4, 2.5, 7.4_

- [x] 10.3 Integrate promotion functionality with existing game flow

  - Update GameBoard component to handle promotion states
  - Modify move validation to account for promotion scenarios
  - Add promotion choice to move history and chess notation
  - Write comprehensive tests for all promotion scenarios
  - _Requirements: 3.4, 4.1, 4.2, 7.4_

- [x] 11. Implement Game Mode Selection and Management
- [x] 11.1 Create GameModeSelection component and UI

  - Design and implement game mode selection screen
  - Add PvP vs AI mode selection buttons with clear visual distinction
  - Implement difficulty selector for AI mode (Easy, Medium, Hard)
  - Add Google Gemini API key input and validation
  - Create minimal, clean styling consistent with overall design
  - _Requirements: 7.1, 7.6, 9.1, 9.2, 9.5_

- [x] 11.2 Implement GameModeManager utility module

  - Create functions for game mode state management
  - Implement mode switching logic between PvP and AI
  - Add player type determination logic (human vs AI)
  - Create game mode validation and configuration management
  - Write comprehensive unit tests for all mode management functions
  - _Requirements: 7.1, 7.2, 7.3, 9.1, 9.5_

- [x] 11.3 Update App component for mode routing

  - Modify App component to handle game mode selection state
  - Implement routing logic between mode selection and game board
  - Add top-level state management for game mode and API configuration
  - Integrate mode selection with existing game initialization
  - Write integration tests for mode selection flow
  - _Requirements: 7.1, 7.6, 9.1, 9.5_

- [x] 12. Implement Google Gemini AI Integration
- [x] 12.1 Create AIService module for Gemini API integration

  - Set up Google Gemini AI API client configuration
  - Implement board state formatting for AI consumption
  - Create move request function with difficulty level support
  - Add AI response parsing and move validation
  - Implement comprehensive error handling and fallback mechanisms
  - _Requirements: 8.1, 8.2, 8.3, 8.5, 9.1_

- [ ] 12.2 Implement AI move calculation and execution

  - Create prompts for different difficulty levels (Easy, Medium, Hard)
  - Implement AI move evaluation and selection logic
  - Add move confidence scoring and reasoning extraction
  - Ensure AI moves comply with all chess rules and validations
  - Create fallback to random valid moves on API failures
  - _Requirements: 8.1, 8.3, 8.4, 8.5, 9.1_

- [x] 12.3 Add AI thinking indicator and user feedback

  - Create AIThinkingIndicator component with loading animation
  - Implement thinking time tracking and display
  - Add visual feedback for AI processing states
  - Create smooth transitions between human and AI turns
  - Write unit tests for AI indicator component
  - _Requirements: 8.2, 6.1, 6.2, 9.1_

- [x] 13. Integrate AI with Game Flow
- [x] 13.1 Update GameBoard component for AI integration

  - Modify game state to include AI mode and thinking status
  - Implement AI turn detection and automatic move triggering
  - Add AI move execution with proper state updates
  - Ensure turn alternation works correctly in AI mode
  - Create seamless integration with existing move validation
  - _Requirements: 7.2, 7.3, 8.1, 8.3, 9.1_

- [x] 13.2 Implement AI game flow and turn management

  - Create AI turn triggering logic after human moves
  - Implement proper game flow for AI vs human gameplay
  - Add game state validation for AI moves
  - Ensure AI respects all game rules (check, checkmate, stalemate)
  - Create comprehensive AI game flow testing
  - _Requirements: 7.2, 7.5, 8.1, 8.3, 9.1_

- [x] 13.3 Add GameStatusPanel for enhanced game information

  - Create component to display current player and game mode
  - Add visual indicators for AI thinking vs human turn
  - Implement game status display with mode-specific information
  - Add minimal styling consistent with overall design
  - Write unit tests for status panel functionality
  - _Requirements: 6.1, 6.2, 7.1, 8.2, 9.1_

- [ ] 14. Enhance UI for Multi-Mode Support
- [ ] 14.1 Update GameControls for mode switching

  - Add mode switching functionality to game controls
  - Implement reset button that respects current game mode
  - Add game mode display in controls panel
  - Create confirmation dialogs for mode changes during games
  - Write tests for enhanced game controls
  - _Requirements: 5.1, 5.2, 6.1, 7.6, 9.1_

- [ ] 14.2 Enhance visual feedback for different game modes

  - Add visual indicators to distinguish PvP from AI mode
  - Implement different color schemes or indicators for AI turns
  - Create enhanced animations for AI move execution
  - Add mode-specific visual feedback and status indicators
  - Ensure all visual enhancements maintain minimal design aesthetic
  - _Requirements: 6.1, 6.2, 6.4, 8.2, 9.1_

- [ ] 15. Testing and Error Handling
- [ ] 15.1 Create comprehensive AI testing suite

  - Write unit tests for AIService module with mocked API responses
  - Create integration tests for complete AI game flows
  - Test all AI error scenarios and fallback mechanisms
  - Implement performance tests for AI response times
  - Create mock Gemini API for consistent testing
  - _Requirements: 8.5, 9.1, 9.4, 9.5_

- [ ] 15.2 Test game mode transitions and edge cases

  - Test switching between PvP and AI modes during games
  - Create tests for all difficulty levels and AI behaviors
  - Test API key validation and error handling
  - Ensure proper state management across mode changes
  - Write integration tests for complete mode selection flow
  - _Requirements: 7.6, 8.5, 9.1, 9.5_

- [ ] 15.3 Implement comprehensive error handling
  - Add graceful degradation when AI service fails
  - Implement user-friendly error messages for API issues
  - Create fallback to PvP mode when AI completely fails
  - Add retry mechanisms for temporary API failures
  - Ensure all error states maintain game playability
  - _Requirements: 8.5, 9.1, 9.5_
