// .env 파일 내용
// VITE_REST_API_KEY=your_kakao_rest_api_key
// VITE_REDIRECT_URL=your_redirect_url

// ✅ 직접 접근하면 TypeScript가 타입을 추론해줘서 더 안전합니다.
const KAKAO_CLIENT_ID: string = import.meta.env.VITE_KAKAO_REST_API_KEY;
const KAKAO_REDIRECT_URI: string = import.meta.env.VITE_KAKAO_REDIRECT_URL;
const NAVER_CLENT_ID: string = import.meta.env.VITE_NAVER_REST_API_KEY;
const NAVER_REDIRECT_URI: string = import.meta.env.VITE_NAVER_REDIRECT_URL;
const GOOGLE_CLENT_ID: string = import.meta.env.VITE_GOOGLE_REST_API_KEY;
const GOOGLE_REDIRECT_URI: string =import.meta.env.VITE_GOOGLE_REDIRECT_URL;

if (!GOOGLE_CLENT_ID || !GOOGLE_REDIRECT_URI) {
  throw new Error(".env 파일에 카카오 로그인 환경변수가 제대로 설정되지 않았습니다.");
}
export const GOOGLE_AUTH_URL = (() => {
  const G_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
  const G_SCOPE = [
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile',
  // ✅ 전화번호와 생일 정보를 받기 위한 scope 추가!
  'https://www.googleapis.com/auth/user.phonenumbers.read',
  'https://www.googleapis.com/auth/user.birthday.read',
].join(' '); // scope는 공백으로 구분해야 합니다.

const params = new URLSearchParams({
  client_id: GOOGLE_CLENT_ID,
  redirect_uri: GOOGLE_REDIRECT_URI,
  response_type: 'code',
  scope: G_SCOPE,
  // access_type: 'offline', // 리프레시 토큰이 필요할 경우 추가
  });
  return `${G_AUTH_URL}?${params.toString()}`;
})();

// 값이 없는 경우를 대비해 확실하게 하고 싶다면 이렇게 체크할 수 있습니다.
if (!KAKAO_CLIENT_ID || !KAKAO_REDIRECT_URI) {
  throw new Error(".env 파일에 카카오 로그인 환경변수가 제대로 설정되지 않았습니다.");
}
export const KAKAO_AUTH_URL: string = `https://kauth.kakao.com/oauth/authorize?client_id=${KAKAO_CLIENT_ID}&redirect_uri=${KAKAO_REDIRECT_URI}&response_type=code`;


const state = Math.random().toString(36).substring(2); // 간단한 랜덤 문자열 생성
sessionStorage.setItem("naver_state", state); // 브라우저 세션에 잠시 저장

if (!NAVER_CLENT_ID || !NAVER_REDIRECT_URI) {
  throw new Error(".env 파일에 네이버 로그인 환경변수가 제대로 설정되지 않았습니다.");
}
export const NAVER_AUTH_URL: string = `https://nid.naver.com/oauth2.0/authorize?client_id=${NAVER_CLENT_ID}&redirect_uri=${NAVER_REDIRECT_URI}&state=${state}&response_type=code`;