import React, { useMemo, useRef, useState } from 'react';
import MapView from './components/MapView';
import DartLauncher from './components/DartLauncher';
import ConfettiEffect from './components/ConfettiEffect';
import WinnerPopup from './components/WinnerPopup';
import { generateRandomCoords } from './utils/randomCoords';
import { reverseGeocode } from './utils/geocoder';
import './styles/App.css';

function App() {
  const [center, setCenter] = useState({ lat: 36.5, lng: 127.5 }); // 대한민국 중심
  const [level, setLevel] = useState(13); // 초기 확대 레벨 (대한민국 전체가 보이도록)
  const [isThrowing, setIsThrowing] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [winnerRegion, setWinnerRegion] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [dartPosition, setDartPosition] = useState(null); // 다트가 꽂힌 위치 (좌표)
  const [flyingDartPosition, setFlyingDartPosition] = useState(null); // 날아가는 다트의 현재 좌표 (지도 좌표계)
  const mapContainerRef = useRef(null);
  const kakaoMapRef = useRef(null);
  const pendingTargetRef = useRef(null); // 비동기 타이밍용 (현재 던진 목표 좌표)
  const flyingAnimIdRef = useRef(null);

  const dartSvg = useMemo(() => {
    return (
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
    );
  }, []);

  const isInCurrentMapBounds = (coords) => {
    const map = kakaoMapRef.current;
    if (!map) return true;
    const bounds = map.getBounds?.();
    if (!bounds) return true;

    const sw = bounds.getSouthWest();
    const ne = bounds.getNorthEast();

    return (
      coords.lat >= sw.getLat() &&
      coords.lat <= ne.getLat() &&
      coords.lng >= sw.getLng() &&
      coords.lng <= ne.getLng()
    );
  };

  const pickRandomCoordsPreferVisible = () => {
    // 무작위 좌표 생성 (화면 안/밖 상관없이)
    return generateRandomCoords();
  };

  const getTargetContainerPoint = (coords) => {
    const map = kakaoMapRef.current;
    const kakao = window.kakao;
    if (!map || !kakao?.maps) return null;

    const proj = map.getProjection?.();
    if (!proj) return null;

    const latlng = new kakao.maps.LatLng(coords.lat, coords.lng);

    // Kakao Maps projection API: containerPointFromCoords가 있으면 그걸 우선 사용
    if (typeof proj.containerPointFromCoords === 'function') {
      const pt = proj.containerPointFromCoords(latlng);
      if (pt && typeof pt.x === 'number' && typeof pt.y === 'number') return { x: pt.x, y: pt.y };
    }

    // 구버전/환경 fallback
    if (typeof proj.pointFromCoords === 'function') {
      const pt = proj.pointFromCoords(latlng);
      if (pt && typeof pt.x === 'number' && typeof pt.y === 'number') return { x: pt.x, y: pt.y };
    }

    return null;
  };

  // 픽셀 좌표를 지도 좌표로 역변환
  const getCoordsFromContainerPoint = (point) => {
    const map = kakaoMapRef.current;
    const kakao = window.kakao;
    if (!map || !kakao?.maps) return null;

    const proj = map.getProjection?.();
    if (!proj) return null;

    // Kakao Maps projection API: coordsFromContainerPoint가 있으면 그걸 우선 사용
    if (typeof proj.coordsFromContainerPoint === 'function') {
      const pt = new kakao.maps.Point(point.x, point.y);
      const latlng = proj.coordsFromContainerPoint(pt);
      if (latlng && typeof latlng.getLat === 'function' && typeof latlng.getLng === 'function') {
        return { lat: latlng.getLat(), lng: latlng.getLng() };
      }
    }

    // 구버전/환경 fallback
    if (typeof proj.coordsFromPoint === 'function') {
      const pt = new kakao.maps.Point(point.x, point.y);
      const latlng = proj.coordsFromPoint(pt);
      if (latlng && typeof latlng.getLat === 'function' && typeof latlng.getLng === 'function') {
        return { lat: latlng.getLat(), lng: latlng.getLng() };
      }
    }

    return null;
  };

  // 다트 던지기 핸들러
  const handleThrowDart = async () => {
    if (isThrowing) return;

    setIsThrowing(true);
    setShowConfetti(false);
    setShowPopup(false);
    setWinnerRegion(null);
    // 새로운 다트를 던질 때는 이전 다트 초기화
    setDartPosition(null);
    setFlyingDartPosition(null);

    // 1. 무작위 지역 확정
    const randomCoords = pickRandomCoordsPreferVisible();
    pendingTargetRef.current = randomCoords;

    // 2. 목적지가 현재 화면 안에 있는지 확인
    const isVisible = isInCurrentMapBounds(randomCoords);
    
    // 3. (현재 화면 기준) 목적지 픽셀 좌표 계산
    const targetPoint = getTargetContainerPoint(randomCoords);
    
    const containerEl = mapContainerRef.current;
    const rect = containerEl?.getBoundingClientRect?.();
    
    if (!rect) {
      // 컨테이너 크기를 알 수 없으면 fallback
      await new Promise((resolve) => setTimeout(resolve, 100));
      // 지도 좌표계 애니메이션을 위한 시작 좌표를 얻을 수 없으면 바로 꽂힘 처리
      setDartPosition(randomCoords);
    } else {
      const startLeft = rect.width / 2;
      const startTop = rect.height - 140; // 런처 위쪽에서 시작
      
      // 지도 좌표계 애니메이션: 시작 픽셀(다트의 뾰족한 끝)을 좌표로 역변환해서 출발점으로 사용
      const dartHeight = 80 * 0.85; // scale 적용된 다트 높이
      const startTipPoint = { x: startLeft, y: startTop - dartHeight };
      const startCoords = getCoordsFromContainerPoint(startTipPoint) || center;
      
      // 기존 애니메이션이 돌고 있으면 중단
      if (flyingAnimIdRef.current) {
        cancelAnimationFrame(flyingAnimIdRef.current);
        flyingAnimIdRef.current = null;
      }

      // 지도 좌표를 선형 보간하면서 비행(1.5초). 마지막 프레임이 곧 randomCoords -> 순간이동 제거.
      const durationMs = 1500;
      const startTime = performance.now();
      const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

      setFlyingDartPosition(startCoords);

      await new Promise((resolve) => {
        const tick = (now) => {
          // 다른 throw가 시작되었으면 중단
          if (pendingTargetRef.current !== randomCoords) {
            flyingAnimIdRef.current = null;
            resolve();
            return;
          }

          const rawT = (now - startTime) / durationMs;
          const t = Math.max(0, Math.min(1, rawT));
          const e = easeOutCubic(t);

          const lat = startCoords.lat + (randomCoords.lat - startCoords.lat) * e;
          const lng = startCoords.lng + (randomCoords.lng - startCoords.lng) * e;
          setFlyingDartPosition({ lat, lng });

          if (t >= 1) {
            flyingAnimIdRef.current = null;
            resolve();
            return;
          }
          flyingAnimIdRef.current = requestAnimationFrame(tick);
        };
        flyingAnimIdRef.current = requestAnimationFrame(tick);
      });

      // 마지막 프레임이 곧 확정 위치. 그 자리에서 그대로 "꽂힘"으로 전환.
      setFlyingDartPosition(null);
      setDartPosition(randomCoords);
    }

    // 4. 다트가 목표 좌표에 '꽂힌' 상태로 유지
    // (위에서 이미 setDartPosition과 setFlyingDart 처리가 완료됨)
    
    // 지도 진동 효과
    try {
      if (mapContainerRef.current) {
        mapContainerRef.current.classList.add('dart-shake');
        setTimeout(() => {
          if (mapContainerRef.current) {
            mapContainerRef.current.classList.remove('dart-shake');
          }
        }, 500);
      }
    } catch (err) {
      console.error('진동 효과 오류:', err);
    }

    // 7. 역지오코딩 및 폭죽 효과
    try {
      const regionName = await reverseGeocode(randomCoords.lat, randomCoords.lng);
      setWinnerRegion(regionName);
      
      // 진동 효과 후 폭죽 효과
      setTimeout(() => {
        setShowConfetti(true);
      }, 300);
      
      // 폭죽 효과 후 배너 표시
      setTimeout(() => {
        setShowPopup(true);
        setIsThrowing(false);
      }, 800);
    } catch (error) {
      console.error('역지오코딩 오류:', error);
      // 에러가 발생해도 팝업은 표시
      setWinnerRegion('알 수 없는 지역');
      setTimeout(() => {
        setShowConfetti(true);
      }, 300);
      setTimeout(() => {
        setShowPopup(true);
        setIsThrowing(false);
      }, 800);
    }
  };

  // 팝업 닫기
  const handleClosePopup = () => {
    setShowPopup(false);
    setShowConfetti(false);
    setWinnerRegion(null);
    // 다트는 지도에 유지 (다음 다트 던지기 전까지)
    // setDartPosition(null);
    // setFlyingDart(null);
  };

  return (
    <div className="app">
      <div className="map-container" ref={mapContainerRef}>
        <MapView 
          center={center} 
          level={level}
          onMapCreate={(map) => {
            kakaoMapRef.current = map;
          }}
          stuckDartPosition={dartPosition}
          flyingDartPosition={flyingDartPosition}
        />
        
        {/* 다트 런처를 지도 위에 오버레이 */}
        <div className="dart-overlay">
          <DartLauncher 
            onThrowDart={handleThrowDart}
            isThrowing={isThrowing}
            showDart={!flyingDartPosition}
          />
        </div>
      </div>

      <ConfettiEffect trigger={showConfetti} />
      
      {showPopup && (
        <WinnerPopup 
          regionName={winnerRegion}
          onClose={handleClosePopup}
        />
      )}
    </div>
  );
}

export default App;
