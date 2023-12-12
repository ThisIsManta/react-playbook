import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// See https://vitejs.dev/config/
export default defineConfig({
	root: 'src',
	build: {
		assetsDir: './',
	},
	server: {
		open: true
	},
	plugins: [react()]
})
