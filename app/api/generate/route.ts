// VoidBuild v2 API - Fixed Module Not Found using fs readFile for templates
export const runtime = 'nodejs';

import fs from 'fs';
import path from 'path';

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

function loadTemplates() {
  try {
    const templatesDir = path.join(process.cwd(), 'templates');
    const read = (name: string) => {
      const filePath = path.join(templatesDir, name);
      if (!fs.existsSync(filePath)) {
        // Try alternative path: app is in voidbuild/app, templates in voidbuild/templates, process.cwd() is voidbuild, so join works
        // If not found, try relative to this file
        const altPath = path.join(__dirname, '..', '..', '..', '..', 'templates', name);
        if (fs.existsSync(altPath)) {
          return JSON.parse(fs.readFileSync(altPath, 'utf8'));
        }
        throw new Error(`Template not found: ${name} at ${filePath}`);
      }
      return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    };

    return {
      'salon-ug-1': read('salon-ug-1.json'),
      'hardware-mbale-1': read('hardware-mbale-1.json'),
      'restaurant-ug-1': read('restaurant-ug-1.json'),
      'boutique-ug-1': read('boutique-ug-1.json'),
      'church-ug-1': read('church-ug-1.json'),
      'boda-ug-1': read('boda-ug-1.json'),
      'school-ug-1': read('school-ug-1.json'),
      'clinic-ug-1': read('clinic-ug-1.json'),
      'barbershop-ug-1': read('barbershop-ug-1.json'),
      'portfolio-ug-1': read('portfolio-ug-1.json'),
    };
  } catch (e) {
    console.error('Failed to load templates via fs, using minimal fallback:', e);
    // Minimal hardcoded fallback if fs fails
    const minimal = {
      id: 'salon-ug-1',
      name: 'Sample Business',
      category: 'salon',
      meta: { target: 'Salon' },
      blocks: [
        { id: 'nav-1', type: 'navbar', data: { businessName: 'Sample', phone: '+256 700 123456' }, style: { primaryColor: '#EC4899' } },
        { id: 'hero-1', type: 'hero', data: { title: 'Welcome', subtitle: 'Sample site', ctaText: 'Contact', image: 'business' }, style: { primaryColor: '#EC4899' } },
        { id: 'contact-1', type: 'contact', data: { phone: '+256 700 123456', location: 'Kampala' }, style: { primaryColor: '#EC4899' } },
        { id: 'footer-1', type: 'footer', data: { businessName: 'Sample', year: 2026 }, style: { primaryColor: '#EC4899' } },
      ]
    };
    return {
      'salon-ug-1': minimal,
      'hardware-mbale-1': minimal,
      'restaurant-ug-1': minimal,
      'boutique-ug-1': minimal,
      'church-ug-1': minimal,
      'boda-ug-1': minimal,
      'school-ug-1': minimal,
      'clinic-ug-1': minimal,
      'barbershop-ug-1': minimal,
      'portfolio-ug-1': minimal,
    };
  }
}

const FALLBACK_TEMPLATES = loadTemplates();

function getClosestTemplate(desc: string) {
  const lower = desc.toLowerCase();
  if (lower.includes('hardware') || lower.includes('cement')) return FALLBACK_TEMPLATES['hardware-mbale-1'];
  if (lower.includes('restaurant') || lower.includes('food')) return FALLBACK_TEMPLATES['restaurant-ug-1'];
  if (lower.includes('boutique') || lower.includes('fashion')) return FALLBACK_TEMPLATES['boutique-ug-1'];
  if (lower.includes('church')) return FALLBACK_TEMPLATES['church-ug-1'];
  if (lower.includes('boda') || lower.includes('garage')) return FALLBACK_TEMPLATES['boda-ug-1'];
  if (lower.includes('school')) return FALLBACK_TEMPLATES['school-ug-1'];
  if (lower.includes('clinic')) return FALLBACK_TEMPLATES['clinic-ug-1'];
  if (lower.includes('barbershop') || lower.includes('barber')) return FALLBACK_TEMPLATES['barbershop-ug-1'];
  if (lower.includes('portfolio') || lower.includes('photographer')) return FALLBACK_TEMPLATES['portfolio-ug-1'];
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
    const { description } = await req.json();
    if (!description || description.length < 5) {
      return Response.json({ error: 'Describe your business' }, { status: 400 });
    }

    const key = process.env.OPENROUTER_API_KEY;
    if (!key || !key.startsWith('sk-or-v1-')) {
      const fallback = getClosestTemplate(description);
      return Response.json({ ...JSON.parse(JSON.stringify(fallback)), id: `fallback-${Date.now()}`, _fallback: true });
    }

    const models = [
      'meta-llama/llama-3.3-70b-instruct:free',
      'meta-llama/llama-3.1-70b-instruct:free',
      'google/gemini-2.0-flash-exp:free',
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
    return Response.json({
      ...JSON.parse(JSON.stringify(fallback)),
      id: `fallback-${Date.now()}`,
      name: description.slice(0, 35),
      _fallback: true,
    });

  } catch (e: any) {
    try {
      const fallback = FALLBACK_TEMPLATES['salon-ug-1'];
      return Response.json({ ...JSON.parse(JSON.stringify(fallback)), id: `fallback-${Date.now()}`, _fallback: true });
    } catch {
      return Response.json({ error: 'Try shorter description' }, { status: 500 });
    }
  }
}
