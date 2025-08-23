# Design Document

## Overview

The React Chess Game will be a single-page application built with React 19 using functional components and hooks. The architecture follows a component-based design with clear separation of concerns between game logic, UI components, and state management. The application will use CSS modules for styling to maintain the minimal aesthetic while ensuring maintainability and scalability.

## Architecture

### High-Level Architecture

```
App
├── GameModeSelection (initial game mode selection)
│   ├── PvPModeButton
│   ├── AIModeButton
│   └── DifficultySelector
├── GameBoard (main game container)
│   ├── ChessBoard (8x8 grid rendering)
│   │   └── Square (individual board squares)
│   │       └── ChessPiece (piece rendering)
│   ├── GameControls (reset button, mode switching)
│   ├── MoveHistory (move tracking panel)
│   ├── AIThinkingIndicator (loading state for AI moves)
│   └── GameStatusPanel (current player, game mode info)
├── GameLogic (chess rules and validation)
├── AIService (Google Gemini integration)
└── GameModeManager (state management for different game modes)
```

### State Management Strategy

The application will use React's built-in state management with `useState` and `useReducer` hooks:

- **Game State**: Centralized in the main `GameBoard` component using `useReducer`
- **Board State**: 8x8 array representing piece positions
- **Game Metadata**: Current player, move history, game status, game mode
- **UI State**: Selected piece, highlighted squares, animations
- **AI State**: Thinking status, difficulty level, API key management
- **Mode State**: Current game mode (PvP, AI), player assignments

### Data Flow

#### PvP Mode:

1. User clicks on a piece → UI updates selection state
2. User clicks destination → Game logic validates move
3. Valid move → State updates → UI re-renders with animation
4. Move recorded → History panel updates → Switch to next player

#### AI Mode:

1. Human player makes move (same as PvP steps 1-4)
2. AI turn begins → Display thinking indicator
3. Generate FEN from current board state → Send to AI system
4. AI returns SAN move → Parse and validate move
5. Execute validated AI move → Update board and history
6. Switch back to human player

#### Mode Selection:

1. User selects game mode → Update mode state
2. If AI mode → Show difficulty selection
3. Mode confirmed → Initialize game board with proper configuration

## Components and Interfaces

### Core Components

#### 1. App Component

- **Purpose**: Root component and global layout
- **Props**: None
- **State**:
  ```javascript
  {
    gameMode: 'selection' | 'pvp' | 'ai',
    aiDifficulty: 'easy' | 'medium' | 'hard',
    geminiApiKey: string
  }
  ```
- **Responsibilities**:
  - Manage top-level application state
  - Route between game mode selection and game board
  - Handle API key management for Gemini integration

#### 2. GameBoard Component

- **Purpose**: Main game controller and state manager
- **Props**: None
- **State**:
  ```javascript
  {
    board: Array<Array<Piece | null>>, // 8x8 board state
    currentPlayer: 'white' | 'black',
    selectedSquare: [number, number] | null,
    moveHistory: Array<Move>,
    gameStatus: 'playing' | 'check' | 'checkmate' | 'stalemate'
  }
  ```
- **Responsibilities**:
  - Manage game state with useReducer
  - Handle piece selection and movement
  - Coordinate between child components

#### 3. ChessBoard Component

- **Purpose**: Render the 8x8 chess board grid
- **Props**:
  ```javascript
  {
    board: Array<Array<Piece | null>>,
    selectedSquare: [number, number] | null,
    validMoves: Array<[number, number]>,
    onSquareClick: (row: number, col: number) => void
  }
  ```
- **Responsibilities**:
  - Render 64 Square components
  - Handle click events and pass to parent
  - Apply visual highlighting for selected pieces and valid moves

#### 4. Square Component

- **Purpose**: Individual board square rendering
- **Props**:
  ```javascript
  {
    piece: Piece | null,
    isLight: boolean,
    isSelected: boolean,
    isValidMove: boolean,
    isInCheck: boolean,
    onClick: () => void
  }
  ```
- **Responsibilities**:
  - Render square background (light/dark)
  - Render piece if present
  - Apply visual states (selected, valid move, check)

#### 5. ChessPiece Component

- **Purpose**: Render individual chess pieces
- **Props**:
  ```javascript
  {
    type: 'pawn' | 'rook' | 'knight' | 'bishop' | 'queen' | 'king',
    color: 'white' | 'black',
    isAnimating: boolean
  }
  ```
- **Responsibilities**:
  - Display Unicode chess symbols or SVG icons
  - Handle piece animations during moves

#### 6. GameControls Component

- **Purpose**: Game control buttons
- **Props**:
  ```javascript
  {
    onReset: () => void,
    gameStatus: string
  }
  ```
- **Responsibilities**:
  - Render reset button
  - Display current game status

#### 7. MoveHistory Component

- **Purpose**: Display move history panel
- **Props**:
  ```javascript
  {
    moves: Array<Move>,
    currentMoveIndex: number
  }
  ```
- **Responsibilities**:
  - Display moves in algebraic notation
  - Provide scrollable move list

