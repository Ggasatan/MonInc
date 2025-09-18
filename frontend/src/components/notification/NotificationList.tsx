
import React, { useState, useMemo } from 'react';
import type{ Notification } from '../../context/NotificationProvider';
import './NotificationList.css';

interface NotificationListProps {
  notifications: Notification[];
  onNotificationClick: (notification: Notification) => void;
  onMarkAllAsRead: () => void;
}

// 시간 계산 유틸리티 함수
const getTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return '방금 전';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}분 전`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}시간 전`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}일 전`;
    
    return date.toLocaleDateString('ko-KR');
};

// 알림 타입에 따른 CSS 클래스를 반환하는 함수
const getTypeClass = (type: string): string => {
    switch (type) {
        case 'follow': return 'type-follow';
        case 'like': return 'type-like';
        case 'comment': return 'type-comment';
        case 'seller_request_received':
        case 'seller_request_submitted':
        case 'seller_approved':
        case 'seller_rejected':
            return 'type-seller';
        default: return 'type-default';
    }
};

// 알림 타입에 따른 한글 텍스트를 반환하는 함수
const getTypeText = (type: string): string => {
    const types: { [key: string]: string } = {
        follow: '팔로우',
        like: '좋아요',
        comment: '댓글',
        seller_request_received: '작가신청',
        seller_request_submitted: '작가신청',
        seller_approved: '승인',
        seller_rejected: '거절',
        inquiry: '문의',
        review: '후기',
        payment_success: '결제완료',
        auction_bid: '입찰',
        auction_win: '경매낙찰',
        admin_notice: '공지'
    };
    return types[type] || '알림';
};

export const NotificationList: React.FC<NotificationListProps> = ({ 
  notifications, 
  onNotificationClick, 
  onMarkAllAsRead 
}) => {
  const [filter, setFilter] = useState('all');

  const filteredNotifications = useMemo(() => {
    if (filter === 'all') return notifications;
    return notifications.filter(n => {
      switch (filter) {
        case 'social':
          return ['follow', 'like', 'comment'].includes(n.type);
        case 'product':
          return n.category === 'ORDER' || ['inquiry', 'review'].includes(n.type);
        case 'admin':
          return n.category === 'ADMIN';
        case 'auction':
          return n.category === 'AUCTION';
        default:
          return true;
      }
    });
  }, [notifications, filter]);

  const filters = [
    { key: 'all', label: '전체' },
    { key: 'social', label: '소셜' },
    { key: 'product', label: '결제' },
    { key: 'auction', label: '좋아요' },
    { key: 'admin', label: '시스템' },
  ];

  return (
    <div className="notification-list-container">
      <div className="notification-modal-header">
        <span>알림</span>
        <button onClick={onMarkAllAsRead} className="mark-all-read-btn">전체 읽음</button>
      </div>
      <div className="notification-filter-bar">
        {filters.map(f => (
          <button 
            key={f.key}
            className={`filter-btn ${filter === f.key ? 'active' : ''}`}
            onClick={() => setFilter(f.key)}
          >
            {f.label}
          </button>
        ))}
      </div>
      <div className="notification-modal-list">
        {filteredNotifications.length === 0 ? (
          <div className="no-notifications">알림이 없습니다.</div>
        ) : (
          filteredNotifications.map(notification => (
            <div 
              key={notification.id} 
              className={`notification-item ${!notification.isRead ? 'unread' : ''}`}
              onClick={() => onNotificationClick(notification)}
            >
              <div className="notification-message">{notification.message}</div>
              <div className="notification-time">
                {getTimeAgo(notification.createdAt)}
                <span className={`notification-type ${getTypeClass(notification.type)}`}>
                  {getTypeText(notification.type)}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
