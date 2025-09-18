import React from 'react';
import styles from './style.module.css';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const Modal = ({ isOpen, onClose, children }: ModalProps) => {
  if (!isOpen) return null;

  return (
    // 모달 오버레이 (뒷배경 어둡게)
    <div className={styles.overlay} onClick={onClose}>
      {/* 모달 컨텐츠 (뒷배경 클릭 시 닫히는 걸 방지) */}
      <div className={styles.content} onClick={(e) => e.stopPropagation()}>
        {children}
        <button className={styles.closeButton} onClick={onClose}>&times;</button>
      </div>
    </div>
  );
};

export default Modal;