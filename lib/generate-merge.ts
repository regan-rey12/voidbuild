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

// Business types we don't have a dedicated template for -> closest base template
// (its layout is reused, but content gets neutralized because it is off-topic).
export const CATEGORY_ALIASES: Record<string, string> = {
  accounting: 'it', audit: 'it', tax: 'it', bookkeeping: 'it', advisory: 'it',
  consulting: 'it', consultant: 'it', insurance: 'it', finance: 'it', financial: 'it',
  legal: 'it', law: 'it', lawyer: 'it', advocate: 'it', notary: 'it',
  construction: 'hardware', contractor: 'hardware', building: 'hardware', builder: 'hardware',
  architecture: 'hardware', architect: 'hardware', engineering: 'hardware', engineer: 'hardware',
  welding: 'hardware', fabrication: 'hardware', renovation: 'hardware',
  supermarket: 'hardware', grocery: 'hardware',
  spa: 'salon', massage: 'salon', beautician: 'salon', makeup: 'salon', nails: 'salon',
  tours: 'hotel', travel: 'hotel', safari: 'hotel', tourism: 'hotel',
};

// ---------- neutral content for repurposed templates ----------
// Used ONLY when the base template's own category doesn't match the requested
// business (e.g. an accounting firm on the professional-services layout), so the
// base template's specific wording never bleeds into an unrelated site.

const NEUTRAL_SERVICES: { name: string; price: string; description: string }[] = [
  { name: 'Consultation', price: 'Free', description: 'Tell us what you need and get a clear, honest quote.' },
  { name: 'Standard Service', price: 'UGX 100,000', description: 'Our most requested service — professional and dependable.' },
  { name: 'Custom Project', price: 'Ask for a quote', description: 'Bigger job? We tailor a package to your needs.' },
  { name: 'Site Visit', price: 'Free in Kampala', description: 'We come to you, assess the work and advise on the best plan.' },
  { name: 'Follow-Up Support', price: 'UGX 50,000', description: 'Check-ins and adjustments after the main work is done.' },
  { name: 'Monthly Package', price: 'UGX 250,000/month', description: 'Ongoing support at a friendly, predictable rate.' },
];

const NEUTRAL_STATS: { number: string; label: string }[] = [
  { number: '10+', label: 'Years of Experience' },
  { number: '500+', label: 'Happy Clients' },
  { number: '24/7', label: 'Customer Care' },
];

const NEUTRAL_PLANS: { name: string; sub: string; features: string[]; popular: boolean }[] = [
  { name: 'Starter', sub: 'For small needs', features: ['One core service', 'WhatsApp support', 'Clear UGX pricing', 'Reliable turnaround'], popular: false },
  { name: 'Standard', sub: 'Most popular', features: ['Everything in Starter', 'Priority scheduling', 'Dedicated support', 'Monthly check-ins'], popular: true },
  { name: 'Premium', sub: 'For bigger jobs', features: ['Everything in Standard', 'Custom scope of work', 'Fast turnaround', 'Ongoing support'], popular: false },
];

const NEUTRAL_TESTIMONIALS: { name: string; role: string; text: string; rating: number }[] = [
  { name: 'Sarah K.', role: 'Happy Client', text: 'Reliable service and clear communication from start to finish.', rating: 5 },
  { name: 'James O.', role: 'Regular Customer', text: 'Fair prices and professional work. I keep coming back.', rating: 5 },
  { name: 'Grace A.', role: 'Satisfied Customer', text: 'Easy to reach and quick to respond. Highly recommended.', rating: 5 },
];

const GENERIC_PLAN_FEATURES = ['Clear scope and honest UGX pricing', 'Friendly, professional service', 'Support on WhatsApp', 'Reliable turnaround'];

