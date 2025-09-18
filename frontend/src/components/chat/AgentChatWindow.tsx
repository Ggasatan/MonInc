
import React, { useState, useEffect, useRef } from 'react';
import { useChat } from '../../hooks/useChat';
import './AgentChatWindow.css';

interface AgentChatWindowProps {
  username: string; // 현재 로그인한 사용자 이름
  isOpen: boolean;   // 이 창이 열려있는지 여부
  onClose: () => void; // 창을 닫는 함수
}

export const AgentChatWindow: React.FC<AgentChatWindowProps> = ({ username, isOpen, onClose }) => {
  // 1. 우리가 만든 useChat 훅을 호출하여 필요한 모든 것을 가져옵니다.
  const { messages, isConnected, sendMessage, joinChat } = useChat();
  
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  // 2. 컴포넌트가 처음 렌더링되고, 유저이름과 소켓연결이 확인되면 채팅방에 참여합니다.
  useEffect(() => {
    if (username && isConnected) {
      joinChat(username);
    }
  }, [username, isConnected, joinChat]);

  // 3. 메시지 목록이 변경될 때마다 스크롤을 맨 아래로 내립니다.
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    if (newMessage.trim() !== '') {
      sendMessage(newMessage);
      setNewMessage('');
    }
  };
  
  // isOpen prop이 false이면 컴포넌트를 렌더링하지 않습니다.
  if (!isOpen) {
    return null;
  }

  // 4. 채팅창 UI를 렌더링합니다.
  return (
    <div className="chat-window">
      <div className="chat-header">
        <h3>실시간 상담</h3>
        <span className={`connection-status ${isConnected ? 'connected' : ''}`}>
          {isConnected ? '● 온라인' : '● 오프라인'}
        </span>
        <button onClick={onClose} className="close-btn">&times;</button>
      </div>
      <div className="chat-body">
        {messages.map((msg, index) => (
          <div key={index} className={`message-bubble-wrapper ${msg.sender === username ? 'sent' : 'received'}`}>
            <div className={`message-bubble`}>
              {msg.sender !== username && <div className="message-sender">{msg.sender}</div>}
              <div className="message-content">{msg.content}</div>
              <div className="message-timestamp">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="chat-footer">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder="메시지를 입력하세요..."
        />
        <button onClick={handleSendMessage}>전송</button>
      </div>
    </div>
  );
};
