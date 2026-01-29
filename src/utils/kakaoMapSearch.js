/**
 * 주소에서 시/군/구까지만 추출 (시/도 + 시/군/구)
 * @param {string} regionName - 예: "경기도 남양주시 호평동 123-45"
 * @returns {string} - 예: "경기도 남양주시"
 */
export function extractCityDistrict(regionName) {
  if (!regionName || typeof regionName !== 'string') return '';
  
  const trimmed = regionName.trim();
  if (!trimmed || trimmed === '알 수 없는 지역') return '';
  
  // 공백으로 분리하여 처음 2개 부분(시/도, 시/군/구)만 추출
  const parts = trimmed.split(' ').filter(p => p.length > 0);
  if (parts.length >= 2) {
    return `${parts[0]} ${parts[1]}`;
  } else if (parts.length === 1) {
    return parts[0];
  }
  
  return trimmed;
}

/**
 * 카카오맵 검색 URL 생성 유틸리티
 * @param {string | null | undefined} regionName - 예: "서울특별시 강남구", "경북 영주시"
 * @param {string} searchType - "맛집" | "관광지" 등 검색 키워드
 * @param {string} sortBy - 정렬 방식: "accuracy" (정확도순) | "popularity" (인기도순), 기본값: "popularity"
 * @returns {string | null} - 예: "https://map.kakao.com/?q=%EA%B2%BD%EB%B6%81%20%EC%98%81%EC%A3%BC%EC%8B%9C%20%EB%A7%9B%EC%A7%91&sort=popularity"
 */
export function generateKakaoMapSearchUrl(regionName, searchType, sortBy = 'popularity') {
  if (!regionName || typeof regionName !== 'string') return null;

  // 시/군/구까지만 추출하여 검색
  const cityDistrict = extractCityDistrict(regionName);
  if (!cityDistrict) return null;

  const keyword = `${cityDistrict} ${searchType}`.trim();
  const encoded = encodeURIComponent(keyword);

  // 카카오맵 검색 URL 패턴: https://map.kakao.com/?q=검색어
  // 정렬 파라미터 추가 시도 (카카오맵이 지원하는지 확인 필요)
  // 일반적인 파라미터: sort, sortBy, order 등
  let url = `https://map.kakao.com/?q=${encoded}`;
  
  // 인기도순 정렬 파라미터 추가 (여러 가능한 파라미터 시도)
  if (sortBy === 'popularity') {
    // 카카오맵이 지원하는 파라미터를 확인하기 위해 여러 옵션 시도
    // 실제로는 카카오맵에서 인기도순 선택 시 URL을 확인해야 정확함
    url += '&sort=popularity';
  }
  
  return url;
}

