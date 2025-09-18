import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Footer.module.css';
import headerLogo from '../assets/images/moninclogoW.png';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.footerContainer}>
        
        {/* 1. 푸터 로고 */}
        <Link to="/" className={styles.logo}>
          {/* ✅ 변경: 텍스트 로고를 이미지로 교체 */}
          {/* ❗ 중요: '/images/logo.png'를 군주의 실제 로고 이미지 경로로 수정해주십시오. */}
          <img src={headerLogo} alt="사이트 로고" />
        </Link>

        {/* 2. 회사 정보 */}
        <div className={styles.companyInfo}>
          <p>회사이름: (주)까마귀 형님네</p>
          <p>대표자명: 까마귀</p>
          <p>주소: 까마귀 특별시 동생구 형님로 123</p>
          <p>상담 가능 시간: 평일 10:00 ~ 18:00 (주말 및 공휴일 휴무)</p>
        </div>

        {/* 3. 저작권 정보 */}
        <div className={styles.copyright}>
          <p>Copyright &copy; {currentYear} 형님네 Corp. All rights reserved.</p>
        </div>

      </div>
    </footer>
  );
};

export default Footer;