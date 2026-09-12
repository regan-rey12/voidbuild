// VoidBuild AI Template Generation API — P2 Premium Default Path
// The AI only EXTRACTS business info; the site is built by merging that info
// into a flagship base template (premium variant styling + local real photos).
// Fallbacks: unusable AI output -> keyword-matched flagship template.

export const runtime = 'nodejs';

import fs from 'fs';
import path from 'path';
import { isRateLimited, getClientIp } from '@/lib/rateLimiter';
import { getCachedTemplate, setCachedTemplate } from '@/lib/cache';
import { mergeExtracted, isUsableExtraction, slugFromCategory, extractionScore, type ExtractedBusiness } from '@/lib/generate-merge';

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

const SYSTEM_PROMPT = `You write the COMPLETE text content for a Ugandan SME business website. The user gives a short description; you produce every section so the site reads as one consistent, ready-to-publish page about THAT business.
Output ONLY a raw, valid JSON object — no markdown, no backticks, no commentary.

JSON Structure (write EVERY field in EVERY section — a missing section leaves a broken, generic website):
{
  "businessName": "Exact Business Name",
  "category": "salon | hardware | restaurant | laundry | boutique | it | school | clinic | barbershop | pharmacy | bakery | tutoring | hotel | gym | portfolio | accounting | consulting | legal | construction | spa | tours",
  "tagline": "Short memorable tagline (max 60 chars)",
  "hero": {
    "badge": "Short badge line (max 60 chars)",
    "title": "Compelling 4-8 word headline",
    "subtitle": "1-2 sentence value proposition (max 220 chars)",
    "ctaText": "Short call-to-action (max 30 chars)"
  },
  "stats": [ { "number": "10+", "label": "Years of Experience" }, { "number": "500+", "label": "Happy Clients" }, { "number": "24/7", "label": "Support" } ],
  "services": [
    { "name": "Service name (max 40 chars)", "price": "UGX 35,000", "description": "One short sentence (max 120 chars)" }
  ],
  "plans": [
    { "name": "Package name", "price": "UGX 50,000", "sub": "short qualifier", "features": ["Feature one", "Feature two", "Feature three", "Feature four"], "popular": false }
  ],
  "testimonials": [
    { "name": "Client name", "role": "e.g. Regular Customer", "text": "One or two sentences (max 180 chars)", "rating": 5 }
  ],
  "contact": {
    "phone": "+256 7XX XXXXXX",
    "whatsapp": "+2567XXXXXXXX",
    "location": "Street/Area, Town, Uganda",
    "hours": "e.g. Mon-Sat 8:00am - 8:00pm",
    "email": "name@business.ug"
  }
}

Rules:
1. ONE BUSINESS, ONE TOPIC: every section is about THIS business. Services, plans, stats and testimonials must all match the business type in the description — never describe a different trade.
2. FACTS vs CONTENT: businessName, phone, whatsapp, email and location may ONLY come from the description — if the description doesn't give them, omit that field. Everything else (hero copy, services, prices, plans, testimonials, stats, opening hours) you WRITE yourself: natural, specific to this business type, realistic for the Ugandan market.
3. Services: write 4-6. Plans: exactly 3, with exactly one "popular": true. Testimonials: exactly 3, realistic and modest, with ordinary Ugandan names. Stats: exactly 3, plausible numbers for this business type.
4. Category: pick the closest match from the list (e.g. accounting, audit, tax, insurance, finance or consulting firm -> "accounting" or "consulting"; law firm or advocate -> "legal"; construction, contractor or engineering -> "construction"; spa or massage -> "spa"; tours or travel -> "tours").
5. Prices in Ugandan Shillings (UGX) at realistic Uganda market rates for this business type.
6. Location must be in Uganda if mentioned (Kampala, Jinja, Entebbe, Gulu, Mbale, Mbarara, etc.).
7. Return valid JSON only.`;

