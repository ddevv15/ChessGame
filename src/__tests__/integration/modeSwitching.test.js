// Mode switching integration tests
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import App from "../../App.js";

describe("Mode Switching Integration", () => {
  test("can switch between PvP and AI modes from game controls", async () => {
    render(<App />);

    // Start with PvP mode
    const pvpButton = screen.getByText("Player vs Player");
    fireEvent.click(pvpButton);

    // Wait for game board to load
    await waitFor(() => {
      expect(screen.getByText("Game Mode")).toBeInTheDocument();
    });

    // Verify we're in PvP mode
    expect(screen.getByText("Player vs Player")).toBeInTheDocument();

    // Try to switch to AI mode - should show confirmation dialog
    const aiEasyButton = screen.getByLabelText(
      "Switch to AI mode - Easy difficulty"
    );
    fireEvent.click(aiEasyButton);

    // Wait for confirmation dialog
    await waitFor(() => {
      expect(screen.getByText("Change Game Mode?")).toBeInTheDocument();
    });

    // Confirm the mode change
    const confirmButton = screen.getByText("Yes, Change Mode");
    fireEvent.click(confirmButton);

    // Wait for mode change to complete
    await waitFor(() => {
      expect(screen.getByText("vs AI (easy)")).toBeInTheDocument();
    });

    // Verify the app header also updates
    expect(screen.getByText("🤖 AI")).toBeInTheDocument();
    expect(screen.getByText("Easy")).toBeInTheDocument();
  });

  test("can switch AI difficulty levels", async () => {
    render(<App />);

    // Start with AI mode
    const aiButton = screen.getByText("Player vs AI");
    fireEvent.click(aiButton);

    // Wait for game board to load
    await waitFor(() => {
      expect(screen.getByText("Game Mode")).toBeInTheDocument();
    });

    // Verify we're in AI medium mode (default)
    expect(screen.getByText("vs AI (medium)")).toBeInTheDocument();

    // Switch to hard difficulty - should show confirmation
    const aiHardButton = screen.getByLabelText(
      "Switch to AI mode - Hard difficulty"
    );
    fireEvent.click(aiHardButton);

    // Wait for confirmation dialog
    await waitFor(() => {
      expect(screen.getByText("Change Game Mode?")).toBeInTheDocument();
    });

    // Confirm the mode change
    const confirmButton = screen.getByText("Yes, Change Mode");
    fireEvent.click(confirmButton);

    // Wait for difficulty change to complete
    await waitFor(() => {
      expect(screen.getByText("vs AI (hard)")).toBeInTheDocument();
    });

    // Verify the app header updates
    expect(screen.getByText("Hard")).toBeInTheDocument();
  });

  test("can cancel mode change", async () => {
    render(<App />);

    // Start with PvP mode
    const pvpButton = screen.getByText("Player vs Player");
    fireEvent.click(pvpButton);

    // Wait for game board to load
    await waitFor(() => {
      expect(screen.getByText("Game Mode")).toBeInTheDocument();
    });

    // Try to switch to AI mode
    const aiButton = screen.getByLabelText(
      "Switch to AI mode - Medium difficulty"
    );
    fireEvent.click(aiButton);

    // Wait for confirmation dialog
    await waitFor(() => {
      expect(screen.getByText("Change Game Mode?")).toBeInTheDocument();
    });

    // Cancel the mode change
    const cancelButton = screen.getByText("Cancel");
    fireEvent.click(cancelButton);

    // Wait for dialog to close
    await waitFor(() => {
      expect(screen.queryByText("Change Game Mode?")).not.toBeInTheDocument();
    });

    // Verify we're still in PvP mode
    expect(screen.getByText("Player vs Player")).toBeInTheDocument();
  });

  test("reset button includes current mode in aria-label", async () => {
    render(<App />);

    // Start with AI mode
    const aiButton = screen.getByText("Player vs AI");
    fireEvent.click(aiButton);

    // Wait for game board to load
    await waitFor(() => {
      expect(screen.getByText("Game Mode")).toBeInTheDocument();
    });

    // Check that reset button has mode-specific aria-label
    const resetButton = screen.getByLabelText(
      /reset game to starting position in vs ai/i
    );
    expect(resetButton).toBeInTheDocument();
  });
});
