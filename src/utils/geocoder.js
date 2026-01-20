import axios from 'axios';

/**
 * 카카오 REST API를 사용하여 좌표를 지역명으로 변환
 * @param {number} lat - 위도
 * @param {number} lng - 경도
 * @returns {Promise<string>} 지역명 (예: "경기도 남양주시 호평동")
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

    if (response.data.documents && response.data.documents.length > 0) {
      const address = response.data.documents[0].address;
      
      // 주소 정보에서 지역명 추출 (시/도 -> 시/군/구까지만)
      if (address) {
        const regionParts = [];
        
        // 시/도
        if (address.region_1depth_name) regionParts.push(address.region_1depth_name);
        // 시/군/구
        if (address.region_2depth_name) regionParts.push(address.region_2depth_name);
        
        // 시/도와 시/군/구만 반환
        return regionParts.join(' ') || '알 수 없는 지역';
      }
    }

    return '알 수 없는 지역';
  } catch (error) {
    console.error('역지오코딩 오류:', error);
    throw new Error('지역명을 가져오는 중 오류가 발생했습니다.');
  }
}
