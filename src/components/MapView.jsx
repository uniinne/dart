import React, { useState } from 'react';
import { CustomOverlayMap, Map, useKakaoLoader } from 'react-kakao-maps-sdk';
import './MapView.css';

const MapView = ({ center, level, onMapCreate, stuckDartPosition, flyingDartPosition }) => {
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
        {/* 날아가는 다트: 지도 좌표(CustomOverlayMap)로 렌더링해 "마지막 순간이동" 제거 */}
        {mapReady && flyingDartPosition && flyingDartPosition.lat && flyingDartPosition.lng && (
          <CustomOverlayMap
            position={{ lat: flyingDartPosition.lat, lng: flyingDartPosition.lng }}
            yAnchor={0}
          >
            <div className="stuck-dart">
              <svg
                width="40"
                height="80"
                viewBox="0 0 50 100"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M25 0 L22.5 20 L25 25 L27.5 20 Z"
                  fill="#FF6B6B"
                  stroke="#fff"
                  strokeWidth="1"
                />
                <rect
                  x="20"
                  y="20"
                  width="10"
                  height="50"
                  rx="5"
                  fill="#FF6B6B"
                  stroke="#fff"
                  strokeWidth="1"
                />
                <path
                  d="M25 70 L15 80 L25 75 L35 80 Z"
                  fill="#4A90E2"
                  stroke="#fff"
                  strokeWidth="0.5"
                />
                <path
                  d="M25 75 L15 90 L25 85 L35 90 Z"
                  fill="#4A90E2"
                  stroke="#fff"
                  strokeWidth="0.5"
                />
                <path
                  d="M20 70 L10 75 L20 75 L15 80 Z"
                  fill="#4A90E2"
                  stroke="#fff"
                  strokeWidth="0.5"
                />
                <path
                  d="M30 70 L40 75 L30 75 L35 80 Z"
                  fill="#4A90E2"
                  stroke="#fff"
                  strokeWidth="0.5"
                />
              </svg>
            </div>
          </CustomOverlayMap>
        )}

        {mapReady && stuckDartPosition && stuckDartPosition.lat && stuckDartPosition.lng && (
          <CustomOverlayMap 
            position={{ lat: stuckDartPosition.lat, lng: stuckDartPosition.lng }} 
            yAnchor={0}
          >
            <div className="stuck-dart">
              <svg
                width="40"
                height="80"
                viewBox="0 0 50 100"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M25 0 L22.5 20 L25 25 L27.5 20 Z"
                  fill="#FF6B6B"
                  stroke="#fff"
                  strokeWidth="1"
                />
                <rect
                  x="20"
                  y="20"
                  width="10"
                  height="50"
                  rx="5"
                  fill="#FF6B6B"
                  stroke="#fff"
                  strokeWidth="1"
                />
                <path
                  d="M25 70 L15 80 L25 75 L35 80 Z"
                  fill="#4A90E2"
                  stroke="#fff"
                  strokeWidth="0.5"
                />
                <path
                  d="M25 75 L15 90 L25 85 L35 90 Z"
                  fill="#4A90E2"
                  stroke="#fff"
                  strokeWidth="0.5"
                />
                <path
                  d="M20 70 L10 75 L20 75 L15 80 Z"
                  fill="#4A90E2"
                  stroke="#fff"
                  strokeWidth="0.5"
                />
                <path
                  d="M30 70 L40 75 L30 75 L35 80 Z"
                  fill="#4A90E2"
                  stroke="#fff"
                  strokeWidth="0.5"
                />
              </svg>
            </div>
          </CustomOverlayMap>
        )}
      </Map>
    </div>
  );
};

export default MapView;
