import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header'; // Header 경로가 다르면 수정해줘
import Footer from './Footer'; // Footer 경로가 다르면 수정해줘

// App.tsx로부터 Header와 Footer에 필요한 모든 props를 전달받기 위한 '설명서'
interface DefaultLayoutProps {
  isLoggedIn: boolean;
  userRole: string | null;
  onLogout: () => void;
  userId: number | null;
}

const DefaultLayout: React.FC<DefaultLayoutProps> = ({ isLoggedIn, userRole, onLogout, userId }) => {
  return (
    <>
      {/* 1. 받은 props를 Header에 전달 */}
      <Header isLoggedIn={isLoggedIn} userRole={userRole} onLogout={onLogout} userId={userId} />

      {/* 2. '내용물'이 들어올 자리 */}
      <main className="main-content">
        <Outlet />
      </main>

      {/* 3. Footer 렌더링 */}
      <Footer />
    </>
  );
};

export default DefaultLayout;