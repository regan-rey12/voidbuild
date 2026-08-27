export const runtime = 'nodejs';

import { getAuthenticatedUserFromRequest } from '@/lib/auth-server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

const ALLOWED_STATUSES = new Set(['new', 'contacted', 'closed', 'spam']);

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(req: Request, context: RouteContext) {
  try {
    const user = await getAuthenticatedUserFromRequest(req);
    if (!user?.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;
    const body = await req.json().catch(() => ({}));
    const status = String(body.status || '').trim().toLowerCase();

    if (!ALLOWED_STATUSES.has(status)) {
      return Response.json({ error: 'Invalid lead status.' }, { status: 400 });
    }

    const admin = getSupabaseAdmin();
    if (!admin) {
      return Response.json({ error: 'Supabase service role is not configured on the server.' }, { status: 500 });
    }

    const { data: lead, error: leadError } = await admin
      .from('leads')
      .select('id, project_id')
      .eq('id', id)
      .limit(1)
      .maybeSingle();

    if (leadError) {
      return Response.json({ error: leadError.message }, { status: 500 });
    }

    if (!lead?.id) {
      return Response.json({ error: 'Lead not found.' }, { status: 404 });
    }

    const { data: project, error: projectError } = await admin
      .from('projects')
      .select('id, user_id')
      .eq('id', lead.project_id)
      .limit(1)
      .maybeSingle();

    if (projectError) {
      return Response.json({ error: projectError.message }, { status: 500 });
    }

    if (!project?.id || project.user_id !== user.id) {
      return Response.json({ error: 'You do not have permission to update this inquiry.' }, { status: 403 });
    }

    const { error: updateError } = await admin
      .from('leads')
      .update({ status })
      .eq('id', id);

    if (updateError) {
      return Response.json({ error: updateError.message }, { status: 500 });
    }

    return Response.json({ success: true, id, status });
  } catch (e: any) {
    return Response.json({ error: e.message || 'Failed to update inquiry status.' }, { status: 500 });
  }
}
