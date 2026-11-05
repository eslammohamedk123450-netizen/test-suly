import { Router, Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import { envConfig } from '../config/env.js';

export const chatRouter = Router();

export const SULY_DEFAULT_SYSTEM_INSTRUCTION = `أنت SULY AI، الرفيق والمنصة الذكية الفاخرة فائقة الأداء والمصداقية.
هويتك ولغتك:
- فصحى راقية، بليغة، واثقة، ومباشرة بدون حشو إنشائي ولا اعتذارات مصطنعة.
- عند تقديم الأكواد (Python, JavaScript, HTML, TypeScript, etc.)، اكتب كوداً نظيفاً، حديثاً، متكاملاً وقابلاً للتشغيل فوراً.
- نسق إجاباتك بتنسيق Markdown احترافي، بعناوين واضحة وجداول وقوائم إذا لزم الأمر، لتكون ملائمة للتقارير والطباعة.
- إذا كان السؤال بالإنجليزية، أجب بأسلوب إنجليزي تقني رفيع (Executive & Crisp) مع الحفاظ على ذات الوقار والثقة.
- استند دائماً إلى تفضيلات المستخدم المحفوظة في الذاكرة وسياق المشروع المرفق.`;

// Lazy client instantiation helper to prevent server crash when key is not provided
let cachedAiClient: GoogleGenAI | null = null;
function getAiClient(): GoogleGenAI | null {
  if (!envConfig.hasGeminiKey || !envConfig.geminiApiKey) {
    return null;
  }
  if (!cachedAiClient) {
    cachedAiClient = new GoogleGenAI({
      apiKey: envConfig.geminiApiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return cachedAiClient;
}

// Streaming Chat API (Server-Sent Events)
chatRouter.post('/stream', async (req: Request, res: Response) => {
  const { messages, memories = [], projectContext = '', customInstruction = '' } = req.body || {};

  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'Messages array is required' });
  }

  // Set SSE Headers
  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  const ai = getAiClient();
  if (!ai) {
    res.write(`data: ${JSON.stringify({ error: 'مفتاح Gemini API غير مهيأ في الخادم حالياً' })}\n\n`);
    res.write('data: [DONE]\n\n');
    return res.end();
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

  try {
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

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (err: unknown) {
    console.error('Error occurred processing chat stream request');
    const errorMessage = err instanceof Error ? err.message : 'حدث خطأ أثناء معالجة الطلب في خادم SULY AI';
    res.write(`data: ${JSON.stringify({ error: errorMessage })}\n\n`);
    res.write('data: [DONE]\n\n');
    res.end();
  }
});

// Non-streaming chat endpoint
chatRouter.post('/', async (req: Request, res: Response) => {
  const { messages, memories = [], projectContext = '' } = req.body || {};

  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'Messages array is required' });
  }

  const ai = getAiClient();
  if (!ai) {
    return res.status(503).json({ error: 'مفتاح Gemini API غير مهيأ في الخادم حالياً' });
  }

  let fullSystemInstruction = SULY_DEFAULT_SYSTEM_INSTRUCTION;
  if (Array.isArray(memories) && memories.length > 0) {
    fullSystemInstruction += `\n\nالذاكرة التراكمية الذكية للمستخدم:\n${memories.join('\n')}`;
  }
  if (projectContext && typeof projectContext === 'string' && projectContext.trim().length > 0) {
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
    console.error('Error occurred processing non-streaming chat request');
    res.status(500).json({
      error: err instanceof Error ? err.message : 'Error generating content',
    });
  }
});
