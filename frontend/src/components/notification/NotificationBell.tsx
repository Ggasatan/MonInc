import React from 'react';
// 이제 useNotifications 훅을 context 폴더에서 가져옴
import { useNotifications } from '../../context/NotificationProvider';
import './NotificationBell.css';

// 이제 props를 받을 필요가 없음!
export const NotificationBell: React.FC = () => {
  // 훅을 호출하면 unreadCount와 toggleModal을 모두 가져올 수 있음
  const { unreadCount, toggleModal } = useNotifications();

  return (
    <div className="bell-container" onClick={toggleModal}>
      <span className="bell-icon">🔔</span>
      {unreadCount > 0 && (
        <span id="notification-badge" className="notification-badge">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </div>
  );
};