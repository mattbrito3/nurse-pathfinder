import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    strictPort: true, // Não incrementar porta se 8080 estiver ocupada
    open: false, // Não abrir browser automaticamente
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
    // Otimizações de build
    rollupOptions: {
      output: {
        manualChunks: {
          // Separar vendor chunks
          'react-vendor': ['react', 'react-dom'],
          'router-vendor': ['react-router-dom'],
          'ui-vendor': ['@radix-ui/react-select', '@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
          'query-vendor': ['@tanstack/react-query'],
          'supabase-vendor': ['@supabase/supabase-js'],
          'utils': ['lucide-react', 'sonner', 'clsx', 'tailwind-merge'],
        },
      },
    },
    // Otimizar tamanho do chunk
    chunkSizeWarningLimit: 300,
    // Minificar agressivamente em produção
    minify: mode === 'production' ? 'terser' : false,
    terserOptions: mode === 'production' ? {
      compress: {
        drop_console: true, // Remove console.logs em produção
        drop_debugger: true,
      },
    } : undefined,
  },
  // Otimizações de dependências
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@tanstack/react-query',
      '@supabase/supabase-js',
    ],
  },
}));
