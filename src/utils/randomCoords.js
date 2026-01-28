/**
 * 한국 내륙 랜덤 좌표 생성 함수
 * 바다를 제외한 한국 본토 영역 내에서 랜덤 좌표를 생성합니다.
 */

// 남한 기준 대략적인 경계 좌표 (바다 포함 가능하도록 더 넓게 확장)
// - 북쪽은 휴전선 이남(대략 38도)까지만 포함
// - 동/서/남쪽은 바다쪽을 더 넓게 포함해 다양성 증가
const KOREA_BOUNDS = {
  minLat: 32.5, // 제주 남쪽 바다 더 넓게 포함
  maxLat: 38.0, // 휴전선 이남
  minLng: 124.0, // 서해 바다 더 넓게 포함
  maxLng: 131.5, // 동해 바다 더 넓게 포함
};

// 제외 영역: 극단적인 바다/휴전선 부근만 최소한으로 제외
// (바다 포함을 허용하되, '알 수 없는 지역' 빈도만 낮추는 목적)
// 해안가 박스를 축소하여 바다 포함 확률 증가
const EXCLUDED_AREAS = [
  // 휴전선 근처(38도 이상)만 제외
  { minLat: 38.0, maxLat: 38.8, minLng: 124.0, maxLng: 131.5 },

  // 제주도 남쪽 먼 바다(극단값) 일부만 제외 (범위 축소)
  { minLat: 32.5, maxLat: 32.8, minLng: 124.0, maxLng: 131.5 },

  // 동해 먼 바다(극단값) 일부만 제외 (범위 축소)
  { minLat: 37.0, maxLat: 38.0, minLng: 131.2, maxLng: 131.5 },
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

// 확실한 육지 위주 안전 좌표(다양한 권역)
export const safeAreas = [
  { lat: 37.5, lng: 127.0 }, // 서울/경기
  { lat: 36.3, lng: 127.4 }, // 대전/충남
  { lat: 35.8, lng: 127.1 }, // 전북
  { lat: 35.2, lng: 126.9 }, // 전남
  { lat: 36.0, lng: 128.6 }, // 경북
  { lat: 35.2, lng: 129.0 }, // 경남
  { lat: 37.0, lng: 127.5 }, // 경기 중앙
  { lat: 36.5, lng: 127.8 }, // 충청 중앙
  { lat: 37.8, lng: 128.9 }, // 강원 남부
  { lat: 33.45, lng: 126.55 }, // 제주(시내권)
];

/**
 * 안전한 좌표 생성 (safeAreas 기반)
 * @returns {{lat: number, lng: number}} 안전한 좌표 객체
 */
export function generateSafeCoords() {
  const randomArea = safeAreas[Math.floor(Math.random() * safeAreas.length)];
  return {
    lat: randomArea.lat + (Math.random() - 0.5) * 0.3, // ±0.15도 범위
    lng: randomArea.lng + (Math.random() - 0.5) * 0.3, // ±0.15도 범위
  };
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
    // 경계 내에서 균등 랜덤(전체 범위 다양성)
    lat = KOREA_BOUNDS.minLat + Math.random() * (KOREA_BOUNDS.maxLat - KOREA_BOUNDS.minLat);
    lng = KOREA_BOUNDS.minLng + Math.random() * (KOREA_BOUNDS.maxLng - KOREA_BOUNDS.minLng);

    attempts++;
    
    // 최대 시도 횟수를 초과하면 안전 좌표 반환 (확실한 육지)
    if (attempts >= maxAttempts) {
      const safeCoords = generateSafeCoords();
      lat = safeCoords.lat;
      lng = safeCoords.lng;
      break;
    }
  } while (isInExcludedArea(lat, lng));

  return { lat, lng };
}
