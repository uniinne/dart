/**
 * 한국 내륙 랜덤 좌표 생성 함수
 * 바다를 제외한 한국 본토 영역 내에서 랜덤 좌표를 생성합니다.
 */

// 한국 본토의 대략적인 경계 좌표 (육지 중심, 휴전선 제외)
// 더 보수적으로 육지 영역만 포함하도록 범위 축소
const KOREA_BOUNDS = {
  minLat: 33.5,  // 제주도 포함하되 바다 제외
  maxLat: 38.0,  // 휴전선 이남 (38.0도 이하로 제한)
  minLng: 126.0, // 서해안 육지 영역
  maxLng: 130.0  // 동해안 육지 영역
};

// 주요 바다 영역 및 휴전선 근처 제외 (더 정확하게 정의)
const EXCLUDED_AREAS = [
  // 서해 바다 영역 (넓게)
  { minLat: 33.0, maxLat: 38.5, minLng: 124.0, maxLng: 127.5 },
  // 남해 바다 영역 (넓게)
  { minLat: 33.0, maxLat: 35.5, minLng: 125.5, maxLng: 130.5 },
  // 동해 바다 영역 (넓게)
  { minLat: 36.0, maxLat: 38.6, minLng: 128.8, maxLng: 132.0 },
  // 제주도 남쪽 바다
  { minLat: 33.0, maxLat: 33.8, minLng: 125.0, maxLng: 127.5 },
  // 휴전선 근처 (38.0도 이상)
  { minLat: 38.0, maxLat: 38.6, minLng: 125.0, maxLng: 131.0 },
  // 울릉도 동쪽 바다
  { minLat: 37.0, maxLat: 38.0, minLng: 130.0, maxLng: 132.0 },
  // 서해안 해안가 (더 넓게 제외)
  { minLat: 33.5, maxLat: 38.0, minLng: 126.0, maxLng: 126.5 },
  // 동해안 해안가 (더 넓게 제외)
  { minLat: 36.0, maxLat: 38.0, minLng: 129.5, maxLng: 130.0 },
];

/**
 * 좌표가 제외 영역(바다)에 있는지 확인
 */
function isInExcludedArea(lat, lng) {
  return EXCLUDED_AREAS.some(area => 
    lat >= area.minLat && 
    lat <= area.maxLat && 
    lng >= area.minLng && 
    lng <= area.maxLng
  );
}

/**
 * 랜덤 좌표 생성
 * @returns {{lat: number, lng: number}} 랜덤 좌표 객체
 */
export function generateRandomCoords() {
  let lat, lng;
  let attempts = 0;
  const maxAttempts = 500; // 시도 횟수 증가

  do {
    // 한국 경계 내에서 랜덤 좌표 생성 (육지 중심 영역)
    // 더 보수적으로 중앙 영역에 가깝게 생성
    const centerLat = (KOREA_BOUNDS.minLat + KOREA_BOUNDS.maxLat) / 2;
    const centerLng = (KOREA_BOUNDS.minLng + KOREA_BOUNDS.maxLng) / 2;
    
    // 중앙에서 ±범위 내에서 랜덤 생성 (바다 확률 감소)
    const latRange = (KOREA_BOUNDS.maxLat - KOREA_BOUNDS.minLat) * 0.8;
    const lngRange = (KOREA_BOUNDS.maxLng - KOREA_BOUNDS.minLng) * 0.8;
    
    lat = centerLat + (Math.random() - 0.5) * latRange;
    lng = centerLng + (Math.random() - 0.5) * lngRange;
    
    // 경계 내로 제한
    lat = Math.max(KOREA_BOUNDS.minLat, Math.min(KOREA_BOUNDS.maxLat, lat));
    lng = Math.max(KOREA_BOUNDS.minLng, Math.min(KOREA_BOUNDS.maxLng, lng));
    
    attempts++;
    
    // 최대 시도 횟수를 초과하면 중앙 지역 좌표 반환 (확실한 육지)
    if (attempts >= maxAttempts) {
      // 대한민국 중앙 지역 (확실한 육지 - 경기도, 충청도, 전라도 중심)
      const safeAreas = [
        { lat: 37.5, lng: 127.0 }, // 서울/경기
        { lat: 36.3, lng: 127.4 }, // 대전/충남
        { lat: 35.8, lng: 127.1 }, // 전북
        { lat: 35.2, lng: 126.9 }, // 전남
        { lat: 36.0, lng: 128.6 }, // 경북
        { lat: 35.2, lng: 129.0 }, // 경남
        { lat: 37.0, lng: 127.5 }, // 경기 중앙
        { lat: 36.5, lng: 127.8 }, // 충청 중앙
      ];
      const randomArea = safeAreas[Math.floor(Math.random() * safeAreas.length)];
      lat = randomArea.lat + (Math.random() - 0.5) * 0.3; // ±0.15도 범위 (더 좁게)
      lng = randomArea.lng + (Math.random() - 0.5) * 0.3; // ±0.15도 범위 (더 좁게)
      break;
    }
  } while (isInExcludedArea(lat, lng));

  return { lat, lng };
}
