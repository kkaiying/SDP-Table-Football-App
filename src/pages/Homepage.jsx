import { useNavigate } from "react-router-dom";
import "./Homepage.css";

export default function Homepage() {
  const navigate = useNavigate();

  return (
    <div className = "home">
      <h1 className = "title">Remote Foosball Opponent</h1>
      <button className = "playButton" onClick={() => navigate("/play")}>
        Play
      </button>
    </div>
  );
}
