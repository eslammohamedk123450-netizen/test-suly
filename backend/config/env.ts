import dotenv from 'dotenv';

// Load environment variables safely
dotenv.config();

export interface ServerConfig {
  port: number;
  host: string;
  nodeEnv: string;
  hasGeminiKey: boolean;
  geminiApiKey?: string;
  supabaseUrl?: string;
  hasSupabaseConfig: boolean;
}

function parsePort(val: string | undefined, defaultPort = 3000): number {
  if (!val) return defaultPort;
  const parsed = parseInt(val, 10);
  if (isNaN(parsed) || parsed <= 0 || parsed > 65535) {
    return defaultPort;
  }
  return parsed;
}

export const envConfig: ServerConfig = {
  port: parsePort(process.env.PORT, 3000),
  host: process.env.HOST || '0.0.0.0',
  nodeEnv: process.env.NODE_ENV || 'development',
  hasGeminiKey: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim().length > 0),
  geminiApiKey: process.env.GEMINI_API_KEY?.trim(),
  supabaseUrl: process.env.SUPABASE_URL,
  hasSupabaseConfig: Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY),
};
