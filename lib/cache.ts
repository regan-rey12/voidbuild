// VoidBuild Cache - Prevents Failed errors, returns closest static template
// Fixed type error: firstKey could be undefined

import { Template } from './types';

const cache = new Map<string, { template: Template; timestamp: number }>();
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

export function getCachedTemplate(prompt: string): Template | null {
  const key = prompt.toLowerCase().trim().slice(0, 100);
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL) {
    cache.delete(key);
    return null;
  }
  return entry.template;
}

export function setCachedTemplate(prompt: string, template: Template) {
  const key = prompt.toLowerCase().trim().slice(0, 100);
  cache.set(key, { template, timestamp: Date.now() });
  // Keep cache size max 100 - FIXED: check firstKey exists before delete
  if (cache.size > 100) {
    const firstKey = cache.keys().next().value;
    if (firstKey) {
      cache.delete(firstKey);
    }
  }
}

export function getClosestStaticTemplate(description: string): string {
  const lower = description.toLowerCase();
  if (lower.includes('salon') || lower.includes('braids') || lower.includes('beauty')) return 'salon-ug-1';
  if (lower.includes('hardware') || lower.includes('cement') || lower.includes('iron')) return 'hardware-mbale-1';
  if (lower.includes('restaurant') || lower.includes('food')) return 'restaurant-ug-1';
  if (lower.includes('church')) return 'church-ug-1';
  if (lower.includes('boda') || lower.includes('garage')) return 'boda-ug-1';
  if (lower.includes('boutique') || lower.includes('fashion')) return 'boutique-ug-1';
  if (lower.includes('school')) return 'school-ug-1';
  if (lower.includes('clinic')) return 'clinic-ug-1';
  if (lower.includes('barbershop') || lower.includes('barber')) return 'barbershop-ug-1';
  if (lower.includes('portfolio') || lower.includes('photographer')) return 'portfolio-ug-1';
  return 'salon-ug-1';
}
