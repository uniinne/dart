import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import MapView from './components/MapView';
import DartLauncher from './components/DartLauncher';
import ConfettiEffect from './components/ConfettiEffect';
import WinnerPopup from './components/WinnerPopup';
import { generateRandomCoords, generateSafeCoords } from './utils/randomCoords';
import { reverseGeocode } from './utils/geocoder';
import { generateKakaoMapSearchUrl } from './utils/kakaoMapSearch';
import './styles/App.css';

// 용산역 좌표 (출발 지점)
const YONGSAN_STATION = { lat: 37.5297, lng: 126.9649 };

function App() {
  const [center, setCenter] = useState({ lat: 36.5, lng: 127.5 }); // 대한민국 중심
  const [level, setLevel] = useState(13); // 초기 확대 레벨 (대한민국 전체가 보이도록)
  const [isThrowing, setIsThrowing] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [winnerRegion, setWinnerRegion] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [dartPosition, setDartPosition] = useState(null); // 다트가 꽂힌 위치 (좌표)
  const [flyingDartPosition, setFlyingDartPosition] = useState(null); // 날아가는 다트의 현재 좌표 (지도 좌표계)
  const [carRotation, setCarRotation] = useState(0); // 자동차 회전 각도 (도)
  const [showStartCar, setShowStartCar] = useState(true); // 용산역 자동차 표시 여부
  const previousCarPositionRef = useRef(null); // 이전 자동차 위치 추적
  const [preselectedTarget, setPreselectedTarget] = useState(null); // { coords: {lat,lng}, regionName }
  const [isPreselecting, setIsPreselecting] = useState(false);
  const mapContainerRef = useRef(null);
  const kakaoMapRef = useRef(null);
  const pendingTargetRef = useRef(null); // 비동기 타이밍용 (현재 던진 목표 좌표)
  const flyingAnimIdRef = useRef(null);
  const preselectInFlightRef = useRef(null);
  const isOpeningFoodRef = useRef(false);
  const isOpeningPlaceRef = useRef(false);
  const isOpeningHotelRef = useRef(false);

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

  const isValidRegionName = (name) => {
    if (!name || typeof name !== 'string') return false;
    const trimmed = name.trim();
    return trimmed.length > 0 && trimmed !== '알 수 없는 지역';
  };

  const preselectWinnerTarget = async () => {
    const maxTries = 15;

    // 일반 랜덤 좌표로 재시도
    for (let i = 0; i < maxTries; i++) {
      const coords = pickRandomCoordsPreferVisible();
      try {
        const regionName = await reverseGeocode(coords.lat, coords.lng);
        if (isValidRegionName(regionName)) {
          return { coords, regionName };
        }
      } catch (err) {
        // ignore and retry
      }
    }

    // safeAreas 기반 좌표로 1회 더 시도
    const safeCoords = generateSafeCoords();
    try {
      const regionName = await reverseGeocode(safeCoords.lat, safeCoords.lng);
      if (isValidRegionName(regionName)) {
        return { coords: safeCoords, regionName };
      }
    } catch (err) {
      // ignore
    }

    // 최후의 fallback (좌표는 하나 주되, 배너에 표시할 지역명이 없을 수 있음)
    return { coords: safeCoords, regionName: '알 수 없는 지역' };
  };

  const ensurePreselectedTarget = async () => {
    if (preselectedTarget && isValidRegionName(preselectedTarget.regionName)) return preselectedTarget;

    if (preselectInFlightRef.current) {
      return await preselectInFlightRef.current;
    }

    setIsPreselecting(true);
    const p = (async () => {
      const next = await preselectWinnerTarget();
      setPreselectedTarget(next);
      return next;
    })();

    preselectInFlightRef.current = p;

    try {
      return await p;
    } finally {
      preselectInFlightRef.current = null;
      setIsPreselecting(false);
    }
  };

  // 앱 시작 시 다음 라운드 타겟을 미리 확정
  useEffect(() => {
    void ensurePreselectedTarget();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

    // 1) 미리 확정된 당첨지역(좌표/지역명) 확보
    const target = await ensurePreselectedTarget();
    const targetCoords = target?.coords;
    const targetRegionName = target?.regionName;

    // 확정 정보가 없거나, 알 수 없는 지역이면 한 번 더 자동 재확정
    if (!targetCoords || !isValidRegionName(targetRegionName)) {
      setPreselectedTarget(null);
      const reselected = await ensurePreselectedTarget();
      if (!reselected?.coords || !isValidRegionName(reselected?.regionName)) {
        // 여기까지 왔다는 건 정말 드문 케이스: 일단 종료 처리
        setWinnerRegion('알 수 없는 지역');
        setShowPopup(true);
        setIsThrowing(false);
        return;
      }
      pendingTargetRef.current = reselected.coords;
      setWinnerRegion(reselected.regionName);
    } else {
      pendingTargetRef.current = targetCoords;
      setWinnerRegion(targetRegionName);
    }

    const finalTarget = pendingTargetRef.current;
    
    const containerEl = mapContainerRef.current;
    const rect = containerEl?.getBoundingClientRect?.();
    
    if (!rect) {
      // 컨테이너 크기를 알 수 없으면 fallback
      await new Promise((resolve) => setTimeout(resolve, 100));
      // 지도 좌표계 애니메이션을 위한 시작 좌표를 얻을 수 없으면 바로 꽂힘 처리
      setDartPosition(finalTarget);
    } else {
      // 출발 지점을 용산역으로 고정
      const startCoords = YONGSAN_STATION;
      
      // 기존 애니메이션이 돌고 있으면 중단
      if (flyingAnimIdRef.current) {
        cancelAnimationFrame(flyingAnimIdRef.current);
        flyingAnimIdRef.current = null;
      }

      // 지도 좌표를 선형 보간하면서 비행(1.5초). 마지막 프레임이 곧 randomCoords -> 순간이동 제거.
      const durationMs = 1500;
      const startTime = performance.now();
      const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

      // 이전 위치 초기화
      previousCarPositionRef.current = startCoords;
      setFlyingDartPosition(startCoords);
      setCarRotation(0);

      await new Promise((resolve) => {
        const tick = (now) => {
          // 다른 throw가 시작되었으면 중단
          if (pendingTargetRef.current !== finalTarget) {
            flyingAnimIdRef.current = null;
            resolve();
            return;
          }

          const rawT = (now - startTime) / durationMs;
          const t = Math.max(0, Math.min(1, rawT));
          const e = easeOutCubic(t);

          const lat = startCoords.lat + (finalTarget.lat - startCoords.lat) * e;
          const lng = startCoords.lng + (finalTarget.lng - startCoords.lng) * e;
          const currentPos = { lat, lng };
          
          // 이동 방향에 따라 자동차 회전 각도 계산
          if (previousCarPositionRef.current) {
            const prev = previousCarPositionRef.current;
            const dx = currentPos.lng - prev.lng;
            const dy = currentPos.lat - prev.lat;
            // 지도 좌표계에서는 위도가 y축, 경도가 x축
            // 각도 계산 (라디안을 도로 변환)
            const angle = Math.atan2(dy, dx) * (180 / Math.PI);
            setCarRotation(angle);
          }
          
          previousCarPositionRef.current = currentPos;
          setFlyingDartPosition(currentPos);

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
      setDartPosition(finalTarget);
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

    // 7. 폭죽/배너 표시 (지역명은 이미 사전 확정)
    setTimeout(() => {
      setShowConfetti(true);
    }, 300);

    setTimeout(() => {
      setShowPopup(true);
      setIsThrowing(false);
    }, 800);
  };

  // 팝업 닫기
  const handleClosePopup = () => {
    setShowPopup(false);
    setShowConfetti(false);
    // winnerRegion은 유지 (맛집/관광지 리스트 버튼에서 사용하기 위해)
    // 다음 라운드를 위해 미리 확정 다시 수행
    setPreselectedTarget(null);
    void ensurePreselectedTarget();
    // 용산역 자동차 숨기기 (다시하기 버튼으로만 표시)
    setShowStartCar(false);
  };

  // 다시하기: 당첨 지역의 자동차를 용산역으로 돌아가게 함
  const handleReset = async () => {
    if (!dartPosition || isThrowing) return;

    setIsThrowing(true);
    const startCoords = YONGSAN_STATION;
    const currentPosition = dartPosition;

    // 기존 애니메이션이 돌고 있으면 중단
    if (flyingAnimIdRef.current) {
      cancelAnimationFrame(flyingAnimIdRef.current);
      flyingAnimIdRef.current = null;
    }

    // 지도 좌표를 선형 보간하면서 용산역으로 이동
    const durationMs = 1500;
    const startTime = performance.now();
    const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

    // 이전 위치 초기화
    previousCarPositionRef.current = currentPosition;
    setFlyingDartPosition(currentPosition);
    setDartPosition(null); // 도착 지점 자동차 숨기기
    setCarRotation(0);

    await new Promise((resolve) => {
      const tick = (now) => {
        const rawT = (now - startTime) / durationMs;
        const t = Math.max(0, Math.min(1, rawT));
        const e = easeOutCubic(t);

        const lat = currentPosition.lat + (startCoords.lat - currentPosition.lat) * e;
        const lng = currentPosition.lng + (startCoords.lng - currentPosition.lng) * e;
        const currentPos = { lat, lng };
        
        // 이동 방향에 따라 자동차 회전 각도 계산
        if (previousCarPositionRef.current) {
          const prev = previousCarPositionRef.current;
          const dx = currentPos.lng - prev.lng;
          const dy = currentPos.lat - prev.lat;
          const angle = Math.atan2(dy, dx) * (180 / Math.PI);
          setCarRotation(angle);
        }
        
        previousCarPositionRef.current = currentPos;
        setFlyingDartPosition(currentPos);

        if (t >= 1) {
          flyingAnimIdRef.current = null;
          resolve();
          return;
        }
        flyingAnimIdRef.current = requestAnimationFrame(tick);
      };
      flyingAnimIdRef.current = requestAnimationFrame(tick);
    });

    // 용산역 도착 후 상태 초기화
    setFlyingDartPosition(null);
    setDartPosition(null); // canReset을 false로 만들어 "목적지 정하기" 버튼이 다시 나타나도록
    setCarRotation(0);
    setShowStartCar(true); // 용산역 자동차 다시 표시
    setWinnerRegion(null); // 다시하기 완료 후 winnerRegion 초기화
    setIsThrowing(false);
  };

  // 당첨 지역 기반 맛집 리스트 열기
  const handleShowFoodList = useCallback(() => {
    if (isOpeningFoodRef.current) return;
    isOpeningFoodRef.current = true;
    
    const url = generateKakaoMapSearchUrl(winnerRegion, '맛집');
    if (!url) {
      isOpeningFoodRef.current = false;
      return;
    }
    
    // 한 번만 실행되도록 보장
    const uniqueId = Date.now();
    window.open(url, `kakao-food-${uniqueId}`, 'noopener,noreferrer');
    
    setTimeout(() => {
      isOpeningFoodRef.current = false;
    }, 2000);
  }, [winnerRegion]);

  // 당첨 지역 기반 관광지 리스트 열기
  const handleShowPlaceList = useCallback(() => {
    if (isOpeningPlaceRef.current) return;
    isOpeningPlaceRef.current = true;
    
    const url = generateKakaoMapSearchUrl(winnerRegion, '관광지');
    if (!url) {
      isOpeningPlaceRef.current = false;
      return;
    }
    
    // 한 번만 실행되도록 보장
    const uniqueId = Date.now();
    window.open(url, `kakao-place-${uniqueId}`, 'noopener,noreferrer');
    
    setTimeout(() => {
      isOpeningPlaceRef.current = false;
    }, 2000);
  }, [winnerRegion]);

  // 당첨 지역 기반 숙소 리스트 열기 (야놀자 검색)
  const handleShowHotelList = useCallback(() => {
    if (isOpeningHotelRef.current) return;
    isOpeningHotelRef.current = true;
    
    if (!winnerRegion || typeof winnerRegion !== 'string') {
      isOpeningHotelRef.current = false;
      return;
    }
    const trimmed = winnerRegion.trim();
    if (!trimmed || trimmed === '알 수 없는 지역') {
      isOpeningHotelRef.current = false;
      return;
    }

    // 야놀자 지역 키워드 검색 URL
    const encoded = encodeURIComponent(trimmed);
    const url = `https://nol.yanolja.com/local/search?keyword=${encoded}`;

    // 한 번만 실행되도록 보장
    const uniqueId = Date.now();
    window.open(url, `yanolja-hotel-${uniqueId}`, 'noopener,noreferrer');
    
    setTimeout(() => {
      isOpeningHotelRef.current = false;
    }, 2000);
  }, [winnerRegion]);

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
          startPosition={showStartCar && !isThrowing && !showPopup ? YONGSAN_STATION : null}
          carRotation={carRotation}
        />
        
        {/* 다트 런처를 지도 위에 오버레이 */}
        <div className={`dart-overlay ${!!dartPosition && !flyingDartPosition && !showPopup ? 'left-center' : 'bottom-center'}`}>
          <DartLauncher 
            onThrowDart={handleThrowDart}
            onReset={handleReset}
            onShowFoodList={handleShowFoodList}
            onShowPlaceList={handleShowPlaceList}
            onShowHotelList={handleShowHotelList}
            isThrowing={isThrowing}
            showDart={!flyingDartPosition}
            canReset={!!dartPosition && !flyingDartPosition && !showPopup}
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
