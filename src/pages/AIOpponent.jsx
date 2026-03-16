import './AIOpponent.css';
import { useState } from 'react';

export default function AIOpponent() {
  const [isGameStarted, setIsGameStarted] = useState(false);

  const toggleGameState = () => {
    setIsGameStarted((prevState) => !prevState);
  };

  return (
    <div className="aiOpponent">
      <h1 className="aiTitle">AI Opponent</h1>
      <button className="playButton" onClick={toggleGameState}>
        {isGameStarted ? "Pause Game" : "Start Game"}
      </button>
    </div>
  );
}