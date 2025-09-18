import React from 'react';
import styles from './style.module.css';
import { type ProductOption } from '../../../types/product';
import { type UserSelections, type FrontEndCategory} from '../../../types/productDetail';

interface MainOptionBarProps {
  activeCategory: FrontEndCategory | null;
  setActiveCategory: React.Dispatch<React.SetStateAction<FrontEndCategory | null>>;
  filteredOptions: ProductOption[];
  currentSelections: UserSelections;
  onOptionSelect: (category: FrontEndCategory, optionId: number) => void;
  categoryMap: { [key in FrontEndCategory]: { dtoKey: keyof UserSelections; filterKey: string; } };
  onSave: () => void;
  onBuy: () => void;
}

const MainOptionBar = ({ 
  activeCategory,
  setActiveCategory,
  categoryMap,
  onSave,
  onBuy
}: MainOptionBarProps) => {
  if (!categoryMap) {
    return null; // 또는 <p>Loading options...</p> 같은 로딩 UI
  }

  const MAIN_OPTIONS = Object.keys(categoryMap) as FrontEndCategory[];
  
  // ✅ [구조 변경] 이제 더 이상 자기 자신의 상태를 가질 필요가 없음!
  const handleIconClick = (category: FrontEndCategory) => {
    // 부모에게 받은 '리모컨'으로 부모의 상태를 직접 변경
    setActiveCategory(prev => (prev === category ? null : category));
  };

  return (
        // '흰색 막대기' 전체를 감싸는 div
        <div className={styles.mainOptionBar}>
      <div className={styles.optionIcons}>
        {MAIN_OPTIONS.map((cat) => ( <div key={cat} className={`${styles.optionIcon} ${activeCategory === cat ? styles.selected : ''}`} onClick={() => handleIconClick(cat)}> <div className={styles.iconPlaceholder}></div><span>{cat}</span></div> ))}
      </div>
      <div className={styles.actionIcons}>
        <div className={styles.actionIcon} onClick={onSave}><div className={styles.iconPlaceholder}></div><span>저장하기</span></div>
        <div className={styles.actionIcon} onClick={onBuy}><div className={styles.iconPlaceholder}></div><span>바로구매</span></div>
      </div>
    </div>
  );
};
export default MainOptionBar;