import { defineConfig } from 'vitest/config'

export default defineConfig({
	root: 'src',
	test: {
		environment: 'happy-dom'
	}
})