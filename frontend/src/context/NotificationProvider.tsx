import React, { createContext, useState, useContext, useEffect, useCallback, type ReactNode } from 'react';
import io, { Socket } from 'socket.io-client';
import axios from 'axios'; 

// 타입 정의는 그대로 유지
export interface Notification {
    id: number;
    message: string;
    type: string;
    category: string;
    isRead: boolean;
    link: string;
    createdAt: string;
    targetUserId?: number;
    userId?: number;
}
export interface ToastNotification {
    id: number;
    title: string;
    message: string;
}
interface NotificationContextType {
    isModalOpen: boolean;
    openModal: () => void;
    closeModal: () => void;
    toggleModal: () => void;
    unreadCount: number;
    notifications: Notification[];
    toasts: ToastNotification[];
    removeToast: (id: number) => void;
    markAsRead: (notificationId: number) => Promise<boolean>;
    markAllAsRead: () => Promise<void>;
    loadNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);
const SOCKET_SERVER_URL = 'http://localhost:3001';

interface NotificationProviderProps {
    children: ReactNode;
    userId: number | null;
    roles: string[];
}

export const NotificationProvider = ({ children, userId, roles }: NotificationProviderProps) => {
    // UI 및 데이터 상태는 그대로 유지
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState<number>(0);
    const [toasts, setToasts] = useState<ToastNotification[]>([]);

    const openModal = useCallback(() => setIsModalOpen(true), []);
    const closeModal = useCallback(() => setIsModalOpen(false), []);
    const toggleModal = useCallback(() => setIsModalOpen(prev => !prev), []);

    const loadNotifications = useCallback(async () => {
        if (!userId) return;
        try {
            const response = await axios.get('/api/notifications/list');
            const fetchedNotifications = response.data.notifications || [];
            setNotifications(fetchedNotifications);
            const unread = fetchedNotifications.filter((n: Notification) => !n.isRead).length;
            setUnreadCount(unread);
        } catch (error) {
            console.error('알림 목록 로드 실패:', error);
        }
    }, [userId]);

    const markAsRead = useCallback(async (notificationId: number): Promise<boolean> => {
        try {
            await axios.post(`/api/notifications/${notificationId}/read`);
            setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
            return true;
        } catch (error) {
            console.error('알림 읽음 처리 실패:', error);
            return false;
        }
    }, []);

    const markAllAsRead = useCallback(async () => {
        try {
            await axios.post(`/api/notifications/read-all`);
                setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
                setUnreadCount(0);
        } catch (error) {
            console.error('전체 알림 읽음 처리 실패:', error);
        }
    }, []);

    // ✅✅✅ 여기가 핵심 수정 부분 ✅✅✅
    useEffect(() => {
        // userId가 없으면 아무것도 하지 않고 종료
        if (!userId) {
          console.log('id가 없습니다. 비회원이라는 뜻이죠',userId)
            return;
        }

        console.log(`(i) userId (${userId}) 확인. 알림 소켓 연결을 시도합니다.`);
        
        const newSocket = io(SOCKET_SERVER_URL, {
            transports: ['websocket', 'polling'],
            auth: { userId, roles },
        });

        newSocket.on('connect', () => {
            console.log('✅ 알림 소켓 연결 성공:', newSocket.id);
            loadNotifications(); // 연결 성공 시 최초 알림 목록 로드
        });

        newSocket.on('disconnect', () => console.log('🔗 알림 소켓 연결 해제'));

        newSocket.on('connect_error', (err) => {
            console.error('🚫 알림 소켓 연결 에러:', err.message);
        });

        // 새 알림 수신 시, API 재요청 대신 받은 데이터로 바로 상태 업데이트 (더 효율적)
        newSocket.on('newNotification', (notification: Notification) => {
            console.log('📬 새 알림 수신:', notification);
            // 상태 업데이트 시 함수형 업데이트를 사용하여 항상 최신 상태를 기반으로 변경
            setNotifications(prevNotifications => [notification, ...prevNotifications]);
            setUnreadCount(prevCount => prevCount + 1);
            
            const newToast = { id: Date.now(), title: '🔔 새 알림', message: notification.message };
            setToasts(prevToasts => [...prevToasts, newToast]);
        });

        // userId가 바뀌거나 컴포넌트가 사라질 때 소켓 연결을 반드시 끊음
        return () => {
            console.log(`🔌 userId (${userId})에 대한 소켓 연결을 정리합니다.`);
            newSocket.disconnect();
        };
    }, [userId, roles, loadNotifications]); // ✅ 의존성 배열을 단순화

    const removeToast = (id: number) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    };

    const value = {
        isModalOpen, openModal, closeModal, toggleModal,
        unreadCount, notifications, toasts, removeToast,
        markAsRead, markAllAsRead, loadNotifications,
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
};