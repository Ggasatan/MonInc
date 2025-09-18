import React, { useState, useEffect, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './style.module.css';
import Modal from '../../components/Modal';
import GameCanvas from '../../components/game/GameCanvas';
import axios from 'axios';

// API 응답 데이터 타입 (+ 기본 캐릭터를 위한 materialOverrides는 null일 수 있음)
interface SavedOption {
  id: number;
  saveName: string;
  modelUrl: string;
  materialOverrides: string | null; 
}

const GamePage = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [savedOptions, setSavedOptions] = useState<SavedOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // ✅ [수정] selectedModel 상태를 제거하고, selectedOption 하나로만 상태를 관리합니다.
  const [selectedOption, setSelectedOption] = useState<SavedOption | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');

    const initializeGame = async () => {
      const defaultCharacter: SavedOption = {
        id: 0, // 고유한 ID
        saveName: "기본 캐릭터 (Default)",
        modelUrl: "/models/white_Ghost.glb", 
        materialOverrides: null, 
      };

      if (!token) {
        // 비회원일 경우
        setSelectedOption(defaultCharacter);
        setIsLoading(false);
        setIsModalOpen(false);
        return;
      }

      // 회원일 경우
      setIsModalOpen(true);
      try {
        // ✅ [수정] 형이 사용하시는 API 경로로 수정했습니다.
        const response = await axios.get<SavedOption[]>('/api/products/me/saved-options');
        const savedList = response.data;
        
        const finalOptions = [defaultCharacter, ...savedList];
        setSavedOptions(finalOptions);
        
        // ✅ [수정] 첫 번째 옵션 '객체'를 기본 선택값으로 설정합니다.
        setSelectedOption(finalOptions[0]);

      } catch (error) {
        console.error("저장된 옵션을 불러오는데 실패했습니다.", error);
        setSavedOptions([defaultCharacter]);
        setSelectedOption(defaultCharacter);
      } finally {
        setIsLoading(false);
      }
    };

    initializeGame();
  }, [navigate]);

  // ✅ [제거] 불필요한 핸들러와 디버깅용 useEffect를 모두 제거하여 코드를 깔끔하게 정리했습니다.

  const handleConfirm = () => {
    // ✅ [수정] selectedOption 유무를 확인합니다.
    if (!selectedOption) {
      alert("캐릭터를 선택해주세요!");
      return;
    }
    setIsModalOpen(false);
  };

  const handleRefresh = () => { window.location.reload(); };
  const handleExit = () => { navigate(-1); };

  return (
    <div className={styles.pageContainer}>
      {/* ✅ [수정] selectedOption이 있을 때만 렌더링하고, props를 올바르게 전달합니다. */}
      {!isModalOpen && selectedOption && (
        <GameCanvas 
          modelUrl={selectedOption.modelUrl} 
          materialOverrides={selectedOption.materialOverrides}
        />
      )}

      {/* ✅ [수정] 모달의 onClose는 handleExit을 직접 호출하도록 변경하여, X 버튼으로도 나갈 수 있게 합니다. */}
      <Modal isOpen={isModalOpen} onClose={handleExit}>
        <div className={styles.gameModalContent}> 
          <h2>캐릭터 선택</h2>
          <p className={styles.modalSubtitle}>플레이할 캐릭터를 선택해주세요.</p>
          
          {isLoading ? (
            <div className={styles.loadingSpinner}></div>
          ) : (
            <div className={styles.dropdownContainer}>
              <select
                className={styles.dropdown}
                // ✅ [핵심 수정 1] value는 선택된 옵션의 고유 ID와 연결합니다.
                value={selectedOption ? selectedOption.id : ''}
                // ✅ [핵심 수정 2] onChange 시, 선택된 ID로 옵션 배열에서 해당 객체를 찾아 상태를 업데이트합니다.
                onChange={(e) => {
                  const selectedId = Number(e.target.value);
                  const newSelection = savedOptions.find(opt => opt.id === selectedId);
                  if (newSelection) {
                    setSelectedOption(newSelection);
                  }
                }}
              >
                {savedOptions.map(option => (
                  // ✅ [핵심 수정 3] option의 value는 항상 고유한 값인 'id'를 사용해야 합니다.
                  <option key={option.id} value={option.id}>
                    {option.saveName}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className={styles.modalButtonContainer}>
            <button 
              className={styles.modalButton} 
              onClick={handleConfirm} 
              disabled={isLoading || !selectedOption}
            >
              선택 완료
            </button>
          </div>
        </div>
      </Modal>
       {!isModalOpen && !isLoading && (
        <div className={styles.controlsContainer}>
          <img 
            className={styles.controlsImage} 
            src="/images/controls.png" // public 폴더에 있는 이미지 경로
            alt="조작키 안내" 
          />
          <p className={styles.controlsText}>
            마우스 커서를 사용하시려면 ESC를 누르세요
          </p>
        </div>
      )}
      <div className={styles.topRightButtons}>
        <button className={styles.gameButton} onClick={handleRefresh}>새로고침</button>
        <button className={`${styles.gameButton} ${styles.secondary}`}  onClick={handleExit}>나가기</button>
      </div>
    </div>
  );
};

export default memo(GamePage);