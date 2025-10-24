import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  base: '/',
  css: {
    postcss: './postcss.config.js',
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  build: {
    outDir: 'dist',
    // 确保资源使用相对路径
    assetsDir: 'assets',
    // 生成相对路径的资源引用
    rollupOptions: {
      output: {
        // 确保所有资源都使用相对路径
        assetFileNames: 'assets/[name]-[hash][extname]',
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        // 优化代码分割
        manualChunks: {
          vendor: ['vue'],
          utils: ['dayjs', 'marked', '@vueuse/core']
        }
      }
    },
    // 优化构建
    minify: 'esbuild',
    sourcemap: false
  },
  server: {
    port: 3000,
    open: true
  }
})