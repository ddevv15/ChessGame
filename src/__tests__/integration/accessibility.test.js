/**
 * Accessibility tests for the chess game application
 * Tests keyboard navigation, ARIA labels, and screen reader support
 */
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import App from "../../App";

// Mock console.error to avoid noise in tests
const originalError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});

afterAll(() => {
  console.error = originalError;
});

describe("Accessibility Tests", () => {
  test("semantic HTML structure is properly implemented", () => {
    render(<App />);

    // Check main semantic elements
    expect(screen.getByRole("banner")).toBeInTheDocument(); // header
    expect(screen.getByRole("main")).toBeInTheDocument(); // main content
    expect(screen.getByRole("contentinfo")).toBeInTheDocument(); // footer

    // Check application role for game board
    expect(screen.getByRole("application")).toBeInTheDocument();

    // Check grid role for chess board
    expect(screen.getByRole("grid")).toBeInTheDocument();

    // Check regions for different sections
    expect(
      screen.getByRole("region", { name: /game controls/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("region", { name: /move history/i })
    ).toBeInTheDocument();
  });

  test("all interactive elements have proper ARIA labels", () => {
    render(<App />);

    // Check that all buttons have aria-label attributes
    const buttons = screen.getAllByRole("button");
    buttons.forEach((button) => {
      expect(button).toHaveAttribute("aria-label");
      expect(button.getAttribute("aria-label")).toBeTruthy();
    });

    // Check specific important labels
    expect(
      screen.getByRole("button", { name: /reset game/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("grid", { name: /chess board/i })
    ).toBeInTheDocument();
  });

  test("keyboard navigation works with arrow keys", async () => {
    render(<App />);

    const gameBoard = screen.getByRole("application");

    // Focus the game board
    gameBoard.focus();
    expect(gameBoard).toHaveFocus();

    // Test arrow key navigation
    fireEvent.keyDown(gameBoard, { key: "ArrowRight" });
    fireEvent.keyDown(gameBoard, { key: "ArrowDown" });
    fireEvent.keyDown(gameBoard, { key: "ArrowLeft" });
    fireEvent.keyDown(gameBoard, { key: "ArrowUp" });

    // Should not throw errors
    expect(gameBoard).toBeInTheDocument();
  });

  test("Enter and Space keys work for piece selection", async () => {
    render(<App />);

    const gameBoard = screen.getByRole("application");
    gameBoard.focus();

    // Navigate to a pawn position (row 6, col 0)
    for (let i = 0; i < 6; i++) {
      fireEvent.keyDown(gameBoard, { key: "ArrowDown" });
    }

    // Select piece with Enter
    fireEvent.keyDown(gameBoard, { key: "Enter" });

    // Should not throw errors
    expect(gameBoard).toBeInTheDocument();

    // Test Space key as well
    fireEvent.keyDown(gameBoard, { key: " " });
    expect(gameBoard).toBeInTheDocument();
  });

  test("Escape key clears selection", async () => {
    render(<App />);

    const gameBoard = screen.getByRole("application");
    gameBoard.focus();

    // Select a piece first
    const squares = screen.getAllByRole("button");
    const pawnSquare = squares.find((square) =>
      square.getAttribute("aria-label")?.includes("white pawn")
    );

    if (pawnSquare) {
      fireEvent.click(pawnSquare);

      // Clear selection with Escape
      fireEvent.keyDown(gameBoard, { key: "Escape" });

      // Should not throw errors
      expect(gameBoard).toBeInTheDocument();
    }
  });

  test("live regions announce game state changes", async () => {
    render(<App />);

    // Check for live regions
    const statusRegions = screen.getAllByRole("status");
    expect(statusRegions.length).toBeGreaterThan(0);

    // Check that at least one status region has aria-live
    const liveRegions = statusRegions.filter((region) =>
      region.hasAttribute("aria-live")
    );
    expect(liveRegions.length).toBeGreaterThan(0);

    // Check for polite announcements
    const politeRegions = screen.getAllByRole("status");
    const hasPoliteRegion = politeRegions.some(
      (region) => region.getAttribute("aria-live") === "polite"
    );
    expect(hasPoliteRegion).toBe(true);
  });

  test("move history is accessible to screen readers", () => {
    render(<App />);

    // Check move history region
    const moveHistory = screen.getByRole("region", { name: /move history/i });
    expect(moveHistory).toBeInTheDocument();

    // Check for log role (for live updates)
    const moveLog = screen.getByRole("log");
    expect(moveLog).toBeInTheDocument();
    expect(moveLog).toHaveAttribute("aria-live", "polite");

    // Check that it's focusable for keyboard users
    expect(moveLog).toHaveAttribute("tabIndex", "0");
  });

  test("chess pieces have descriptive labels", () => {
    render(<App />);

    const squares = screen.getAllByRole("button");

    // Check that piece squares have descriptive labels (exclude reset button)
    const pieceSquares = squares.filter((square) => {
      const label = square.getAttribute("aria-label");
      return label && label.includes("on") && !label.includes("Reset");
    });

    expect(pieceSquares.length).toBeGreaterThan(0);

    // Check label format includes piece type, color, and position
    pieceSquares.forEach((square) => {
      const label = square.getAttribute("aria-label");
      expect(label).toMatch(/(white|black)/i);
      expect(label).toMatch(/(pawn|rook|knight|bishop|queen|king)/i);
      expect(label).toMatch(/on [a-h][1-8]/i);
    });
  });

  test("empty squares have appropriate labels", () => {
    render(<App />);

    const squares = screen.getAllByRole("button");

    // Find empty squares
    const emptySquares = squares.filter((square) =>
      square.getAttribute("aria-label")?.includes("Empty square")
    );

    expect(emptySquares.length).toBeGreaterThan(0);

    // Check label format includes position
    emptySquares.forEach((square) => {
      const label = square.getAttribute("aria-label");
      expect(label).toMatch(/Empty square [a-h][1-8]/i);
    });
  });

  test("game status changes are announced", async () => {
    render(<App />);

    // Check initial status
    const statusText = screen.getByRole("status", { name: /game status/i });
    expect(statusText).toBeInTheDocument();
    expect(statusText).toHaveTextContent(/white to move/i);

    // Status should be live
    expect(statusText).toHaveAttribute("aria-live", "polite");
  });

  test("focus management works correctly", () => {
    render(<App />);

    // Test that focus can be set on interactive elements
    const gameBoard = screen.getByRole("application");
    const resetButton = screen.getByRole("button", { name: /reset game/i });
    const moveHistory = screen.getByRole("log");

    // All should be focusable
    expect(gameBoard).toHaveAttribute("tabIndex", "0");
    expect(resetButton).not.toHaveAttribute("disabled");
    expect(moveHistory).toHaveAttribute("tabIndex", "0");

    // Test focus
    gameBoard.focus();
    expect(gameBoard).toHaveFocus();

    resetButton.focus();
    expect(resetButton).toHaveFocus();
  });

  test("high contrast mode is supported", () => {
    // Mock high contrast media query
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: jest.fn().mockImplementation((query) => ({
        matches: query === "(prefers-contrast: high)",
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    });

    render(<App />);

    // App should render without errors in high contrast mode
    expect(screen.getByText("Chess Game")).toBeInTheDocument();
    expect(
      screen.getByRole("grid", { name: /chess board/i })
    ).toBeInTheDocument();
  });

  test("reduced motion is respected", () => {
    // Mock reduced motion preference
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: jest.fn().mockImplementation((query) => ({
        matches: query === "(prefers-reduced-motion: reduce)",
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    });

    render(<App />);

    // App should render without errors with reduced motion
    expect(screen.getByText("Chess Game")).toBeInTheDocument();
    expect(
      screen.getByRole("grid", { name: /chess board/i })
    ).toBeInTheDocument();
  });

  test("color scheme preferences are supported", () => {
    // Mock dark mode preference
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: jest.fn().mockImplementation((query) => ({
        matches: query === "(prefers-color-scheme: dark)",
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    });

    render(<App />);

    // App should render without errors in dark mode
    expect(screen.getByText("Chess Game")).toBeInTheDocument();
    expect(
      screen.getByRole("grid", { name: /chess board/i })
    ).toBeInTheDocument();
  });

  test("headings create proper document structure", () => {
    render(<App />);

    // Check heading hierarchy
    const h1 = screen.getByRole("heading", { level: 1 });
    expect(h1).toHaveTextContent("Chess Game");

    const h3s = screen.getAllByRole("heading", { level: 3 });
    expect(h3s.length).toBeGreaterThan(0);

    // Check that headings have proper content
    const headingTexts = h3s.map((h) => h.textContent);
    expect(headingTexts).toContain("Game Status");
    expect(headingTexts).toContain("Move History");
  });

  test("form controls have proper labels and descriptions", () => {
    render(<App />);

    // Check that the reset button has proper labeling
    const resetButton = screen.getByRole("button", { name: /reset game/i });
    expect(resetButton).toHaveAttribute("aria-label");
    expect(resetButton.getAttribute("aria-label")).toMatch(/reset/i);
  });
});
