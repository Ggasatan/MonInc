import React, { useState, useEffect } from 'react';
import ProductItem from '../../components/product/ProductGrid';
import { type Product } from '../../types/product';
import styles from './style.module.css'
import { fetchProducts } from '../../api/productApi';

const ProductListPage = () => {
  // 상품 목록 데이터를 '상태'로 관리. 초기값으로 mockProducts를 사용.
  const [products, setProducts] = useState<Product[]>([]);

  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // API를 호출하는 비동기 함수를 정의
    const loadProducts = async () => {
      setIsLoading(true); // 데이터 로딩 시작
      const productsFromApi = await fetchProducts();

      // ✅ 4. API에서 받은 데이터에 isCustom 필드를 추가하는 '가공' 단계
      const transformedProducts = productsFromApi.map(product => ({
        ...product, // 기존 product 데이터는 그대로 복사하고
        // 👇👇👇 여기가 바로 형이 정해줘야 할 'isCustom 규칙'이 들어갈 자리!
        isCustom: product.status !== 'DISCONTINUED', // 👈 지금은 임시로 모두 true로 설정.
      }));
      
      setProducts(transformedProducts); // 가공된 데이터로 상태 업데이트
      setIsLoading(false); // 데이터 로딩 완료
    };

    loadProducts(); // 함수 실행
  }, []); // 의존성 배열을 비워두면, 컴포넌트가 마운트될 때 한 번만 실행됨

  // 로딩 중일 때 보여줄 UI
  if (isLoading) {
    return <div className={styles.pageContainer}><h1>로딩 중...</h1></div>;
  }

  return (
    <div className={styles.pageContainer}>
      <h1 className={styles.title}>상품 목록</h1>
      {/* [수정] 상품 목록을 감싸는 div에 그리드 스타일 적용 */}
      <div className={styles.productListGrid}>
        {products.map((product) => (
          <ProductItem key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
};

export default ProductListPage;