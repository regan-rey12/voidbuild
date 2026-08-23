// VoidBuild Feedback API - public insert via server route, admin read disabled by default
export const runtime = 'nodejs';

import { getSupabaseAdmin } from '@/lib/supabase-admin';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { rating, comment, templateId, businessName, url, userAgent } = body || {};

    if (!rating || !['up', 'down'].includes(rating)) {
      return Response.json({ error: 'Rating required: up or down' }, { status: 400 });
    }

    const feedbackData = {
      rating,
      comment: String(comment || '').slice(0, 1000),
      template_id: templateId ? String(templateId).slice(0, 200) : null,
      business_name: businessName ? String(businessName).slice(0, 200) : null,
      url: url ? String(url).slice(0, 500) : null,
      user_agent: userAgent ? String(userAgent).slice(0, 500) : null,
      created_at: new Date().toISOString(),
    };

    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return Response.json({ success: true, message: 'Feedback accepted - database admin client not configured yet.' });
    }

    const { error } = await supabase.from('feedback').insert({
      ...feedbackData,
      user_id: null,
    });

    if (error) throw error;

    return Response.json({ success: true, message: 'Feedback saved - thank you!' });
  } catch (e: any) {
    return Response.json({ error: e.message || 'Failed to save feedback' }, { status: 500 });
  }
}

export async function GET() {
  return Response.json(
    {
      error: 'Feedback listing is disabled on this public endpoint. Use a protected admin route instead.',
      feedback: [],
    },
    { status: 403 }
  );
}
