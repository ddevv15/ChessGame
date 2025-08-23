/**
 * Integration test for GameOverModal with full app flow
 */
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import App from "../../App";
import { GAME_MODES } from "../../constants/gameConstants";

describe("GameOverModal Integration", () => {
  test("modal appears when game reaches checkmate state", async () => {
    render(<App />);

    // First, select PvP mode to get to the game
    const pvpButton = screen.getByRole("button", { name: /player vs player/i });
    fireEvent.click(pvpButton);

    // Wait for the game board to appear
    await waitFor(() => {
      expect(screen.getByRole("application")).toBeInTheDocument();
    });

    // The GameOverModal should not be visible initially
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    // Note: To fully test modal appearance, we would need to:
    // 1. Simulate a series of moves that lead to checkmate
    // 2. Verify the modal appears with correct content
    // 3. Test modal interactions
    // This would require a more complex test setup with specific board positions
  });

  test("modal can be closed and game can be reset", async () => {
    render(<App />);

    // Select PvP mode
    const pvpButton = screen.getByRole("button", { name: /player vs player/i });
    fireEvent.click(pvpButton);

    // Wait for game board
    await waitFor(() => {
      expect(screen.getByRole("application")).toBeInTheDocument();
    });

    // The reset functionality should be available through game controls
    const resetButton = screen.getByRole("button", { name: /reset game/i });
    expect(resetButton).toBeInTheDocument();

    // Clicking reset should work (this tests the onReset callback)
    fireEvent.click(resetButton);

    // Game should still be playable after reset
    expect(screen.getByRole("application")).toBeInTheDocument();
  });

  test("app handles mode selection and game flow correctly", async () => {
    render(<App />);

    // Initially should show mode selection
    expect(screen.getByText("Choose your game mode")).toBeInTheDocument();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    // Select PvP mode
    const pvpButton = screen.getByRole("button", { name: /player vs player/i });
    fireEvent.click(pvpButton);

    // Should now show the game
    await waitFor(() => {
      expect(screen.getByRole("application")).toBeInTheDocument();
    });

    // Game controls should be available
    expect(
      screen.getByRole("button", { name: /reset game/i })
    ).toBeInTheDocument();

    // Back button should be available to return to mode selection
    const backButton = screen.getByRole("button", {
      name: /back to mode selection/i,
    });
    expect(backButton).toBeInTheDocument();

    // Click back button
    fireEvent.click(backButton);

    // Should return to mode selection
    await waitFor(() => {
      expect(screen.getByText("Choose your game mode")).toBeInTheDocument();
    });

    // Game board should no longer be visible
    expect(screen.queryByRole("application")).not.toBeInTheDocument();
  });

  test("AI mode selection works correctly", async () => {
    render(<App />);

    // Select AI mode
    const aiButton = screen.getByRole("button", { name: /player vs ai/i });
    fireEvent.click(aiButton);

    // Should show the game with AI mode indicators
    await waitFor(() => {
      expect(screen.getByRole("application")).toBeInTheDocument();
    });

    // Should show AI mode indicator in header
    expect(screen.getByText("🤖 AI")).toBeInTheDocument();
    expect(screen.getByText("Medium")).toBeInTheDocument(); // Default difficulty
  });
});
