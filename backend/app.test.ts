import test from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from './app.js';
import type { Server } from 'http';

test('Backend Module Suite', async (t) => {
  const app = createApp();
  let server: Server;
  let baseUrl: string;

  await new Promise<void>((resolve) => {
    server = app.listen(0, '127.0.0.1', () => {
      const addr = server.address();
      if (addr && typeof addr === 'object') {
        baseUrl = `http://127.0.0.1:${addr.port}`;
      }
      resolve();
    });
  });

  t.after(() => {
    return new Promise<void>((resolve) => {
      server.close(() => resolve());
    });
  });

  await t.test('1. Express app instantiates and health check succeeds even without Gemini key', async () => {
    const res = await fetch(`${baseUrl}/api/health`);
    assert.equal(res.status, 200);

    const body = await res.json();
    assert.equal(body.status, 'online');
    assert.equal(body.platform, 'SULY AI');
    assert.equal(body.model, 'gemini-3.8-flash');
    assert.equal(typeof body.hasKey, 'boolean');
    assert.ok(body.time);
  });

  await t.test('2. /api/chat/stream rejects empty request body with 400', async () => {
    const res = await fetch(`${baseUrl}/api/chat/stream`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });

    assert.equal(res.status, 400);
    const body = await res.json();
    assert.equal(body.error, 'Messages array is required');
  });

  await t.test('3. /api/chat/stream rejects invalid non-array messages with 400', async () => {
    const res = await fetch(`${baseUrl}/api/chat/stream`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: 'not-an-array' }),
    });

    assert.equal(res.status, 400);
    const body = await res.json();
    assert.equal(body.error, 'Messages array is required');
  });

  await t.test('4. /api/chat/stream rejects empty messages array with 400', async () => {
    const res = await fetch(`${baseUrl}/api/chat/stream`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: [] }),
    });

    assert.equal(res.status, 400);
    const body = await res.json();
    assert.equal(body.error, 'Messages array is required');
  });

  await t.test('5. /api/chat rejects empty request body with 400', async () => {
    const res = await fetch(`${baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });

    assert.equal(res.status, 400);
    const body = await res.json();
    assert.equal(body.error, 'Messages array is required');
  });
});
