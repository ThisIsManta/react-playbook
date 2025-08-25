import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import packageJSON from '../package.json' with { type: 'json' }

export default defineConfig({
	// Support GitHub Pages
	base: '/' + packageJSON.repository.url.split('/').slice(-1)[0].replace(/\.git$/, ''),

	build: {
		assetsDir: './',
		minify: false,
	},

	server: {
		open: true
	},

	plugins: [react()],
})
