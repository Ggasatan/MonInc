
import React from 'react';
import { useChatUI } from '../../context/ChatUIProvider';
import './FloatingChatButtons.css'; // 버튼 스타일을 위한 CSS 파일

export const FloatingChatButtons: React.FC = () => {
  // ChatUIProvider에서 채팅창을 토글하는 함수를 가져옵니다.
  const { toggleChat } = useChatUI();

  // 현재는 상담원 채팅 버튼만 구현합니다.
  // 추후 챗봇 버튼도 이곳에 추가할 수 있습니다.
  return (
    <div className="floating-buttons-container">
      <button 
        className="chat-btn-floating" 
        onClick={toggleChat} 
        title="실시간 상담"
      >
        {/* 아이콘은 SVG나 아이콘 라이브러리(e.g., FontAwesome)를 사용하면 좋습니다. */}
        <span>💬</span>
      </button>
    </div>
  );
};
