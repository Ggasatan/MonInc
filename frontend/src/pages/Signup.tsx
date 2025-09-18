import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from './Signup.module.css';

interface FormData {
  email: string;
  authCode: string;
  name: string;
  password: string;
  passwordConfirm: string;
  phonePrefix: string;
  phoneSuffix: string;
  birthYear: string;
  birthMonth: string;
  birthDay: string;
}
const Signup:React.FC = () => {
    const navigate = useNavigate();
    // 폼 입력 데이터를 하나의 state 객체로 관리
     // useState에 위에서 정의한 FormData 타입을 적용합니다.
    const [formData, setFormData] = useState<FormData>({
        email: '', authCode: '', name: '', password: '', passwordConfirm: '',
        phonePrefix: '010',phoneSuffix:'', birthYear: '', birthMonth: '', birthDay: '',
    });

    // 에러 객체의 타입을 명시합니다.
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [isEmailSent, setIsEmailSent] = useState<boolean>(false);
    const [isEmailVerified, setIsEmailVerified] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [feedback, setFeedback] = useState<string>('');
    

    // ✅ 추가: 생년월일 '일' 옵션을 동적으로 관리하기 위한 state
    const [daysInMonth, setDaysInMonth] = useState<number[]>([]);

        // ✅ 추가: 이메일 변경 시 인증 상태 초기화
    useEffect(() => {
        // 컴포넌트가 처음 마운트될 때는 실행하지 않도록 조건 추가
        if (isEmailSent || isEmailVerified) {
            console.log("이메일이 변경되어 인증 상태를 초기화합니다.");
            setIsEmailVerified(false);
            setIsEmailSent(false);
            setFeedback('이메일 주소가 변경되었습니다. 다시 인증해주세요.');
        }
    }, [formData.email]); // formData.email이 변경될 때마다 이 effect가 실행됩니다.

     // ✅ 추가: 년/월 변경 시 해당 월의 일 수를 다시 계산
    useEffect(() => {
        const { birthYear, birthMonth } = formData;
        if (birthYear && birthMonth) {
            // 특정 년도의 특정 월의 마지막 날짜를 구함 (다음 달의 0번째 날짜 = 이번 달의 마지막 날)
            const lastDay = new Date(Number(birthYear), Number(birthMonth), 0).getDate();
            const newDays = Array.from({ length: lastDay }, (_, i) => i + 1);
            setDaysInMonth(newDays);

            // 만약 현재 선택된 '일'이 변경된 '월'의 최대일수보다 크다면 '일' 선택을 초기화
            if (Number(formData.birthDay) > lastDay) {
                setFormData(prev => ({ ...prev, birthDay: '' }));
            }
        } else {
            setDaysInMonth(Array.from({ length: 31 }, (_, i) => i + 1)); // 기본값은 31일
        }
    }, [formData.birthYear, formData.birthMonth]); // 년 또는 월이 변경될 때마다 실행


    // input, select 변경 이벤트 타입을 명시합니다.
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        if (name === 'phoneSuffix') {
            const numericValue = value.replace(/[^0-9]/g, ''); // 숫자가 아닌 문자 제거
            setFormData({ ...formData, [name]: numericValue });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    // 1. 인증메일 발송 핸들러
    const handleSendEmail = async (): Promise<void> => {
        if (!formData.email) {
            setErrors({ email: '이메일을 입력해주세요.' });
            return;
        }
        setIsLoading(true);
        setFeedback('');
        setErrors({});
        try {
            await axios.post('/api/members/signup/send-email', { email: formData.email });
            console.log('백으로 요청을 보냄');
            setIsEmailSent(true);
            setFeedback('인증 메일이 발송되었습니다. 5분 안에 인증을 완료해주세요.');
        } catch (error) {
            setErrors({ email: '메일 발송에 실패했습니다. 이메일을 확인해주세요.' });
        } finally {
            setIsLoading(false);
        }
    };

    // 2. 이메일 인증 확인 핸들러
    const handleVerifyEmail = async (): Promise<void> => {
        if (!formData.authCode) {
            setErrors({ authCode: '인증 코드를 입력해주세요.' });
            return;
        }
        setIsLoading(true);
        setFeedback('');
        setErrors({});
        try {
            await axios.post('/api/members/signup/verify-email', {
                email: formData.email,
                authCode: formData.authCode,
            });
            setIsEmailVerified(true);
            setFeedback('이메일 인증이 성공적으로 완료되었습니다.');
        } catch (error) {
            setErrors({ authCode: '인증 코드가 일치하지 않거나 만료되었습니다.' });
        } finally {
            setIsLoading(false);
        }
    };

    // 3. 최종 회원가입 폼 제출 핸들러
       const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
        
        e.preventDefault();
        setIsLoading(true);
        setFeedback('');
        setErrors({});

        // 클라이언트 측 유효성 검사
        if (formData.password !== formData.passwordConfirm) {
            setErrors({ passwordConfirm: '비밀번호가 일치하지 않습니다.' });
            setIsLoading(false);
            return;
        }

        if (formData.phoneSuffix.length !== 8) {
            setErrors({ phoneNum: '휴대폰 번호 8자리를 정확히 입력해주세요.' });
            setIsLoading(false);
            return;
        }


        // ✅ 수정: 백엔드로 보낼 데이터를 가공
        const birthDate = `${formData.birthYear}-${formData.birthMonth.padStart(2, '0')}-${formData.birthDay.padStart(2, '0')}`;
        const phoneNum = `${formData.phonePrefix}${formData.phoneSuffix}`;
        const submissionData = {
            ...formData,
            birthDate, // YYYY-MM-DD 형식으로 변환하여 추가
            phoneNum,
        };
        // 불필요한 필드는 제거하고 보낼 수 있습니다.
        delete (submissionData as any).birthYear;
        delete (submissionData as any).birthMonth;
        delete (submissionData as any).birthDay;
        delete (submissionData as any).passwordConfirm;
        delete (submissionData as any).phonePrefix;
        delete (submissionData as any).phoneSuffix;

        try {
            await axios.post('/api/members/signup', submissionData);
            alert('회원가입이 성공적으로 완료되었습니다! 로그인 페이지로 이동합니다.');
            
            // ✅ 수정: window.location.href 대신 navigate 함수 사용
            navigate('/login'); 

        } catch (error) { // 여기서 error는 'unknown' 타입입니다.
            // ✅ 수정: axios.isAxiosError 타입 가드를 사용하여 에러 타입을 확인합니다.
            if (axios.isAxiosError(error) && error.response) {
                // 이 블록 안에서 error는 AxiosError 타입으로 인식됩니다.
                setErrors(error.response.data);
            } else {
                // axios 에러가 아니거나, 네트워크 에러 등 다른 문제일 경우
                setErrors({ globalError: '알 수 없는 오류가 발생했습니다.' });
                console.error("Signup Error:", error); // 디버깅을 위해 콘솔에 실제 에러 기록
            }
        } finally {
            setIsLoading(false);
        }
    };

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: currentYear - 1949 }, (_, i) => currentYear - i);
    const months = Array.from({ length: 12 }, (_, i) => i + 1);
    // const days = Array.from({ length: 31 }, (_, i) => i + 1);
    const phonePrefixOptions = ['010', '011', '016', '017', '018', '019'];

    return (
        <div className={styles['signup-page-container']}>
            <div className={styles['signup-form-wrapper']}>
                <h1 className={styles['form-title']}>회원가입</h1>
                
                {feedback && <p className={styles['feedback-message']}>{feedback}</p>}
                {errors.globalError && <p className={styles['error-message']}>{errors.globalError}</p>}
                
                <form onSubmit={handleSubmit}>
                    {/* 이메일 입력 그룹 */}
                    <div className={styles['form-group']}>
                        <label htmlFor="email">이메일 주소</label>
                        <div className={styles['input-with-button']}> {/* 오타 수정: input-withBbutton -> input-with-button */}
                            <input
                                type="email" id="email" name="email" value={formData.email}
                                onChange={handleChange} placeholder="이메일을 입력해주세요"
                                required readOnly={isEmailVerified}
                            />
                            <button
                                type="button"
                                // cn() 함수를 사용하여 여러 클래스를 조합합니다.
                                className={styles['btn-secondary']} 
                                onClick={handleSendEmail} disabled={isLoading || isEmailVerified}
                            >
                                {isEmailSent ? '재전송' : '인증메일 발송'}
                            </button>
                        </div>
                        {errors.email && <p className={styles['error-message']}>{errors.email}</p>} {/* 오타 수정: stlye -> styles */}
                    </div>

                    {/* 인증코드 입력 그룹 */}
                    {isEmailSent && !isEmailVerified && (
                        <div className={styles['form-group']}> {/* 오타 수정 */}
                            <label htmlFor="authCode">인증코드</label>
                            <div className={styles['input-with-button']}> {/* 오타 수정 */}
                                <input
                                    type="text" id="authCode" name="authCode" value={formData.authCode}
                                    onChange={handleChange} placeholder="인증코드를 입력하세요" required
                                />
                                <button
                                    type="button"
                                    className={styles['btn-secondary']}
                                    onClick={handleVerifyEmail} disabled={isLoading}
                                >
                                    인증 확인
                                </button>
                            </div>
                            {errors.authCode && <p className={styles['error-message']}>{errors.authCode}</p>}
                        </div>
                    )}

                    {/* 나머지 필드 (클래스 이름 수정) */}
                    <div className={styles['form-group']}>
                        <label htmlFor="name">이름</label>
                        <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required />
                        {errors.name && <p className={styles['error-message']}>{errors.name}</p>}
                    </div>
                    
                    <div className={styles['form-group']}>
                        <label htmlFor="password">비밀번호</label>
                        <input type="password" id="password" name="password" value={formData.password} onChange={handleChange} required placeholder="비밀번호를 입력하세요"/>
                        {errors.password && <p className={styles['error-message']}>{errors.password}</p>}
                    </div>
                    
                    <div className={styles['form-group']}>
                        <label htmlFor="passwordConfirm">비밀번호 확인</label>
                        <input type="password" id="passwordConfirm" name="passwordConfirm" value={formData.passwordConfirm} onChange={handleChange} required placeholder="비밀번호를 다시 입력하세요"/>
                        {errors.passwordConfirm && <p className={styles['error-message']}>{errors.passwordConfirm}</p>}
                    </div>
                    <div className={styles['form-group']}>
                    <label htmlFor="phonePrefix">휴대폰 번호</label>
                    <div className={styles['phone-number-group']}>
                        <select
                            id="phonePrefix"
                            name="phonePrefix"
                            value={formData.phonePrefix}
                            onChange={handleChange}
                            required
                        >
                            {phonePrefixOptions.map(prefix => (
                                <option key={prefix} value={prefix}>
                                    {prefix}
                                </option>
                            ))}
                        </select>
                        <input
                            type="text"
                            id="phoneSuffix"
                            name="phoneSuffix"
                            value={formData.phoneSuffix}
                            onChange={handleChange}
                            placeholder="'-' 없이 8자리 입력"
                            maxLength={8}
                            required
                        />
                    </div>
                    {errors.phoneNum && <p className={styles['error-message']}>{errors.phoneNum}</p>}
                    </div>
                    <div className={styles['form-group']}>
                        <label>생년월일</label>
                        {/* ✅ 수정: className을 styles 객체에서 가져오도록 변경 */}
                        <div className={styles['birthdate-group']}>
                            <select name="birthYear" value={formData.birthYear} onChange={handleChange} required>
                                <option value="">----년</option>
                                {/* ✅ 사용: 여기서 'years' 배열을 사용합니다. */}
                                {years.map(year => (
                                    <option key={year} value={year}>
                                        {year}년
                                    </option>
                                ))}
                            </select>
                            
                            <select name="birthMonth" value={formData.birthMonth} onChange={handleChange} required>
                                <option value="">--월</option>
                                {/* ✅ 사용: 여기서 'months' 배열을 사용합니다. */}
                                {months.map(month => (
                                    <option key={month} value={month}>
                                        {month}월
                                    </option>
                                ))}
                            </select>
                            
                            <select name="birthDay" value={formData.birthDay} onChange={handleChange} required>
                                <option value="">--일</option>
                                {/* ✅ 사용: 여기서 'days' 배열을 사용합니다. */}
                                {daysInMonth.map(day => 
                                    <option key={day} value={day}>{day}일
                                    </option>)}
                            </select>
                        </div>
                        {/* 에러 메시지 표시 부분 (필요 시) */}
                        {(errors.birthYear || errors.birthMonth || errors.birthDay) && (
                            <p className={styles['error-message']}>
                                생년월일을 선택해주세요.
                            </p>
                        )}
                    </div>
                    
                    {/* 최종 가입하기 버튼 */}
                    <button type="submit" className={styles['btn-primary']} disabled={!isEmailVerified || isLoading}>
                        {isLoading ? '가입 처리 중...' : '가입하기'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Signup;