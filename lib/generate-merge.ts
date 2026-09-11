// P2 — Premium default generation path.
// The AI extracts business info; we merge it INTO a flagship base template,
// preserving variant styling and local photography. Worst case = base template.

import type { Template } from './types';

export interface ExtractedService {
  name?: unknown;
  price?: unknown;
  description?: unknown;
}

export interface ExtractedPlan {
  name?: unknown;
  price?: unknown;
  sub?: unknown;
  features?: unknown;
  popular?: unknown;
}

export interface ExtractedTestimonial {
  name?: unknown;
  role?: unknown;
  text?: unknown;
  rating?: unknown;
}

export interface ExtractedBusiness {
  businessName?: unknown;
  category?: unknown;
  tagline?: unknown;
  hero?: {
    badge?: unknown;
    title?: unknown;
    subtitle?: unknown;
    ctaText?: unknown;
  };
  stats?: unknown;
  services?: unknown;
  plans?: unknown;
  testimonials?: unknown;
  contact?: {
    phone?: unknown;
    whatsapp?: unknown;
    location?: unknown;
    hours?: unknown;
    email?: unknown;
  };
}

// category key (as used in template JSONs) -> template file slug
export const CATEGORY_SLUGS: Record<string, string> = {
  salon: 'salon-ug-1',
  hardware: 'hardware-mbale-1',
  restaurant: 'restaurant-ug-1',
  boutique: 'boutique-ug-1',
  pharmacy: 'pharmacy-ug-1',
  hotel: 'hotel-ug-1',
  barbershop: 'barbershop-ug-1',
  clinic: 'clinic-ug-1',
  bakery: 'bakery-ug-1',
  gym: 'gym-ug-1',
  laundry: 'laundry-ug-1',
  it: 'it-ug-1',
  tutoring: 'tutoring-ug-1',
  school: 'school-ug-1',
  portfolio: 'portfolio-ug-1',
};

// ---------- sanitizers ----------

function cleanString(v: unknown, maxLen: number): string | null {
  if (typeof v !== 'string') return null;
  let s = v.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  if (s.length > maxLen) s = s.slice(0, maxLen - 1).trimEnd() + '…';
  return s.length > 0 ? s : null;
}

function cleanPhone(v: unknown): string | null {
  if (typeof v !== 'string') return null;
  const s = v.replace(/<[^>]*>/g, '').trim();
  const digits = s.replace(/[^\d]/g, '');
  if (!digits) return null;
  // accept +256... (12-15 digits) or local 07... (9-11 digits); keep original formatting
  const hasPlus = s.trim().startsWith('+');
  if (hasPlus && digits.length >= 12 && digits.length <= 15) return s;
  if (!hasPlus && digits.length >= 9 && digits.length <= 11) return s;
  return null;
}

function cleanWhatsapp(v: unknown): string | null {
  const p = cleanPhone(v);
  if (!p) return null;
  return p.replace(/[^\d]/g, ''); // wa.me wants bare digits
}

function cleanEmail(v: unknown): string | null {
  if (typeof v !== 'string') return null;
  const s = v.trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s) ? s : null;
}

// ---------- merge ----------

function block(t: Template, type: string) {
  return t.blocks.find((b) => b.type === type);
}

