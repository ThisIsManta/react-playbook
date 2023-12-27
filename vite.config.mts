import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { repository } from './package.json'

// See https://vitejs.dev/config/
export default defineConfig({
	root: 'src',

	// Support GitHub Pages
	base: '/' + repository.url.split('/').slice(-1)[0].replace(/\.git$/, ''),
	build: {
		assetsDir: './',
	},

	server: {
		open: true
	},

	plugins: [react()]
})
