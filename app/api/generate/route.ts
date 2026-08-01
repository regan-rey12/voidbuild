// VoidBuild v2 API - FIXED free models + better errors
export const runtime = 'edge';

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

const SYSTEM_PROMPT = `You are VoidBuild AI, expert for Ugandan SMEs.

OUTPUT ONLY VALID JSON. No markdown, no code fences.

STRUCTURE (MUST FOLLOW):
{
  "id": "type-location-number",
  "name": "Business Name",
  "category": "salon | hardware | restaurant | church | shop | boda | school | clinic | boutique | barbershop | portfolio",
  "description": "short",
  "meta": {"target": "Salon in Wandegeya", "language": "en"},
  "blocks": [
    {"id":"nav-1","type":"navbar","data":{"businessName":"Aisha's Beauty","phone":"+256 700 123456","whatsapp":"+256700123456","links":[{"label":"Services","href":"#services"},{"label":"Contact","href":"#contact"}]},"style":{"primaryColor":"#EC4899"}},
    {"id":"hero-1","type":"hero","data":{"badge":"#1 Rated in Wandegeya","title":"Slay Every Day","subtitle":"Braids, natural hair. MTN MoMo accepted. Open 7am-9pm.","ctaText":"Book on WhatsApp","ctaLink":"#contact","image":"african salon braids"},"style":{"primaryColor":"#EC4899","alignment":"left"}},
    {"id":"services-1","type":"services","data":{"heading":"Our Services - Fair Prices","subheading":"Students 10% off","services":[{"name":"Box Braids","price":"UGX 35,000","description":"Neat, long-lasting 3-4hrs","icon":"💇🏾‍♀️"}]},"style":{"primaryColor":"#EC4899"}},
    {"id":"contact-1","type":"contact","data":{"heading":"Find Us in Wandegeya","phone":"+256 700 123456","whatsapp":"+256700123456","location":"Wandegeya Market, Shop 12A, Kampala","hours":"Mon-Sun 7am-9pm"},"style":{"primaryColor":"#EC4899"}},
    {"id":"footer-1","type":"footer","data":{"businessName":"Aisha's Beauty","tagline":"Braids • Natural Hair • Wandegeya","year":2026},"style":{"primaryColor":"#EC4899"}}
  ]
}

RULES:
- primaryColor by category: salon=#EC4899 pink, hardware=#F59E0B amber, restaurant=#EF4444 red, church=#6366F1 indigo, shop=#10B981 emerald, boda=#111827 black, school=#0EA5E9 sky, clinic=#06B6D4 cyan, boutique=#EC4899 pink, barbershop=#111827 black
- All prices MUST be UGX: "UGX 35,000"
- Always include phone + whatsapp in +256 format
- Mention MTN MoMo / Airtel Money in subtitle if shop
- Location Ugandan: Wandegeya, Mbale, Mbarara, Gulu, Kampala, Ntinda, Entebbe
- 3-6 services, each price UGX, icon emoji
- Short text, mobile-friendly
`;

function parseJSON(raw: string) {
  const cleaned = raw.replace(/```json/gi, '').replace(/```/g, '').trim();
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start === -1 || end === -1) throw new Error('No JSON object found in model output: ' + cleaned.slice(0,200));
  return JSON.parse(cleaned.slice(start, end + 1));
}

export async function POST(req: Request) {
  try {
    const { description } = await req.json();
    if (!description || description.length < 5) {
      return Response.json({ error: 'Describe your business (e.g. Salon in Wandegeya)' }, { status: 400 });
    }

    const key = process.env.OPENROUTER_API_KEY;
    if (!key || !key.startsWith('sk-or-v1-')) {
      return Response.json({ error: 'OPENROUTER_API_KEY missing or invalid in .env.local. Get free key at openrouter.ai/keys - should start with sk-or-v1-' }, { status: 500 });
    }

    // UPDATED FREE MODELS 2026 - Working list (OpenRouter retired some)
    const models = [
      'meta-llama/llama-3.3-70b-instruct:free', // NEW best free
      'meta-llama/llama-3.1-70b-instruct:free',
      'meta-llama/llama-3.1-8b-instruct:free',
      'google/gemini-2.0-flash-exp:free', // Gemini free works great for JSON
      'deepseek/deepseek-r1:free',
      'qwen/qwen-2.5-72b-instruct:free',
      'mistralai/mistral-small-24b-instruct-2501:free', // replacement for 7b
      'openchat/openchat-7b:free',
    ];

    let attempts: string[] = [];
    for (const model of models) {
      try {
        console.log(`Trying model: ${model}`);
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
              { role: 'user', content: `Business Description: ${description}` },
            ],
            temperature: 0.7,
            max_tokens: 2500,
          }),
        });

        if (!res.ok) {
          const body = await res.text();
          attempts.push(`${model}: HTTP ${res.status} - ${body.slice(0,200)}`);
          continue; // try next model
        }

        const data = await res.json();
        const content = data.choices?.[0]?.message?.content;
        if (!content) {
          attempts.push(`${model}: empty content`);
          continue;
        }

        const json = parseJSON(content);
        if (!json.blocks || !Array.isArray(json.blocks)) {
          attempts.push(`${model}: invalid blocks`);
          continue;
        }

        // Success!
        return Response.json(json);
      } catch (e: any) {
        attempts.push(`${model}: ${e.message}`);
      }
    }

    // All failed - return detailed error
    return Response.json({ 
      error: `All models failed. Your key might be invalid or rate limited. Attempts: ${attempts.join(' | ').slice(0, 1000)}`,
      attempts 
    }, { status: 500 });

  } catch (e: any) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
