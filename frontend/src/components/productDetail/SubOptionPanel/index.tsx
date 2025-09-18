import React, {useEffect, useState} from 'react';
import styles from './style.module.css';
import {type CustomizablePart, type MaterialOverrides, type MaterialProperties } from '../../../types/productDetail';

interface SubOptionPanelProps {
  basePrice: number;
  totalPrice: number;
  customParts: CustomizablePart[];
  materialOverrides: MaterialOverrides;
  onMaterialChange: (partDisplayName: string, property: keyof MaterialProperties, value: string | number) => void;
  onSave: () => void;
  onBuy: () => void;
}

const SubOptionPanel = ({ 
  customParts,
  materialOverrides,
  onMaterialChange,
  onSave,
  onBuy,
}: SubOptionPanelProps) => {

  // ✅ [구조 변경] 이 컴포넌트는 더 이상 필터링을 하지 않음!
  // useMemo와 복잡한 필터링 로직 모두 삭제!
  // ✅ [추가] 현재 어떤 파츠를 편집하고 있는지 기억할 상태
  const [selectedPart, setSelectedPart] = useState<CustomizablePart | null>(null);

  // ✅ [추가] 파츠를 처음 로드했을 때, 첫 번째 파츠를 자동으로 선택해주는 로직
  // 사용자가 아무것도 선택하지 않은 빈 화면을 보지 않도록 하는 UX 개선입니다.
  useEffect(() => {
    if (customParts.length > 0 && !selectedPart) {
      setSelectedPart(customParts[0]);
    }
  }, [customParts, selectedPart]);

  // 선택된 파츠의 현재 재질 값을 가져오는 헬퍼 변수. 코드를 깔끔하게 만들어줍니다.
  const currentMaterial = selectedPart ? materialOverrides[selectedPart.displayName] : null;
  return (
    // ✅ [수정] isOpen, onClose 관련 로직을 제거하고 항상 열려있는 상태로 만듭니다.
    <div className={`${styles.panelContainer} ${styles.open}`}>
      <div className={styles.panelHeader}>
        <h3 className={styles.panelTitle}>커스터마이저</h3>
      </div>

      {/* === 새로운 UI가 들어갈 메인 컨텐츠 영역 === */}
      <div className={styles.contentArea}>
        {/* 1. 파츠 선택 버튼 목록 */}
        <div className={styles.partSelector}>
          {customParts.map((part) => (
            <button 
              key={part.meshName}
              className={`${styles.partButton} ${selectedPart?.meshName === part.meshName ? styles.active : ''}`}
              onClick={() => setSelectedPart(part)}
            >
              {part.displayName}
            </button>
          ))}
        </div>

        {/* 2. 재질 편집 컨트롤 (선택된 파츠가 있을 때만 보임) */}
        {selectedPart && currentMaterial && (
          <div className={styles.materialEditor}>
            <div className={styles.editorRow}>
              <label htmlFor="colorPicker">색상</label>
              <input 
                type="color" 
                id="colorPicker"
                value={currentMaterial.color}
                onChange={(e) => onMaterialChange(selectedPart.displayName, 'color', e.target.value)}
              />
            </div>
            <div className={styles.editorRow}>
              <label htmlFor="metalnessSlider">금속성</label>
              <input 
                type="range" 
                id="metalnessSlider"
                min="0" max="1" step="0.01"
                value={currentMaterial.metalness}
                onChange={(e) => onMaterialChange(selectedPart.displayName, 'metalness', parseFloat(e.target.value))}
              />
            </div>
            <div className={styles.editorRow}>
              <label htmlFor="roughnessSlider">거칠기</label>
              <input 
                type="range" 
                id="roughnessSlider"
                min="0" max="1" step="0.01"
                value={currentMaterial.roughness}
                onChange={(e) => onMaterialChange(selectedPart.displayName, 'roughness', parseFloat(e.target.value))}
              />
            </div>
          </div>
        )}
      </div>
      
      {/* 3. 가격 표시 (기존과 동일) */}
      <div className={styles.totalPriceSection}>
        {/* ... 가격 표시 JSX ... */}
      </div>

      {/* 4. 저장 및 구매 버튼 (MainOptionBar에서 이식) */}
      <div className={styles.actionButtonsSection}>
        <button className={styles.actionButton} onClick={onSave}>
          저장하기
        </button>
        <button className={styles.actionButton} onClick={onBuy}>
          바로구매
        </button>
      </div>
    </div>
  );
};
export default SubOptionPanel;