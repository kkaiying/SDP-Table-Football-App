import "./HowToPlay.css";
import { useNavigate } from "react-router-dom";

export default function HowToPlay() {
  const navigate = useNavigate();

  return (
    <div className="howToPlay">
      <h1 className="title">How to Play</h1>

      <div className="mouseControls">
        
      </div>
      <div className="controllerControls">
        
      </div>
    </div>
  );
}