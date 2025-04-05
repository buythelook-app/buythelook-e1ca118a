import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => ({
  server: {
    host: "0.0.0.0",
    port: 8080,
    proxy: {
      '/api/replicate': {
        target: 'https://api.replicate.com/v1',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/replicate/, ''),
      },
    },
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      external: [
        '@capacitor/app',
        '@capacitor/core',
        '@capacitor/splash-screen',
        '@capacitor/status-bar',
        '@capacitor/haptics',
        '@capacitor/keyboard',
        '@capacitor/preferences',
        '@capacitor/share',
        '@capacitor/camera',
        '@capacitor/browser',
        '@capacitor/network',
        '@capacitor/push-notifications',
        '@capacitor/device',
        '@capacitor/toast',
        '@capacitor/dialog',
        '@capacitor/filesystem'
      ]
    }
  }
}));
