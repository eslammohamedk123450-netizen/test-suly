import express, { Express, Request, Response, NextFunction } from 'express';
import { healthRouter } from './routes/health.js';
import { chatRouter } from './routes/chat.js';

export function createApp(): Express {
  const app = express();

  // JSON payload parser with existing 15mb limit
  app.use(express.json({ limit: '15mb' }));

  // Safe request logging middleware: does NOT log headers, user messages, files, or sensitive payloads
  app.use((req: Request, _res: Response, next: NextFunction) => {
    // Only log method and path without query secrets or bodies
    if (process.env.NODE_ENV !== 'test') {
      const sanitizedPath = req.path;
      console.log(`[API] ${req.method} ${sanitizedPath}`);
    }
    next();
  });

  // API Route registrations
  app.use('/api/health', healthRouter);
  app.use('/api/chat', chatRouter);

  return app;
}

export const app = createApp();
