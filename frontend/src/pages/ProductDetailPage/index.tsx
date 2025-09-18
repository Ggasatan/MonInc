// src/pages/ProductDetailPage.tsx (최종 완성본)

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import styles from './style.module.css';
import SubOptionPanel from '../../components/productDetail/SubOptionPanel';
import { ThreeJsViewer} from '../../components/productDetail';
import {  type ProductDetail } from '../../types/product';
import {  saveSelectedOptions, fetchProductById, preparePaymentApi, verifyPaymentApi  } from '../../api/productApi';
import {type CustomizablePart,  type MaterialOverrides, type MaterialProperties} from '../../types/productDetail';
import DeliveryInfoModal, { type DeliveryInfoData } from '../../components/productDetail/DeliveryInfoModal';
import Modal from '../../components/Modal';

const ProductDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [productInfo, setProductInfo] = useState<ProductDetail | null>(null);
  const [totalPrice, setTotalPrice] = useState(0);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [saveName, setSaveName] = useState('나의 몬스터');
  const [isSaved, setIsSaved] = useState(false);
  const [savedOptionId, setSavedOptionId] = useState<number | null>(null);
  const [isDeliveryModalOpen, setIsDeliveryModalOpen] = useState(false);
  const [merchantUid, setMerchantUid] = useState<string | null>(null);
  const [customizableParts, setCustomizableParts] = useState<CustomizablePart[]>([]);
    const [materialOverrides, setMaterialOverrides] = useState<MaterialOverrides>({});

  // 데이터 로딩, 가격 계산 useEffect (변경 없음)
  useEffect(() => {
    if (!id) return;
    const loadData = async () => {
      try {
        const productData = await fetchProductById(id);
        setProductInfo(productData);
        setTotalPrice(productData.basePrice);
      } catch (error) { console.error("데이터 로딩 중 에러 발생:", error); }
    };
    loadData();
  }, [id]);
  
  // ✅ [수정] '바로구매' 버튼의 컨트롤 타워
  const handlePurchaseClick = () => {
    // 1. 이미 저장이 되어 있다면, 저장된 ID로 바로 배송 정보 모달을 연다.
    if (isSaved && savedOptionId) {
      setIsDeliveryModalOpen(true);
    } 
    // 2. 저장이 안 되어 있다면, 사용자에게 알리고 이름 입력 모달을 연다.
    else {
      alert('구매를 진행하려면 먼저 현재 옵션을 저장해야 합니다.');
      setIsSaveModalOpen(true);
    }
  };

  const handleSaveAndProceedToDelivery = async () => {
    if (!id) return;
    const payload = { mon: parseInt(id, 10), saveName: saveName, materialOverrides: JSON.stringify(materialOverrides) };
    try {
      // 1. 먼저 저장을 한다.
      const savedData = await saveSelectedOptions(payload);
      // 2. 저장 성공 후, 상태를 업데이트하고 이름 입력 모달을 닫는다.
      setIsSaved(true);
      setSavedOptionId(savedData.id);
      setIsSaveModalOpen(false);
      
      // 3. <<핵심>> 이어서 바로 배송 정보 모달을 연다!
      setIsDeliveryModalOpen(true);
    } catch (error) {
      alert('옵션 저장에 실패하여 구매를 진행할 수 없습니다.');
    }
  };
  
  // ✅ [수정] 배송 정보 모달의 '제출' 버튼이 눌렸을 때 실행되는 최종 함수
  const handleFinalSubmit = async (deliveryInfo: DeliveryInfoData) => {
    if (!savedOptionId) return alert('옵션 정보가 유효하지 않습니다.');

    try {
      const paymentInfo = await preparePaymentApi({
        saveOptionId: savedOptionId,
        deliveryInfo: deliveryInfo,
      });
      setMerchantUid(paymentInfo.merchantUid);
      const { IMP } = window;
      if (!IMP) return alert("결제 모듈을 불러오는 데 실패했습니다.");
      
      const iamportCode = import.meta.env.VITE_IMPORT_IMP;
      IMP.init(iamportCode);
      IMP.request_pay({
        pg: 'html5_inicis', pay_method: 'card',
        merchant_uid: paymentInfo.merchantUid,
        name: paymentInfo.productName,
        amount: paymentInfo.amount,
        buyer_email: paymentInfo.buyerEmail,
        buyer_name: paymentInfo.buyerName,
        buyer_tel: deliveryInfo.recipientPhone,
        buyer_addr: `${deliveryInfo.recipientAddress} ${deliveryInfo.recipientDetailAddress}`,
      }, async (rsp) => {
        if (rsp.success && rsp.imp_uid && rsp.merchant_uid) {
          try {
            // [핵심 추가] 결제 성공 시, 백엔드에 검증 요청을 보낸다!
            await verifyPaymentApi({
              imp_uid: rsp.imp_uid,
              merchant_uid: rsp.merchant_uid,
            });
            
            alert('결제가 성공적으로 완료되었습니다.');
            // TODO: 결제 완료 페이지로 이동하는 로직 추가 (예: navigate('/order/complete'))
            
          } catch (error) {
            // 검증 과정에서 에러 발생 시 (예: 금액 위변조)
            console.error("결제 검증 실패:", error);
            alert("결제는 성공했으나, 정보를 확인하는 과정에서 오류가 발생했습니다. 관리자에게 문의해주세요.");
            // TODO: 여기서 백엔드에 결제 취소 요청을 보내는 로직을 추가하면 더 완벽함
          }
        } else {
          alert(`결제에 실패했습니다: ${rsp.error_msg}`);
        }
      });
      setIsDeliveryModalOpen(false);
    } catch (error) {
      alert("결제 처리 중 오류가 발생했습니다.");
    }
  };

  // '단순 저장' 로직 (이름 입력 모달과 연결됨)
  const handleConfirmSaveOnly = async () => {
    if (!id) return;
    const payload = {  mon: parseInt(id, 10), saveName: saveName, materialOverrides: JSON.stringify(materialOverrides)};
    try {
      if(!isSaved){
        const savedData = await saveSelectedOptions(payload);
        setIsSaved(true);
        setSavedOptionId(savedData.id);
        setIsSaveModalOpen(false);
        alert('성공적으로 저장되었습니다!');
      } else {
        alert('이미 저장되었습니다.');
      }

    } catch (error) {
      alert('저장에 실패했습니다.');
    }
  };

  const handlePartsDiscovered = useCallback((parts: CustomizablePart[]) => {
    setCustomizableParts(parts);
    
    // 파츠 목록을 받으면, 각 파츠의 기본 재질 값을 materialOverrides 상태에 초기화해줍니다.
    const initialOverrides: MaterialOverrides = {};
    parts.forEach(part => {
      initialOverrides[part.displayName] = { // UI에 표시될 displayName을 key로 사용
        color: '#ffffff', // 기본 색상: 흰색
        metalness: 0.5,    // 기본 금속성
        roughness: 0.5,    // 기본 거칠기
      };
    });
    setMaterialOverrides(initialOverrides);

  }, []);
 const handleMaterialChange = useCallback((
  partDisplayName: string, 
  property: keyof MaterialProperties, 
  value: string | number
) => {
    setMaterialOverrides(prevOverrides => ({
      ...prevOverrides,
      [partDisplayName]: {
        ...prevOverrides[partDisplayName], // 기존 해당 파츠의 다른 속성값은 유지
        [property]: value, // 변경된 속성만 업데이트
      }
    }));
  }, []);


  if (!productInfo) {
    return <div>로딩 중...</div>;
  }
  
  return (
    <div className={styles.pageContainer}>
      <section className={styles.viewerSection}>
        <ThreeJsViewer 
          productInfo={productInfo}
          onPartsDiscovered={handlePartsDiscovered} // ✅ [수정] 콜백 함수 전달
          materialOverrides={materialOverrides} // ✅ [추가] 실시간 재질 변경을 위해 상태 전달
        />
      </section>
      <section className={styles.selectorSection}>

        <SubOptionPanel 
          basePrice={productInfo.basePrice}
          totalPrice={totalPrice} 
          customParts={customizableParts}
          materialOverrides={materialOverrides}
          onMaterialChange={handleMaterialChange}
          onSave={() => setIsSaveModalOpen(true)} 
          onBuy={handlePurchaseClick}   
        />

        {/* 이름 입력 모달 (단순 저장용) */}
      <Modal isOpen={isSaveModalOpen} onClose={() => setIsSaveModalOpen(false)}>
        <div className={styles.saveModalContent}>
          <h2>이름을 정해주세요</h2>
          
          <input 
            type="text" 
            className={styles.saveNameInput}
            value={saveName} 
            onChange={(e) => setSaveName(e.target.value)} 
            placeholder="나만의 몬스터"
          />
          
          <div className={styles.modalButtonContainer}>
            <button className={`${styles.modalButton} ${styles.primary}`} onClick={handleSaveAndProceedToDelivery}>
              저장 후 구매하기
            </button> 
            <button className={styles.modalButton} onClick={handleConfirmSaveOnly}>
              저장만 하기
            </button>
            <button className={`${styles.modalButton} ${styles.secondary}`} onClick={() => setIsSaveModalOpen(false)}>
              취소
            </button>
          </div>
        </div>
      </Modal>
        
        {/* 배송 정보 입력 모달 */}
        <DeliveryInfoModal
          isOpen={isDeliveryModalOpen}
          onClose={() => setIsDeliveryModalOpen(false)}
          onSubmit={handleFinalSubmit}
        />
      </section>
    </div>
  );
};

export default ProductDetailPage;