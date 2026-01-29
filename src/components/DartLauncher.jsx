import React from 'react';
import './DartLauncher.css';

const DartLauncher = ({
  onThrowDart,
  onReset,
  onShowFoodList,
  onShowPlaceList,
  onShowHotelList,
  onShowDirections,
  onShowAverageRegion,
  canShowAverageRegion = false,
  isThrowing,
  showDart = true,
  canReset = false,
}) => {
  const handleFoodClick = () => {
    if (onShowFoodList) {
      onShowFoodList();
    } else {
      // TODO: 나중에 실제 맛집 리스트 페이지로 연결
      // eslint-disable-next-line no-console
      console.log('맛집 리스트 아이콘 클릭');
    }
  };

  const handlePlaceClick = () => {
    if (onShowPlaceList) {
      onShowPlaceList();
    } else {
      // TODO: 나중에 실제 관광지 리스트 페이지로 연결
      // eslint-disable-next-line no-console
      console.log('관광지 리스트 아이콘 클릭');
    }
  };

  const handleHotelClick = () => {
    if (onShowHotelList) {
      onShowHotelList();
    } else {
      // eslint-disable-next-line no-console
      console.log('숙소 찾기 아이콘 클릭');
    }
  };

  const handleDirectionsClick = () => {
    if (onShowDirections) {
      onShowDirections();
    } else {
      // eslint-disable-next-line no-console
      console.log('길찾기 아이콘 클릭');
    }
  };

  const handleAverageClick = () => {
    if (onShowAverageRegion) {
      onShowAverageRegion();
    } else {
      // eslint-disable-next-line no-console
      console.log('최근 10개 평균값 지역 보기 클릭');
    }
  };

  return (
    <div className="dart-launcher">
      <div className="button-group">
        {canReset && (
          <div className="list-buttons">
            {/* 숙소 찾아보기 */}
            <button
              type="button"
              className="list-button"
              onClick={handleHotelClick}
              disabled={isThrowing}
            >
              <div className="list-button-icon">
                <svg
                  width="40"
                  height="40"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* 호텔/숙소 건물 */}
                  <rect x="4" y="8" width="16" height="12" rx="1" fill="#ffffff" opacity="0.9" stroke="#FFA500" strokeWidth="1.4"/>
                  {/* 지붕 */}
                  <path d="M4 8 L12 3 L20 8 Z" fill="#ffffff" opacity="0.9" stroke="#FFA500" strokeWidth="1.4"/>
                  {/* 창문 (왼쪽) */}
                  <rect x="6" y="11" width="3" height="3" rx="0.5" fill="#FFA500" opacity="0.7"/>
                  {/* 창문 (오른쪽) */}
                  <rect x="15" y="11" width="3" height="3" rx="0.5" fill="#FFA500" opacity="0.7"/>
                  {/* 문 */}
                  <rect x="10.5" y="14" width="3" height="6" rx="0.5" fill="#FFA500" opacity="0.8"/>
                  {/* 별 (호텔 등급 표시) */}
                  <circle cx="7" cy="6" r="0.8" fill="#FFD700"/>
                  <circle cx="12" cy="5" r="0.8" fill="#FFD700"/>
                  <circle cx="17" cy="6" r="0.8" fill="#FFD700"/>
                </svg>
              </div>
              <span className="list-button-label">숙소 찾아보기</span>
            </button>

            {/* 맛집 리스트 */}
            <button
              type="button"
              className="list-button"
              onClick={handleFoodClick}
              disabled={isThrowing}
            >
              <div className="list-button-icon">
                <svg
                  width="40"
                  height="40"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* 그릇 */}
                  <path
                    d="M4 10C4 13.3137 6.68629 16 10 16H14C17.3137 16 20 13.3137 20 10H4Z"
                    fill="#ffffff"
                    opacity="0.9"
                  />
                  {/* 그릇 라인 */}
                  <path
                    d="M4 10C4 13.3137 6.68629 16 10 16H14C17.3137 16 20 13.3137 20 10"
                    stroke="#4A90E2"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                  />
                  {/* 김 (증기) */}
                  <path
                    d="M9 4C9.8 4.6 10.2 5.4 9.8 6.2C9.5 6.8 9.3 7.2 9.3 7.8"
                    stroke="#ffffff"
                    strokeWidth="1.3"
                    strokeLinecap="round"
                  />
                  <path
                    d="M12 4C12.8 4.6 13.2 5.4 12.8 6.2C12.5 6.8 12.3 7.2 12.3 7.8"
                    stroke="#ffffff"
                    strokeWidth="1.3"
                    strokeLinecap="round"
                  />
                  <path
                    d="M15 4C15.8 4.6 16.2 5.4 15.8 6.2C15.5 6.8 15.3 7.2 15.3 7.8"
                    stroke="#ffffff"
                    strokeWidth="1.3"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <span className="list-button-label">맛집리스트</span>
            </button>

            {/* 관광지 리스트 */}
            <button
              type="button"
              className="list-button"
              onClick={handlePlaceClick}
              disabled={isThrowing}
            >
              <div className="list-button-icon">
                <svg
                  width="40"
                  height="40"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* 위치 핀 */}
                  <path
                    d="M12 3C9.23858 3 7 5.23858 7 8C7 10.7614 9 13 12 17C15 13 17 10.7614 17 8C17 5.23858 14.7614 3 12 3Z"
                    fill="#ffffff"
                    stroke="#f5576c"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <circle
                    cx="12"
                    cy="8"
                    r="2.2"
                    fill="#f5576c"
                    opacity="0.9"
                  />
                </svg>
              </div>
              <span className="list-button-label">관광지 리스트</span>
            </button>

            {/* 길찾기 */}
            <button
              type="button"
              className="list-button"
              onClick={handleDirectionsClick}
              disabled={isThrowing}
            >
              <div className="list-button-icon">
                <svg
                  width="40"
                  height="40"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* 출발지 (용산역) */}
                  <circle
                    cx="6"
                    cy="18"
                    r="3"
                    fill="#4A90E2"
                    stroke="#fff"
                    strokeWidth="1.5"
                  />
                  {/* 도착지 (당첨 지역) */}
                  <circle
                    cx="18"
                    cy="6"
                    r="3"
                    fill="#f5576c"
                    stroke="#fff"
                    strokeWidth="1.5"
                  />
                  {/* 경로 선 */}
                  <path
                    d="M6 18 Q12 12 18 6"
                    stroke="#4A90E2"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    fill="none"
                  />
                  {/* 화살표 */}
                  <path
                    d="M16 7 L18 6 L16 5"
                    stroke="#4A90E2"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                  />
                </svg>
              </div>
              <span className="list-button-label">길찾기</span>
            </button>
          </div>
        )}

        {!canReset && (
          <button
            className="throw-button"
            onClick={onThrowDart}
            disabled={isThrowing}
          >
            {isThrowing ? '이동 중...' : '목적지 정하기'}
          </button>
        )}

        {canReset && (
          <div className="reset-row">
            <button
              className="reset-button"
              onClick={onReset}
              disabled={isThrowing}
            >
              {isThrowing ? '이동 중...' : '다시하기'}
            </button>

            {canShowAverageRegion && (
              <button
                className="avg-button"
                onClick={handleAverageClick}
                disabled={isThrowing}
                type="button"
              >
                최근 10개 평균값 지역 보기
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DartLauncher;
