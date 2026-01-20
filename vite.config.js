import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // GitHub Pages는 https://<user>.github.io/<repo>/ 형태로 서빙되므로 base 경로가 필요합니다.
  base: '/dart/',
})
