
import React, { createContext, useState, useContext, useCallback } from 'react';
import type { ReactNode } from 'react';

// Context가 제공할 값의 타입을 정의합니다.
interface ChatUIContextType {
  isChatOpen: boolean;
  openChat: () => void;
  closeChat: () => void;
  toggleChat: () => void;
}

// Context 객체 생성
const ChatUIContext = createContext<ChatUIContextType | undefined>(undefined);

// 다른 컴포넌트들을 감싸서 상태를 제공할 Provider 컴포넌트
export const ChatUIProvider = ({ children }: { children: ReactNode }) => {
  const [isChatOpen, setIsChatOpen] = useState(false);

  const openChat = useCallback(() => setIsChatOpen(true), []);
  const closeChat = useCallback(() => setIsChatOpen(false), []);
  const toggleChat = useCallback(() => setIsChatOpen(prev => !prev), []);

  const value = { isChatOpen, openChat, closeChat, toggleChat };

  return (
    <ChatUIContext.Provider value={value}>
      {children}
    </ChatUIContext.Provider>
  );
};

// 다른 컴포넌트에서 쉽게 Context 값을 사용하게 해주는 커스텀 훅
export const useChatUI = () => {
  const context = useContext(ChatUIContext);
  if (context === undefined) {
    throw new Error('useChatUI must be used within a ChatUIProvider');
  }
  return context;
};
