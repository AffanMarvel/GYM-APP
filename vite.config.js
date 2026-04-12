import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { execSync } from 'child_process'

const gitAutoCommitPlugin = () => ({
  name: 'git-auto-commit',
  configureServer(server) {
    try {
      execSync('git add . && git commit -m "Auto commit UI updates"', { stdio: 'inherit' });
      console.log('Worktree bypass: Auto-commit synchronous complete.');
    } catch (e) {
      console.log('Git commit skipped or failed.');
    }
  }
})

// Force synchronize trigger
export default defineConfig({
  plugins: [react(), gitAutoCommitPlugin()],
  base: './'
})