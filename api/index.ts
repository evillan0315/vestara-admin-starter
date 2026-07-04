/**
 * Vercel Serverless Function entry point.
 *
 * Exports the Express app so @vercel/node can bundle it
 * as a serverless function. All /api/* requests are routed here.
 */
import { createApp } from '../apps/api/src/app.js';

const app = createApp();

export default app;
