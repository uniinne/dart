import React from 'react';
import './WinnerPopup.css';

const WinnerPopup = ({ regionName, onClose, title = '당첨지역으로 떠나세요!!', label = '여행지' }) => {
  if (!regionName) return null;

  return (
    <div className="popup-overlay" onClick={onClose}>
      <div className="popup-content" onClick={(e) => e.stopPropagation()}>
        <div className="popup-header">
          <div className="celebration-icon">
            <svg
              width="64"
              height="64"
              viewBox="0 0 56 56"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* 스타리아 스타일 자동차 본체 (둥근 디자인) */}
              <path d="M10 20 Q10 16 14 16 L42 16 Q46 16 46 20 L46 32 Q46 36 42 36 L14 36 Q10 36 10 32 Z" fill="#4A90E2" stroke="#fff" strokeWidth="1.5"/>
              {/* 지붕 (둥근 형태) */}
              <path d="M14 20 Q14 12 20 12 L36 12 Q42 12 42 20" fill="#2E5C8A" stroke="#fff" strokeWidth="1.5"/>
              {/* 넓은 전면 유리창 (스타리아 특징) */}
              <path d="M12 20 Q12 14 18 14 L22 14 Q28 14 28 20" fill="#87CEEB" opacity="0.8" stroke="#fff" strokeWidth="0.5"/>
              {/* 측면 창 (넓고 둥근 형태) */}
              <path d="M28 20 Q28 14 34 14 L38 14 Q44 14 44 20" fill="#87CEEB" opacity="0.8" stroke="#fff" strokeWidth="0.5"/>
              {/* 뒷유리 */}
              <path d="M40 20 Q40 14 44 14 L44 20 Z" fill="#87CEEB" opacity="0.6" stroke="#fff" strokeWidth="0.5"/>
              {/* 앞바퀴 */}
              <circle cx="18" cy="38" r="4.5" fill="#1A1A1A" stroke="#fff" strokeWidth="1"/>
              <circle cx="18" cy="38" r="2.5" fill="#444"/>
              {/* 뒷바퀴 */}
              <circle cx="38" cy="38" r="4.5" fill="#1A1A1A" stroke="#fff" strokeWidth="1"/>
              <circle cx="38" cy="38" r="2.5" fill="#444"/>
              {/* 헤드라이트 (둥근 형태) */}
              <circle cx="10" cy="28" r="2.5" fill="#FFE066"/>
              <circle cx="10" cy="28" r="1.5" fill="#FFF" opacity="0.8"/>
              {/* 그릴 (수평선) */}
              <line x1="12" y1="22" x2="14" y2="22" stroke="#fff" strokeWidth="1"/>
              <line x1="12" y1="24" x2="14" y2="24" stroke="#fff" strokeWidth="1"/>
            </svg>
          </div>
          <h2 className="popup-title">{title}</h2>
        </div>
        <div className="popup-body">
          <div className="region-card">
            <div className="region-label">{label}</div>
            <p className="region-name">{regionName}</p>
            <div className="decorative-line"></div>
          </div>
        </div>
        <div className="popup-footer">
          <button className="close-button" onClick={onClose}>
            <span>확인</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default WinnerPopup;
