import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './SavedOptions.module.css';
import { type FrontEndCategory } from '../../../types/productDetail';

/**
 * [재사용] 기존에 만들어둔 SubOptionItem 컴포넌트를 그대로 가져온다!
 * 경로가 다를 수 있으니, 형의 프로젝트 구조에 맞게 수정해줘.
 */
import SubOptionItem from '../../../components/productDetail/SubOptionItem';

interface SavedOption {
  id: number;
  saveName: string;
  productName: string;
  savedAt: string;
  materialOverrides: string; // JSON 문자열
}

// ✅ [추가] JSON을 파싱한 뒤의 객체 타입을 위한 정의
interface MaterialInfo {
  color: string;
  metalness: number;
  roughness: number;
}

// ✅ [추가] 파싱된 재질 정보를 보여주기 위한 헬퍼 컴포넌트
const MaterialDisplay = ({ materialJson }: { materialJson: string }) => {
  try {
    const materials: Record<string, MaterialInfo> = JSON.parse(materialJson);
    
    // JSON 객체를 [key, value] 배열로 변환하여 렌더링
    return (
      <ul className={styles.materialList}>
        {Object.entries(materials).map(([partName, materialInfo]) => (
          <li key={partName} className={styles.materialItem}>
            <span className={styles.partName}>{partName}:</span>
            {/* 색상 견본 */}
            <div 
              className={styles.colorSwatch} 
              style={{ backgroundColor: materialInfo.color }}
            ></div>
            {/* 색상 코드 텍스트 */}
            <span className={styles.colorCode}>{materialInfo.color.toUpperCase()}</span>
          </li>
        ))}
      </ul>
    );
  } catch (e) {
    // 혹시 모를 JSON 파싱 에러 처리
    console.error("Material JSON 파싱 에러:", e);
    return <span style={{ color: 'red' }}>옵션 정보를 표시할 수 없습니다.</span>;
  }
};

const SavedOptions = () => {
  // 상태 변수 선언
  const [savedOptions, setSavedOptions] = useState<SavedOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 데이터 로딩을 위한 useEffect
  useEffect(() => {
    const fetchSavedOptions = async () => {
      try {
        const response = await axios.get<SavedOption[]>('/api/mypage/saved-options');
        setSavedOptions(response.data);
      } catch (err) {
        setError('저장된 옵션을 불러오는 데 실패했습니다.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSavedOptions();
  }, []); // 처음 렌더링 시 한 번만 실행

  
  /**
   * [핵심] 삭제 버튼 클릭 시 실행될 함수
   */
  const handleDelete = async (id: number) => {
    // 사용자에게 한번 더 확인받는 절차 (실수 방지)
    if (!window.confirm('정말로 이 항목을 삭제하시겠습니까?')) {
      return;
    }

    try {
      await axios.delete(`/api/mypage/saved-options/${id}`);
      
      // 삭제 성공 시, 화면에서도 해당 항목을 바로 제거 (페이지 새로고침 없이!)
      setSavedOptions(prevOptions => prevOptions.filter(option => option.id !== id));
      alert('성공적으로 삭제되었습니다.');

    } catch (err) {
      alert('삭제에 실패했습니다. 다시 시도해주세요.');
      console.error(err);
    }
  };


  // 로딩 및 에러 상태 처리

  if (loading) return <div className={styles.container}>로딩 중...</div>;
  if (error) return <div className={styles.container}>{error}</div>;

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>저장된 옵션 목록</h1>
      
      {savedOptions.length === 0 ? (
        <p className={styles.noData}>저장된 옵션이 없습니다.</p>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.colSaveName}>저장 이름</th>
              <th className={styles.colProduct}>적용 상품</th>
              <th className={styles.colDate}>저장 일시</th>
              <th className={styles.colOptions}>커스텀 정보</th>
              <th className={styles.colActions}>관리</th>
            </tr>
          </thead>
          <tbody>
            {savedOptions.map((item) => (
              <tr key={item.id}>
                <td>{item.saveName}</td>
                <td>{item.productName}</td>
                <td>{new Date(item.savedAt).toLocaleDateString()}</td>
                <td>
                  {/* ✅✅✅ [핵심] 헬퍼 컴포넌트를 사용하여 재질 정보 렌더링 */}
                  <MaterialDisplay materialJson={item.materialOverrides} />
                </td>
                <td style={{ textAlign: 'center' }}>
                  <button onClick={() => handleDelete(item.id)} className={styles.deleteButton}>
                    삭제
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default SavedOptions;