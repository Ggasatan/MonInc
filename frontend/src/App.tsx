import React, { useState, useEffect, type JSX } from 'react';
import { Routes, Route ,Navigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { ChatUIProvider, useChatUI } from './context/ChatUIProvider';
import { NotificationProvider } from './context/NotificationProvider';
import { FloatingChatButtons } from './components/chat/FloatingChatButtons';
import { AgentChatWindow } from './components/chat/AgentChatWindow';
import { NotificationModal } from './components/notification/NotificationModal';
import GamePage from './pages/GamePage';

// CSS 및 컴포넌트 import
import './App.css';
import DefaultLayout from './components/DefaultLayout';
import Header from './components/Header';
import Footer from './components/Footer';
import MainPage from './pages/MainPage'; // 메인 페이지
import LoginPage from './pages/Login'; // 로그인 페이지
import SignupPage from './pages/Signup'; // 회원가입 페이지
import LoginHandler from './pages/LoginHandler';
import SignupDetailsPage from './pages/SignupDetails'
import ChatDashboard from './pages/chatManager/ChatDashboard';
import ProductListPage from './pages/ProductListPage';
import ProductDetailPage from './pages/ProductDetailPage';
import { ToastProvider } from './context/ToastProvider';
import MyPage from './pages/mypage';
import MemberEdit from './pages/mypage/MemberEdit';
import OrderHistory from './pages/mypage/OderHistory';
import SaveOptionList from './pages/mypage/SaveOptionList';

// JWT 토큰에 포함될 정보 (userId 추가)
interface JwtPayload {
  sub: string; // 사용자 이름
  auth: string; // "ROLE_USER" 또는 "ROLE_ADMIN,ROLE_USER" 등
  userId: number; // 사용자 ID
}

const AdminRoute = ({ children, userRole }: { children: JSX.Element, userRole: string | null }) => {
  const isAdmin = userRole && userRole.includes('ADMIN');
  // 관리자가 아니면 메인 페이지로 튕겨냄
  return isAdmin ? children : <Navigate to="/" replace />;
};


const App: React.FC = () => {
  // --- 상태 관리 ---
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [isAuthReady, setIsAuthReady] = useState<boolean>(false);
  const location = useLocation();
  const isMainPage = location.pathname === '/';

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      try {
        const decodedToken: JwtPayload = jwtDecode(token);
        // 상태 업데이트 및 axios 기본 헤더 설정
        setIsLoggedIn(true);
        setUserRole(decodedToken.auth);
        setUsername(decodedToken.sub); // `sub` 클레임을 username으로 사용
        setUserId(decodedToken.userId); // `userId` 클레임 사용
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      } catch (error) {
        console.error("저장된 토큰이 유효하지 않습니다:", error);
        handleLogout(); // 잘못된 토큰이면 로그아웃 처리
      }
    }
    setIsAuthReady(true);
  }, []); // 빈 배열: 컴포넌트가 처음 마운트될 때 한 번만 실행

  const handleLoginSuccess = (token: string): void => {
    try {
      const decodedToken: JwtPayload = jwtDecode(token);
      localStorage.setItem('accessToken', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUserRole(decodedToken.auth);
      setUsername(decodedToken.sub);
      setUserId(decodedToken.userId);
      setIsLoggedIn(true);
    } catch (error) {
      console.error("로그인 시 토큰 디코딩에 실패했습니다:", error);
    }
  };

  const handleLogout = (): void => {
    localStorage.removeItem('accessToken');
    delete axios.defaults.headers.common['Authorization'];
    setUserRole(null);
    setUsername(null);
    setUserId(null);
    setIsLoggedIn(false);
  };

  // ChatUIContext의 값을 사용하기 위한 래퍼 컴포넌트
  const ChatWindowWrapper = () => {
    const { isChatOpen, closeChat } = useChatUI();
    if (!username) return null; // username이 없으면 렌더링하지 않음
    return <AgentChatWindow username={username} isOpen={isChatOpen} onClose={closeChat} />;
  };

  if (!isAuthReady) {
    return <div>인증 정보를 확인하는 중입니다...</div>; // 혹은 스피너 컴포넌트 등을 사용
  }  

  return (
    <ToastProvider>
      <NotificationProvider userId={userId} roles={userRole ? userRole.split(',') : []}>
        <ChatUIProvider>
          <div className="app-container">
            
            
            {/* 로그인 시에만 알림 및 채팅 관련 컴포넌트 렌더링 */}
            {isLoggedIn  && (
              <NotificationModal />
            )}

            <main className="main-content">
              <Routes>
                {/* 라우트 설정은 그대로 둡니다. */}
                <Route path="/" element={
                  <>
                    <Header isLoggedIn={isLoggedIn} userRole={userRole} onLogout={handleLogout} userId={userId} />
                    <MainPage />
                    {/* <Footer /> */}
                  </>
                } />
                <Route path="/game" element={<GamePage />} />
                <Route element={<DefaultLayout isLoggedIn={isLoggedIn} userRole={userRole} onLogout={handleLogout} userId={userId} />}>
                  <Route path="/login" element={<LoginPage onLoginSuccess={handleLoginSuccess} />} />
                  <Route path="/signup" element={<SignupPage />} />
                  <Route
                    path="login/oauth2/callback/:socialTypeValue" //redirect_url
                    element={<LoginHandler onLoginSuccess={handleLoginSuccess}/>} 
                  />
                  <Route path="/signup-details" element={<SignupDetailsPage />} />
                  <Route path='/admin/chat' element={
                      <AdminRoute userRole={userRole}>
                        <ChatDashboard />
                      </AdminRoute>
                    } />
                    <Route path="/products" element={<ProductListPage />} />
                    <Route path="/product/:id" element={<ProductDetailPage />} />
                    <Route path="/mypage" element={<MyPage />} />
                    <Route path="/mypage/member-edit" element={<MemberEdit />} />
                    <Route path="/mypage/orders" element={<OrderHistory />} />
                    <Route path="/mypage/saved-options" element={<SaveOptionList />} /> 
                </Route>
              </Routes>
            </main>

            {isLoggedIn  && !userRole?.includes('ADMIN') && (
              <>
                <FloatingChatButtons />
                <ChatWindowWrapper />
              </>
            )}      
          </div>
        </ChatUIProvider>
      </NotificationProvider>
    </ToastProvider>
  );
}

export default App;
