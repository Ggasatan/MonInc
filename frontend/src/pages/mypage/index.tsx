// 파일 경로: src/pages/mypage/index.tsx

// 1. useState와 useEffect를 react에서 import 한다.
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios'; // API 호출을 위해 axios를 import 한다.
import styles from './MyPage.module.css';

const MyPage = () => {
  // 2. 컴포넌트의 상태를 관리할 변수들을 선언한다.
  // userName: API로부터 받아온 유저 이름을 저장할 공간
  // loading: API 호출이 진행 중인지 여부를 저장 (true이면 로딩 중)
  // error: API 호출 중 에러가 발생하면 에러 메시지를 저장
  const [userName, setUserName] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // 3. 컴포넌트가 처음 화면에 렌더링될 때 딱 한 번만 실행될 부분.
  useEffect(() => {
    // API를 호출하는 비동기 함수를 정의
    const fetchMyInfo = async () => {
      try {
        // [1단계]에서 만든 백엔드 API를 호출!
        // App.tsx에서 이미 axios 기본 헤더에 토큰을 설정해줘서, 그냥 호출만 하면 된다.
        const response = await axios.get('/api/mypage/me');
        
        // API 호출 성공 시, 응답 데이터에서 이름을 꺼내 userName 상태를 업데이트한다.
        setUserName(response.data.name);

      } catch (err) {
        // API 호출 실패 시, 에러 상태를 업데이트한다.
        console.error("유저 정보 조회 실패:", err);
        setError('사용자 정보를 불러오는 데 실패했습니다.');
      } finally {
        // 성공하든 실패하든, 로딩 상태를 false로 변경한다.
        setLoading(false);
      }
    };

    fetchMyInfo(); // 위에서 정의한 함수를 실행
  }, []); // 빈 배열[]: 이 useEffect는 처음 마운트될 때 딱 한 번만 실행됨을 의미

  // 4. 로딩 중일 때 보여줄 화면
  if (loading) {
    return <div className={styles.mypageContainer}>로딩 중...</div>;
  }

  // 5. 에러가 발생했을 때 보여줄 화면
  if (error) {
    return <div className={styles.mypageContainer}>{error}</div>;
  }

  // 6. 모든 데이터가 성공적으로 로드되었을 때 보여줄 최종 화면
  return (
    <div className={styles.mypageContainer}>
      <div className={styles.welcomeMessage}>
        {/* 가짜 이름 대신, 상태에 저장된 진짜 userName을 사용한다. */}
        <h1>{userName}님 환영합니다.</h1>
        <p>당신의 순수함과 창의성을 기다리고 있습니다.</p>
      </div>

      <div className={styles.mypageButtons}>
        <Link to="/mypage/member-edit" className={styles.mypageButton}>
          개인정보 수정
        </Link>
        <Link to="/mypage/orders" className={styles.mypageButton}>
          구매 내역
        </Link>
        <Link to="/mypage/saved-options" className={styles.mypageButton}>
          저장된 옵션
        </Link>
      </div>
    </div>
  );
};

export default MyPage;