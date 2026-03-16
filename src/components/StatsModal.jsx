import './Tutorial.css';

function StatsModal({ onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>x</button>
        <h2>Statistics</h2>
        <p>Here you can view your play statistics!</p>
      </div>
    </div>
  );
}

export default StatsModal;