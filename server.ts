import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = parseInt(process.env.PORT || '3000', 10);

app.use(express.json({ limit: '15mb' }));

const SULY_DEFAULT_SYSTEM_INSTRUCTION = `أنت SULY AI، الرفيق والمنصة الذكية الفاخرة فائقة الأداء والمصداقية.
هويتك ولغتك:
- فصحى راقية، بليغة، واثقة، ومباشرة بدون حشو إنشائي ولا اعتذارات مصطنعة.
- عند تقديم الأكواد (Python, JavaScript, HTML, TypeScript, etc.)، اكتب كوداً نظيفاً، حديثاً، متكاملاً وقابلاً للتشغيل فوراً.
- نسق إجاباتك بتنسيق Markdown احترافي، بعناوين واضحة وجداول وقوائم إذا لزم الأمر، لتكون ملائمة للتقارير والطباعة.
- إذا كان السؤال بالإنجليزية، أجب بأسلوب إنجليزي تقني رفيع (Executive & Crisp) مع الحفاظ على ذات الوقار والثقة.
- استند دائماً إلى تفضيلات المستخدم المحفوظة في الذاكرة وسياق المشروع المرفق.`;

// Initialize GoogleGenAI client (Server-side only)
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Health check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'online',
    platform: 'SULY AI',
    model: 'gemini-3.8-flash',
    hasKey: Boolean(process.env.GEMINI_API_KEY),
    time: new Date().toISOString(),
  });
});

// Streaming Chat API (Server-Sent Events)
app.post('/api/chat/stream', async (req, res) => {
  const { messages, memories = [], projectContext = '', customInstruction = '' } = req.body;

  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'Messages array is required' });
  }

  // Construct comprehensive system instruction including cumulative memory and project context
  let fullSystemInstruction = SULY_DEFAULT_SYSTEM_INSTRUCTION;
  if (customInstruction) {
    fullSystemInstruction += `\n\nتوجيهات إضافية:\n${customInstruction}`;
  }

  if (Array.isArray(memories) && memories.length > 0) {
    fullSystemInstruction += `\n\nالذاكرة التراكمية الذكية للمستخدم (تفضيلات راسخة):\n${memories.map((m: string, i: number) => `${i + 1}. ${m}`).join('\n')}`;
  }

  if (projectContext && typeof projectContext === 'string' && projectContext.trim().length > 0) {
    fullSystemInstruction += `\n\nمستندات وسياق المشروع الحالي النشط (قاعدة المعرفة):\n${projectContext.slice(0, 25000)}`;
  }

  // Set SSE Headers
  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  try {
    // Format conversation history for Gemini
    // Convert previous messages to contents structure or pass user prompt with context
    // In @google/genai, ai.chats or generateContentStream can be used.
    // Let's format contents list with valid roles ('user' and 'model')
    const contents = messages.map((msg: { role: string; content: string }) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    }));

    const responseStream = await ai.models.generateContentStream({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        systemInstruction: fullSystemInstruction,
      },
    });

    for await (const chunk of responseStream) {
      const text = chunk.text || '';
      if (text) {
        res.write(`data: ${JSON.stringify({ text })}\n\n`);
      }
    }

    res.write(`data: [DONE]\n\n`);
    res.end();
  } catch (err: unknown) {
    console.error('Error in /api/chat/stream:', err);
    const errorMessage = err instanceof Error ? err.message : 'حدث خطأ أثناء معالجة الطلب في خادم SULY AI';
    res.write(`data: ${JSON.stringify({ error: errorMessage })}\n\n`);
    res.write(`data: [DONE]\n\n`);
    res.end();
  }
});

// Non-streaming chat endpoint
app.post('/api/chat', async (req, res) => {
  const { messages, memories = [], projectContext = '' } = req.body;

  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'Messages array is required' });
  }

  let fullSystemInstruction = SULY_DEFAULT_SYSTEM_INSTRUCTION;
  if (Array.isArray(memories) && memories.length > 0) {
    fullSystemInstruction += `\n\nالذاكرة التراكمية الذكية للمستخدم:\n${memories.join('\n')}`;
  }
  if (projectContext) {
    fullSystemInstruction += `\n\nمستندات المشروع:\n${projectContext.slice(0, 25000)}`;
  }

  try {
    const contents = messages.map((msg: { role: string; content: string }) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    }));

    const result = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        systemInstruction: fullSystemInstruction,
      },
    });

    res.json({ text: result.text || '' });
  } catch (err: unknown) {
    console.error('Error in /api/chat:', err);
    res.status(500).json({
      error: err instanceof Error ? err.message : 'Error generating content',
    });
  }
});

// Setup Vite dev server or static production files
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true, hmr: process.env.DISABLE_HMR !== 'true' },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`✦ SULY AI Platform running at http://localhost:${port} [Model: gemini-3.8-flash]`);
  });
}

startServer();
