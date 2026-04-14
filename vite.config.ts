import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const repositoryName =
  process.env.GITHUB_REPOSITORY?.split('/')[1] ?? 'maps-react-demo'

const base = process.env.GITHUB_ACTIONS === 'true' ? `/${repositoryName}/` : '/'

// https://vite.dev/config/
export default defineConfig({
  base,
  plugins: [react()],
})