export function mergeExtracted(base: Template, ext: ExtractedBusiness, genId: string): Template {
  const t: Template = JSON.parse(JSON.stringify(base));
  t.id = genId;

  const businessName = cleanString(ext.businessName, 40);
  if (businessName) t.name = businessName;

  // navbar
  const nav = block(t, 'navbar');
  if (nav) {
    if (businessName) nav.data.businessName = businessName;
    const phone = cleanPhone(ext.contact?.phone);
    const wa = cleanWhatsapp(ext.contact?.whatsapp ?? ext.contact?.phone);
    if (phone) nav.data.phone = phone;
    if (wa) nav.data.whatsapp = wa;
  }

  // hero — text only; image + variant stay from the base template
  const hero = block(t, 'hero');
  if (hero) {
    const badge = cleanString(ext.hero?.badge, 70);
    const title = cleanString(ext.hero?.title, 70);
    const subtitle = cleanString(ext.hero?.subtitle, 260);
    const cta = cleanString(ext.hero?.ctaText, 34);
    if (badge) hero.data.badge = badge;
    if (title) hero.data.title = title;
    if (subtitle) hero.data.subtitle = subtitle;
    if (cta) hero.data.ctaText = cta;
  }

  // stats
  const stats = block(t, 'stats');
  if (stats && Array.isArray(ext.stats) && ext.stats.length >= 1) {
    const cleaned = (ext.stats as Record<string, unknown>[])
      .slice(0, 4)
      .map((s) => ({ number: cleanString(s?.number, 14) || '', label: cleanString(s?.label, 48) || '' }))
      .filter((s) => s.number && s.label);
    if (cleaned.length >= 1) stats.data.stats = cleaned;
  }

  // services — replace text per slot, keep base images/variant; base slots keep content if AI returns fewer
  const services = block(t, 'services');
  if (services && Array.isArray(ext.services)) {
    const list = services.data.services || [];
    const incoming = (ext.services as ExtractedService[]).slice(0, Math.max(list.length, 6));
    incoming.forEach((s, i) => {
      if (!list[i]) return;
      const name = cleanString(s?.name, 48);
      const price = cleanString(s?.price, 28);
      const description = cleanString(s?.description, 140);
      if (name) list[i].name = name;
      if (price) list[i].price = price;
      if (description) list[i].description = description;
    });
  }

  // pricing plans
  const pricing = block(t, 'pricing');
  if (pricing && Array.isArray(ext.plans)) {
    const plans = pricing.data.plans || [];
    const incoming = (ext.plans as ExtractedPlan[]).slice(0, plans.length);
    incoming.forEach((p, i) => {
      const name = cleanString(p?.name, 40);
      if (!name) return;
      const price = cleanString(p?.price, 28);
      const sub = cleanString(p?.sub, 44);
      let features: string[] | null = null;
      if (Array.isArray(p?.features)) {
        features = (p.features as unknown[])
          .map((f) => cleanString(f, 80))
          .filter((f): f is string => !!f)
          .slice(0, 6);
      }
      plans[i].name = name;
      if (price) plans[i].price = price;
      if (sub) plans[i].sub = sub;
      if (features && features.length >= 3) plans[i].features = features;
    });
    // popular flag: trust AI only if exactly one plan is explicitly popular
    const popularIdx = incoming.findIndex((p) => p?.popular === true);
    if (popularIdx >= 0 && incoming.filter((p) => p?.popular === true).length === 1 && plans[popularIdx]) {
      plans.forEach((p: { popular?: boolean }, i: number) => { p.popular = i === popularIdx; });
    }
  }

  // testimonials
  const testi = block(t, 'testimonials');
  if (testi && Array.isArray(ext.testimonials)) {
    const list = testi.data.testimonials || [];
    const incoming = (ext.testimonials as ExtractedTestimonial[]).slice(0, list.length);
    incoming.forEach((x, i) => {
      const name = cleanString(x?.name, 32);
      const role = cleanString(x?.role, 40);
      const text = cleanString(x?.text, 220);
      const rating = typeof x?.rating === 'number' ? Math.min(5, Math.max(1, Math.round(x.rating))) : 5;
      if (name && text) {
        list[i].name = name;
        list[i].text = text;
        if (role) list[i].role = role;
        list[i].rating = rating;
      }
    });
  }

  // contact + map
  const contact = block(t, 'contact');
  if (contact) {
    const phone = cleanPhone(ext.contact?.phone);
    const wa = cleanWhatsapp(ext.contact?.whatsapp ?? ext.contact?.phone);
    const location = cleanString(ext.contact?.location, 90);
    const hours = cleanString(ext.contact?.hours, 90);
    const email = cleanEmail(ext.contact?.email);
    if (phone) contact.data.phone = phone;
    if (wa) contact.data.whatsapp = wa;
    if (location) contact.data.location = location;
    if (hours) contact.data.hours = hours;
    if (email) contact.data.email = email;
  }
  const map = block(t, 'map');
  if (map) {
    const location = cleanString(ext.contact?.location, 90);
    if (location) map.data.location = location;
  }

  // footer
  const footer = block(t, 'footer');
  if (footer) {
    if (businessName) footer.data.businessName = businessName;
    const tagline = cleanString(ext.tagline, 90);
    if (tagline) footer.data.tagline = tagline;
  }

  return t;
}

// Does the AI payload contain anything usable at all?
export function isUsableExtraction(ext: ExtractedBusiness): boolean {
  if (cleanString(ext.businessName, 40)) return true;
  if (Array.isArray(ext.services) && ext.services.some((s: ExtractedService) => cleanString(s?.name, 48))) return true;
  if (ext.hero && cleanString(ext.hero.title, 70)) return true;
  return false;
}

// Resolve which base template slug to use: trust a valid AI category, else null (caller falls back to keywords)
export function slugFromCategory(cat: unknown): string | null {
  if (typeof cat !== 'string') return null;
  const k = cat.toLowerCase().trim();
  return CATEGORY_SLUGS[k] || null;
}
