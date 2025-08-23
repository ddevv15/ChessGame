// Enhanced GameControls component tests - Mode switching functionality
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import GameControls from "../../components/GameControls/GameControls.js";
import {
  PIECE_COLORS,
  GAME_MODES,
  DIFFICULTY_LEVELS,
} from "../../constants/gameConstants.js";

describe("GameControls Enhanced Mode Switching", () => {
  const defaultProps = {
    gameStatus: "playing",
    currentPlayer: PIECE_COLORS.WHITE,
    gameMode: GAME_MODES.PVP,
    aiDifficulty: DIFFICULTY_LEVELS.MEDIUM,
    onReset: jest.fn(),
    onBackToModeSelection: jest.fn(),
    onModeChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Game Mode Display", () => {
    test("displays PvP mode correctly", () => {
      render(<GameControls {...defaultProps} />);

      expect(screen.getByText("Game Mode")).toBeInTheDocument();
      expect(screen.getByText("Player vs Player")).toBeInTheDocument();

      // Check that the mode display section contains the PvP emoji
      const modeDisplay = screen.getByText("Player vs Player").parentElement;
      expect(modeDisplay).toContainHTML("👥");
    });

    test("displays AI mode with difficulty correctly", () => {
      render(
        <GameControls
          {...defaultProps}
          gameMode={GAME_MODES.AI}
          aiDifficulty={DIFFICULTY_LEVELS.HARD}
        />
      );

      expect(screen.getByText("vs AI (hard)")).toBeInTheDocument();

      // Check that the mode display section contains the AI emoji
      const modeDisplay = screen.getByText("vs AI (hard)").parentElement;
      expect(modeDisplay).toContainHTML("🤖");
    });
  });

  describe("Mode Switching Controls", () => {
    test("renders mode switching buttons when onModeChange is provided", () => {
      render(<GameControls {...defaultProps} />);

      expect(screen.getByText("Switch Mode")).toBeInTheDocument();
      expect(
        screen.getByLabelText("Switch to Player vs Player mode")
      ).toBeInTheDocument();
      expect(
        screen.getByLabelText("Switch to AI mode - Easy difficulty")
      ).toBeInTheDocument();
      expect(
        screen.getByLabelText("Switch to AI mode - Medium difficulty")
      ).toBeInTheDocument();
      expect(
        screen.getByLabelText("Switch to AI mode - Hard difficulty")
      ).toBeInTheDocument();
    });

    test("does not render mode switching when onModeChange is not provided", () => {
      const propsWithoutModeChange = { ...defaultProps };
      delete propsWithoutModeChange.onModeChange;

      render(<GameControls {...propsWithoutModeChange} />);

      expect(screen.queryByText("Switch Mode")).not.toBeInTheDocument();
    });

    test("highlights current mode button as active", () => {
      render(<GameControls {...defaultProps} />);

      const pvpButton = screen.getByLabelText(
        "Switch to Player vs Player mode"
      );
      expect(pvpButton).toHaveClass("modeButtonActive");
      expect(pvpButton).toBeDisabled();
    });

    test("highlights current AI difficulty as active", () => {
      render(
        <GameControls
          {...defaultProps}
          gameMode={GAME_MODES.AI}
          aiDifficulty={DIFFICULTY_LEVELS.HARD}
        />
      );

      const hardButton = screen.getByLabelText(
        "Switch to AI mode - Hard difficulty"
      );
      expect(hardButton).toHaveClass("modeButtonActive");
      expect(hardButton).toBeDisabled();
    });
  });

  describe("Mode Change During Game", () => {
    test("shows confirmation dialog when changing mode during active game", async () => {
      render(<GameControls {...defaultProps} />);

      const aiEasyButton = screen.getByLabelText(
        "Switch to AI mode - Easy difficulty"
      );
      fireEvent.click(aiEasyButton);

      await waitFor(() => {
        expect(screen.getByText("Change Game Mode?")).toBeInTheDocument();
      });

      expect(
        screen.getByText(
          "Changing the game mode will start a new game. Your current progress will be lost."
        )
      ).toBeInTheDocument();
      expect(screen.getByText("AI (easy)")).toBeInTheDocument();
      expect(screen.getByText("Yes, Change Mode")).toBeInTheDocument();
      expect(screen.getByText("Cancel")).toBeInTheDocument();
    });

    test("does not show confirmation dialog when game is over", () => {
      render(<GameControls {...defaultProps} gameStatus="checkmate" />);

      const aiEasyButton = screen.getByLabelText(
        "Switch to AI mode - Easy difficulty"
      );
      fireEvent.click(aiEasyButton);

      expect(screen.queryByText("Change Game Mode?")).not.toBeInTheDocument();
      expect(defaultProps.onModeChange).toHaveBeenCalledWith(
        GAME_MODES.AI,
        DIFFICULTY_LEVELS.EASY
      );
    });

    test("confirms mode change when user clicks Yes", async () => {
      render(<GameControls {...defaultProps} />);

      const aiMediumButton = screen.getByLabelText(
        "Switch to AI mode - Medium difficulty"
      );
      fireEvent.click(aiMediumButton);

      await waitFor(() => {
        expect(screen.getByText("Change Game Mode?")).toBeInTheDocument();
      });

      const confirmButton = screen.getByText("Yes, Change Mode");
      fireEvent.click(confirmButton);

      expect(defaultProps.onModeChange).toHaveBeenCalledWith(
        GAME_MODES.AI,
        DIFFICULTY_LEVELS.MEDIUM
      );

      await waitFor(() => {
        expect(screen.queryByText("Change Game Mode?")).not.toBeInTheDocument();
      });
    });

    test("cancels mode change when user clicks Cancel", async () => {
      render(<GameControls {...defaultProps} />);

      const aiHardButton = screen.getByLabelText(
        "Switch to AI mode - Hard difficulty"
      );
      fireEvent.click(aiHardButton);

      await waitFor(() => {
        expect(screen.getByText("Change Game Mode?")).toBeInTheDocument();
      });

      const cancelButton = screen.getByText("Cancel");
      fireEvent.click(cancelButton);

      expect(defaultProps.onModeChange).not.toHaveBeenCalled();

      await waitFor(() => {
        expect(screen.queryByText("Change Game Mode?")).not.toBeInTheDocument();
      });
    });
  });

  describe("Reset Button Enhancement", () => {
    test("updates reset button aria-label to include current mode", () => {
      render(<GameControls {...defaultProps} />);

      const resetButton = screen.getByLabelText(
        "Reset game to starting position in Player vs Player mode"
      );
      expect(resetButton).toBeInTheDocument();
    });

    test("updates reset button aria-label for AI mode", () => {
      render(
        <GameControls
          {...defaultProps}
          gameMode={GAME_MODES.AI}
          aiDifficulty={DIFFICULTY_LEVELS.EASY}
        />
      );

      const resetButton = screen.getByLabelText(
        "Reset game to starting position in vs AI (easy) mode"
      );
      expect(resetButton).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    test("confirmation dialog has proper ARIA attributes", async () => {
      render(<GameControls {...defaultProps} />);

      const pvpButton = screen.getByLabelText(
        "Switch to AI mode - Easy difficulty"
      );
      fireEvent.click(pvpButton);

      await waitFor(() => {
        const dialog = screen.getByRole("dialog");
        expect(dialog).toHaveAttribute("aria-modal", "true");
        expect(dialog).toHaveAttribute("aria-labelledby", "mode-change-title");
      });
    });

    test("mode buttons have proper accessibility labels", () => {
      render(<GameControls {...defaultProps} />);

      expect(
        screen.getByLabelText("Switch to Player vs Player mode")
      ).toBeInTheDocument();
      expect(
        screen.getByLabelText("Switch to AI mode - Easy difficulty")
      ).toBeInTheDocument();
      expect(
        screen.getByLabelText("Switch to AI mode - Medium difficulty")
      ).toBeInTheDocument();
      expect(
        screen.getByLabelText("Switch to AI mode - Hard difficulty")
      ).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    test("handles mode change to same mode gracefully", () => {
      render(<GameControls {...defaultProps} />);

      const pvpButton = screen.getByLabelText(
        "Switch to Player vs Player mode"
      );
      expect(pvpButton).toBeDisabled();

      // Should not trigger any action since button is disabled
      fireEvent.click(pvpButton);
      expect(defaultProps.onModeChange).not.toHaveBeenCalled();
    });

    test("handles check status during mode change", async () => {
      render(<GameControls {...defaultProps} gameStatus="check" />);

      const aiButton = screen.getByLabelText(
        "Switch to AI mode - Easy difficulty"
      );
      fireEvent.click(aiButton);

      await waitFor(() => {
        expect(screen.getByText("Change Game Mode?")).toBeInTheDocument();
      });
    });
  });
});
