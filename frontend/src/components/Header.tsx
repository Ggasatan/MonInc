import React from 'react';
import { Link, useNavigate, useLocation   } from 'react-router-dom'; // 페이지 이동을 위해 Link 컴포넌트를 사용
import styles from './Header.module.css'; // CSS 모듈을 가져옵니다.
import { NotificationBell } from './notification/NotificationBell';
import headerLogoW from '../assets/images/moninclogoW.png'
import headerLogo from '../assets/images/moninclogo.png'

interface HeaderProps {
  isLoggedIn: boolean;
  userRole: string | null;
  onLogout: () => void; // 매개변수도, 반환값도 없는 함수라는 의미
  userId: number | null;
}

const Header = ({ isLoggedIn, userRole, onLogout }: HeaderProps) => {
  const navigate = useNavigate();
  const location = useLocation(); 
  const isMainPage = location.pathname === '/';

  const handleLogoutClick = () => {
    onLogout(); // App.tsx에서 내려준 로그아웃 함수 실행
    navigate('/'); // 메인 페이지로 이동
  };
  const renderRightNav = () => {
    if (!isLoggedIn) {
      return (
        <>
          <Link to="/login">LOGIN</Link>
          <Link to="/signup">SIGN IN</Link>
        </>
      );
    } else {
      // ✅ 수정: userRole에 따라 다른 메뉴를 보여줍니다.
      // 'auth' 문자열에 "ADMIN"이 포함되어 있는지 확인합니다.
      const isAdmin = userRole && userRole.includes('ADMIN');
      const roles = userRole ? userRole.split(',') : [];

      if (isAdmin) {
        return (
        <>
          {/* <Link to="/admin">관리자 페이지</Link> */}
          <Link to="/admin/chat">채팅 관리</Link> {/* 텍스트도 더 명확하게 변경 */}
          <NotificationBell />
          <a href="#!" onClick={handleLogoutClick} className={styles.logoutButton}>
            LOGOUT
          </a>
        </> 
        )
      } else {
        return (
          <>
            <Link to="/mypage">MY PAGE</Link>
            {/* <Link to="/cart">CART</Link> */}
            <NotificationBell  />
            <a href="#!" onClick={handleLogoutClick} className={styles.logoutButton}>
              LOGOUT
            </a>
          </>
        );
      }
    }
  };
  return (
     <header className={`${styles.headerContainer} ${isMainPage ? styles.transparentHeader : ''}`}>
      
      {/* 1. 로고 영역 */}
      <Link to="/" className={styles.logo}>
        {/* ✅ 변경: 텍스트 로고를 이미지로 교체 */}
        {/* ❗ 중요: '/images/logo.png'를 군주의 실제 로고 이미지 경로로 수정해주십시오. */}
        <img src={`${isMainPage ?  headerLogoW : headerLogo}`} alt="사이트 로고" />
      </Link>

      {/* 2. 네비게이션 영역 */}
      <nav className={styles.navLinks}>
        <Link to="/products">PRODUCT</Link>
        <Link to="/game">USERMON</Link>
        {/* 기존의 로그인/로그아웃 렌더링 함수를 그대로 호출합니다. */}
        {renderRightNav()}
      </nav>
      
    </header>
  );
};

export default Header;