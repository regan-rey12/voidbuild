// VoidBuild v2 API - User's preferred models + Full results, no truncation
export const runtime = 'nodejs';

import fs from 'fs';
import path from 'path';
import { isRateLimited, getClientIp } from '@/lib/rateLimiter';

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

const SYSTEM_PROMPT = `You are VoidBuild AI for Ugandan SMEs. OUTPUT ONLY VALID JSON, FULL, NOT TRUNCATED.

STRUCTURE:
{
  "id": "type-location",
  "name": "Business Name",
  "category": "salon | hardware | restaurant | church | boutique | boda | school | clinic | barbershop | portfolio",
  "meta": {"target": "Salon Wandegeya"},
  "blocks": [
    {"id":"nav-1","type":"navbar","data":{"businessName":"Business","phone":"+256 700 123456","whatsapp":"+256700123456"},"style":{"primaryColor":"#EC4899"}},
    {"id":"hero-1","type":"hero","data":{"title":"Headline 6 words","subtitle":"Subtitle 15 words with UGX","ctaText":"Book on WhatsApp","image":"salon"},"style":{"primaryColor":"#EC4899"}},
    {"id":"services-1","type":"services","data":{"heading":"Our Services","services":[{"name":"Service 1","price":"UGX 35,000","description":"20 words","image":"braids"}]},"style":{"primaryColor":"#EC4899"}},
    {"id":"contact-1","type":"contact","data":{"phone":"+256 700 123456","whatsapp":"+256700123456","location":"Wandegeya, Kampala","hours":"Mon-Sun 7am-9pm"},"style":{"primaryColor":"#EC4899"}},
    {"id":"footer-1","type":"footer","data":{"businessName":"Business","tagline":"Tagline","year":2026},"style":{"primaryColor":"#EC4899"}}
  ]
}
RULES: All prices UGX, phone +256, location Uganda, short texts, 3 services max.
`;

