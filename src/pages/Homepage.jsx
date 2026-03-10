import { useNavigate } from "react-router-dom";
import "./Homepage.css";

export default function Homepage() {
  const navigate = useNavigate();

  return (
    <div className = "home">
      <h1 className = "homeTitle">Remote Foosball Opponent</h1>
      <button className = "playButton" onClick={() => navigate("/play")}>
        Play
      </button>
      <button className = "howToPlayButton" onClick={() => navigate("/howtoplay")}>
        How to Play
      </button>
    </div>
  );
}