#### 8. GameModeSelection Component

- **Purpose**: Initial game mode selection screen
- **Props**:
  ```javascript
  {
    onModeSelect: (mode: 'pvp' | 'ai', difficulty?: string) => void,
    onApiKeySet: (apiKey: string) => void
  }
  ```
- **Responsibilities**:
  - Display game mode options (PvP vs AI)
  - Handle difficulty selection for AI mode
  - Manage Gemini API key input and validation

#### 9. AIThinkingIndicator Component

- **Purpose**: Visual indicator for AI processing
- **Props**:
  ```javascript
  {
    isThinking: boolean,
    thinkingTime: number
  }
  ```
- **Responsibilities**:
  - Display loading animation when AI is calculating
  - Show elapsed thinking time
  - Provide visual feedback for AI processing state

#### 10. GameStatusPanel Component

- **Purpose**: Display current game information
- **Props**:
  ```javascript
  {
    currentPlayer: 'white' | 'black',
    gameMode: 'pvp' | 'ai',
    gameStatus: string,
    isAITurn: boolean
  }
  ```
- **Responsibilities**:
  - Show whose turn it is
  - Display current game mode
  - Indicate if AI is thinking or human's turn

### Utility Modules

#### 1. GameLogic Module

- **Purpose**: Chess rules and move validation
- **Functions**:
  - `isValidMove(from, to, board, piece)`: Validate piece movement
  - `isInCheck(board, color)`: Check if king is in check
  - `getAllValidMoves(board, color)`: Get all legal moves for a color
  - `makeMove(board, from, to)`: Execute a move and return new board state

#### 2. ChessNotation Module

- **Purpose**: Convert moves to algebraic notation
- **Functions**:
  - `moveToAlgebraic(move, board)`: Convert move to standard notation
  - `parseAlgebraic(notation)`: Parse algebraic notation to move

#### 3. BoardUtils Module

- **Purpose**: Board manipulation utilities
- **Functions**:
  - `initializeBoard()`: Create starting board position
  - `copyBoard(board)`: Deep copy board state
  - `isSquareOccupied(board, position)`: Check if square has piece

#### 4. AIService Module

- **Purpose**: AI chess opponent integration
- **Functions**:
  - `generateFEN(board, gameState)`: Convert board state to FEN notation
  - `requestAIMove(fenString)`: Send FEN to AI and receive SAN move
  - `parseSANMove(sanMove, board)`: Parse SAN notation to board coordinates
  - `validateAIMove(move, board)`: Validate AI move against chess rules
  - `handleAPIError(error)`: Graceful error handling and fallbacks

#### 5. GameModeManager Module

- **Purpose**: Game mode state management
- **Functions**:
  - `switchGameMode(mode, difficulty?)`: Change between PvP and AI modes
  - `isAITurn(currentPlayer, gameMode)`: Determine if it's AI's turn
  - `getPlayerType(color, gameMode)`: Get player type (human/ai) for color
  - `validateGameMode(mode, difficulty)`: Validate mode configuration

## Data Models

### Piece Interface

```javascript
interface Piece {
  type: "pawn" | "rook" | "knight" | "bishop" | "queen" | "king";
  color: "white" | "black";
  hasMoved: boolean; // For castling and en passant
}
```

### Move Interface

```javascript
interface Move {
  from: [number, number];
  to: [number, number];
  piece: Piece;
  capturedPiece?: Piece;
  notation: string;
  timestamp: number;
}
```

### GameState Interface

```javascript
interface GameState {
  board: (Piece | null)[][];
  currentPlayer: "white" | "black";
  selectedSquare: [number, number] | null;
  moveHistory: Move[];
  gameStatus: "playing" | "check" | "checkmate" | "stalemate";
  gameMode: "pvp" | "ai";
  aiDifficulty?: "easy" | "medium" | "hard";
  isAIThinking: boolean;
  humanPlayerColor?: "white" | "black"; // For AI mode
}
```

### FENState Interface

```javascript
interface FENState {
  fenString: string;
  isValid: boolean;
  boardPosition: string;
  activeColor: string;
  castlingRights: string;
  enPassantTarget: string;
  halfmoveClock: number;
  fullmoveNumber: number;
}
```

### SANMove Interface

```javascript
interface SANMove {
  notation: string;
  from: [number, number];
  to: [number, number];
  piece: string;
  isCapture: boolean;
  isCheck: boolean;
  isCheckmate: boolean;
  promotion?: string;
}
```

### GameModeConfig Interface

```javascript
interface GameModeConfig {
  mode: "pvp" | "ai";
  humanPlayerColor?: "white" | "black";
  aiEndpoint?: string;
}
```

## AI Communication Protocol

### FEN-to-SAN Architecture

The AI integration follows a simple, stateless communication protocol:

1. **Input**: Current board state converted to FEN (Forsyth-Edwards Notation)
2. **Output**: AI move response in SAN (Standard Algebraic Notation)

### FEN Generation Process

