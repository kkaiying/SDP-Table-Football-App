import "./HowToPlay.css";
import { useNavigate } from "react-router-dom";

export default function HowToPlay() {
  const navigate = useNavigate();

  return (
    <div className="howToPlay">
      <h1 className="howToTitle">How to Play</h1>

      <div className="controlsContainer">
        <div className="mouseControls">
          <h2 className = "mouseTitle">Mouse Controls</h2>
          <p>XYZ</p>
        </div>

        <div className="controllerControls">
          <h2 className = "controllerTitle">Controller Controls</h2>
          <p><b>A: </b>Select defence or attack mode (defence controls goalkeeper and defenders, 
          attack controls midfielders and attackers)</p>
          <p><b>Left stick: </b>Move leftmost rod of pair in and out</p>
          <p><b>Right stick: </b>Move rightmost rod of pair in and out</p>
        </div>
      </div>
    </div>
  );
}