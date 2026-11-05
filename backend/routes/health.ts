import { Router, Request, Response } from 'express';
import { envConfig } from '../config/env.js';

export const healthRouter = Router();

healthRouter.get('/', (_req: Request, res: Response) => {
  res.json({
    status: 'online',
    platform: 'SULY AI',
    model: 'gemini-3.8-flash',
    hasKey: envConfig.hasGeminiKey,
    time: new Date().toISOString(),
  });
});
