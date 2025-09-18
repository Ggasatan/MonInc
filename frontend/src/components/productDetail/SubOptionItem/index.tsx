import React from 'react';
import styles from './style.module.css';
import { type ProductOption } from '../../../types/product';
import { type UserSelections, type FrontEndCategory, type CategoryMapType } from '../../../types/productDetail';

interface SubOptionItemProps {
  option: ProductOption;
  category: FrontEndCategory; // ✅ 부모로부터 받는 category의 타입이 'string'이 아닌 'FrontEndCategory'임을 명시
  currentSelections?: UserSelections;
  onOptionSelect?: (category: FrontEndCategory, optionId: number) => void;
  categoryMap?: { [key in FrontEndCategory]: { dtoKey: keyof UserSelections; filterKey: string; } };
}

const SubOptionItem = ({ 
  option, 
  category,
  currentSelections,
  onOptionSelect,
  categoryMap,
}: SubOptionItemProps) => {

  const renderThumbnail = () => {
    // 이제 category는 'FrontEndCategory' 타입이므로 categoryMap[category]는 항상 안전함
    
    if (!categoryMap) {
      return <div className={styles.thumbnailPlaceholder} />;
    }
    const filterKey = categoryMap[category].filterKey;

    if (filterKey === 'SKIN' || filterKey.includes('ACCESSORIES')) {
      return <img src={option.optionThumbnail} alt={option.optionName} className={styles.thumbnailImage} />;
    }
    if (filterKey.includes('PARTS')) {
      return <div className={styles.thumbnailColorCircle} style={{ backgroundColor: option.optionThumbnail }} />;
    }
    return <div className={styles.thumbnailPlaceholder} />;
  };

  const isOutOfStock = option.stock === 0;

  // ✅ [핵심 수정] 이제 dtoKey는 'keyof UserSelections' 타입임이 보장됨

  
  // ✅ 에러가 사라짐!
  let isSelected = false; // 기본값은 false
    if (categoryMap && currentSelections) {
      const dtoKey = categoryMap[category].dtoKey;
      isSelected = currentSelections[dtoKey] === option.productId;
  }

  const itemClassName = `${styles.itemContainer} ${isOutOfStock ? styles.disabled : ''} ${isSelected ? styles.selected : ''}`;

  const handleClick = () => {
    if (isOutOfStock || !onOptionSelect) {
      return;
    }
    onOptionSelect(category, option.productId); 
  };

  return (
    <div className={itemClassName} onClick={handleClick}>
      {renderThumbnail()}
      <span className={styles.itemName}>{option.optionName}</span>
      <p className={styles.itemPrice}>+{option.optionPrice.toLocaleString()}원</p>
    </div>
  );
};

export default SubOptionItem;
