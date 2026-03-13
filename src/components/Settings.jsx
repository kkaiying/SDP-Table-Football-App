import './Settings.css'

function SettingsModal({ onClose }) {
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className ='modal-content' onClick={(e) => e.stopPropagation()}>
                <button className='modal-close' onClick={onClose}> x </button>
                <h2> Mouse Controls </h2>
                <div className='settings-content'>
                    <p>Contenttt</p>
                </div>
            </div>
        </div>
    )
}
export default SettingsModal