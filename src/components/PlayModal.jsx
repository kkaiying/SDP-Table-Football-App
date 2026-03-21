import './Tutorial.css';

function PlayModal({ onClose, onSinglePlayer, onMultiplayer }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>x</button>
        <h2>Select Game Mode</h2>
        <div className="play-modal-buttons">
          <button className="play-modal-button" onClick={() => onSinglePlayer("/ai-opponent")}>
            Single-player
          </button>
          <button className="play-modal-button" onClick={onMultiplayer}>
            Multiplayer
          </button>
        </div>
      </div>
    </div>
  );
}

export default PlayModal;