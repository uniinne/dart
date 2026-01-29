import axios from 'axios';

/**
 * 카카오 REST API를 사용하여 좌표를 지역명으로 변환
 * @param {number} lat - 위도
 * @param {number} lng - 경도
 * @returns {Promise<string|null>} 지역명 (예: "경기도 남양주시 호평동") 또는 null (알 수 없는 지역인 경우)
 */
export async function reverseGeocode(lat, lng) {
  const REST_API_KEY = import.meta.env.VITE_KAKAO_REST_KEY;
  
  if (!REST_API_KEY || REST_API_KEY.includes('여기에')) {
    throw new Error('카카오 REST API 키가 설정되지 않았습니다. .env 파일을 확인하세요.');
  }

  try {
    const response = await axios.get(
      'https://dapi.kakao.com/v2/local/geo/coord2address.json',
      {
        params: {
          x: lng,
          y: lat,
        },
        headers: {
          Authorization: `KakaoAK ${REST_API_KEY}`,
        },
      }
    );

    // documents가 없거나 빈 배열인 경우
    if (!response.data?.documents || response.data.documents.length === 0) {
      return null;
    }

    const address = response.data.documents[0]?.address;
    
    // 주소 정보가 없는 경우
    if (!address) {
      return null;
    }
    
    // 주소 정보에서 지역명 추출 (시/도 -> 시/군/구 -> 읍/면/동까지만, 리 제외)
    const regionParts = [];
    
    // 시/도
    if (address.region_1depth_name && address.region_1depth_name.trim()) {
      regionParts.push(address.region_1depth_name.trim());
    }
    // 시/군/구
    if (address.region_2depth_name && address.region_2depth_name.trim()) {
      regionParts.push(address.region_2depth_name.trim());
    }
    // 읍/면/동 (리 제외)
    // region_3depth_name (법정동) 우선 사용, 없으면 region_3depth_h_name (행정동) 사용
    let region3 = null;
    if (address.region_3depth_name && address.region_3depth_name.trim()) {
      region3 = address.region_3depth_name.trim();
    } else if (address.region_3depth_h_name && address.region_3depth_h_name.trim()) {
      region3 = address.region_3depth_h_name.trim();
    }
    
    if (region3) {
      // "리"로 끝나면 제외 (읍/면/동까지만 표시)
      if (!region3.endsWith('리')) {
        regionParts.push(region3);
      }
    }
    
    // 유효한 지역명이 있는 경우만 반환
    const regionName = regionParts.join(' ').trim();
    return regionName.length > 0 ? regionName : null;
  } catch (error) {
    console.error('역지오코딩 오류:', error);
    // 에러 발생 시 null 반환 (재시도 가능하도록)
    return null;
  }
}
