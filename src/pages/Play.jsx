import "./Play.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import FoosballTable from "../components/FoosballTable";

export default function Play() {
  const [opponentScore, setOpponentScore] = useState(0);
  const [yourScore, setYourScore] = useState(0);
  const [result, setResult] = useState("");
  const navigate = useNavigate();

  const incrementOpponentScore = () => {
    setOpponentScore(opponentScore + 1);
  };

  const incrementYourScore = () => {
    setYourScore(yourScore + 1);
  };

  const finishGame = () => {
    if (yourScore > opponentScore) {
      setResult("You win!");
    } else if (opponentScore > yourScore) {
      setResult("Opponent wins!");
    } else {
      setResult("It's a tie!");
    }

    setTimeout(() => {
      navigate("/");
    }, 5000);
  };

  return (
    <div className="play">
      <p className="opponent">Opponent</p>
      <div className="opponentScore" onClick={incrementOpponentScore}>
        {opponentScore}
      </div>
      <div className="imageContainer">
        <FoosballTable/>
      </div>
      <p className="you">You</p>
      <div className="yourScore" onClick={incrementYourScore}>
        {yourScore}
      </div>
      <button className="finishGameButton" onClick={finishGame}>Finish Game</button>
      {result && <div className="resultMessage">{result}</div>}
    </div>
  );
}
