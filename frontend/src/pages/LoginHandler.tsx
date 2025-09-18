import React, { useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import axios, { isAxiosError } from 'axios';

// ✅ 1. 이 컴포넌트가 받을 props의 타입을 interface로 정의합니다.
// "이 컴포넌트는 onLoginSuccess 라는 이름의 함수를 props로 받을거야.
// 그 함수는 문자열(token) 하나를 인자로 받고, 아무것도 반환하지 않아(void)."
interface LoginHandelerProps {
  onLoginSuccess: (token: string) => void;
}

// ✅ 2. React.FC에 우리가 정의한 Props 타입을 제네릭(<>)으로 넣어줍니다.
//    props를 받을 때, { onLoginSuccess } 처럼 구조 분해 할당으로 받으면 코드가 깔끔해져요.
const LoginHandeler: React.FC<LoginHandelerProps> = ({ onLoginSuccess }) => {
  console.log("시작!");
  const navigate = useNavigate();
  const { socialTypeValue } = useParams<{ socialTypeValue: 'kakao' | 'naver' | 'google' }>();
  const [searchParams] = useSearchParams();
  const code = searchParams.get('code');
  const state = searchParams.get('state'); // 네이버용 state 값

  useEffect(() => {
    console.log("LoginHandeler 마운트됨, 로그인 처리 시작!");
    console.log("추출된 code : ",code);
    const socialLogin = async () => {
        if (!code) { // code 값이 없을 경우를 대비한 방어 코드
          console.error("인가 코드가 없습니다.");
          navigate("/login", { replace: true }); // 로그인 페이지로 돌려보내기
          return;
        }

        const API_BASE_URL = 'http://localhost:8080';
        let apiUrl = `${API_BASE_URL}/api/oauth2/${socialTypeValue}`
        const params = new URLSearchParams({code});

        if (socialTypeValue === 'naver') {
          if (!state) {
            console.error("네이버 로그인 시 state 값이 없습니다.");
            navigate("/login", { replace: true });
            return;
          }
          params.append('state', state);
        }

        try {
        console.log("백으로 요청 보냄! code : ",code)
        const response = await axios.get(`${apiUrl}?${params.toString()}`);
        console.log("백엔드로부터 받은 응답:", response.data); 
        
        // ✅ 3. 로그인에 성공하면, props로 받은 onLoginSuccess 함수를 호출해서
        //    App.tsx에게 토큰을 전달합니다.
        const { status, member, token } = response.data;
        console.log("token : ",token);
        if (!token) { throw new Error("백엔드로부터 토큰을 받지 못했습니다."); }
        onLoginSuccess(token);
          
        // ✅ 4. 모든 처리가 끝났으니 메인 페이지로 이동시킵니다.
        console.log("메인페이지로 이동!")
        if(status === 'ADDITIONAL_INFO_REQUIRED'){
          console.log("추가 정보 입력이 필요합니다. 추가 정보 페이지로 이동합니다.");
          // state를 사용해서 추가 정보 페이지에 사용자 정보를 넘겨줄 수 있습니다.
          navigate("/signup-details", { replace: true, state: { member } });
        } else {
          navigate("/", { replace: true }); // replace: true는 뒤로가기 시 이 페이지를 건너뛰게 함
        }

        } catch (error) {
            console.error(`${socialTypeValue} 로그인 처리 중 오류 발생:`, error);

            if(isAxiosError(error)){
              if(error.response){
                if(error.response.status===409){
                  const errorMessage = error.response.data.message || "이미 가입된 이메일 입니다.";
                  alert(errorMessage);
                } else {
                  alert(`로그인에 실패했습니다. (에러코드 : ${error.response.status})`);
                }
              } else {
                alert("서버를 연결할 수 없습니다. 네트워크 상태를 확인해주세요.")
              }
            } else {
              alert("알 수 없는 오류 입니다.");
            }
            navigate("/login", { replace: true });
        }
    };
    socialLogin();
  }, [socialTypeValue]); // useEffect 안에서 사용하는 외부 변수/함수는 의존성 배열에 넣어주는 것이 원칙입니다.

  return (
    <div className="LoginHandeler">
      <div className="notice">
        <p>소셜 로그인 중입니다.</p>
        <p>잠시만 기다려주세요...</p>
        {/* 스피너 같은 로딩 애니메이션을 추가하면 더 좋습니다. */}
        <div className="spinner"></div> 
      </div>
    </div>
  );
};

export default LoginHandeler;