```javascript
// Example FEN string for starting position:
"rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

// Components:
// 1. Board position: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR"
// 2. Active color: "w" (white to move) or "b" (black to move)
// 3. Castling rights: "KQkq" (King/Queen side for white/black)
// 4. En passant target: "-" (or square like "e3")
// 5. Halfmove clock: "0" (moves since last pawn move or capture)
// 6. Fullmove number: "1" (increments after black's move)
```

### SAN Response Format

The AI will respond with standard algebraic notation moves:

```javascript
// Examples of expected SAN responses:
"e4"; // Pawn to e4
"Nf3"; // Knight to f3
"Bb5+"; // Bishop to b5 with check
"Qxd7#"; // Queen captures on d7 with checkmate
"O-O"; // Kingside castling
"O-O-O"; // Queenside castling
"e8=Q"; // Pawn promotion to queen
"Nbd2"; // Knight from b-file to d2 (disambiguation)
```

### Move Validation Pipeline

1. **Receive SAN**: Parse the SAN string from AI response
2. **Identify Piece**: Determine which piece is moving
3. **Find Source**: Locate the piece's current position
4. **Validate Move**: Ensure move is legal according to chess rules
5. **Execute Move**: Apply the move to the board state
6. **Handle Errors**: Request new move if invalid

### Error Recovery Strategy

- **Invalid SAN Format**: Request new move from AI
- **Illegal Move**: Request new move with error context
- **Ambiguous Move**: Request clarification or use best guess
- **AI Timeout**: Fall back to random legal move
- **Connection Error**: Pause game with retry option

## Error Handling

### Move Validation Errors

- Invalid piece movement patterns
- Moving into check
- Moving opponent's pieces
- Moving to occupied squares (same color)

### UI Error States

- Graceful handling of invalid clicks
- Visual feedback for illegal moves
- Error boundaries for component failures

### AI Error States

- Google Gemini API connection failures
- Invalid API key handling
- Rate limiting and quota exceeded errors
- Malformed AI response handling
- Network timeout and connectivity issues

### Error Recovery

- Reset game state on critical errors
- Maintain move history integrity
- Fallback UI states for rendering issues
- AI fallback to random valid moves on API failure
- Graceful degradation to PvP mode if AI completely fails

## Testing Strategy

### Unit Testing

- **Game Logic**: Test all chess rules and move validation
- **Components**: Test rendering and user interactions
- **Utilities**: Test board manipulation and notation conversion
- **AI Service**: Test API integration with mocked Gemini responses
- **Game Mode Manager**: Test mode switching and player type logic

### Integration Testing

- **Game Flow**: Test complete move sequences
- **State Management**: Test state updates and side effects
- **UI Interactions**: Test click handlers and visual feedback
- **AI Integration**: Test complete AI move cycles with mocked API
- **Mode Switching**: Test transitions between PvP and AI modes

### AI Testing

- **API Mocking**: Mock Gemini API responses for consistent testing
- **Error Scenarios**: Test all AI error conditions and fallbacks
- **Move Validation**: Ensure AI moves comply with chess rules
- **Difficulty Testing**: Verify different difficulty levels produce appropriate moves

### Test Structure

```
src/
├── __tests__/
│   ├── components/
│   │   ├── GameBoard.test.js
│   │   ├── ChessBoard.test.js
│   │   ├── Square.test.js
│   │   ├── GameModeSelection.test.js
│   │   ├── AIThinkingIndicator.test.js
│   │   └── GameStatusPanel.test.js
│   ├── utils/
│   │   ├── gameLogic.test.js
│   │   ├── chessNotation.test.js
│   │   ├── aiService.test.js
│   │   └── gameModeManager.test.js
│   ├── integration/
│   │   ├── gameFlow.test.js
│   │   ├── aiGameFlow.test.js
│   │   └── modeTransitions.test.js
│   └── mocks/
│       └── geminiAPI.mock.js
```

### Testing Approach

- Use React Testing Library for component testing
- Mock complex game logic for UI tests
- Test chess rules with comprehensive move scenarios
- Snapshot testing for UI consistency
- Mock Google Gemini API for AI testing
- Test error handling and fallback scenarios
- Performance testing for AI response times

## Styling Architecture

### CSS Modules Structure

```
src/styles/
├── components/
│   ├── GameBoard.module.css
│   ├── ChessBoard.module.css
│   ├── Square.module.css
│   ├── MoveHistory.module.css
│   ├── GameModeSelection.module.css
│   ├── AIThinkingIndicator.module.css
│   └── GameStatusPanel.module.css
├── globals.css
├── variables.css
└── animations.css
```

### Design System

- **Colors**: Minimal palette with light/dark squares, accent colors for selection
- **Typography**: Clean, minimal font for move history and UI text
- **Spacing**: Consistent grid-based spacing system
- **Animations**: Subtle transitions for piece movements and UI feedback

### Responsive Design

- Mobile-first approach with breakpoints
- Scalable board size based on viewport
- Collapsible move history on small screens
- Touch-friendly interaction targets