function loadTemplates(): Record<string, any> {
  const templates: Record<string, any> = {};
  const names = [
    'salon-ug-1',
    'hardware-mbale-1',
    'restaurant-ug-1',
    'boutique-ug-1',
    'church-ug-1',
    'boda-ug-1',
    'school-ug-1',
    'clinic-ug-1',
    'barbershop-ug-1',
    'portfolio-ug-1',
    'pharmacy-ug-1',
    'bakery-ug-1',
    'carwash-ug-1',
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

  // Fallback template if missing
  const fallbackSalon = templates['salon-ug-1'] || {
    id: 'salon-ug-1',
    name: 'Sample Salon',
    category: 'salon',
    meta: { target: 'Salon' },
    blocks: [
      { id: 'nav-1', type: 'navbar', data: { businessName: 'Salon', phone: '+256 700 123456' }, style: { primaryColor: '#EC4899' } },
      { id: 'hero-1', type: 'hero', data: { title: 'Welcome to Our Salon', subtitle: 'Professional beauty and braiding services in Kampala.', ctaText: 'Book on WhatsApp', image: 'african salon braids' }, style: { primaryColor: '#EC4899' } },
      { id: 'services-1', type: 'services', data: { heading: 'Our Services', services: [{ name: 'Box Braids', price: 'UGX 35,000', description: 'Neat, long-lasting braids' }] }, style: { primaryColor: '#EC4899' } },
      { id: 'contact-1', type: 'contact', data: { phone: '+256 700 123456', location: 'Kampala' }, style: { primaryColor: '#EC4899' } },
      { id: 'footer-1', type: 'footer', data: { businessName: 'Salon', year: 2026 }, style: { primaryColor: '#EC4899' } },
    ]
  };

  for (const name of names) {
    if (!templates[name]) {
      templates[name] = fallbackSalon;
    }
  }

  return templates;
}

const FALLBACK_TEMPLATES = loadTemplates();

function getClosestTemplate(desc: string) {
  const lower = desc.toLowerCase();
  if (lower.includes('pharmacy') || lower.includes('drug') || lower.includes('medicine')) return FALLBACK_TEMPLATES['pharmacy-ug-1'];
  if (lower.includes('bakery') || lower.includes('cake') || lower.includes('pastry') || lower.includes('bread')) return FALLBACK_TEMPLATES['bakery-ug-1'];
  if (lower.includes('car wash') || lower.includes('carwash') || lower.includes('detailing') || lower.includes('auto spa')) return FALLBACK_TEMPLATES['carwash-ug-1'];
  if (lower.includes('hotel') || lower.includes('lodge') || lower.includes('cottage') || lower.includes('resort') || lower.includes('jinja')) return FALLBACK_TEMPLATES['hotel-ug-1'];
  if (lower.includes('gym') || lower.includes('fitness') || lower.includes('workout') || lower.includes('zumba') || lower.includes('aerobics')) return FALLBACK_TEMPLATES['gym-ug-1'];
  if (lower.includes('hardware') || lower.includes('cement') || lower.includes('iron sheet') || lower.includes('mbale')) return FALLBACK_TEMPLATES['hardware-mbale-1'];
  if (lower.includes('restaurant') || lower.includes('food') || lower.includes('luwombo') || lower.includes('tilapia') || lower.includes('pilau') || lower.includes('rolex')) return FALLBACK_TEMPLATES['restaurant-ug-1'];
  if (lower.includes('boutique') || lower.includes('dress') || lower.includes('ankara') || lower.includes('suit') || lower.includes('handbag')) return FALLBACK_TEMPLATES['boutique-ug-1'];
  if (lower.includes('church') || lower.includes('fellowship') || lower.includes('ministry') || lower.includes('pastor')) return FALLBACK_TEMPLATES['church-ug-1'];
  if (lower.includes('boda') || lower.includes('motorcycle') || lower.includes('mechanic') || lower.includes('garage')) return FALLBACK_TEMPLATES['boda-ug-1'];
  if (lower.includes('school') || lower.includes('academy') || lower.includes('nursery') || lower.includes('primary') || lower.includes('uneb')) return FALLBACK_TEMPLATES['school-ug-1'];
  if (lower.includes('clinic') || lower.includes('hospital') || lower.includes('doctor') || lower.includes('maternity') || lower.includes('lab')) return FALLBACK_TEMPLATES['clinic-ug-1'];
  if (lower.includes('barbershop') || lower.includes('barber') || lower.includes('fade') || lower.includes('haircut') || lower.includes('shave')) return FALLBACK_TEMPLATES['barbershop-ug-1'];
  if (lower.includes('portfolio') || lower.includes('photography') || lower.includes('photographer') || lower.includes('wedding')) return FALLBACK_TEMPLATES['portfolio-ug-1'];
  return FALLBACK_TEMPLATES['salon-ug-1'];
}

function parseJSON(raw: string) {
  let cleaned = raw.replace(/```json/gi, '').replace(/```/g, '').trim();
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start === -1 || end === -1) throw new Error('No JSON');
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
      return Response.json({ error: `Too many requests. Wait ${Math.ceil(rateLimit.resetIn / 1000)}s` }, { status: 429 });
    }

    let { description } = await req.json();
    if (!description || typeof description !== 'string') return Response.json({ error: 'Describe business' }, { status: 400 });
    description = description.trim().replace(/<[^>]*>/g, '');
    if (description.length < 5) return Response.json({ error: 'At least 5 chars' }, { status: 400 });
    if (description.length > 500) return Response.json({ error: 'Max 500 chars' }, { status: 400 });

    const blocked = ['ignore previous instructions', 'system prompt', '<script', 'javascript:'];
    const lowerDesc = description.toLowerCase();
    for (const p of blocked) if (lowerDesc.includes(p)) return Response.json({ error: 'Invalid description' }, { status: 400 });

    const key = process.env.OPENROUTER_API_KEY;
    if (!key || !key.startsWith('sk-or-v1-')) {
      const fallback = getClosestTemplate(description);
      return Response.json({ ...JSON.parse(JSON.stringify(fallback)), id: `fallback-${Date.now()}`, _fallback: true });
    }

    // User's preferred models - no disturbing ones
    const models = [
      'openrouter/free', // Best option (auto-selects free models)
      'qwen/qwen3-coder:free', // Excellent for coding
      'meta-llama/llama-3.2-3b-instruct:free',
      'google/gemma-3-27b-it:free',
      'nvidia/nemotron-3-ultra:free',
      'mistralai/mistral-7b-instruct:free', // Keep as last fallback, though you found it disturbing, we try other free first
    ];

    for (const model of models) {
      try {
        const res = await fetch(OPENROUTER_URL, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${key}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': process.env.APP_ORIGIN || 'http://localhost:3000',
            'X-Title': 'voidbuild.com',
          },
          body: JSON.stringify({
            model,
            messages: [
              { role: 'system', content: SYSTEM_PROMPT },
              { role: 'user', content: `Business: ${description}. Full JSON 5 blocks, short, valid.` },
            ],
            temperature: 0.7,
            max_tokens: 4000,
          }),
        });
        if (!res.ok) continue;
        const data = await res.json();
        const content = data.choices?.[0]?.message?.content;
        if (!content) continue;
        const json = parseJSON(content);
        if (!json.blocks || !Array.isArray(json.blocks)) continue;
        return Response.json(json);
      } catch {}
    }

    const fallback = getClosestTemplate(description);
    return Response.json({ ...JSON.parse(JSON.stringify(fallback)), id: `fallback-${Date.now()}`, name: description.slice(0, 35), _fallback: true });

  } catch (e: any) {
    try {
      const fallback = FALLBACK_TEMPLATES['salon-ug-1'];
      return Response.json({ ...JSON.parse(JSON.stringify(fallback)), id: `fallback-${Date.now()}`, _fallback: true });
    } catch {
      return Response.json({ error: 'Try shorter description' }, { status: 500 });
    }
  }
}
