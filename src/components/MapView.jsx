import React, { useState } from 'react';
import { CustomOverlayMap, Map, useKakaoLoader } from 'react-kakao-maps-sdk';
import './MapView.css';

const MapView = ({ center, level, onMapCreate, stuckDartPosition, flyingDartPosition, startPosition, carRotation = 0 }) => {
  const [mapReady, setMapReady] = useState(false);
  // 카카오 지도 SDK 로드
  const apiKey = import.meta.env.VITE_KAKAO_MAP_KEY;
  
  if (!apiKey || apiKey.includes('여기에')) {
    return (
      <div className="map-error">
        <p>카카오 지도 API 키가 설정되지 않았습니다.</p>
        <p>.env 파일에 VITE_KAKAO_MAP_KEY를 설정하세요.</p>
      </div>
    );
  }

  const [loading, error] = useKakaoLoader({
    appkey: apiKey,
    libraries: ['services'],
  });

  if (loading) {
    return (
      <div className="map-loading">
        <p>지도 로딩 중...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="map-error">
        <p>지도 로딩 실패: {error.message}</p>
        <p>카카오 지도 API 키를 확인하세요.</p>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <Map
        center={center}
        style={{ width: '100%', height: '100%' }}
        level={level}
        onCreate={(map) => {
          if (onMapCreate) onMapCreate(map);
          setMapReady(true);
        }}
      >
        {/* 용산역에 고정된 자동차 아이콘 (항상 표시, 이동 중이 아닐 때만) */}
        {mapReady && startPosition && !flyingDartPosition && (
          <CustomOverlayMap
            position={{ lat: startPosition.lat, lng: startPosition.lng }}
            yAnchor={0.5}
          >
            <div className="car-icon start-car">
              <svg
                width="40"
                height="40"
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
          </CustomOverlayMap>
        )}

        {/* 이동 중인 자동차 */}
        {mapReady && flyingDartPosition && flyingDartPosition.lat && flyingDartPosition.lng && (
          <CustomOverlayMap
            position={{ lat: flyingDartPosition.lat, lng: flyingDartPosition.lng }}
            yAnchor={0.5}
          >
            <div className="car-icon moving-car" style={{ transform: `rotate(${carRotation}deg)` }}>
              <svg
                width="40"
                height="40"
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
          </CustomOverlayMap>
        )}

        {/* 도착 지점에 표시되는 자동차 */}
        {mapReady && stuckDartPosition && stuckDartPosition.lat && stuckDartPosition.lng && (
          <CustomOverlayMap 
            position={{ lat: stuckDartPosition.lat, lng: stuckDartPosition.lng }} 
            yAnchor={0.5}
          >
            <div className="car-icon arrived-car">
              <svg
                width="40"
                height="40"
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
          </CustomOverlayMap>
        )}
      </Map>
    </div>
  );
};

export default MapView;
