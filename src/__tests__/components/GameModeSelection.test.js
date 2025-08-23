// GameModeSelection.test.js - Tests for GameModeSelection component
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import GameModeSelection from "../../components/GameModeSelection/GameModeSelection";

// Mock the CSS module
jest.mock(
  "../../components/GameModeSelection/GameModeSelection.module.css",
  () => ({
    container: "container",
    content: "content",
    title: "title",
    subtitle: "subtitle",
    modeButtons: "modeButtons",
    modeButton: "modeButton",
    pvpButton: "pvpButton",
    aiButton: "aiButton",
    selected: "selected",
    modeIcon: "modeIcon",
    modeTitle: "modeTitle",
    modeDescription: "modeDescription",
    apiKeySection: "apiKeySection",
    sectionTitle: "sectionTitle",
    difficultySection: "difficultySection",
    label: "label",
    select: "select",
    aiInfo: "aiInfo",
    aiDescription: "aiDescription",
    aiNote: "aiNote",
    actionButtons: "actionButtons",
    startButton: "startButton",
    backButton: "backButton",
  })
);

describe("GameModeSelection Component", () => {
  const mockOnModeSelect = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders game mode selection screen", () => {
    render(<GameModeSelection onModeSelect={mockOnModeSelect} />);

    expect(screen.getByText("♟️ React Chess Game")).toBeInTheDocument();
    expect(screen.getByText("Choose your game mode")).toBeInTheDocument();
    expect(screen.getByText("Player vs Player")).toBeInTheDocument();
    expect(screen.getByText("Player vs AI")).toBeInTheDocument();
  });

  test("displays PvP mode button with correct content", () => {
    render(<GameModeSelection onModeSelect={mockOnModeSelect} />);

    const pvpButton = screen.getByText("Player vs Player").closest("button");
    expect(pvpButton).toBeInTheDocument();
    expect(screen.getByText("👥")).toBeInTheDocument();
    expect(
      screen.getByText("Play chess against another human player")
    ).toBeInTheDocument();
  });

  test("displays AI mode button with correct content", () => {
    render(<GameModeSelection onModeSelect={mockOnModeSelect} />);

    const aiButton = screen.getByText("Player vs AI").closest("button");
    expect(aiButton).toBeInTheDocument();
    expect(screen.getByText("🤖")).toBeInTheDocument();
    expect(
      screen.getByText("Challenge our AI opponent powered by Google Gemini")
    ).toBeInTheDocument();
  });

  test("clicking PvP mode calls onModeSelect immediately", () => {
    render(<GameModeSelection onModeSelect={mockOnModeSelect} />);

    const pvpButton = screen.getByText("Player vs Player").closest("button");
    fireEvent.click(pvpButton);

    expect(mockOnModeSelect).toHaveBeenCalledWith("pvp", undefined);
  });

  test("clicking AI mode shows configuration section", () => {
    render(<GameModeSelection onModeSelect={mockOnModeSelect} />);

    const aiButton = screen.getByText("Player vs AI").closest("button");
    fireEvent.click(aiButton);

    expect(screen.getByText("AI Configuration")).toBeInTheDocument();
    expect(screen.getByText("AI Difficulty:")).toBeInTheDocument();
    expect(
      screen.getByText(/Play against our AI opponent/)
    ).toBeInTheDocument();
  });

  test("AI mode shows difficulty selector with correct options", () => {
    render(<GameModeSelection onModeSelect={mockOnModeSelect} />);

    const aiButton = screen.getByText("Player vs AI").closest("button");
    fireEvent.click(aiButton);

    const difficultySelect = screen.getByLabelText("AI Difficulty:");
    expect(difficultySelect).toBeInTheDocument();

    const options = difficultySelect.querySelectorAll("option");
    expect(options).toHaveLength(3);
    expect(options[0]).toHaveValue("easy");
    expect(options[1]).toHaveValue("medium");
    expect(options[2]).toHaveValue("hard");
  });

  test("AI mode shows AI information", () => {
    render(<GameModeSelection onModeSelect={mockOnModeSelect} />);

    const aiButton = screen.getByText("Player vs AI").closest("button");
    fireEvent.click(aiButton);

    expect(
      screen.getByText(/Play against our AI opponent/)
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /AI moves are calculated using advanced chess algorithms/
      )
    ).toBeInTheDocument();
  });

  test("start AI game button is enabled", () => {
    render(<GameModeSelection onModeSelect={mockOnModeSelect} />);

    const aiButton = screen.getByText("Player vs AI").closest("button");
    fireEvent.click(aiButton);

    const startButton = screen.getByText("Start AI Game");
    expect(startButton).not.toBeDisabled();
  });

  test("clicking start AI game calls onModeSelect", async () => {
    render(<GameModeSelection onModeSelect={mockOnModeSelect} />);

    const aiButton = screen.getByText("Player vs AI").closest("button");
    fireEvent.click(aiButton);

    const startButton = screen.getByText("Start AI Game");
    fireEvent.click(startButton);

    await waitFor(() => {
      expect(mockOnModeSelect).toHaveBeenCalledWith("ai", "medium");
    });
  });

  test("back button resets selection", () => {
    render(<GameModeSelection onModeSelect={mockOnModeSelect} />);

    const aiButton = screen.getByText("Player vs AI").closest("button");
    fireEvent.click(aiButton);

    expect(screen.getByText("AI Configuration")).toBeInTheDocument();

    const backButton = screen.getByText("Back");
    fireEvent.click(backButton);

    expect(screen.queryByText("AI Configuration")).not.toBeInTheDocument();
    expect(screen.getByText("Player vs Player")).toBeInTheDocument();
    expect(screen.getByText("Player vs AI")).toBeInTheDocument();
  });

  test("PvP mode shows start button after selection", () => {
    render(<GameModeSelection onModeSelect={mockOnModeSelect} />);

    const pvpButton = screen.getByText("Player vs Player").closest("button");
    fireEvent.click(pvpButton);

    expect(screen.getByText("Start PvP Game")).toBeInTheDocument();
    expect(screen.getByText("Back")).toBeInTheDocument();
  });
});