function loadTemplates(): Record<string, any> {
  const templates: Record<string, any> = {};
  const names = [
    'salon-ug-1',
    'hardware-mbale-1',
    'restaurant-ug-1',
    'boutique-ug-1',
    'laundry-ug-1',
    'it-ug-1',
    'school-ug-1',
    'clinic-ug-1',
    'barbershop-ug-1',
    'portfolio-ug-1',
    'pharmacy-ug-1',
    'bakery-ug-1',
    'tutoring-ug-1',
    'hotel-ug-1',
    'gym-ug-1',
  ];

  const templatesDir = path.join(process.cwd(), 'templates');

  for (const name of names) {
    try {
      const filePath = path.join(templatesDir, `${name}.json`);
      if (fs.existsSync(filePath)) {
        templates[name] = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        continue;
      }
      const altPath = path.join(__dirname, '..', '..', '..', '..', 'templates', `${name}.json`);
      if (fs.existsSync(altPath)) {
        templates[name] = JSON.parse(fs.readFileSync(altPath, 'utf8'));
        continue;
      }
    } catch {}
  }

  const fallbackSalon = templates['salon-ug-1'] || {
    id: 'salon-ug-1',
    name: 'Sample Business',
    category: 'salon',
    meta: { target: 'Ugandan SME' },
    blocks: [
      { id: 'nav-1', type: 'navbar', data: { businessName: 'My Business', phone: '+256 751 391318' }, style: { primaryColor: '#111827' } },
      { id: 'hero-1', type: 'hero', data: { title: 'Welcome to Our Business', subtitle: 'Professional services in Kampala, Uganda.', ctaText: 'Book on WhatsApp', image: '/template-images/salon/salon-1.jpg' }, style: { primaryColor: '#111827' } },
      { id: 'services-1', type: 'services', data: { heading: 'Our Services', services: [{ name: 'Standard Service', price: 'UGX 35,000', description: 'Top quality service.' }] }, style: { primaryColor: '#111827' } },
      { id: 'contact-1', type: 'contact', data: { phone: '+256 751 391318', location: 'Kampala, Uganda' }, style: { primaryColor: '#111827' } },
      { id: 'footer-1', type: 'footer', data: { businessName: 'My Business', year: 2026 }, style: { primaryColor: '#111827' } },
    ],
  };

  for (const name of names) {
    if (!templates[name]) {
      templates[name] = fallbackSalon;
    }
  }

  return templates;
}

const FALLBACK_TEMPLATES = loadTemplates();

function getClosestTemplate(description: string): { template: any; matched: boolean } {
  const lower = description.toLowerCase();
  // single words match on word boundaries (so "tax" doesn't hijack "taxi",
  // "lab" doesn't hijack "available"); phrases match as substrings.
  const hit = (...words: string[]) =>
    words.some((w) => (w.includes(' ') ? lower.includes(w) : new RegExp(`\\b${w}\\b`, 'i').test(lower)));
  if (hit('pharmacy', 'drug', 'medicine', 'chemist')) return { template: FALLBACK_TEMPLATES['pharmacy-ug-1'], matched: true };
  if (hit('bakery', 'cake', 'pastries', 'pastry', 'bread')) return { template: FALLBACK_TEMPLATES['bakery-ug-1'], matched: true };
  if (hit('laundry', 'dry clean', 'washing clothes')) return { template: FALLBACK_TEMPLATES['laundry-ug-1'], matched: true };
  if (hit('tutor', 'tuition', 'lessons', 'teaching')) return { template: FALLBACK_TEMPLATES['tutoring-ug-1'], matched: true };
  if (hit('gym', 'fitness', 'workout', 'zumba', 'aerobics', 'bodybuilding')) return { template: FALLBACK_TEMPLATES['gym-ug-1'], matched: true };
  if (hit('restaurant', 'food', 'luwombo', 'tilapia', 'pilau', 'rolex', 'cafe', 'café')) return { template: FALLBACK_TEMPLATES['restaurant-ug-1'], matched: true };
  if (hit('boutique', 'dresses', 'dress', 'ankara', 'suits', 'handbag', 'handbags', 'clothes', 'clothing')) return { template: FALLBACK_TEMPLATES['boutique-ug-1'], matched: true };
  if (hit('school', 'academy', 'nursery', 'primary', 'uneb')) return { template: FALLBACK_TEMPLATES['school-ug-1'], matched: true };
  if (hit('clinic', 'hospital', 'doctor', 'maternity', 'lab', 'laboratory', 'medical', 'dental')) return { template: FALLBACK_TEMPLATES['clinic-ug-1'], matched: true };
  if (hit('barbershop', 'barber', 'fade', 'haircut', 'shave')) return { template: FALLBACK_TEMPLATES['barbershop-ug-1'], matched: true };
  if (hit('salon', 'braids', 'braid', 'hairdresser', 'hairdressing', 'hairstyle', 'weave', 'hair', 'spa', 'massage', 'makeup', 'nails', 'facial', 'beautician')) return { template: FALLBACK_TEMPLATES['salon-ug-1'], matched: true };
  if (hit('hotel', 'lodge', 'cottage', 'resort', 'guesthouse', 'tours', 'travel', 'safari', 'tourism')) return { template: FALLBACK_TEMPLATES['hotel-ug-1'], matched: true };
  if (hit('portfolio', 'photography', 'photographer', 'wedding', 'video', 'filming', 'studio')) return { template: FALLBACK_TEMPLATES['portfolio-ug-1'], matched: true };
  if (hit('it support', 'it consulting', 'computer', 'computers', 'laptop', 'laptops', 'software', 'network', 'networking', 'tech company', 'website', 'web design', 'accounting', 'accountant', 'audit', 'auditing', 'tax', 'taxes', 'bookkeeping', 'consulting', 'consultant', 'consultancy', 'advisory', 'insurance', 'finance', 'financial', 'lawyer', 'advocate', 'law firm', 'legal', 'attorney', 'notary')) return { template: FALLBACK_TEMPLATES['it-ug-1'], matched: true };
  if (hit('hardware', 'cement', 'iron sheet', 'iron sheets', 'construction', 'contractor', 'building', 'builder', 'architecture', 'architect', 'engineering', 'engineer', 'welding', 'fabrication', 'renovation', 'supermarket', 'grocery', 'plumbing', 'electrical', 'paint')) return { template: FALLBACK_TEMPLATES['hardware-mbale-1'], matched: true };
  // No keyword match: neutral professional-services layout (NOT a niche template),
  // so an unmatched business never lands on an obviously wrong design.
  return { template: FALLBACK_TEMPLATES['it-ug-1'], matched: false };
}

