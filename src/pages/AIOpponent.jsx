import './AIOpponent.css';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoExitOutline, IoSettingsSharp } from 'react-icons/io5';
import Settings from '../components/Settings';

export default function AIOpponent() {
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const navigate = useNavigate();

  const toggleGameState = () => {
    setIsGameStarted((prevState) => !prevState);
  };

  const finishGame = () => {
    navigate("/");
  };

  return (
    <div className="aiOpponent">
      <h1 className="aiTitle">AI Opponent</h1>
      <button className="playButton" onClick={toggleGameState}>
        {isGameStarted ? "Pause Game" : "Start Game"}
      </button>
      <button className="finishGameButton" onClick={finishGame}>
        <IoExitOutline />
      </button>
      <button className="playSettingsButton" onClick={() => setShowSettings(true)}>
        <IoSettingsSharp />
      </button>
      {showSettings && <Settings onClose={() => setShowSettings(false)} />}
    </div>
  );
}