import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from './Signup.module.css'; // ✅ 기존 CSS를 그대로 사용합니다.

const SignupDetails: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // LoginHandeler에서 넘겨준 member 정보를 받습니다.
  const socialUserInfo = location.state?.member;

  // 폼 데이터 state. LoginHandeler에서 받은 정보로 초기화합니다.
  const [formData, setFormData] = useState({
    name: socialUserInfo?.name || '',
    phonePrefix: '010',
    phoneSuffix: '',
    birthYear: '',
    birthMonth: '',
    birthDay: '',
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [daysInMonth, setDaysInMonth] = useState<number[]>([]);

  // 페이지 접근 시 소셜 정보가 없으면 로그인 페이지로 튕겨냅니다. (보안 강화)
  useEffect(() => {
    if (!socialUserInfo) {
      alert("잘못된 접근입니다. 다시 로그인해주세요.");
      navigate("/login");
    }
  }, [socialUserInfo, navigate]);
  
  // 년/월이 바뀌면 '일' 옵션을 동적으로 계산 (Signup.tsx와 동일한 로직)
  useEffect(() => {
    const { birthYear, birthMonth } = formData;
    if (birthYear && birthMonth) {
      const lastDay = new Date(Number(birthYear), Number(birthMonth), 0).getDate();
      const newDays = Array.from({ length: lastDay }, (_, i) => i + 1);
      setDaysInMonth(newDays);
      if (Number(formData.birthDay) > lastDay) {
        setFormData(prev => ({ ...prev, birthDay: '' }));
      }
    } else {
      setDaysInMonth(Array.from({ length: 31 }, (_, i) => i + 1));
    }
  }, [formData.birthYear, formData.birthMonth]);


  // input, select 변경 핸들러 (Signup.tsx와 동일한 로직)
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'phoneSuffix') {
        const numericValue = value.replace(/[^0-9]/g, '');
        setFormData({ ...formData, [name]: numericValue });
    } else {
        setFormData({ ...formData, [name]: value });
    }
  };

  // 폼 제출 핸들러
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    // 이 페이지에 접근했다는 것은 이미 localStorage에 토큰이 저장된 상태입니다.
    const token = localStorage.getItem('accessToken');
    console.log('token확인 : ',token)
    if (!token) {
      alert("인증 정보가 만료되었습니다. 다시 로그인해주세요.");
      navigate("/login");
      return;
    }

    // 백엔드로 보낼 데이터 가공
    const birthDate = `${formData.birthYear}-${String(formData.birthMonth).padStart(2, '0')}-${String(formData.birthDay).padStart(2, '0')}`;
    const phoneNum = `${formData.phonePrefix}${formData.phoneSuffix}`;

    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
      
      // ✅ 백엔드의 추가 정보 업데이트 API를 호출합니다.
      await axios.patch(`${API_BASE_URL}/api/oauth2/AuthDetails`, {
        phoneNum,
        birthDate,
        headers: {'Authorization': `Bearer ${token}`}
      });
      
      alert("회원 정보가 성공적으로 등록되었습니다!");
      navigate("/", { replace: true });

    } catch (error) {
      console.error("추가 정보 저장 중 오류 발생:", error);
      if (axios.isAxiosError(error) && error.response) {
        setErrors(error.response.data); // 백엔드 validation 에러를 표시
      } else {
        alert("정보 저장에 실패했습니다. 다시 시도해주세요.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 년/월/일, 전화번호 앞자리 배열 (Signup.tsx와 동일)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1949 }, (_, i) => currentYear - i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const phonePrefixOptions = ['010', '011', '016', '017', '018', '019'];

  return (
    <div className={styles['signup-page-container']}>
      <div className={styles['signup-form-wrapper']}>
        <h1 className={styles['form-title']}>추가 정보 입력</h1>
        <p>환영합니다, <strong>{socialUserInfo?.name || '사용자'}</strong>님! 서비스 이용을 위해 추가 정보를 입력해주세요.</p>
        
        {errors.globalError && <p className={styles['error-message']}>{errors.globalError}</p>}
        
        {/*
          ✅ 여기서부터는 기존 Signup.tsx의 form 부분 JSX를 거의 그대로 가져옵니다.
             단, 이메일/비밀번호 등 불필요한 부분은 제외합니다.
        */}
        <form onSubmit={handleSubmit}>
            {/* 이름 (수정 불가, 보여주기만 함) */}
            <div className={styles['form-group']}>
                <label htmlFor="name">이름</label>
                <input type="text" id="name" name="name" value={formData.name} disabled />
            </div>

            {/* 전화번호 (입력 필요) */}
            <div className={styles['form-group']}>
              <label htmlFor="phonePrefix">휴대폰 번호</label>
              <div className={styles['phone-number-group']}>
                <select id="phonePrefix" name="phonePrefix" value={formData.phonePrefix} onChange={handleChange} required>
                    {phonePrefixOptions.map(prefix => (<option key={prefix} value={prefix}>{prefix}</option>))}
                </select>
                <input type="text" id="phoneSuffix" name="phoneSuffix" value={formData.phoneSuffix} onChange={handleChange} placeholder="'-' 없이 8자리 입력" maxLength={8} required />
              </div>
              {errors.phoneNum && <p className={styles['error-message']}>{errors.phoneNum}</p>}
            </div>

            {/* 생년월일 (입력 필요) */}
            <div className={styles['form-group']}>
              <label>생년월일</label>
              <div className={styles['birthdate-group']}>
                <select name="birthYear" value={formData.birthYear} onChange={handleChange} required>
                  <option value="">----년</option>
                  {years.map(year => (<option key={year} value={year}>{year}년</option>))}
                </select>
                <select name="birthMonth" value={formData.birthMonth} onChange={handleChange} required>
                  <option value="">--월</option>
                  {months.map(month => (<option key={month} value={month}>{month}월</option>))}
                </select>
                <select name="birthDay" value={formData.birthDay} onChange={handleChange} required>
                  <option value="">--일</option>
                  {daysInMonth.map(day => <option key={day} value={day}>{day}일</option>)}
                </select>
              </div>
              {errors.birthDate && <p className={styles['error-message']}>{errors.birthDate}</p>}
            </div>
            
            <button type="submit" className={styles['btn-primary']} disabled={isLoading}>
                {isLoading ? '저장 중...' : '가입 완료'}
            </button>
        </form>
      </div>
    </div>
  );
};

export default SignupDetails;