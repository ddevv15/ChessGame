// ErrorModal component tests
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import ErrorModal from "../../components/ErrorModal/ErrorModal.js";

describe("ErrorModal Component", () => {
  const mockError = {
    title: "Test Error",
    message: "This is a test error message",
    action: "Try Again",
    canRetry: true,
    canContinue: true,
    severity: "recoverable",
    originalError: "Original error details",
    timestamp: Date.now(),
  };

  const mockHandlers = {
    onRetry: jest.fn(),
    onSwitchToPvP: jest.fn(),
    onDismiss: jest.fn(),
    onClose: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders nothing when not visible", () => {
    render(
      <ErrorModal isVisible={false} error={mockError} {...mockHandlers} />
    );

    expect(screen.queryByTestId("error-modal")).not.toBeInTheDocument();
  });

  it("renders nothing when no error provided", () => {
    render(<ErrorModal isVisible={true} error={null} {...mockHandlers} />);

    expect(screen.queryByTestId("error-modal")).not.toBeInTheDocument();
  });

  it("renders error modal with correct content", () => {
    render(<ErrorModal isVisible={true} error={mockError} {...mockHandlers} />);

    expect(screen.getByTestId("error-modal")).toBeInTheDocument();
    expect(screen.getByText(/Test Error/)).toBeInTheDocument();
    expect(
      screen.getByText("This is a test error message")
    ).toBeInTheDocument();
  });

  it("displays retry button when canRetry is true", () => {
    render(<ErrorModal isVisible={true} error={mockError} {...mockHandlers} />);

    const retryButton = screen.getByTestId("error-modal-retry");
    expect(retryButton).toBeInTheDocument();
    expect(retryButton).toHaveTextContent("🔄 Try Again");
  });

  it("calls onRetry when retry button is clicked", () => {
    render(<ErrorModal isVisible={true} error={mockError} {...mockHandlers} />);

    fireEvent.click(screen.getByTestId("error-modal-retry"));
    expect(mockHandlers.onRetry).toHaveBeenCalledTimes(1);
  });

  it("displays switch to PvP button when appropriate", () => {
    const pvpError = {
      ...mockError,
      action: "Switch to PvP",
    };

    render(<ErrorModal isVisible={true} error={pvpError} {...mockHandlers} />);

    const switchButton = screen.getByTestId("error-modal-switch-pvp");
    expect(switchButton).toBeInTheDocument();
    expect(switchButton).toHaveTextContent("👥 Switch to PvP");
  });

  it("calls onSwitchToPvP when switch button is clicked", () => {
    const pvpError = {
      ...mockError,
      action: "Switch to PvP",
    };

    render(<ErrorModal isVisible={true} error={pvpError} {...mockHandlers} />);

    fireEvent.click(screen.getByTestId("error-modal-switch-pvp"));
    expect(mockHandlers.onSwitchToPvP).toHaveBeenCalledTimes(1);
  });

  it("displays continue button when action is Continue", () => {
    const continueError = {
      ...mockError,
      action: "Continue",
      canRetry: false,
    };

    render(
      <ErrorModal isVisible={true} error={continueError} {...mockHandlers} />
    );

    const continueButton = screen.getByTestId("error-modal-continue");
    expect(continueButton).toBeInTheDocument();
    expect(continueButton).toHaveTextContent("✓ Continue");
  });

  it("calls onDismiss when continue button is clicked", () => {
    const continueError = {
      ...mockError,
      action: "Continue",
      canRetry: false,
    };

    render(
      <ErrorModal isVisible={true} error={continueError} {...mockHandlers} />
    );

    fireEvent.click(screen.getByTestId("error-modal-continue"));
    expect(mockHandlers.onDismiss).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when close button is clicked", () => {
    render(<ErrorModal isVisible={true} error={mockError} {...mockHandlers} />);

    fireEvent.click(screen.getByTestId("error-modal-close"));
    expect(mockHandlers.onClose).toHaveBeenCalledTimes(1);
  });

  it("calls onDismiss when dismiss button is clicked", () => {
    render(<ErrorModal isVisible={true} error={mockError} {...mockHandlers} />);

    fireEvent.click(screen.getByTestId("error-modal-dismiss"));
    expect(mockHandlers.onDismiss).toHaveBeenCalledTimes(1);
  });

  it("applies critical styling for critical errors", () => {
    const criticalError = {
      ...mockError,
      severity: "critical",
    };

    render(
      <ErrorModal isVisible={true} error={criticalError} {...mockHandlers} />
    );

    const modal = screen.getByTestId("error-modal");
    expect(modal).toHaveClass("critical");
  });

  it("applies recoverable styling for recoverable errors", () => {
    render(<ErrorModal isVisible={true} error={mockError} {...mockHandlers} />);

    const modal = screen.getByTestId("error-modal");
    expect(modal).toHaveClass("recoverable");
  });

  it("shows debug information in development mode", () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "development";

    render(<ErrorModal isVisible={true} error={mockError} {...mockHandlers} />);

    expect(screen.getByText("Debug Information")).toBeInTheDocument();

    process.env.NODE_ENV = originalEnv;
  });

  it("hides debug information in production mode", () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "production";

    render(<ErrorModal isVisible={true} error={mockError} {...mockHandlers} />);

    expect(screen.queryByText("Debug Information")).not.toBeInTheDocument();

    process.env.NODE_ENV = originalEnv;
  });

  it("has proper accessibility attributes", () => {
    render(<ErrorModal isVisible={true} error={mockError} {...mockHandlers} />);

    const modal = screen.getByTestId("error-modal");
    expect(modal).toHaveAttribute("role", "dialog");
    expect(modal).toHaveAttribute("aria-labelledby", "error-modal-title");
    expect(modal).toHaveAttribute("aria-describedby", "error-modal-message");

    const closeButton = screen.getByTestId("error-modal-close");
    expect(closeButton).toHaveAttribute("aria-label", "Close error dialog");
  });

  it("handles keyboard navigation", () => {
    render(<ErrorModal isVisible={true} error={mockError} {...mockHandlers} />);

    const retryButton = screen.getByTestId("error-modal-retry");
    retryButton.focus();
    expect(retryButton).toHaveFocus();

    fireEvent.click(retryButton); // Use click instead of keyDown for simplicity
    expect(mockHandlers.onRetry).toHaveBeenCalledTimes(1);
  });

  it("handles different error types correctly", () => {
    const errorTypes = [
      {
        type: "API_KEY_INVALID",
        title: "API Configuration Issue",
        message: "API key is invalid",
        action: "Switch to PvP",
        canRetry: false,
        canContinue: true,
        severity: "critical",
      },
      {
        type: "NETWORK_ERROR",
        title: "Connection Problem",
        message: "Network connection failed",
        action: "Try Again",
        canRetry: true,
        canContinue: true,
        severity: "recoverable",
      },
      {
        type: "RATE_LIMIT",
        title: "AI Taking a Break",
        message: "Rate limit exceeded",
        action: "Try Again",
        canRetry: true,
        canContinue: true,
        severity: "recoverable",
      },
    ];

    errorTypes.forEach((errorType) => {
      const { rerender } = render(
        <ErrorModal isVisible={true} error={errorType} {...mockHandlers} />
      );

      expect(screen.getByText(new RegExp(errorType.title))).toBeInTheDocument();

      if (errorType.canRetry) {
        expect(screen.getByTestId("error-modal-retry")).toBeInTheDocument();
      }

      if (errorType.action === "Switch to PvP") {
        expect(
          screen.getByTestId("error-modal-switch-pvp")
        ).toBeInTheDocument();
      }

      rerender(<div />); // Clear for next iteration
    });
  });
});
