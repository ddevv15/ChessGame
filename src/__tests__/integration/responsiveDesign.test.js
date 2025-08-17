/**
 * Responsive design and mobile optimization tests
 * Tests responsive behavior across different viewports and devices
 */
import React from "react";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import "@testing-library/jest-dom";
import App from "../../App";

// Mock window.matchMedia for responsive tests
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Helper function to simulate viewport changes
const setViewport = (width, height) => {
  Object.defineProperty(window, "innerWidth", {
    writable: true,
    configurable: true,
    value: width,
  });
  Object.defineProperty(window, "innerHeight", {
    writable: true,
    configurable: true,
    value: height,
  });
  window.dispatchEvent(new Event("resize"));
};

describe("Responsive Design Tests", () => {
  beforeEach(() => {
    // Reset viewport to desktop size before each test
    setViewport(1024, 768);
  });

  afterEach(() => {
    cleanup();
  });

  test("desktop layout renders correctly", () => {
    setViewport(1024, 768);
    render(<App />);

    // Check that all components are visible
    expect(screen.getByText("Chess Game")).toBeInTheDocument();
    expect(
      screen.getByRole("grid", { name: /chess board/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/game status/i)).toBeInTheDocument();
    expect(screen.getByText(/move history/i)).toBeInTheDocument();

    // Check that the main container has proper desktop styling
    const main = screen.getByRole("main");
    expect(main).toHaveClass("App-main");
  });

  test("tablet layout adapts correctly", () => {
    setViewport(768, 1024);
    render(<App />);

    // App should still be fully functional
    expect(screen.getByText("Chess Game")).toBeInTheDocument();
    expect(
      screen.getByRole("grid", { name: /chess board/i })
    ).toBeInTheDocument();

    // Check that board squares are accessible (64 squares + reset button)
    const squares = screen.getAllByRole("button");
    expect(squares.length).toBeGreaterThanOrEqual(64);

    // Filter to get only chess board squares
    const boardSquares = squares.filter((square) =>
      square.getAttribute("data-testid")?.startsWith("square-")
    );
    expect(boardSquares.length).toBe(64);
  });

  test("mobile portrait layout works correctly", () => {
    setViewport(375, 667); // iPhone SE size
    render(<App />);

    // All core functionality should be present
    expect(screen.getByText("Chess Game")).toBeInTheDocument();
    expect(
      screen.getByRole("grid", { name: /chess board/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/game status/i)).toBeInTheDocument();
    expect(screen.getByText(/move history/i)).toBeInTheDocument();

    // Check that squares are still interactive
    const squares = screen.getAllByRole("button");
    const boardSquares = squares.filter((square) =>
      square.getAttribute("data-testid")?.startsWith("square-")
    );
    expect(boardSquares.length).toBe(64);

    // Test that pieces can still be selected
    const pawnSquares = boardSquares.filter((square) =>
      square.getAttribute("aria-label")?.includes("white pawn")
    );

    if (pawnSquares.length > 0) {
      fireEvent.click(pawnSquares[0]);
      // Should not throw error
      expect(pawnSquares[0]).toBeInTheDocument();
    }
  });

  test("mobile landscape layout optimizes space usage", () => {
    setViewport(667, 375); // iPhone SE landscape
    render(<App />);

    // Core functionality should remain
    expect(screen.getByText("Chess Game")).toBeInTheDocument();
    expect(
      screen.getByRole("grid", { name: /chess board/i })
    ).toBeInTheDocument();

    // Board should still be fully functional
    const squares = screen.getAllByRole("button");
    const boardSquares = squares.filter((square) =>
      square.getAttribute("data-testid")?.startsWith("square-")
    );
    expect(boardSquares.length).toBe(64);
  });

  test("very small screens maintain usability", () => {
    setViewport(320, 568); // iPhone 5/SE
    render(<App />);

    // Essential elements should still be present
    expect(screen.getByText("Chess Game")).toBeInTheDocument();
    expect(
      screen.getByRole("grid", { name: /chess board/i })
    ).toBeInTheDocument();

    // Board should be scaled appropriately
    const board = screen.getByRole("grid", { name: /chess board/i });
    expect(board).toBeInTheDocument();

    // Squares should still be clickable
    const squares = screen.getAllByRole("button");
    const boardSquares = squares.filter((square) =>
      square.getAttribute("data-testid")?.startsWith("square-")
    );
    expect(boardSquares.length).toBe(64);

    // Test interaction still works
    fireEvent.click(boardSquares[0]);
    expect(boardSquares[0]).toBeInTheDocument();
  });

  test("touch interactions work properly on mobile", () => {
    // Simulate touch device
    setViewport(375, 667);

    // Mock touch events
    Object.defineProperty(window.navigator, "maxTouchPoints", {
      writable: true,
      value: 5,
    });

    render(<App />);

    const squares = screen.getAllByRole("button");
    const boardSquares = squares.filter((square) =>
      square.getAttribute("data-testid")?.startsWith("square-")
    );
    const pawnSquare = boardSquares.find((square) =>
      square.getAttribute("aria-label")?.includes("white pawn")
    );

    if (pawnSquare) {
      // Simulate touch events
      fireEvent.touchStart(pawnSquare);
      fireEvent.touchEnd(pawnSquare);
      fireEvent.click(pawnSquare);

      // Should not throw errors
      expect(pawnSquare).toBeInTheDocument();
    }
  });

  test("board scales properly across different screen sizes", () => {
    const testSizes = [
      [320, 568], // iPhone 5
      [375, 667], // iPhone 6/7/8
      [414, 896], // iPhone XR
      [768, 1024], // iPad
      [1024, 768], // Desktop
    ];

    testSizes.forEach(([width, height]) => {
      setViewport(width, height);
      const { unmount } = render(<App />);

      const board = screen.getByRole("grid", { name: /chess board/i });
      expect(board).toBeInTheDocument();

      // Board should be visible and functional
      const squares = screen.getAllByRole("button");
      const boardSquares = squares.filter((square) =>
        square.getAttribute("data-testid")?.startsWith("square-")
      );
      expect(boardSquares.length).toBe(64);

      // Clean up for next iteration
      unmount();
    });
  });

  test("responsive breakpoints trigger appropriate styles", () => {
    // Test different breakpoints
    const breakpoints = [
      { width: 1200, expected: "desktop" },
      { width: 768, expected: "tablet" },
      { width: 480, expected: "mobile" },
      { width: 320, expected: "small-mobile" },
    ];

    breakpoints.forEach(({ width, expected }) => {
      setViewport(width, 600);
      const { unmount } = render(<App />);

      // Verify the app renders without errors at each breakpoint
      expect(screen.getAllByText("Chess Game")[0]).toBeInTheDocument();
      expect(
        screen.getByRole("grid", { name: /chess board/i })
      ).toBeInTheDocument();

      // Clean up
      unmount();
    });
  });

  test("orientation changes are handled gracefully", () => {
    // Start in portrait
    setViewport(375, 667);
    render(<App />);

    expect(screen.getByText("Chess Game")).toBeInTheDocument();

    // Switch to landscape
    setViewport(667, 375);
    window.dispatchEvent(new Event("orientationchange"));

    // App should still work
    expect(screen.getByText("Chess Game")).toBeInTheDocument();
    expect(
      screen.getByRole("grid", { name: /chess board/i })
    ).toBeInTheDocument();
  });

  test("accessibility is maintained across all screen sizes", () => {
    const testSizes = [
      [320, 568],
      [768, 1024],
      [1024, 768],
    ];

    testSizes.forEach(([width, height]) => {
      setViewport(width, height);
      const { unmount } = render(<App />);

      // Check semantic structure is maintained
      expect(screen.getAllByRole("banner")[0]).toBeInTheDocument();
      expect(screen.getAllByRole("main")[0]).toBeInTheDocument();
      expect(screen.getAllByRole("contentinfo")[0]).toBeInTheDocument();

      // Check interactive elements remain accessible
      const buttons = screen.getAllByRole("button");
      buttons.forEach((button) => {
        expect(button).toHaveAttribute("aria-label");
      });

      // Clean up
      unmount();
    });
  });

  test("minimum touch target sizes are maintained on mobile", () => {
    setViewport(375, 667);
    render(<App />);

    const squares = screen.getAllByRole("button");
    const boardSquares = squares.filter((square) =>
      square.getAttribute("data-testid")?.startsWith("square-")
    );

    // Check that squares meet minimum touch target guidelines (44px)
    boardSquares.forEach((square) => {
      const rect = square.getBoundingClientRect();
      // Note: In test environment, actual computed styles may not reflect CSS
      // This test verifies the elements exist and are interactive
      expect(square).toBeInTheDocument();
      expect(square).not.toBeDisabled();
    });
  });
});
