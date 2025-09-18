import React, { useState, useEffect } from 'react';
import styles from '../../pages/Signup.module.css'; // ✅ 회원가입 CSS 재활용!
import Modal from '../Modal'; // 기존에 사용하던 Modal 컴포넌트
import { fetchMemberInfo } from '../../api/productApi';


// 이 DTO는 나중에 부모 컴포넌트에서 재활용할 수 있도록 export
export interface DeliveryInfoData {
  recipientName: string;
  recipientPhone: string;
  recipientAddress: string;
  recipientDetailAddress: string;
  requestMessage: string;
}

interface DeliveryInfoModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (deliveryInfo: DeliveryInfoData) => void;
}

const DeliveryInfoModal = ({ isOpen, onClose, onSubmit }: DeliveryInfoModalProps) => {
  const [deliveryInfo, setDeliveryInfo] = useState<DeliveryInfoData>({
    recipientName: '',
    recipientPhone: '',
    recipientAddress: '',
    recipientDetailAddress: '',
    requestMessage: '',
  });

  // 모달이 열릴 때, 회원 정보를 조회해서 기본값을 채움
  useEffect(() => {
    if (isOpen) {
      const loadMemberInfo = async () => {
        try {
          const memberData = await fetchMemberInfo();
          setDeliveryInfo(prev => ({
            ...prev,
            recipientName: memberData.name || '',
            recipientPhone: memberData.phoneNum || '',
          }));
        } catch (error) {
          console.error("기본 정보 로딩 실패", error);
        }
      };
      loadMemberInfo();
    }
  }, [isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setDeliveryInfo(prev => ({ ...prev, [name]: value }));
  };
  
  // 카카오 주소 검색 핸들러
  const handleAddressSearch = () => {
    const { daum } = window;
    if (!daum) return;

    new daum.Postcode({
      oncomplete: (data) => {
        setDeliveryInfo(prev => ({ ...prev, recipientAddress: data.address }));
      },
    }).open();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: 간단한 유효성 검사 추가 가능
    onSubmit(deliveryInfo); // ✅ 부모에게 deliveryInfo와 paymentInfo를 둘 다 전달!
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className={styles['signup-form-wrapper']} style={{ margin: 0, padding: '2rem' }}>
        <h2 className={styles['form-title']}>배송 정보 입력</h2>
        <form onSubmit={handleSubmit}>
          {/* 이름 */}
          <div className={styles['form-group']}>
            <label htmlFor="recipientName">받는 사람</label>
            <input type="text" id="recipientName" name="recipientName" value={deliveryInfo.recipientName} onChange={handleChange} required />
          </div>
          {/* 연락처 */}
          <div className={styles['form-group']}>
            <label htmlFor="recipientPhone">연락처</label>
            <input type="text" id="recipientPhone" name="recipientPhone" value={deliveryInfo.recipientPhone} onChange={handleChange} placeholder="'-' 없이 숫자만 입력" required />
          </div>
          {/* 주소 */}
          <div className={styles['form-group']}>
            <label htmlFor="recipientAddress">주소</label>
            <div className={styles['input-with-button']}>
              <input type="text" id="recipientAddress" name="recipientAddress" value={deliveryInfo.recipientAddress} readOnly placeholder="주소 검색 버튼을 클릭하세요" required />
              <button type="button" className={styles['btn-secondary']} onClick={handleAddressSearch}>주소 검색</button>
            </div>
          </div>
          {/* 상세주소 */}
          <div className={styles['form-group']}>
            <label htmlFor="recipientDetailAddress">상세주소</label>
            <input type="text" id="recipientDetailAddress" name="recipientDetailAddress" value={deliveryInfo.recipientDetailAddress} onChange={handleChange} required />
          </div>
          {/* 요청사항 */}
          <div className={styles['form-group']}>
            <label htmlFor="requestMessage">요청사항</label>
            <textarea id="requestMessage" name="requestMessage" value={deliveryInfo.requestMessage} onChange={handleChange} rows={3}></textarea>
          </div>

          <button type="submit" className={styles['btn-primary']} style={{ width: '100%' }}>결제 진행하기</button>
        </form>
      </div>
    </Modal>
  );
};

export default DeliveryInfoModal;