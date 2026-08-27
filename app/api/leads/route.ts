export const runtime = 'nodejs';

import { getSupabaseAdmin } from '@/lib/supabase-admin';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));

    const projectId = String(body.projectId || '').trim();
    const name = String(body.name || '').trim();
    const phone = String(body.phone || '').trim();
    const message = String(body.message || '').trim();
    const source = String(body.source || 'website').trim().slice(0, 50);

    if (!projectId) {
      return Response.json({ error: 'projectId is required' }, { status: 400 });
    }
    if (!name || name.length < 2) {
      return Response.json({ error: 'Please enter a valid name.' }, { status: 400 });
    }
    if (!message || message.length < 3) {
      return Response.json({ error: 'Please enter a valid message.' }, { status: 400 });
    }

    const admin = getSupabaseAdmin();
    if (!admin) {
      return Response.json({ error: 'Supabase service role is not configured on the server.' }, { status: 500 });
    }

    const { data: project } = await admin
      .from('projects')
      .select('id')
      .eq('id', projectId)
      .limit(1)
      .maybeSingle();

    if (!project?.id) {
      return Response.json({ error: 'This website could not be found.' }, { status: 404 });
    }

    const { error } = await admin.from('leads').insert({
      project_id: projectId,
      name: name.slice(0, 120),
      phone: phone ? phone.slice(0, 60) : null,
      message: message.slice(0, 2000),
      source,
      status: 'new',
    });

    if (error) throw error;

    return Response.json({ success: true, message: 'Lead saved successfully.' });
  } catch (e: any) {
    return Response.json({ error: e.message || 'Failed to submit lead' }, { status: 500 });
  }
}
