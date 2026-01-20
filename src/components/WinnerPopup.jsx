import React from 'react';
import './WinnerPopup.css';

const WinnerPopup = ({ regionName, onClose }) => {
  if (!regionName) return null;

  return (
    <div className="popup-overlay" onClick={onClose}>
      <div className="popup-content" onClick={(e) => e.stopPropagation()}>
        <div className="popup-header">
          <h2>🎯 당첨!</h2>
        </div>
        <div className="popup-body">
          <p className="region-name">{regionName}</p>
        </div>
        <div className="popup-footer">
          <button className="close-button" onClick={onClose}>
            확인
          </button>
        </div>
      </div>
    </div>
  );
};

export default WinnerPopup;
