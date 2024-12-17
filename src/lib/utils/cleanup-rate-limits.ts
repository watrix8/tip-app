// lib/utils/cleanup-rate-limits.ts
import { db } from '@/lib/config/firebase';
import { collection, query, where, getDocs, deleteDoc } from 'firebase/firestore';

export async function cleanupRateLimits() {
  const now = Date.now();
  const rateLimitsRef = collection(db, 'rateLimits');
  const q = query(rateLimitsRef, where('resetTime', '<', now));

  try {
    const snapshot = await getDocs(q);
    const batch = snapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(batch);
    console.log(`Cleaned up ${batch.length} expired rate limit records`);
  } catch (error) {
    console.error('Error cleaning up rate limits:', error);
  }
}