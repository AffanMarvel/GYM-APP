import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Removed gitAutoCommitPlugin — it was running 'git commit' on every dev start
// which could corrupt the git working tree during development.

export default defineConfig({
  plugins: [react()],
  base: './'
})