function parseJSON(raw: string) {
  let cleaned = raw.replace(/```json/gi, '').replace(/```/g, '').trim();
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start === -1 || end === -1) throw new Error('Could not parse AI response JSON');
  let jsonStr = cleaned.slice(start, end + 1);
  const open = (jsonStr.match(/\{/g) || []).length;
  const close = (jsonStr.match(/\}/g) || []).length;
  if (open > close) jsonStr += '}'.repeat(open - close);
  return JSON.parse(jsonStr);
}

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    const rateLimit = isRateLimited(ip);
    if (rateLimit.limited) {
      return Response.json({ error: `Rate limit reached. Please wait ${Math.ceil(rateLimit.resetIn / 1000)} seconds.` }, { status: 429 });
    }

    let { description } = await req.json().catch(() => ({}));
    if (!description || typeof description !== 'string') {
      return Response.json({ error: 'Please enter a business description.' }, { status: 400 });
    }

    description = description.trim().replace(/<[^>]*>/g, '');
    if (description.length < 5) {
      return Response.json({ error: 'Please enter at least 5 characters (e.g. Salon in Wandegeya Aisha braids 35k).' }, { status: 400 });
    }
    if (description.length > 500) {
      return Response.json({ error: 'Business description is too long (maximum 500 characters).' }, { status: 400 });
    }

    const blocked = ['ignore previous instructions', 'system prompt', '<script', 'javascript:'];
    const lowerDesc = description.toLowerCase();
    for (const p of blocked) {
      if (lowerDesc.includes(p)) return Response.json({ error: 'Invalid description content.' }, { status: 400 });
    }

    const rawKey = process.env.OPENROUTER_API_KEY || '';
    const cleanKey = rawKey.trim().replace(/^['"`\[\s]+/, '').replace(/['"`\]\s]+$/, '');

    // If OpenRouter key is not set, load the closest matched flagship template
    if (!cleanKey || cleanKey.includes('placeholder') || cleanKey.includes('YOUR_OPENROUTER')) {
      const fallback = getClosestTemplate(description);
      const cloned = JSON.parse(JSON.stringify(fallback.template));
      cloned.id = `site-${Date.now().toString(36)}`;
      cloned.generationNotice = 'fallback';
      return Response.json(cloned);
    }

    // Serve repeat requests from cache (1-hour TTL)
    const cached = getCachedTemplate(description);
    if (cached) {
      const cloned = JSON.parse(JSON.stringify(cached));
      cloned.id = `gen-${Date.now().toString(36)}`;
      return Response.json(cloned);
    }

    const models = [
      'openrouter/free',
      'qwen/qwen3-coder:free',
      'meta-llama/llama-3.2-3b-instruct:free',
      'google/gemma-3-27b-it:free',
      'nvidia/nemotron-3-ultra:free',
    ];

    const attemptModel = async (model: string): Promise<ExtractedBusiness> => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 14000);
      try {
        const res = await fetch(OPENROUTER_URL, {
          method: 'POST',
          signal: controller.signal,
          headers: {
            'Authorization': `Bearer ${cleanKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://voidbuild.com',
            'X-Title': 'VoidBuild',
          },
          body: JSON.stringify({
            model,
            messages: [
              { role: 'system', content: SYSTEM_PROMPT },
              { role: 'user', content: `Write the complete website content JSON for this Ugandan business: \"${description}\". Return raw JSON only.` },
            ],
            temperature: 0.4,
            max_tokens: 2500,
          }),
        });

        if (!res.ok) {
          const errText = await res.text();
          throw new Error(`Model ${model} returned ${res.status}: ${errText.slice(0, 100)}`);
        }

        const data = await res.json();
        const content = data.choices?.[0]?.message?.content;
        if (!content) throw new Error(`Model ${model} returned empty content`);

        const ext = parseJSON(content) as ExtractedBusiness;
        if (!isUsableExtraction(ext)) throw new Error(`Model ${model} returned an unusable extraction`);
        return ext;
      } finally {
        clearTimeout(timeoutId);
      }
    };

    try {
      // Race all free models in parallel, collecting every usable extraction that
      // lands. A thin-but-fast result doesn't automatically win: we keep waiting
      // (max ~14s) for a richer one — only a COMPLETE extraction (every website
      // section covered) exits the race early.
      const results = await new Promise<ExtractedBusiness[]>((resolve) => {
        const out: ExtractedBusiness[] = [];
        let settledCount = 0;
        let finished = false;
        const finish = () => { if (!finished) { finished = true; resolve(out); } };
        for (const model of models) {
          attemptModel(model)
            .then((ext) => {
              out.push(ext);
              if (extractionScore(ext).complete) finish(); // full coverage — stop waiting
            })
            .catch(() => {})
            .finally(() => { settledCount += 1; if (settledCount === models.length) finish(); });
        }
        // every attemptModel aborts at 14s, so all .finally fire by then; this is a belt-and-braces guard
        const guard = setTimeout(finish, 15500);
        if (typeof guard.unref === 'function') guard.unref();
      });

      if (!results.length) {
        throw new Error('All models failed or returned unusable extractions');
      }
      results.sort((a, b) => extractionScore(b).rich - extractionScore(a).rich);
      const ext = results[0];

      // Base template: trust a valid AI category, else keyword-match the description
      const rawCat = typeof ext.category === 'string' ? ext.category.toLowerCase().trim() : '';
      const slug = slugFromCategory(rawCat);
      let base: any;
      let keywordMatched = false;
      if (slug && FALLBACK_TEMPLATES[slug]) {
        base = FALLBACK_TEMPLATES[slug];
      } else {
        const closest = getClosestTemplate(description);
        base = closest.template;
        keywordMatched = closest.matched;
      }
      // Repurposed = the chosen layout's own category doesn't fit the requested
      // business (e.g. "accounting" on the professional-services layout) → merge
      // neutralizes every field the extraction doesn't cover.
      const repurposed = slug ? rawCat !== base.category : !keywordMatched;

      const merged = mergeExtracted(base, ext, `gen-${Date.now().toString(36)}`, { repurposed });
      if (repurposed) merged.generationNotice = 'matched';
      setCachedTemplate(description, merged);
      return Response.json(merged);
    } catch (agg: any) {
      console.warn('All generation models failed:', (agg?.errors ?? [agg]).map((e: any) => e?.message).join(' | ').slice(0, 300));
    }

    // If all models timed out/failed, load closest flagship template — with an honest notice
    const fallback = getClosestTemplate(description);
    const cloned = JSON.parse(JSON.stringify(fallback.template));
    cloned.id = `gen-${Date.now().toString(36)}`;
    cloned.generationNotice = 'fallback';
    return Response.json(cloned);

  } catch (e: any) {
    console.error('Generate route exception:', e);
    const fallback = FALLBACK_TEMPLATES['salon-ug-1'];
    return Response.json({ ...JSON.parse(JSON.stringify(fallback)), id: `gen-${Date.now().toString(36)}`, generationNotice: 'fallback' });
  }
}
