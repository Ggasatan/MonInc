import React from 'react';
import MainPageEffect from '../components/MainPageEffect';

const MainPage: React.FC = () => {
  // 💥 CSS import도, div로 감쌀 필요도 없이, 3D 효과 그 자체만 반환!
  return <MainPageEffect />;
};

export default MainPage;