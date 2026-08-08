// VoidBuild Feedback API - Saves feedback to Supabase + localStorage fallback
export const runtime = 'nodejs';

import { getSupabase } from '../../../lib/supabase';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { rating, comment, templateId, businessName, url, userAgent } = body;

    if (!rating || !['up', 'down'].includes(rating)) {
      return Response.json({ error: 'Rating required: up or down' }, { status: 400 });
    }

    const feedbackData = {
      rating,
      comment: (comment || '').slice(0, 1000),
      template_id: templateId || null,
      business_name: businessName || null,
      url: url || null,
      user_agent: userAgent || null,
      created_at: new Date().toISOString(),
    };

    const supabase = getSupabase();
    if (supabase) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        const { error } = await supabase.from('feedback').insert({
          ...feedbackData,
          user_id: user?.id || null,
        });
        if (error) throw error;
      } catch (e) {
        console.warn('Supabase feedback save failed, will use localStorage fallback on client:', e);
        // Don't fail request, client will save to localStorage as fallback
      }
    }

    return Response.json({ success: true, message: 'Feedback saved - thank you!' });
  } catch (e: any) {
    return Response.json({ error: e.message || 'Failed to save feedback' }, { status: 500 });
  }
}

export async function GET() {
  // For admin to list feedback (requires auth, but for MVP allow anon read with RLS)
  const supabase = getSupabase();
  if (!supabase) {
    return Response.json({ feedback: [], message: 'Supabase not configured, feedback saved locally only' });
  }

  try {
    const { data, error } = await supabase
      .from('feedback')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;
    return Response.json({ feedback: data || [] });
  } catch (e: any) {
    return Response.json({ error: e.message, feedback: [] }, { status: 500 });
  }
}
