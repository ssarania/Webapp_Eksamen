import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from "@tailwindcss/vite"
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
	plugins: [react(), tailwindcss()],
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
		},
	},

	// Proxy API requests to the backend during development
	server: {
		proxy: {
			'/api': {
				target: 'http://localhost:5093',
				changeOrigin: true,
				secure: false,
			},
			'/auth': {
				target: 'http://localhost:5093',
				changeOrigin: true,
				secure: false,
			},
		},
	},
})
