import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// See https://vitejs.dev/config/
export default defineConfig({
	root: 'src',
	server:{
		open:true
	},
	plugins: [react()]
})
