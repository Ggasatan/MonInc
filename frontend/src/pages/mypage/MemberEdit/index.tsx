// 파일 경로: src/pages/mypage/MemberEdit/index.tsx

/**
 * 변경: React 관련 import 수정
 * useState, useEffect를 추가하고, Link는 이제 필요 없으므로 제거.
 */
import React, { useState, useEffect } from 'react';
import axios from 'axios';
/**
 * 변경: useNavigate만 남기고 Link는 제거
 */
import { useNavigate } from 'react-router-dom';
/**
 * 변경: CSS 파일 경로 수정
 */
import styles from '../../Login.module.css';

/**
 * 추가: 폼 데이터의 타입을 미리 정의.
 * 이메일, 비밀번호 대신 수정할 필드들로 구성.
 */
interface FormData {
  name: string;
  phoneNum: string;
  birthDate: string;
  password: ''; // 비밀번호는 새로 입력받을 필드
}

/**
 * 변경: 컴포넌트 이름 변경 (Login -> MemberEdit)
 * props는 이제 받지 않으므로 제거.
 */
const MemberEdit: React.FC = () => {
    const navigate = useNavigate();

    /**
     * 변경: useState 로직을 하나의 객체로 통합 관리.
     * email, password 대신 formData 객체를 사용.
     */
    const [formData, setFormData] = useState<FormData>({
      name: '',
      phoneNum: '',
      birthDate: '',
      password: '',
    });

    const [error, setError] = useState<string>('');
    // isLoading 상태는 그대로 사용!
    const [isLoading, setIsLoading] = useState<boolean>(true); // 초기값을 true로 변경 (데이터 로딩)


    /**
     * 추가: 페이지 로드 시, 기존 회원 정보를 불러오는 useEffect
     */
    useEffect(() => {
      const fetchMemberData = async () => {
        setError('');
        try {
          const response = await axios.get('/api/mypage/member-edit');
          const { name, phoneNum, birthDate } = response.data;
          // API로부터 받은 데이터로 폼 상태를 초기화
          setFormData({ name, phoneNum, birthDate, password: '' });
        } catch (err) {
          setError('회원 정보를 불러오는 데 실패했습니다.');
          console.error(err);
        } finally {
          setIsLoading(false); // 로딩 완료
        }
      };
      fetchMemberData();
    }, []); // 빈 배열: 처음 렌더링될 때 한 번만 실행


    /**
     * 추가: 폼의 각 input 값이 변경될 때마다 상태를 업데이트하는 함수
     */
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setFormData(prevState => ({
        ...prevState,
        [name]: value,
      }));
    };


    /**
     * 변경: handleSubmit 로직을 정보 수정 API 호출 로직으로 전체 교체
     */
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        // 비밀번호를 제외한 수정할 데이터 객체 생성
        const updateData: Partial<FormData> = {
          name: formData.name,
          phoneNum: formData.phoneNum,
          birthDate: formData.birthDate,
        };
        
        // 비밀번호 필드에 값이 입력된 경우에만 객체에 추가
        if(formData.password) {
          updateData.password = formData.password;
        }

        try {
            // PUT 요청으로 수정 API 호출
            await axios.put('/api/mypage/me', updateData);
            alert('회원 정보가 성공적으로 수정되었습니다.');
            navigate('/mypage'); // 수정 완료 후 마이페이지로 이동
        } catch (err) {
             if (axios.isAxiosError(err) && err.response) {
                setError('정보 수정에 실패했습니다: ' + (err.response.data.message || '서버 오류'));
            } else {
                setError('네트워크 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * 추가: 데이터 로딩 중에 보여줄 화면
     */
    if (isLoading && !formData.name) { // 초기 데이터가 없을 때만 로딩 표시
      return <div className={styles['login-page-container']}>로딩 중...</div>
    }

    // JSX 부분도 대대적으로 수정
    return (
        // 재사용: 전체 레이아웃 클래스는 그대로 사용
        <div className={styles['login-page-container']}>
            <div className={styles['login-form-wrapper']}>
                {/* 변경: 제목 변경 */}
                <h1 className={styles['form-title']}>개인정보 수정</h1>
                <form onSubmit={handleSubmit}>
                    {/* 변경: 입력 필드를 '이름'으로 변경 */}
                    <div className={styles['form-group']}>
                        <label htmlFor="name">이름</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    {/* 추가: '연락처' 필드 */}
                    <div className={styles['form-group']}>
                        <label htmlFor="phoneNum">연락처</label>
                        <input
                            type="text"
                            id="phoneNum"
                            name="phoneNum"
                            value={formData.phoneNum}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    {/* 추가: '생년월일' 필드 */}
                    <div className={styles['form-group']}>
                        <label htmlFor="birthDate">생년월일</label>
                        <input
                            type="text"
                            id="birthDate"
                            name="birthDate"
                            value={formData.birthDate}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    {/* 추가: '새 비밀번호' 필드 */}
                    <div className={styles['form-group']}>
                        <label htmlFor="password">새 비밀번호</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="변경할 경우에만 입력하세요"
                            autoComplete="new-password"
                        />
                    </div>

                    {error && <p className={styles['error-message']}>{error}</p>}
                    {/* 변경: 버튼 텍스트 변경 */}
                    <button type="submit" className={styles['btn-primary']} disabled={isLoading}>
                        {isLoading ? '수정 중...' : '수정하기'}
                    </button>
                </form>
                {/* 삭제: 하단 링크 및 소셜 로그인 관련 JSX 전체 삭제 */}
            </div>
        </div>
    );
};

export default MemberEdit;