// generic navbar labels by section anchor (used when repurposed, so template-specific
// labels like "Genres" or "Book Date" never appear on an unrelated business)
const GENERIC_NAV_LABELS: Record<string, string> = {
  '#services': 'Services',
  '#gallery': 'Our Work',
  '#pricing': 'Packages',
  '#testimonials': 'Reviews',
  '#stats': 'Why Us',
  '#map': 'Location',
  '#contact': 'Contact',
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
  let digits = p.replace(/[^\d]/g, ''); // wa.me wants bare digits
  // local Ugandan numbers → international 256… (wa.me and tel: need country code)
  if (digits.length === 10 && digits.startsWith('0')) digits = '256' + digits.slice(1);
  else if (digits.length === 9 && /^[17]/.test(digits)) digits = '256' + digits;
  return digits;
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

export function mergeExtracted(base: Template, ext: ExtractedBusiness, genId: string, opts: { repurposed?: boolean } = {}): Template {
  const t: Template = JSON.parse(JSON.stringify(base));
  t.id = genId;

  // "Repurposed" = the base layout's own category doesn't match the requested business
  // (e.g. accounting firm on the professional-services layout). In that case every
  // field the extraction doesn't cover gets NEUTRAL generic content instead of the
  // base template's own (off-topic) wording.
  const rawCat = typeof ext.category === 'string' ? ext.category.toLowerCase().trim() : '';
  const repurposed = opts.repurposed ?? (!!rawCat && rawCat !== t.category);

  const businessName = cleanString(ext.businessName, 40);
  if (businessName) t.name = businessName;

  // navbar
  const nav = block(t, 'navbar');
  if (nav) {
    if (businessName) nav.data.businessName = businessName;
    const phone = cleanPhone(ext.contact?.phone);
    const wa = cleanWhatsapp(ext.contact?.whatsapp ?? ext.contact?.phone);
    if (phone) nav.data.phone = phone;
    else if (wa) nav.data.phone = `+${wa}`;
    if (wa) nav.data.whatsapp = wa;
    if (repurposed && Array.isArray(nav.data.links)) {
      nav.data.links = nav.data.links.map((l: { href?: string; label?: string }) => ({
        ...l,
        label: (typeof l.href === 'string' && GENERIC_NAV_LABELS[l.href]) || l.label,
      }));
    }
  }

  // hero — text only; image + variant stay from the base template
  const hero = block(t, 'hero');
  if (hero) {
    const badge = cleanString(ext.hero?.badge, 70);
    const title = cleanString(ext.hero?.title, 70);
    const subtitle = cleanString(ext.hero?.subtitle, 260);
    const cta = cleanString(ext.hero?.ctaText, 34);
    if (badge) hero.data.badge = badge;
    else if (repurposed) hero.data.badge = 'Trusted Local Business';
    if (title) hero.data.title = title;
    else if (repurposed) hero.data.title = businessName || 'Quality Service You Can Trust';
    if (subtitle) hero.data.subtitle = subtitle;
    else if (repurposed) hero.data.subtitle = 'Professional service with clear pricing — reach us on WhatsApp any time.';
    if (cta) hero.data.ctaText = cta;
    else if (repurposed) hero.data.ctaText = 'Get a Quote';
  }

  // stats
  const stats = block(t, 'stats');
  if (stats) {
    if (Array.isArray(ext.stats) && ext.stats.length >= 1) {
      const cleaned = (ext.stats as Record<string, unknown>[])
        .slice(0, 4)
        .map((s) => ({ number: cleanString(s?.number, 14) || '', label: cleanString(s?.label, 48) || '' }))
        .filter((s) => s.number && s.label);
      if (cleaned.length >= 1) stats.data.stats = cleaned;
    } else if (repurposed) {
      const count = Math.min(3, (stats.data.stats || []).length || 3);
      stats.data.stats = NEUTRAL_STATS.slice(0, count);
    }
    if (repurposed) {
      stats.data.heading = 'Why Clients Choose Us';
    }
  }

  // services — replace text per slot, keep base images/variant.
  // When repurposed: no off-topic leftovers — truncate to what the extraction
  // provided (padding to 3 with neutral items if it came back thin), and use a
  // generic heading. When the category matches, extra base slots are on-topic
  // richness and stay.
  const services = block(t, 'services');
  if (services && Array.isArray(ext.services) && ext.services.length > 0) {
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
    if (repurposed) {
      const images = list.map((s: { image?: string }) => s.image).filter(Boolean);
      let kept = list.slice(0, incoming.length);
      for (let k = 0; kept.length < Math.min(3, list.length || 3); k++) {
        const ns = NEUTRAL_SERVICES[(incoming.length + k) % NEUTRAL_SERVICES.length];
        kept.push({ ...ns, image: images[(incoming.length + k) % Math.max(images.length, 1)] });
      }
      services.data.services = kept;
      services.data.heading = 'Our Services';
      services.data.subheading = 'Reliable service with clear UGX pricing.';
    }
  } else if (services && repurposed) {
    // no services extracted at all — neutral set, same slot count as the base
    const list = services.data.services || [];
    const count = list.length >= 3 ? Math.min(list.length, 6) : 3;
    services.data.services = Array.from({ length: count }, (_, i) => ({
      ...NEUTRAL_SERVICES[i % NEUTRAL_SERVICES.length],
      image: list[i % Math.max(list.length, 1)]?.image,
    }));
    services.data.heading = 'Our Services';
    services.data.subheading = 'Reliable service with clear UGX pricing.';
  }

  // pricing plans
  const pricing = block(t, 'pricing');
  if (pricing && Array.isArray(ext.plans) && ext.plans.length > 0) {
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
      else if (repurposed) plans[i].features = GENERIC_PLAN_FEATURES;
    });
    // popular flag: trust AI only if exactly one plan is explicitly popular
    const popularIdx = incoming.findIndex((p) => p?.popular === true);
    if (popularIdx >= 0 && incoming.filter((p) => p?.popular === true).length === 1 && plans[popularIdx]) {
      plans.forEach((p: { popular?: boolean }, i: number) => { p.popular = i === popularIdx; });
    }
    if (repurposed) {
      // replace any uncovered base plan slots with a neutral "talk to us" plan
      for (let i = incoming.length; i < plans.length; i++) {
        plans[i] = {
          ...plans[i],
          name: 'Custom Quote',
          sub: 'Tailored to your needs',
          features: [...GENERIC_PLAN_FEATURES],
          popular: false,
        };
      }
      const pop = plans.findIndex((p: { popular?: boolean }) => p.popular);
      if (pop === -1 && plans[1]) plans[1].popular = true;
      pricing.data.heading = 'Packages & Pricing';
      pricing.data.subheading = 'Straightforward packages — pick what fits your business.';
    }
  } else if (pricing && repurposed) {
    // no plans extracted — neutral set on the base slot structure (keeps base prices)
    const plans = pricing.data.plans || [];
    pricing.data.plans = (plans.length ? plans : [{} as never, {} as never, {} as never]).map((p: Record<string, unknown>, i: number) => ({
      ...p,
      name: NEUTRAL_PLANS[Math.min(i, NEUTRAL_PLANS.length - 1)].name,
      sub: NEUTRAL_PLANS[Math.min(i, NEUTRAL_PLANS.length - 1)].sub,
      price: (typeof p.price === 'string' && p.price) || ['UGX 100,000', 'UGX 250,000', 'UGX 500,000'][Math.min(i, 2)],
      features: [...NEUTRAL_PLANS[Math.min(i, NEUTRAL_PLANS.length - 1)].features],
      popular: i === 1,
    }));
    pricing.data.heading = 'Packages & Pricing';
    pricing.data.subheading = 'Straightforward packages — pick what fits your business.';
  }

  // testimonials
  const testi = block(t, 'testimonials');
  if (testi) {
    const list = testi.data.testimonials || [];
    if (Array.isArray(ext.testimonials) && ext.testimonials.length > 0) {
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
          else if (repurposed) list[i].role = 'Happy Client';
          list[i].rating = rating;
        }
      });
      if (repurposed) {
        for (let i = incoming.length; i < list.length; i++) {
          const n = NEUTRAL_TESTIMONIALS[i % NEUTRAL_TESTIMONIALS.length];
          list[i] = { ...list[i], ...n };
        }
      }
    } else if (repurposed) {
      testi.data.testimonials = (list.length ? list : [{} as never, {} as never, {} as never]).map((_: unknown, i: number) => ({
        ...(list[i] || {}),
        ...NEUTRAL_TESTIMONIALS[i % NEUTRAL_TESTIMONIALS.length],
      }));
    }
    if (repurposed) {
      testi.data.heading = 'What Our Clients Say';
      if ('subheading' in testi.data) testi.data.subheading = 'Real feedback from real customers.';
    }
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
    else if (wa) contact.data.phone = `+${wa}`;
    if (wa) contact.data.whatsapp = wa;
    if (location) contact.data.location = location;
    else if (repurposed) contact.data.location = 'Kampala, Uganda';
    if (hours) contact.data.hours = hours;
    else if (repurposed) contact.data.hours = 'Mon-Sat 8:00am - 6:00pm';
    if (email) contact.data.email = email;
    if (repurposed) contact.data.heading = 'Get in Touch';
  }
  const map = block(t, 'map');
  if (map) {
    const location = cleanString(ext.contact?.location, 90);
    if (location) map.data.location = location;
    else if (repurposed) map.data.location = 'Kampala, Uganda';
    if (repurposed) {
      map.data.heading = 'Find Us';
      if ('subheading' in map.data) map.data.subheading = 'Visit us or call ahead — we are easy to reach.';
    }
  }

  // gallery (images stay — real photos, layout-agnostic)
  const gallery = block(t, 'gallery');
  if (gallery && repurposed) {
    gallery.data.heading = 'Our Work';
    if ('subheading' in gallery.data) gallery.data.subheading = 'A look at what we do.';
  }

  // footer
  const footer = block(t, 'footer');
  if (footer) {
    if (businessName) footer.data.businessName = businessName;
    const tagline = cleanString(ext.tagline, 90);
    if (tagline) footer.data.tagline = tagline;
    else if (repurposed) footer.data.tagline = 'Quality service you can rely on.';
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

// Score an extraction: `rich` ranks partial results, `complete` means every
// section of the website is covered — the only result we stop waiting for early.
export function extractionScore(ext: ExtractedBusiness): { rich: number; complete: boolean } {
  const hasName = typeof ext?.businessName === 'string' && ext.businessName.trim().length >= 2;
  const hasHero = !!(ext?.hero && typeof ext.hero?.title === 'string' && ext.hero.title.trim());
  const nServices = Array.isArray(ext?.services) ? ext.services.length : 0;
  const nPlans = Array.isArray(ext?.plans) ? ext.plans.length : 0;
  const nTesti = Array.isArray(ext?.testimonials) ? ext.testimonials.length : 0;
  const nStats = Array.isArray(ext?.stats) ? ext.stats.length : 0;
  const hasContact = !!(ext?.contact && Object.values(ext.contact).some((v) => typeof v === 'string' && v.trim()));

  let rich = 0;
  if (hasName) rich += 2;
  rich += nServices >= 3 ? 3 : nServices > 0 ? 1 : 0;
  rich += nPlans >= 3 ? 2 : nPlans > 0 ? 1 : 0;
  if (nTesti > 0) rich += 1;
  if (hasHero) rich += 1;
  if (hasContact) rich += 1;
  if (nStats > 0) rich += 1;

  const complete = hasName && hasHero && nServices >= 4 && nPlans >= 3 && nTesti >= 3 && nStats >= 1;
  return { rich, complete };
}

// Resolve which base template slug to use: trust a valid AI category (or a known
// alias like "accounting" -> professional-services layout), else null (caller falls back to keywords)
export function slugFromCategory(cat: unknown): string | null {
  if (typeof cat !== 'string') return null;
  const k = cat.toLowerCase().trim();
  const canonical = CATEGORY_ALIASES[k] || k;
  return CATEGORY_SLUGS[canonical] || null;
}
