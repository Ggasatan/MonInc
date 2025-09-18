// 파일 경로: src/pages/mypage/OrderHistory/index.tsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './OrderHistory.module.css'; // 1. CSS 파일 경로 변경
import SubOptionItem from '../../../components/productDetail/SubOptionItem'; // 2. SubOptionItem 재사용!

// 3. 백엔드 DTO에 맞춰 타입 정의 변경
interface OptionDetail {
  optionName: string;
  optionThumbnail: string;
  category: string; 
}

interface OrderHistory {
  orderId: number;
  productName: string;
  orderDate: string;
  totalPrice: number;
  orderStatus: 'PENDING' | 'COMPLETED' | 'CANCELLED' | 'FAILED';
  // options: OptionDetail[]; // 이 줄을 삭제하고
  savedOptionName: string; // 이 줄을 추가!
}

const translateOrderStatus = (status: OrderHistory['orderStatus']): string => {
    switch (status) {
        case 'PENDING':
            return '결제 대기중';
        case 'COMPLETED':
            return '결제 완료';
        case 'CANCELLED':
            return '주문 취소됨';
        case 'FAILED':
            return '결제 실패';
        default:
            return status; // 혹시 모를 다른 상태값 대비
    }
};

const OrderHistory = () => {
  // 4. 상태 변수 이름 변경 (savedOptions -> orders)
  const [orders, setOrders] = useState<OrderHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        // 5. API 호출 주소 변경
        const response = await axios.get<OrderHistory[]>('/api/mypage/orders');
        setOrders(response.data);
      } catch (err) {
        setError('구매 내역을 불러오는 데 실패했습니다.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  /**
   * [핵심] 주문 취소(환불 요청) 함수
   */
  const handleCancel = async (orderId: number) => {
    if (!window.confirm('정말로 이 주문을 취소하시겠습니까?')) {
      return;
    }

    try {
      // 6. 주문 취소 API 호출
      await axios.post(`/api/mypage/orders/${orderId}/cancel`);
      
      // 화면 상태를 즉시 업데이트 (CANCELLED로 변경)
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order.orderId === orderId ? { ...order, orderStatus: 'CANCELLED' } : order
        )
      );
      alert('주문이 성공적으로 취소되었습니다.');

    } catch (err) {
      alert('주문 취소에 실패했습니다. 다시 시도해주세요.');
      console.error(err);
    }
  };


  if (loading) return <div className={styles.container}>로딩 중...</div>;
  if (error) return <div className={styles.container}>{error}</div>;

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>구매 내역</h1>
      
      {orders.length === 0 ? (
        <p className={styles.noData}>구매 내역이 없습니다.</p>
      ) : (
        <table className={styles.table}>
          <thead>
            {/* 7. 테이블 헤더(컬럼) 내용 변경 */}
            <tr>
              <th className={styles.colOrderId}>주문번호</th>
              <th className={styles.colProduct}>상품 정보</th>
              <th className={styles.colOptions}>저장된 이름</th>
              <th className={styles.colDate}>주문일시</th>
              <th className={styles.colPrice}>결제 금액</th>
              <th className={styles.colActions}>주문 상태</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.orderId}>
                <td>{order.orderId}</td>
                <td>{order.productName}</td>
                <td>
                  {/* 옵션 목록 렌더링은 SavedOptions와 완전히 동일! */}
                  {order.savedOptionName}
                </td>
                {/* 시간까지 표시하도록 toLocaleString() 사용 */}
                <td>{new Date(order.orderDate).toLocaleString()}</td>
                <td style={{ textAlign: 'right' }}>{order.totalPrice.toLocaleString()}원</td>
                <td style={{ textAlign: 'center' }}>
                  {/**
                   * [핵심] 조건부 렌더링!
                   * 주문 상태가 'COMPLETED'일 때만 '주문 취소' 버튼을 보여준다.
                   * 그 외의 상태에서는 상태 텍스트만 보여준다.
                   */}
                  {order.orderStatus === 'COMPLETED' || order.orderStatus === 'PENDING' ? (
                    <button onClick={() => handleCancel(order.orderId)} className={styles.cancelButton}>
                      주문 취소
                    </button>
                  ) : (
                    <span className={styles.statusText}>{translateOrderStatus(order.orderStatus)}</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default OrderHistory;