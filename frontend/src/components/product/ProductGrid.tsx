import React from 'react';
import { type Product } from '../../types/product'; // 방금 만든 타입을 가져와
import { Link } from 'react-router-dom'; // [추가] 라우팅을 위한 Link 컴포넌트 import
import styles from './ProductGrid.module.css';


import ProductModelViewer from './ProductModelViewer';


// ProductItem 컴포넌트가 받을 props의 타입을 정의
interface ProductItemProps {
  product: Product;
}

const ProductItem = ({ product }: ProductItemProps) => {
  return (
    <div className={styles.itemContainer}>
      {/* 1. 왼쪽: 이미지 영역 */}
      <div className={styles.imageWrapper}>
        <ProductModelViewer modelUrl={product.modelUrl} />
      </div>

      {/* [추가] 2. 오른쪽: 모든 텍스트 정보를 감싸는 컨테이너 */}
      <div className={styles.infoWrapper}>
        <h2 className={styles.productName}>{product.name}</h2>
        <p className={styles.productStatus}>{product.status}</p>
        <p className={styles.productDetails}>크기 :  {product.monWidth}X{product.monHigh}</p>
        <p className={styles.productPrice}>기본 가격 : {product.basePrice.toLocaleString()}~</p>
        
        {product.isCustom && ( // isCustom이 true일 때만 버튼과 링크가 보이도록
        <Link to={`/product/${product.id}`}>
          <button className={styles.customButton}>custom</button>
        </Link>
      )}
      </div>
    </div>
  );
};

export default ProductItem;