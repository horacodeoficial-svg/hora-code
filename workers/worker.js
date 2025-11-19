import { Worker } from 'bullmq';
import IORedis from 'ioredis';
import axios from 'axios';

const connection = new IORedis({
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || undefined
});

const worker = new Worker('generateQueue', async job => {
  const { orderId } = job.data;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  try {
    await axios.post(`${baseUrl}/api/generate-texts`, { orderId });
    await axios.post(`${baseUrl}/api/generate-layout`, { orderId });
    return { ok: true };
  } catch (e) {
    console.error('Worker error', e.message);
    throw e;
  }
}, { connection });

console.log('Worker started');
