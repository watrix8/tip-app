// lib/utils/rate-limiter.ts
import { db } from '@/lib/config/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

interface RateLimitData {
  count: number;
  resetTime: number;
}

export async function rateLimit(
  ip: string,
  action: string,
  config: { windowMs: number; maxRequests: number }
) {
  // Sanityzacja IP (usuwanie znaków specjalnych)
  const sanitizedIp = ip.replace(/[./]/g, '_');
  const rateLimitRef = doc(db, 'rateLimits', `${action}_${sanitizedIp}`);
  const now = Date.now();

  try {
    const docSnap = await getDoc(rateLimitRef);
    const data = docSnap.data() as RateLimitData | undefined;

    // Jeśli nie ma danych lub minął czas resetowania
    if (!data || data.resetTime < now) {
      await setDoc(rateLimitRef, {
        count: 1,
        resetTime: now + config.windowMs,
        lastUpdated: now
      });

      return {
        success: true,
        current: 1,
        limit: config.maxRequests,
        remaining: config.maxRequests - 1
      };
    }

    // Inkrementuj licznik
    const newCount = data.count + 1;
    await setDoc(rateLimitRef, {
      count: newCount,
      resetTime: data.resetTime,
      lastUpdated: now
    });

    return {
      success: newCount <= config.maxRequests,
      current: newCount,
      limit: config.maxRequests,
      remaining: Math.max(0, config.maxRequests - newCount)
    };
  } catch (error) {
    console.error('Rate limit error:', error);
    // W razie błędu przepuszczamy request
    return {
      success: true,
      current: 1,
      limit: config.maxRequests,
      remaining: config.maxRequests - 1
    };
  }
}