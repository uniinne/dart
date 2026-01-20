import React from 'react';
import './DartLauncher.css';

const DartLauncher = ({ onThrowDart, isThrowing, showDart = true }) => {
  return (
    <div className="dart-launcher">
      {showDart && (
        <div className="dart-icon">
        <svg
          width="40"
          height="40"
          viewBox="0 0 100 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* 다트 몸체 (뾰족한 앞부분) */}
          <path
            d="M50 0 L45 40 L50 50 L55 40 Z"
            fill="#FF6B6B"
            stroke="#fff"
            strokeWidth="2"
          />
          {/* 다트 몸체 (원통형) */}
          <rect
            x="40"
            y="40"
            width="20"
            height="100"
            rx="10"
            fill="#FF6B6B"
            stroke="#fff"
            strokeWidth="2"
          />
          {/* 다트 깃털 (위쪽) */}
          <path
            d="M50 140 L30 160 L50 150 L70 160 Z"
            fill="#4A90E2"
            stroke="#fff"
            strokeWidth="1"
          />
          {/* 다트 깃털 (아래쪽) */}
          <path
            d="M50 150 L30 180 L50 170 L70 180 Z"
            fill="#4A90E2"
            stroke="#fff"
            strokeWidth="1"
          />
          {/* 다트 깃털 (왼쪽) */}
          <path
            d="M40 140 L20 150 L40 150 L30 160 Z"
            fill="#4A90E2"
            stroke="#fff"
            strokeWidth="1"
          />
          {/* 다트 깃털 (오른쪽) */}
          <path
            d="M60 140 L80 150 L60 150 L70 160 Z"
            fill="#4A90E2"
            stroke="#fff"
            strokeWidth="1"
          />
        </svg>
        </div>
      )}
      <button
        className="throw-button"
        onClick={onThrowDart}
        disabled={isThrowing}
      >
        {isThrowing ? '던지는 중...' : '다트 던지기'}
      </button>
    </div>
  );
};

export default DartLauncher;
