import "./Play.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import FoosballTable from "../components/FoosballTable";
import { IoExitOutline } from "react-icons/io5";
import { IoSettingsSharp } from 'react-icons/io5'
import Settings from "../components/Settings";

export default function Play() {
  const [opponentScore, setOpponentScore] = useState(0);
  const [yourScore, setYourScore] = useState(0);
  const [result, setResult] = useState("");
  const [showSettings, setShowSettings] = useState(false);
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
    }, 3000);
  };

  return (
    <div className="play">
      <div className="opponent">
        <p>Opponent</p>
        <div className="opponentScore" onClick={incrementOpponentScore}>
          {opponentScore}
        </div>
      </div>
      <div className="imageContainer">
        <FoosballTable/>
      </div>
      <div className="you">
        <div className="yourScore" onClick={incrementYourScore}>
          {yourScore}
        </div>
        <p>You</p>
      </div>
      <button className="finishGameButton" onClick={finishGame}><IoExitOutline /></button>
      <button className="playSettingsButton" onClick={() => setShowSettings(true)}>
        <IoSettingsSharp />
      </button>
      {result && <div className="resultMessage">{result}</div>}
      {showSettings && <Settings onClose={() => setShowSettings(false)} />}
    </div>
  );
}
