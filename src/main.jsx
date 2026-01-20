import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './styles/App.css'

try {
  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  )
} catch (error) {
  console.error('앱 초기화 오류:', error);
  document.getElementById('root').innerHTML = `
    <div style="padding: 20px; color: red;">
      <h2>오류가 발생했습니다</h2>
      <p>${error.message}</p>
      <p>브라우저 콘솔을 확인하세요 (F12)</p>
    </div>
  `;
}
