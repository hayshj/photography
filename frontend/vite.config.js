import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

function minioPreconnect(publicBaseUrl) {
  if (!publicBaseUrl) return null

  const publicOrigin = new URL(publicBaseUrl).origin
  return {
    name: 'minio-preconnect',
    transformIndexHtml() {
      return [{
        tag: 'link',
        attrs: { rel: 'preconnect', href: publicOrigin, crossorigin: '' },
        injectTo: 'head-prepend',
      }]
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, projectRoot, '')
  const minioPublicBaseUrl = globalThis.process?.env?.MINIO_PUBLIC_BASE_URL || env.MINIO_PUBLIC_BASE_URL || ''
  const imageAssetVersion = globalThis.process?.env?.MINIO_IMAGE_VERSION || env.MINIO_IMAGE_VERSION || '1'

  return {
    define: {
      // Only public image settings are included in browser code.
      __MINIO_PUBLIC_BASE_URL__: JSON.stringify(minioPublicBaseUrl),
      __IMAGE_ASSET_VERSION__: JSON.stringify(imageAssetVersion),
    },
    plugins: [minioPreconnect(minioPublicBaseUrl), tailwindcss(), react()].filter(Boolean),
    server: {
      proxy: {
        '/api': 'http://localhost:3000',
      },
    },
  }
})
