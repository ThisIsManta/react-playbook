import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { repository } from './package.json'

// See https://vitejs.dev/config/
export default defineConfig({
	root: 'src',
	build: {
		// Support GitHub Pages
		assetsDir: repository.url.split('/').slice(-1)[0].replace(/\.git$/, ''),
	},
	server: {
		open: true
	},
	plugins: [react()]
})
