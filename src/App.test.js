import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders chess game title", () => {
  render(<App />);
  const titleElement = screen.getByText(/chess game/i);
  expect(titleElement).toBeInTheDocument();
});
