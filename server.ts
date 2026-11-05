import 'dotenv/config';
import express, { Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

app.use(express.json({ limit: '20mb' }));

// Initialize GoogleGenAI client
const apiKey = process.env.GEMINI_API_KEY || '';
let ai: GoogleGenAI | null = null;

if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Available SULY Models configuration
const SULY_MODELS = [
  {
    id: 'suly-pro',
    name: 'SULY Pro',
    description: 'General-purpose assistance for writing, coding, and analysis.',
    tag: 'Flagship',
    icon: 'sparkle',
    capabilities: ['Text generation', 'Code and writing assistance', 'File input'],
  },
  {
    id: 'suly-reasoning',
    name: 'SULY Reasoning',
    description: 'A reasoning-focused assistant for STEM, logic, and architecture topics.',
    tag: 'Reasoning',
    icon: 'brain',
    capabilities: ['Complex problem solving', 'Math and science assistance', 'Architecture discussion'],
  },
  {
    id: 'suly-fast',
    name: 'SULY Fast',
    description: 'A fast assistant for routine questions and everyday tasks.',
    tag: 'Fast',
    icon: 'zap',
    capabilities: ['Quick text responses', 'Everyday tasks', 'Code assistance'],
  },
  {
    id: 'suly-stem',
    name: 'SULY STEM',
    description: 'A focused assistant for math, algorithms, and STEM topics.',
    tag: 'STEM Reasoning',
    icon: 'cpu',
    capabilities: ['Math and STEM assistance', 'Algorithms', 'Logical problem solving'],
  },
];

const SULY_GEMINI_MODELS: Record<string, string> = {
  'suly-pro': process.env.SULY_PRO_MODEL || process.env.GEMINI_MODEL || 'gemini-2.5-pro',
  'suly-reasoning': process.env.SULY_REASONING_MODEL || 'gemini-2.5-pro',
  'suly-fast': process.env.SULY_FAST_MODEL || 'gemini-2.5-flash',
  'suly-stem': process.env.SULY_STEM_MODEL || 'gemini-2.5-flash',
};

app.get('/api/models', (_req: Request, res: Response) => {
  res.json({ models: SULY_MODELS });
});

// Stream chat completion endpoint
app.post('/api/chat', async (req: Request, res: Response) => {
  const { messages, model = 'suly-pro', webSearch = false, reasoning = false, customInstructions = '', memories = [], language = 'en' } = req.body;

  if (!Array.isArray(messages) || messages.length === 0) {
    res.status(400).json({ error: 'Messages array is required.' });
    return;
  }

  // Set SSE Headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  // Helper to send SSE event
  const sendEvent = (data: Record<string, unknown>) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  const isReasoning = reasoning || model === 'suly-reasoning' || model === 'suly-stem';

  // Prepare system instructions
  let systemInstruction = `You are SULY AI, a helpful assistant in this application. Do not claim to be trained by another provider or to be a different model.
You provide helpful, direct, articulate, insightful, and truthful answers with impeccable formatting.
Format your responses using Markdown: use headings, bold text, bulleted/numbered lists, tables, and backtick code blocks with explicit language tags (e.g. \`\`\`python, \`\`\`javascript, \`\`\`html) when providing code.
Respond naturally in the same language the user writes (e.g., Arabic if Arabic, English if English).`;
  if (isReasoning) {
    systemInstruction += '\n\nFor complex tasks, work through the problem carefully and provide a concise rationale or summary, without exposing hidden chain-of-thought.';
  }

  if (customInstructions && customInstructions.trim()) {
    systemInstruction += `\n\nUser Custom Instructions:\n${customInstructions}`;
  }

  if (Array.isArray(memories) && memories.length > 0) {
    systemInstruction += `\n\nSaved User Memory:\n${memories.map((m: any) => `- ${m.content || m}`).join('\n')}`;
  }

  if (!ai) {
    sendEvent({
      type: 'error',
      message: language === 'ar'
        ? 'خدمة الذكاء الاصطناعي غير مهيأة. أضف GEMINI_API_KEY إلى إعدادات الخادم.'
        : 'The AI service is not configured. Add GEMINI_API_KEY to the server environment.',
    });
    sendEvent({ type: 'done', finishReason: 'ERROR' });
    res.end();
    return;
  }

  const startTime = Date.now();


  try {
    // Format conversation history for Gemini
    const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }> }> = [];

    for (let i = 0; i < messages.length; i++) {
      const msg = messages[i];
      const role = msg.role === 'assistant' ? 'model' : 'user';
      const parts: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }> = [];

      // Check attachments
      if (Array.isArray(msg.attachments) && msg.attachments.length > 0) {
        for (const att of msg.attachments) {
          if (att.data && att.mimeType) {
            const base64Data = att.data.replace(/^data:[^;]+;base64,/, '');
            parts.push({
              inlineData: {
                mimeType: att.mimeType,
                data: base64Data,
              },
            });
          }
        }
      }

      if (msg.content) {
        parts.push({ text: msg.content });
      }

      if (parts.length > 0) {
        contents.push({ role, parts });
      }
    }

    // Configure tools
    const config: Record<string, unknown> = {
      systemInstruction,
    };

    if (webSearch) {
      config.tools = [{ googleSearch: {} }];
    }

    let fullResponseText = '';

    const geminiModel = SULY_GEMINI_MODELS[model] || process.env.GEMINI_MODEL || 'gemini-2.5-flash';
    const responseStream = await ai.models.generateContentStream({
      model: geminiModel,
      contents,
      config,
    });

    for await (const chunk of responseStream) {
      const text = chunk.text;
      if (text) {
        fullResponseText += text;
        sendEvent({ type: 'content', text });
      }
    }

    const durationMs = Date.now() - startTime;
    const tokenCount = Math.max(Math.round(fullResponseText.split(/\s+/).length * 1.3), 1);
    sendEvent({ type: 'metrics', tokens: tokenCount, durationMs });

    sendEvent({ type: 'done', finishReason: 'STOP' });
    res.end();
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error('Chat upstream notice:', errorMsg);

    sendEvent({
      type: 'error',
      message: language === 'ar'
        ? 'تعذر الحصول على رد من مزود الذكاء الاصطناعي. تحقق من اسم النموذج وإعدادات الخادم ثم أعد المحاولة.'
        : 'The AI provider could not complete this request. Check the configured model and server logs, then retry.',
    });
    sendEvent({ type: 'done', finishReason: 'ERROR' });
    res.end();
  }
});

// Setup Vite middleware in dev or static files in prod
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: process.env.DISABLE_HMR !== 'true' },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SULY App server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
