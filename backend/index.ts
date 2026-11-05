import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import { app } from './app.js';
import { envConfig } from './config/env.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

export async function startServer() {
  if (envConfig.nodeEnv === 'production') {
    // Serve pre-built static assets
    app.use(express.static(path.join(rootDir, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(rootDir, 'dist', 'index.html'));
    });
  } else {
    // Vite middleware for development (React SPA + /design-prototype)
    const { createServer } = await import('vite');
    const vite = await createServer({
      root: rootDir,
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  const server = app.listen(envConfig.port, envConfig.host, () => {
    console.log(`✦ SULY AI Platform running at http://${envConfig.host}:${envConfig.port} [Model: gemini-3.8-flash]`);
  });

  return server;
}

// Start server if executed directly
if (process.env.NODE_ENV !== 'test') {
  startServer().catch((err) => {
    console.error('Fatal error starting SULY AI server:', err);
    process.exit(1);
  });
}
