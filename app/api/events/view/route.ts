export const runtime = 'nodejs';

import { getSupabaseAdmin } from '@/lib/supabase-admin';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const projectId = String(body.projectId || '').trim();

    if (!projectId) {
      return Response.json({ error: 'projectId is required' }, { status: 400 });
    }

    const admin = getSupabaseAdmin();
    if (!admin) {
      return Response.json({ error: 'Supabase service role is not configured on the server.' }, { status: 500 });
    }

    const referrer = (req.headers.get('referer') || '').slice(0, 500) || null;
    const userAgent = (req.headers.get('user-agent') || '').slice(0, 500) || null;
    const visitorHash = String(body.visitorHash || '').slice(0, 120) || null;

    await admin.from('events').insert({
      project_id: projectId,
      event_type: 'page_view',
      referrer,
      user_agent: userAgent,
      visitor_hash: visitorHash,
      metadata: { source: body.source || 'public_page' },
    });

    const { data: project } = await admin
      .from('projects')
      .select('id, views')
      .eq('id', projectId)
      .limit(1)
      .maybeSingle();

    if (project?.id) {
      await admin
        .from('projects')
        .update({ views: (project.views || 0) + 1, updated_at: new Date().toISOString() })
        .eq('id', projectId);
    }

    return Response.json({ success: true });
  } catch (e: any) {
    return Response.json({ error: e.message || 'Failed to record page view' }, { status: 500 });
  }
}
