import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom' // 💥 여기서 import!
import App from './App'
import './index.css' // 또는 App.css 등 전역 CSS

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/* 💥 App 전체를 BrowserRouter로 감싸준다! */}
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)