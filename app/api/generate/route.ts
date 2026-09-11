// VoidBuild AI Template Generation API — P2 Premium Default Path
// The AI only EXTRACTS business info; the site is built by merging that info
// into a flagship base template (premium variant styling + local real photos).
// Fallbacks: unusable AI output -> keyword-matched flagship template.

export const runtime = 'nodejs';

import fs from 'fs';
import path from 'path';
import { isRateLimited, getClientIp } from '@/lib/rateLimiter';
import { getCachedTemplate, setCachedTemplate } from '@/lib/cache';
import { mergeExtracted, isUsableExtraction, slugFromCategory, type ExtractedBusiness } from '@/lib/generate-merge';

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

const SYSTEM_PROMPT = `You are VoidBuild AI. You extract structured business information for a Ugandan SME website.
Output ONLY a raw, valid JSON object — no markdown, no backticks, no commentary.

JSON Structure (all fields optional, but fill in as many as the description allows):
{
  "businessName": "Exact Business Name",
  "category": "salon | hardware | restaurant | laundry | boutique | it | school | clinic | barbershop | pharmacy | bakery | tutoring | hotel | gym | portfolio",
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
1. Use ONLY facts stated or clearly implied by the description. Never invent phone numbers, emails or addresses — omit them if not given.
2. Prices in Ugandan Shillings (UGX). If the description gives no prices, give realistic Uganda market prices for that business type.
3. Services: provide 3-6 items. Plans: provide exactly 3, with exactly one "popular": true. Testimonials: provide 3, realistic and modest.
4. Location must be in Uganda if mentioned (Kampala, Jinja, Entebbe, Gulu, Mbale, Mbarara, etc.).
5. Return valid JSON only.`;

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

function getClosestTemplate(description: string) {
  const lower = description.toLowerCase();
  if (lower.includes('pharmacy') || lower.includes('drug') || lower.includes('medicine') || lower.includes('chemist')) return FALLBACK_TEMPLATES['pharmacy-ug-1'];
  if (lower.includes('bakery') || lower.includes('cake') || lower.includes('pastry') || lower.includes('bread')) return FALLBACK_TEMPLATES['bakery-ug-1'];
  if (lower.includes('laundry') || lower.includes('dry clean') || lower.includes('washing clothes')) return FALLBACK_TEMPLATES['laundry-ug-1'];
  if (lower.includes('it support') || lower.includes('it consulting') || lower.includes('computer') || lower.includes('software') || lower.includes('network') || lower.includes('tech company') || lower.includes('laptops')) return FALLBACK_TEMPLATES['it-ug-1'];
  if (lower.includes('tutor') || lower.includes('tuition') || lower.includes('lessons') || lower.includes('teaching')) return FALLBACK_TEMPLATES['tutoring-ug-1'];
  if (lower.includes('hotel') || lower.includes('lodge') || lower.includes('cottage') || lower.includes('resort') || lower.includes('jinja')) return FALLBACK_TEMPLATES['hotel-ug-1'];
  if (lower.includes('gym') || lower.includes('fitness') || lower.includes('workout') || lower.includes('zumba') || lower.includes('aerobics')) return FALLBACK_TEMPLATES['gym-ug-1'];
  if (lower.includes('hardware') || lower.includes('cement') || lower.includes('iron sheet') || lower.includes('mbale') || lower.includes('construction')) return FALLBACK_TEMPLATES['hardware-mbale-1'];
  if (lower.includes('restaurant') || lower.includes('food') || lower.includes('luwombo') || lower.includes('tilapia') || lower.includes('pilau') || lower.includes('rolex') || lower.includes('cafe')) return FALLBACK_TEMPLATES['restaurant-ug-1'];
  if (lower.includes('boutique') || lower.includes('dress') || lower.includes('ankara') || lower.includes('suit') || lower.includes('handbag') || lower.includes('clothes')) return FALLBACK_TEMPLATES['boutique-ug-1'];
  if (lower.includes('school') || lower.includes('academy') || lower.includes('nursery') || lower.includes('primary') || lower.includes('uneb')) return FALLBACK_TEMPLATES['school-ug-1'];
  if (lower.includes('clinic') || lower.includes('hospital') || lower.includes('doctor') || lower.includes('maternity') || lower.includes('lab') || lower.includes('medical')) return FALLBACK_TEMPLATES['clinic-ug-1'];
  if (lower.includes('barbershop') || lower.includes('barber') || lower.includes('fade') || lower.includes('haircut') || lower.includes('shave')) return FALLBACK_TEMPLATES['barbershop-ug-1'];
  if (lower.includes('portfolio') || lower.includes('photography') || lower.includes('photographer') || lower.includes('wedding') || lower.includes('video')) return FALLBACK_TEMPLATES['portfolio-ug-1'];
  return FALLBACK_TEMPLATES['salon-ug-1'];
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
      const cloned = JSON.parse(JSON.stringify(fallback));
      cloned.id = `site-${Date.now().toString(36)}`;
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

    let lastError: any = null;

    for (const model of models) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 14000);

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
              { role: 'user', content: `Extract the business information for this Ugandan business: "${description}". Return raw JSON only.` },
            ],
            temperature: 0.4,
            max_tokens: 1600,
          }),
        });

        clearTimeout(timeoutId);

        if (!res.ok) {
          const errText = await res.text();
          lastError = `Model ${model} returned ${res.status}: ${errText.slice(0, 100)}`;
          continue;
        }

        const data = await res.json();
        const content = data.choices?.[0]?.message?.content;
        if (!content) continue;

        const ext = parseJSON(content) as ExtractedBusiness;
        if (!isUsableExtraction(ext)) continue;

        // Base template: trust a valid AI category, else keyword-match the description
        const slug = slugFromCategory(ext.category);
        const base = (slug && FALLBACK_TEMPLATES[slug]) || getClosestTemplate(description);

        const merged = mergeExtracted(base, ext, `gen-${Date.now().toString(36)}`);
        setCachedTemplate(description, merged);
        return Response.json(merged);
      } catch (err: any) {
        lastError = err.message;
      }
    }

    // If all models timed out/failed, load closest flagship template
    const fallback = getClosestTemplate(description);
    const cloned = JSON.parse(JSON.stringify(fallback));
    cloned.id = `gen-${Date.now().toString(36)}`;
    return Response.json(cloned);

  } catch (e: any) {
    console.error('Generate route exception:', e);
    const fallback = FALLBACK_TEMPLATES['salon-ug-1'];
    return Response.json({ ...JSON.parse(JSON.stringify(fallback)), id: `gen-${Date.now().toString(36)}` });
  }
}
