import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import styles from './Login.module.css'; // .module.css import
import cn, { type Value } from 'classnames';
import { KAKAO_AUTH_URL, NAVER_AUTH_URL, GOOGLE_AUTH_URL } from '../config/OAuth.config';

// 컴포넌트가 받을 props의 타입을 정의합니다.
interface LoginProps {
  onLoginSuccess: (token: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
    // useState에 타입(string, boolean)을 명시합니다.
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [error, setError] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const navigate = useNavigate();

    // Form 제출 이벤트의 타입을 명시합니다.
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const response = await axios.post('/api/members/login', { email, password });
            
            const { token } = response.data;
            console.log("백엔드로부터 받은 응답:", response.data); 
            onLoginSuccess(token); // 부모 컴포넌트(App)의 함수 호출
            
            navigate('/'); // 로그인 성공 시 메인 페이지로 이동
        } catch (err) {
             if (axios.isAxiosError(err) && err.response) {
                // 서버가 의도적으로 에러 응답을 보냈을 때 (e.g., 401 Unauthorized)
                setError('이메일 또는 비밀번호를 확인해주세요.');
            } else {
                // 네트워크 오류 또는 그 외 알 수 없는 에러
                setError('로그인에 실패했습니다. 잠시 후 다시 시도해주세요.');
                console.error("Login Error:", err); // 디버깅을 위해 콘솔에 실제 에러 기록
            }
        } finally {
            setIsLoading(false);
        }
    };
    // ✅ 추가: 소셜 로그인 핸들러 (백엔드 URL로 리다이렉트)
    const handleKakaoLogin = () => {
    // window.location.href를 사용해서 사용자를 카카오 인증 페이지로 보냅니다.
    // 이렇게 하면 현재 페이지가 카카오 로그인 페이지로 완전히 바뀌게 됩니다.
        window.location.href = KAKAO_AUTH_URL;
    };

    const handleNaverLogin=()=>{
        window.location.href = NAVER_AUTH_URL;
    }

    const handleGoogleLogin=()=>{
        window.location.href = GOOGLE_AUTH_URL;
    }


    return (
        // CSS Modules 사용 시, 하이픈(-)이 있는 클래스는 대괄호 표기법으로 접근합니다.
        <div className={styles['login-page-container']}>
            <div className={styles['login-form-wrapper']}>
                <h1 className={styles['form-title']}>로그인</h1>
                <form onSubmit={handleSubmit}>
                    <div className={styles['form-group']}>
                        <label htmlFor="email">아이디 (E-mail)</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            // input 변경 이벤트의 타입을 명시합니다.
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                            required
                            autoComplete="email" // ✅ 추가: 자동완성 기능
                        />
                    </div>
                    <div className={styles['form-group']}>
                        <label htmlFor="password">비밀번호</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                            required
                            autoComplete="current-password" // ✅ 추가: 자동완성 기능
                        />
                    </div>
                    {error && <p className={styles['error-message']}>{error}</p>}
                    <button type="submit" className={styles['btn-primary']} disabled={isLoading}>
                        {isLoading ? '로그인 중...' : '로그인'}
                    </button>
                </form>
                <div className={styles['form-links']}>
                    <Link to="/find-id">아이디 찾기</Link>
                    <span>|</span>
                    <Link to="/find-password">비밀번호 찾기</Link>
                    <span>|</span>
                    <Link to="/signup">회원가입</Link>
                </div>
                {/* ✅ 추가: 소셜 로그인 섹션 */}
                <div className={styles['social-login-divider']}>
                    <span>또는</span>
                </div>
                <div className={styles['social-login-buttons']}>
                    <button onClick={handleGoogleLogin} className={cn(styles['social-btn'], styles['google-btn'])}>
                        Google로 로그인
                    </button>
                    <button onClick={handleKakaoLogin} className={cn(styles['social-btn'], styles['kakao-btn'])}>
                        카카오로 로그인
                    </button>
                    <button onClick={handleNaverLogin} className={cn(styles['social-btn'], styles['naver-btn'])}>
                        네이버로 로그인
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Login;