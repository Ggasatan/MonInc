import React from 'react';
// 훅을 context 폴더에서 가져옴
import { useNotifications, type Notification } from '../../context/NotificationProvider';
import { NotificationList } from './NotificationList';
import './NotificationModal.css';

// 이제 props를 받을 필요가 없음!
export const NotificationModal: React.FC = () => {
  // 필요한 모든 상태와 함수를 하나의 훅으로 가져옴
  const { isModalOpen, closeModal, notifications, markAsRead, markAllAsRead } = useNotifications();

  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id).then(success => {
      if (success && notification.link) {
        window.location.href = notification.link;
        closeModal();
      }
    });
  };

  if (!isModalOpen) {
    return null;
  }

  return (
    <div className="notification-modal-overlay" onClick={closeModal}>
      <div className="notification-modal-content" onClick={e => e.stopPropagation()}>
        <NotificationList 
          notifications={notifications}
          onNotificationClick={handleNotificationClick}
          onMarkAllAsRead={markAllAsRead}
        />
      </div>
    </div>
  );
};