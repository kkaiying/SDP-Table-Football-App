import './Tutorial.css'

function Tutorial({ onClose, openSettings }) {
    return (
        <div className='modal-overlay' onClick={onClose}>
            <div className='modal-content' onClick={(e) => e.stopPropagation()}>
                <button className='modal-close' onClick={onClose}>x</button>
                <h2>How To Play</h2>
                <div className='tutorial-content'>
                    <p>The aim of the game is to score the most goals!</p>
                    <ul>
                        <li>Defend your goal</li>       
                        <li>Score goals into the opponent's goal (the one on the right!)</li>
                        <li>Move your rods to position your players</li>
                        <li>Spin your rods to kick the ball</li>
                        <li>Anticipate your opponent's moves!</li>
                    </ul>
                    <p>Grab a friend, a mouse or a controller, and have fun!</p>
                    <p>Need help with the controls? <span className='controls-link' onClick={openSettings}>View the controls guide</span> 
                    </p>
                </div>
            </div>
        </div>
    )
}

export default Tutorial