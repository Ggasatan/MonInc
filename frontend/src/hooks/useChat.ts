import { useState, useEffect, useCallback, useRef } from 'react';
import io, { Socket } from 'socket.io-client';

// 메시지 타입을 정의합니다.
interface ChatMessage {
  content: string;
  sender: string;
  recipient: string | null;
  type: 'JOIN' | 'CHAT' | 'LEAVE';
  timestamp: string;
}

// useChat 훅의 반환 타입을 정의합니다.
interface UseChatReturn {
  messages: ChatMessage[];
  isConnected: boolean;
  sendMessage: (content: string, recipient?: string | null) => void;
  joinChat: (username: string) => void;
}

const SOCKET_SERVER_URL = 'http://localhost:3001';

export const useChat = (): UseChatReturn => {
  // 1. 소켓 인스턴스는 useRef로 관리. 리렌더링 되어도 연결이 유지됨.
  const socketRef = useRef<Socket | null>(null);

  // 2. 화면에 보여줘야 할 상태들만 useState로 관리.
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [username, setUsername] = useState<string | null>(null);
  const [historyLoaded, setHistoryLoaded] = useState<boolean>(false);

  // 3. useEffect는 단 하나만 사용해서 모든 로직을 관리.
  useEffect(() => {
    // StrictMode 때문에 재실행되어도, ref 덕분에 소켓이 중복 생성되지 않음.
    if (!socketRef.current) {
      socketRef.current = io(SOCKET_SERVER_URL, {
        transports: ['websocket', 'polling'],
      });
    }
    
    const socket = socketRef.current; // 이제부터 socket 변수는 이 안에서만 유효

    const handleNewMessage = (message: ChatMessage) => {
      setMessages(prev => [...prev, message]);
    };

    const handleChatHistory = (data: { userId: string, history: ChatMessage[] }) => {
      if (!historyLoaded && data.userId === username) {
        console.log(`📜 ${data.userId}의 채팅 기록 ${data.history.length}건을 수신했습니다.`);
        const sortedHistory = data.history.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
        setMessages(sortedHistory);
        setHistoryLoaded(true);
      }
    };

    // 이벤트 리스너 등록
    socket.on('connect', () => setIsConnected(true));
    socket.on('disconnect', () => setIsConnected(false));
    socket.on('chatMessage', handleNewMessage);
    socket.on('adminReply', handleNewMessage);
    socket.on('chatHistory', handleChatHistory);

    // useEffect가 재실행되거나, 컴포넌트가 언마운트될 때 리스너 정리
    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('chatMessage', handleNewMessage);
      socket.off('adminReply', handleNewMessage);
      socket.off('chatHistory', handleChatHistory);
    };
  }, [username, historyLoaded]); // username, historyLoaded가 바뀔 때마다 최신 값을 아는 리스너를 새로 등록

  const joinChat = useCallback((user: string) => {
    setHistoryLoaded(false); 
    setUsername(user);
    // 4. 이제부터 소켓은 항상 socketRef.current로 접근!
    if (socketRef.current && socketRef.current.connected) {
      console.log(`👤 ${user}님이 채팅에 참여합니다.`);
      socketRef.current.emit('joinChat', { sender: user, type: 'JOIN' });
    }
  }, []); // ref는 의존성 배열에 넣을 필요 없음

  const sendMessage = useCallback((content: string, recipient: string | null = null) => {
    // 5. 여기도 socketRef.current로 접근!
    if (socketRef.current && socketRef.current.connected && username) {
      const message: ChatMessage = { content, sender: username, recipient, type: 'CHAT', timestamp: new Date().toISOString() };
      socketRef.current.emit('sendMessage', message);
    } else {
      console.warn('⚠️ 소켓이 연결되지 않았거나 사용자가 설정되지 않아 메시지를 보낼 수 없습니다.');
    }
  }, [username]);

  return { messages, isConnected, sendMessage, joinChat };
};