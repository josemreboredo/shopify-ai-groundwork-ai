import { vercelPreset } from '@vercel/react-router/vite';

/** Lead Consultant web app (2.0.0, ADR 0014). Server-rendered; Vercel preset only when building on Vercel. */
export default {
  ssr: true,
  presets: process.env.VERCEL ? [vercelPreset()] : [],
};
