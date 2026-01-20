# Travel Dart (Kakao Maps)

대한민국 지도에서 **무작위 육지 좌표**를 뽑아 다트를 날려 꽂고, **시/도 + 시/군/구**까지만 당첨 지역으로 표시하는 앱입니다.

## 로컬 실행

1) 의존성 설치

```bash
npm ci
```

2) 환경변수 설정(로컬)

프로젝트 루트에 `.env` 파일을 만들고 아래 값을 넣어주세요. (`.env`는 git에 올라가지 않도록 `.gitignore`에 포함되어 있습니다.)

```bash
VITE_KAKAO_MAP_KEY=YOUR_KAKAO_JAVASCRIPT_KEY
VITE_KAKAO_REST_KEY=YOUR_KAKAO_REST_API_KEY
```

3) 실행

```bash
npm run dev
```

## GitHub Pages 배포 (GitHub Actions)

이 저장소는 `main` 브랜치에 푸시하면 GitHub Actions가 자동으로 빌드 후 Pages로 배포합니다.

### 1) GitHub Secrets 설정(필수)

GitHub 저장소 → **Settings → Secrets and variables → Actions** 에서 아래 2개를 추가하세요:

- `VITE_KAKAO_MAP_KEY` : Kakao JavaScript 키 (Maps SDK)
- `VITE_KAKAO_REST_KEY` : Kakao REST API 키 (역지오코딩)

> 주의: 실제 키는 절대 커밋하지 마세요.

### 2) GitHub Pages 설정

GitHub 저장소 → **Settings → Pages** → **Build and deployment**에서

- Source: **GitHub Actions**

로 설정합니다.

### 3) 배포 확인

Actions의 `Deploy to GitHub Pages` 워크플로가 성공하면 아래 형태로 접속할 수 있습니다.

`https://<github-id>.github.io/dart/`

# 여행지 다트 (Travel Dart) 🎯

카카오 지도 API를 활용한 재미있는 여행지 랜덤 선택 게임입니다. 다트를 던져 랜덤한 지역을 선택하고, 해당 지역으로 지도가 이동하며 폭죽 효과와 함께 지역명을 확인할 수 있습니다.

## 기능

- 🗺️ 카카오 지도 API를 사용한 인터랙티브 지도
- 🎯 다트 던지기 애니메이션
- 🎊 폭죽 효과 (canvas-confetti)
- 📍 랜덤 좌표 생성 (바다 제외)
- 🏘️ 역지오코딩을 통한 지역명 표시
- ✨ 모던하고 심플한 UI 디자인

## 시작하기

### 1. 프로젝트 설정

```bash
# 의존성 설치
npm install
```

### 2. 카카오 API 키 설정

`.env` 파일을 생성하고 카카오 API 키를 입력하세요:

```env
VITE_KAKAO_MAP_KEY=여기에_카카오_JavaScript_API_키를_입력하세요
VITE_KAKAO_REST_KEY=여기에_카카오_REST_API_키를_입력하세요
```

**카카오 API 키 발급 방법:**
1. [카카오 개발자 콘솔](https://developers.kakao.com/)에 접속
2. 애플리케이션 생성
3. **JavaScript 키** (지도용)와 **REST API 키** (역지오코딩용) 발급
4. 플랫폼 설정에서 웹 도메인 등록 (예: `http://localhost:5173`)

### 3. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 `http://localhost:5173`으로 접속하세요.

## 프로젝트 구조

```
travel-dart/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── MapView.jsx           # 카카오 지도 컴포넌트
│   │   ├── DartLauncher.jsx      # 다트 아이콘 + 던지기 버튼
│   │   ├── ConfettiEffect.jsx    # 폭죽 효과
│   │   └── WinnerPopup.jsx       # 당첨 팝업
│   ├── utils/
│   │   ├── randomCoords.js       # 랜덤 좌표 생성
│   │   └── geocoder.js          # 역지오코딩
│   ├── styles/
│   │   └── App.css               # 전역 스타일
│   ├── App.jsx                   # 메인 앱 컴포넌트
│   └── main.jsx                  # 진입점
├── .env                          # 환경 변수 (직접 생성 필요)
├── package.json
└── README.md
```

## 사용된 기술

- **React 18+**: UI 프레임워크
- **Vite**: 빌드 도구
- **react-kakao-maps-sdk**: 카카오 지도 React 라이브러리
- **canvas-confetti**: 폭죽 애니메이션
- **axios**: HTTP 클라이언트

## 빌드

프로덕션 빌드:

```bash
npm run build
```

빌드 결과물은 `dist` 폴더에 생성됩니다.

## 라이선스

MIT
