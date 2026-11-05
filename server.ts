/**
 * SULY AI Server - Compatibility Entrypoint
 *
 * This entrypoint delegates directly to backend/index.ts
 * ensuring full backward-compatibility with npm/bun run dev and start scripts.
 */

import './backend/index.js';
