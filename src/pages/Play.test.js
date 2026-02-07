import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Play from "./Play";

describe("Play component", () => {
  test("displays 'You win!' when your score is higher than the opponent score", () => {
    render(
      <MemoryRouter>
        <Play />
      </MemoryRouter>
    );

    const yourScoreDiv = screen.getByText("0", { selector: ".yourScore" });
    const opponentScoreDiv = screen.getByText("0", { selector: ".opponentScore" });
    const finishGameButton = screen.getByText("Finish Game");

    // increment your score
    fireEvent.click(yourScoreDiv);
    fireEvent.click(yourScoreDiv);

    // increment opponent score
    fireEvent.click(opponentScoreDiv);

    // finish game
    fireEvent.click(finishGameButton);

    expect(screen.getByText("You win!")).toBeInTheDocument();
  });

  test("displays 'Opponent wins!' when opponent score is higher than your score", () => {
    render(
      <MemoryRouter>
        <Play />
      </MemoryRouter>
    );

    const yourScoreDiv = screen.getByText("0", { selector: ".yourScore" });
    const opponentScoreDiv = screen.getByText("0", { selector: ".opponentScore" });
    const finishGameButton = screen.getByText("Finish Game");

    // increment opponent score
    fireEvent.click(opponentScoreDiv);
    fireEvent.click(opponentScoreDiv);

    // increment your score
    fireEvent.click(yourScoreDiv);

    // finish game
    fireEvent.click(finishGameButton);

    expect(screen.getByText("Opponent wins!")).toBeInTheDocument();
  });

  test("displays 'It's a tie!' when both scores are equal", () => {
    render(
      <MemoryRouter>
        <Play />
      </MemoryRouter>
    );

    const yourScoreDiv = screen.getByText("0", { selector: ".yourScore" });
    const opponentScoreDiv = screen.getByText("0", { selector: ".opponentScore" });
    const finishGameButton = screen.getByText("Finish Game");

    // increment both scores equally
    fireEvent.click(yourScoreDiv);
    fireEvent.click(opponentScoreDiv);

    // finish game
    fireEvent.click(finishGameButton);

    expect(screen.getByText("It's a tie!")).toBeInTheDocument();
  });
});