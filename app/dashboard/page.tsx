"use client";
import { useEffect, useMemo, useState } from 'react';
import {
  getProjects,
  deleteProject,
  SavedProject,
  updateProjectSubdomain,
  validateSubdomain,
  claimLocalProjects,
} from '@/lib/projects';
import { getAccessToken, getEffectiveUser, User } from '@/lib/auth';
import { getUserPlan, PLANS, Plan, refreshUserPlanFromCloud, getSubscriptionSnapshotFromCloud } from '@/lib/payments';
import { getSupabase } from '@/lib/supabase';
import TopNav from '@/components/TopNav';
import Paywall from '@/components/Paywall';
import DomainCenter from '@/components/DomainCenter';
import Link from 'next/link';
import {
  Plus,
  Trash2,
  ExternalLink,
  Edit3,
  Copy,
  Check,
  AlertTriangle,
  Rocket,
  Crown,
  MessageCircle,
  Eye,
  Globe,
  Link as LinkIcon,
  X,
  Share2,
  Lock,
  Clock3,
  BarChart3,
} from 'lucide-react';

type LeadStatus = 'new' | 'contacted' | 'closed' | 'spam';

type LeadFilter = 'all' | LeadStatus;

interface DashboardLead {
  id: string;
  project_id: string;
  name: string;
  phone?: string | null;
  message: string;
  status: LeadStatus;
  created_at?: string;
}

function startOfDaysAgo(days: number) {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() - days);
  return date;
}

function formatDelta(current: number, previous: number) {
  const diff = current - previous;
  if (diff > 0) return `+${diff} vs previous 7 days`;
  if (diff < 0) return `${diff} vs previous 7 days`;
  return 'No change vs previous 7 days';
}

function leadStatusClasses(status: LeadStatus) {
  switch (status) {
    case 'new':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'contacted':
      return 'bg-yellow-50 text-yellow-800 border-yellow-200';
    case 'closed':
      return 'bg-green-50 text-green-700 border-green-200';
    case 'spam':
      return 'bg-red-50 text-red-700 border-red-200';
    default:
      return 'bg-gray-100 text-gray-700 border-gray-200';
  }
}

export default function Dashboard() {
  const [projects, setProjects] = useState<SavedProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [paymentMsg, setPaymentMsg] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deleteConfirmProj, setDeleteConfirmProj] = useState<SavedProject | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [paywallDismissed, setPaywallDismissed] = useState(false);
  const [statusNotification, setStatusNotification] = useState<string | null>(null);
  const [currentPlan, setCurrentPlan] = useState<Plan>(getUserPlan());
  const [leads, setLeads] = useState<DashboardLead[]>([]);
  const [leadFilter, setLeadFilter] = useState<LeadFilter>('all');
  const [leadStatusSavingId, setLeadStatusSavingId] = useState<string | null>(null);
  const [views7d, setViews7d] = useState(0);
  const [viewsPrev7d, setViewsPrev7d] = useState(0);
  const [clicks7d, setClicks7d] = useState(0);
  const [clicksPrev7d, setClicksPrev7d] = useState(0);
  const [subscriptionState, setSubscriptionState] = useState<{ status: string; expiresAt?: string | null; graceEndsAt?: string | null } | null>(null);

  const [managingProj, setManagingProj] = useState<SavedProject | null>(null);
  const [subdomainInput, setSubdomainInput] = useState('');
  const [customDomainInput, setCustomDomainInput] = useState('');
  const [subdomainError, setSubdomainError] = useState<string | null>(null);
  const [subdomainSaving, setSubdomainSaving] = useState(false);
  const [subdomainSuccess, setSubdomainSuccess] = useState(false);
  const [confirmSubdomainChange, setConfirmSubdomainChange] = useState(false);
  const [customDomainStatus, setCustomDomainStatus] = useState<'none' | 'pending_dns' | 'active' | 'provider_unconfigured' | 'error'>('none');
  const [customDomainVerification, setCustomDomainVerification] = useState<Array<{ type?: string; domain?: string; value?: string; reason?: string }>>([]);
  const [customDomainBusy, setCustomDomainBusy] = useState(false);
  const [customDomainMessage, setCustomDomainMessage] = useState<string | null>(null);

  const fetchUserProjects = async (currentUser: User | null) => {
    try {
      if (currentUser?.id) {
        await claimLocalProjects(currentUser.id);
        const snapshot = await getSubscriptionSnapshotFromCloud(currentUser.id);
        setCurrentPlan(snapshot.plan);
        setSubscriptionState({ status: snapshot.status, expiresAt: snapshot.expiresAt, graceEndsAt: snapshot.graceEndsAt });
      }

      const loadedProjects = await getProjects();
      const filteredProjects = loadedProjects.filter((proj) => {
        const projAny = proj as any;
        if (projAny.user_id && currentUser && projAny.user_id !== currentUser.id && !projAny.user_id.startsWith('demo')) return false;
        return true;
      });
      setProjects(filteredProjects);

      if (currentUser?.id) {
        const supabase = getSupabase();
        if (supabase) {
          const [leadRes, eventRes] = await Promise.all([
            supabase
              .from('leads')
              .select('id, project_id, name, phone, message, status, created_at')
              .order('created_at', { ascending: false })
              .limit(50),
            supabase
              .from('events')
              .select('id, project_id, event_type, created_at')
              .order('created_at', { ascending: false })
              .limit(300),
          ]);

          const leadRows = ((leadRes.data as DashboardLead[] | null) || []).map((lead) => ({
            ...lead,
            status: (lead.status || 'new') as LeadStatus,
          }));
          setLeads(leadRows);

          const eventRows = (eventRes.data as Array<{ event_type: string; created_at?: string }> | null) || [];

          const start7 = startOfDaysAgo(7).getTime();
          const start14 = startOfDaysAgo(14).getTime();
          let recentViews = 0;
          let recentClicks = 0;
          let prevViews = 0;
          let prevClicks = 0;

          for (const event of eventRows) {
            const ts = event.created_at ? new Date(event.created_at).getTime() : 0;
            if (!ts) continue;
            const isView = event.event_type === 'page_view';
            const isClick = event.event_type === 'whatsapp_click';

            if (ts >= start7) {
              if (isView) recentViews++;
              if (isClick) recentClicks++;
            } else if (ts >= start14 && ts < start7) {
              if (isView) prevViews++;
              if (isClick) prevClicks++;
            }
          }

          setViews7d(recentViews);
          setViewsPrev7d(prevViews);
          setClicks7d(recentClicks);
          setClicksPrev7d(prevClicks);
        }
      }
    } catch (e: any) {
      console.warn('Dashboard load warning:', e?.message || e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const payment = params.get('payment');
    if (payment === 'success') {
      setPaymentMsg('Payment successful! Your subscription is now active.');
      window.history.replaceState({}, '', '/dashboard');
    } else if (payment === 'renewed') {
      setPaymentMsg('Payment successful! Your plan has been renewed.');
      window.history.replaceState({}, '', '/dashboard');
    } else if (payment === 'failed') {
      setPaymentMsg('Payment was not completed. You can try again whenever you are ready.');
      window.history.replaceState({}, '', '/dashboard');
    } else if (payment === 'error') {
      setPaymentMsg('We could not confirm your payment automatically. Please contact support if you were charged.');
      window.history.replaceState({}, '', '/dashboard');
    }

    const domainOrder = params.get('domainOrder');
    if (domainOrder === 'success') {
      setPaymentMsg(`Domain registration payment confirmed${params.get('domain') ? ` for ${params.get('domain')}` : ''}. Check Domain Center for DNS instructions.`);
      window.history.replaceState({}, '', '/dashboard');
    } else if (domainOrder === 'pending') {
      setPaymentMsg('Your domain payment was confirmed, but the registrar is still completing the order. Check Domain Center again shortly.');
      window.history.replaceState({}, '', '/dashboard');
    } else if (domainOrder === 'failed' || domainOrder === 'error') {
      setPaymentMsg('The domain order could not be completed. No subscription changes were made.');
      window.history.replaceState({}, '', '/dashboard');
    }

    const checkUser = async () => {
      let u = await getEffectiveUser();
      if (!u) {
        await new Promise((r) => setTimeout(r, 350));
        u = await getEffectiveUser();
      }

      setUser(u);
      setAuthChecked(true);
      if (!u) {
        window.location.href = '/auth';
        return;
      }
      fetchUserProjects(u);
    };

    checkUser();
  }, []);

  const filteredLeads = useMemo(() => {
    return leadFilter === 'all' ? leads : leads.filter((lead) => lead.status === leadFilter);
  }, [leads, leadFilter]);

  const handleCopyLink = async (url: string, id: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2500);
    } catch {}
  };

  const handleDeleteProject = async (proj: SavedProject) => {
    setDeleting(true);
    try {
      await deleteProject(proj.id);
      setProjects((prev) => prev.filter((p) => p.id !== proj.id));
      setLeads((prev) => prev.filter((lead) => lead.project_id !== proj.id));
      setDeleteConfirmProj(null);
      setStatusNotification(`Website "${proj.business_name}" deleted. You now have slot available to build a new website.`);
      setTimeout(() => setStatusNotification(null), 5000);
    } catch (e: any) {
      setStatusNotification(`Unable to delete website: ${e.message || 'Please try again'}`);
    } finally {
      setDeleting(false);
    }
  };

  const loadCustomDomainStatus = async (projectId: string) => {
    try {
      const token = await getAccessToken();
      if (!token) return;
      const res = await fetch(`/api/domains?projectId=${encodeURIComponent(projectId)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Unable to load domain status.');
      setCustomDomainStatus(data.status || 'none');
      setCustomDomainVerification(Array.isArray(data.verification) ? data.verification : []);
    } catch (e: any) {
      setCustomDomainMessage(e.message || 'Unable to load domain status.');
    }
  };

  const openLinkManager = (p: SavedProject) => {
    setManagingProj(p);
    setSubdomainInput(p.subdomain || p.id.split('-')[0] || 'my-shop');
    setCustomDomainInput(p.custom_domain || '');
    setSubdomainError(null);
    setSubdomainSuccess(false);
    setConfirmSubdomainChange(false);
    setCustomDomainStatus(p.custom_domain ? 'pending_dns' : 'none');
    setCustomDomainVerification([]);
    setCustomDomainMessage(null);
    if (p.custom_domain) void loadCustomDomainStatus(p.id);
  };

  const handleConnectCustomDomain = async () => {
    if (!managingProj || !customDomainInput.trim()) {
      setCustomDomainMessage('Enter the domain you want to connect.');
      return;
    }
    setCustomDomainBusy(true);
    setCustomDomainMessage(null);
    try {
      const token = await getAccessToken();
      if (!token) throw new Error('Please sign in again to connect a domain.');
      const res = await fetch('/api/domains', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ projectId: managingProj.id, domain: customDomainInput }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Unable to connect this domain.');
      const domain = data.domain || customDomainInput.trim().toLowerCase();
      setCustomDomainInput(domain);
      setCustomDomainStatus(data.status || 'pending_dns');
      setCustomDomainVerification(Array.isArray(data.verification) ? data.verification : []);
      setProjects((prev) => prev.map((p) => p.id === managingProj.id ? { ...p, custom_domain: domain } : p));
      setCustomDomainMessage(data.verified ? 'Domain connected and ready.' : 'Domain saved. Add the DNS record below, then check again.');
    } catch (e: any) {
      setCustomDomainStatus('error');
      setCustomDomainMessage(e.message || 'Unable to connect this domain.');
    } finally {
      setCustomDomainBusy(false);
    }
  };

  const handleCheckCustomDomain = async () => {
    if (!managingProj || !customDomainInput.trim()) return;
    setCustomDomainBusy(true);
    setCustomDomainMessage(null);
    try {
      const token = await getAccessToken();
      if (!token) throw new Error('Please sign in again to check this domain.');
      const res = await fetch('/api/domains/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ projectId: managingProj.id, domain: customDomainInput }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Unable to check DNS right now.');
      setCustomDomainStatus(data.status || 'pending_dns');
      setCustomDomainVerification(Array.isArray(data.verification) ? data.verification : []);
      setCustomDomainMessage(data.verified ? 'Domain connected and ready.' : 'DNS is not ready yet. Check the record and try again.');
    } catch (e: any) {
      setCustomDomainStatus('error');
      setCustomDomainMessage(e.message || 'Unable to check DNS right now.');
    } finally {
      setCustomDomainBusy(false);
    }
  };

  const handleDisconnectCustomDomain = async () => {
    if (!managingProj || !customDomainInput.trim()) return;
    if (!window.confirm(`Disconnect ${customDomainInput}? The website will keep working on its VoidBuild subdomain.`)) return;
    setCustomDomainBusy(true);
    setCustomDomainMessage(null);
    try {
      const token = await getAccessToken();
      if (!token) throw new Error('Please sign in again to disconnect this domain.');
      const res = await fetch(`/api/domains?projectId=${encodeURIComponent(managingProj.id)}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Unable to disconnect this domain.');
      setCustomDomainInput('');
      setCustomDomainStatus('none');
      setCustomDomainVerification([]);
      setCustomDomainMessage('Domain disconnected. Your VoidBuild subdomain is still available.');
      setProjects((prev) => prev.map((p) => p.id === managingProj.id ? { ...p, custom_domain: undefined } : p));
    } catch (e: any) {
      setCustomDomainStatus('error');
      setCustomDomainMessage(e.message || 'Unable to disconnect this domain.');
    } finally {
      setCustomDomainBusy(false);
    }
  };

  const copyDomainText = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCustomDomainMessage('DNS value copied.');
      setTimeout(() => setCustomDomainMessage(null), 2500);
    } catch {
      setCustomDomainMessage('Copy failed. Select the DNS value manually.');
    }
  };

  const handleSaveSubdomain = async () => {
    if (!managingProj) return;
    setSubdomainError(null);
    setSubdomainSaving(true);

    const originalSubdomain = (managingProj.subdomain || managingProj.id.split('-')[0] || 'my-shop').toLowerCase().trim();
    const nextSubdomain = subdomainInput.toLowerCase().trim();

    if (nextSubdomain !== originalSubdomain && !confirmSubdomainChange) {
      setSubdomainError('Please confirm that you understand changing this website address may break old shared links and bookmarks.');
      setSubdomainSaving(false);
      return;
    }

    const val = validateSubdomain(subdomainInput);
    if (!val.valid) {
      setSubdomainError(val.error || 'Invalid subdomain');
      setSubdomainSaving(false);
      return;
    }

    const res = await updateProjectSubdomain(managingProj.id, subdomainInput);
    if (!res.success) {
      setSubdomainError(res.error || 'Failed to update subdomain');
    } else {
      setProjects((prev) =>
        prev.map((p) =>
          p.id === managingProj.id
            ? { ...p, subdomain: subdomainInput.toLowerCase().trim() }
            : p
        )
      );
      setSubdomainSuccess(true);
      setTimeout(() => setSubdomainSuccess(false), 3000);
    }
    setSubdomainSaving(false);
  };

  const handleLeadStatusChange = async (leadId: string, status: LeadStatus) => {
    try {
      setLeadStatusSavingId(leadId);
      const token = await getAccessToken();
      if (!token) {
        throw new Error('Please sign in again to update inquiry status.');
      }

      const res = await fetch(`/api/leads/${leadId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Unable to update inquiry status.');

      setLeads((prev) => prev.map((lead) => (lead.id === leadId ? { ...lead, status } : lead)));
      setStatusNotification(`Inquiry marked as ${status}.`);
      setTimeout(() => setStatusNotification(null), 3500);
    } catch (e: any) {
      setStatusNotification(e.message || 'Unable to update inquiry status.');
      setTimeout(() => setStatusNotification(null), 5000);
    } finally {
      setLeadStatusSavingId(null);
    }
  };

  if (!authChecked) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 rounded-full border-4 border-gray-200 border-t-gray-900 animate-spin mx-auto"></div>
          <div className="mt-3 text-sm text-gray-500">Checking your account...</div>
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white border rounded-2xl p-8 max-w-md w-full text-center shadow-sm">
          <img src="/logo.png" alt="VoidBuild" className="w-10 h-10 object-contain mx-auto" />
          <h1 className="mt-4 font-bold text-lg text-gray-900">Sign in required</h1>
          <p className="text-sm text-gray-600 mt-2">Dashboard is only accessible after sign in.</p>
          <Link href="/auth" className="mt-6 inline-flex px-5 py-2.5 rounded-full bg-gray-900 text-white text-sm font-bold hover:bg-black transition">
            Sign In
          </Link>
        </div>
      </main>
    );
  }

  const planInfo = PLANS[currentPlan] || PLANS.free;
  const isLimitReached = projects.length >= planInfo.limit;
  const remainingSites = Math.max(0, planInfo.limit - projects.length);
  const totalClicks = projects.reduce((acc, p) => acc + (p.whatsapp_clicks || 0), 0);
  const totalViews = projects.reduce((acc, p) => acc + (p.views || 0), 0);

  return (
    <main className="min-h-screen bg-gray-50">
      <TopNav currentPage="dashboard" />

      <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 md:py-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">Your Dashboard</h1>
            <div className="text-xs text-gray-500 mt-1 flex flex-wrap items-center gap-2">
              <span>
                Signed in as <strong className="text-gray-700">{user.email || user.phone || user.id.slice(0, 12)}</strong>
              </span>
              <span>•</span>
              <span className="px-2 py-0.5 rounded-full bg-gray-200 text-gray-800 font-bold uppercase text-[10px]">{planInfo.name} Plan</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isLimitReached ? (
              <button
                onClick={() => setPaywallDismissed(false)}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-yellow-400 text-gray-950 text-xs font-bold hover:bg-yellow-500 transition shadow-sm"
              >
                <Crown className="w-3.5 h-3.5" />
                <span>Upgrade for More Sites</span>
              </button>
            ) : (
              <Link
                href="/builder"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-gray-900 text-white text-xs font-bold hover:bg-black transition shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Website</span>
              </Link>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mt-6">
          <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-green-50 text-green-700 border border-green-200 flex items-center justify-center flex-shrink-0">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-gray-500 font-medium">WhatsApp Inquiries</div>
              <div className="text-xl font-extrabold text-gray-900 mt-0.5">{totalClicks}</div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center flex-shrink-0">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-gray-500 font-medium">Website Visits</div>
              <div className="text-xl font-extrabold text-gray-900 mt-0.5">{totalViews}</div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 border border-purple-200 flex items-center justify-center flex-shrink-0">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-gray-500 font-medium">Active Website Slots</div>
              <div className="text-xl font-extrabold text-gray-900 mt-0.5">
                {projects.length} / {planInfo.limit}
              </div>
              <div className="text-[11px] text-gray-400">{remainingSites} slots left</div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
              <BarChart3 className="w-4 h-4 text-gray-700" />
              <span>Last 7 Days Views</span>
            </div>
            <div className="text-2xl font-extrabold text-gray-900 mt-2">{views7d}</div>
            <div className="text-[11px] text-gray-500 mt-1">{formatDelta(views7d, viewsPrev7d)}</div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
              <Clock3 className="w-4 h-4 text-gray-700" />
              <span>Last 7 Days Clicks</span>
            </div>
            <div className="text-2xl font-extrabold text-gray-900 mt-2">{clicks7d}</div>
            <div className="text-[11px] text-gray-500 mt-1">{formatDelta(clicks7d, clicksPrev7d)}</div>
          </div>
        </div>

        {subscriptionState?.status === 'grace_period' && (
          <div className="mt-6 bg-yellow-50 border border-yellow-200 text-yellow-900 rounded-xl p-4 shadow-sm">
            <div className="font-semibold text-xs md:text-sm">Your plan is in grace period.</div>
            <div className="text-xs mt-1">Renew before {subscriptionState.graceEndsAt ? new Date(subscriptionState.graceEndsAt).toLocaleDateString() : 'the grace period ends'} to keep your paid features active without interruption.</div>
          </div>
        )}

        {subscriptionState?.status === 'active' && subscriptionState.expiresAt && currentPlan !== 'free' && (
          <div className="mt-6 bg-gray-50 border border-gray-200 text-gray-700 rounded-xl p-4 shadow-sm">
            <div className="font-semibold text-xs md:text-sm">Your {planInfo.name} plan is active.</div>
            <div className="text-xs mt-1">Renews yearly. Current access runs until {new Date(subscriptionState.expiresAt).toLocaleDateString()}.</div>
          </div>
        )}

        {paymentMsg && (
          <div className="mt-6 bg-green-50 border border-green-200 text-green-800 rounded-xl p-4 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
              <div className="font-semibold text-xs md:text-sm">{paymentMsg}</div>
            </div>
            <button onClick={() => setPaymentMsg('')} className="text-xs font-bold underline hover:text-green-950">Dismiss</button>
          </div>
        )}

        {statusNotification && (
          <div className="mt-6 bg-blue-50 border border-blue-200 text-blue-800 rounded-xl p-4 flex items-center justify-between shadow-sm">
            <div className="text-xs md:text-sm font-medium">{statusNotification}</div>
            <button onClick={() => setStatusNotification(null)} className="text-xs font-bold underline hover:text-blue-950">Dismiss</button>
          </div>
        )}

        {isLimitReached && !paywallDismissed && (
          <div className="mt-6" id="paywall-section">
            <Paywall
              limitReached={true}
              onDismiss={() => setPaywallDismissed(true)}
              onDeleteOldSite={() => {
                const el = document.getElementById('websites-grid');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
                setStatusNotification('Select an old website below and click delete to free up your current plan slot.');
              }}
            />
          </div>
        )}

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-[1.3fr_0.7fr] gap-6">
          <section id="websites-grid">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Your Published Websites ({projects.length})</h2>
              {remainingSites > 0 && (
                <span className="text-xs text-green-700 bg-green-50 border border-green-200 px-2.5 py-0.5 rounded-full font-semibold">
                  {remainingSites} {remainingSites === 1 ? 'slot' : 'slots'} available
                </span>
              )}
            </div>

            {loading ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
                <div className="w-8 h-8 rounded-full border-4 border-gray-200 border-t-gray-900 animate-spin mx-auto"></div>
                <div className="text-gray-500 text-xs mt-3">Loading your websites...</div>
              </div>
            ) : projects.length === 0 ? (
              <div className="text-center border-2 border-dashed rounded-2xl p-10 md:p-14 bg-white">
                <img src="/logo.png" alt="VoidBuild" className="w-12 h-12 object-contain mx-auto" />
                <div className="font-bold text-base mt-4 text-gray-900">No websites built yet</div>
                <div className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">Create your first professional Ugandan shop website in 30 seconds.</div>
                <Link
                  href="/builder"
                  className="mt-5 inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-gray-900 text-white text-xs font-bold hover:bg-black transition shadow-sm"
                >
                  <Rocket className="w-3.5 h-3.5 text-yellow-400" />
                  <span>Create First Website Free</span>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                {projects.map((p) => {
                  const subSlug = p.subdomain || p.id.split('-')[0] || 'shop';
                  const directUrl = p.custom_domain
                    ? `https://${p.custom_domain}`
                    : typeof window !== 'undefined'
                    ? `${window.location.origin}/s/${subSlug}`
                    : `/s/${subSlug}`;
                  const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/p/${p.id}` : `/p/${p.id}`;

                  return (
                    <div key={p.id} className="bg-white rounded-2xl border border-gray-200 p-5 hover:shadow-lg hover:border-gray-300 transition-all flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-gray-100 uppercase font-bold text-gray-700">{p.category || 'Business'}</span>
                          <span className="text-[10px] text-gray-400 font-medium">{p.created_at ? new Date(p.created_at).toLocaleDateString() : 'Active'}</span>
                        </div>

                        <h3 className="font-bold text-base mt-3 text-gray-900 truncate">{p.business_name || 'My Shop'}</h3>

                        <div className="mt-2.5 flex items-center justify-between bg-gray-50 border border-gray-200 rounded-xl px-3 py-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <Globe className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
                            <span className="text-xs font-mono text-gray-800 truncate font-semibold">{p.custom_domain || `${subSlug}.voidbuild.com`}</span>
                          </div>
                          <button
                            onClick={() => openLinkManager(p)}
                            className="text-[11px] font-bold text-blue-600 hover:text-blue-800 hover:underline flex-shrink-0 ml-2"
                          >
                            Change
                          </button>
                        </div>

                        <div className="mt-3 flex items-center gap-2 flex-wrap">
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded-md">
                            <MessageCircle className="w-3 h-3" />
                            <span>{p.whatsapp_clicks || 0} WhatsApp clicks</span>
                          </span>
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md">
                            <Eye className="w-3 h-3" />
                            <span>{p.views || 0} views</span>
                          </span>
                        </div>
                      </div>

                      <div className="mt-5 pt-4 border-t border-gray-100 space-y-2">
                        <div className="flex items-center gap-2">
                          <a
                            href={`/s/${subSlug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-900 text-xs font-semibold transition"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>View Live</span>
                          </a>
                          <Link
                            href={`/builder?editId=${p.id}`}
                            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-gray-900 hover:bg-black text-white text-xs font-bold transition"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Edit Again</span>
                          </Link>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleCopyLink(directUrl, p.id)}
                            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-medium transition"
                          >
                            {copiedId === p.id ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-green-600" />
                                <span className="text-green-700 font-bold">Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5 text-gray-500" />
                                <span>Copy Link</span>
                              </>
                            )}
                          </button>

                          <button
                            onClick={() => handleCopyLink(shareUrl, `${p.id}-share`)}
                            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-medium transition"
                          >
                            <Share2 className="w-3.5 h-3.5 text-gray-500" />
                            <span>Copy Share Link</span>
                          </button>

                          <button
                            onClick={() => setDeleteConfirmProj(p)}
                            className="inline-flex items-center justify-center p-2 rounded-xl border border-transparent hover:border-red-200 hover:bg-red-50 text-gray-400 hover:text-red-600 transition"
                            title="Delete Website"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          <section className="space-y-6">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-100 flex items-center justify-between gap-3 flex-wrap">
                <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Recent Inquiries ({filteredLeads.length})</h2>
                <div className="flex flex-wrap gap-2">
                  {(['all', 'new', 'contacted', 'closed', 'spam'] as LeadFilter[]).map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setLeadFilter(filter)}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border transition ${
                        leadFilter === filter
                          ? 'bg-gray-900 text-white border-gray-900'
                          : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      {filter === 'all' ? 'All' : filter}
                    </button>
                  ))}
                </div>
              </div>

              {filteredLeads.length === 0 ? (
                <div className="p-5 text-xs text-gray-500">No inquiries yet for this filter. Once visitors send messages from your website, they will appear here.</div>
              ) : (
                <div className="divide-y divide-gray-100 max-h-[520px] overflow-y-auto">
                  {filteredLeads.map((lead) => {
                    const projectName = projects.find((p) => p.id === lead.project_id)?.business_name || 'Website';
                    return (
                      <div key={lead.id} className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-bold text-sm text-gray-900">{lead.name}</span>
                              <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold uppercase ${leadStatusClasses(lead.status)}`}>
                                {lead.status}
                              </span>
                            </div>
                            <div className="text-[11px] text-gray-400 mt-1">from {projectName}</div>
                          </div>
                          <div className="text-[11px] text-gray-400 whitespace-nowrap">{lead.created_at ? new Date(lead.created_at).toLocaleDateString() : 'New'}</div>
                        </div>

                        <div className="text-xs text-gray-700 mt-3 leading-relaxed">{lead.message}</div>
                        <div className="text-[11px] text-gray-500 mt-2">{lead.phone ? `Phone: ${lead.phone}` : 'Phone not provided'}</div>

                        <div className="mt-3 flex flex-wrap gap-2">
                          {(['new', 'contacted', 'closed', 'spam'] as LeadStatus[]).map((status) => (
                            <button
                              key={status}
                              onClick={() => handleLeadStatusChange(lead.id, status)}
                              disabled={leadStatusSavingId === lead.id || lead.status === status}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition ${
                                lead.status === status
                                  ? 'bg-gray-900 text-white border-gray-900'
                                  : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                              } disabled:opacity-50`}
                            >
                              {leadStatusSavingId === lead.id && lead.status !== status ? 'Saving...' : `Mark ${status}`}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </section>
        </div>

        {!isLimitReached && projects.length > 0 && currentPlan === 'free' && (
          <div className="mt-12">
            <Paywall />
          </div>
        )}
      </div>

      {managingProj && (
        <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm overflow-y-auto overscroll-contain">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[calc(100dvh-1.5rem)] sm:max-h-[calc(100dvh-2rem)] shadow-2xl border flex flex-col overflow-hidden">
            <div className="p-4 sm:p-5 border-b flex items-center justify-between bg-gray-900 text-white flex-shrink-0">
              <div className="flex items-center gap-2.5">
                <img src="/logo.png" alt="VoidBuild" className="w-6 h-6 object-contain flex-shrink-0" />
                <h3 className="font-bold text-sm">Manage Website Link &amp; Domain Request</h3>
              </div>
              <button
                onClick={() => setManagingProj(null)}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-gray-300 hover:text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 sm:p-6 space-y-6 overflow-y-auto overscroll-contain">
              <div>
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">Custom Subdomain (.voidbuild.com)</label>
                <div className="mt-2 flex rounded-xl border border-gray-300 overflow-hidden focus-within:ring-2 focus-within:ring-gray-900/10 focus-within:border-gray-900">
                  <span className="bg-gray-100 text-gray-500 text-xs px-3 py-2.5 flex items-center font-mono select-none">https://</span>
                  <input
                    value={subdomainInput}
                    onChange={(e) => {
                      setSubdomainInput(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''));
                      if (subdomainError) setSubdomainError(null);
                    }}
                    placeholder="my-shop-name"
                    className="flex-1 px-3 py-2.5 text-xs font-mono font-bold text-gray-900 outline-none"
                  />
                  <span className="bg-gray-100 text-gray-600 text-xs px-3 py-2.5 flex items-center font-mono font-semibold select-none">.voidbuild.com</span>
                </div>
                <p className="text-[11px] text-gray-500 mt-1.5">Lowercase letters, numbers, and hyphens (3-30 chars).</p>

                {managingProj && subdomainInput.toLowerCase().trim() !== (managingProj.subdomain || managingProj.id.split('-')[0] || 'my-shop').toLowerCase().trim() && (
                  <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-[11px] text-amber-900">
                    <div className="font-bold">Changing your website address:</div>
                    <div className="mt-1">Old shared links, bookmarks, and search results may stop working until you update them.</div>
                    <label className="mt-2 flex items-start gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={confirmSubdomainChange}
                        onChange={(e) => setConfirmSubdomainChange(e.target.checked)}
                        className="mt-0.5"
                      />
                      <span>I understand and still want to change this subdomain.</span>
                    </label>
                  </div>
                )}

                {subdomainError && (
                  <div className="mt-2 text-xs text-red-600 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{subdomainError}</span>
                  </div>
                )}

                {subdomainSuccess && (
                  <div className="mt-2 text-xs text-green-700 bg-green-50 border border-green-200 rounded-lg p-2 flex items-center gap-1.5 font-semibold">
                    <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <span>Link updated successfully! Your website is live at {subdomainInput}.voidbuild.com</span>
                  </div>
                )}
              </div>

              <DomainCenter
                projectId={managingProj.id}
                currentDomain={managingProj.custom_domain}
                plan={currentPlan}
                onDomainChange={(domain) => {
                  setProjects((prev) => prev.map((p) => p.id === managingProj.id ? { ...p, custom_domain: domain } : p));
                  setManagingProj((prev) => prev ? { ...prev, custom_domain: domain } : prev);
                }}
              />

              <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-center gap-3">
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(`Check out our official shop website: https://${subdomainInput || 'myshop'}.voidbuild.com`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-bold transition shadow-sm"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Share to WhatsApp Status</span>
                </a>

                <button
                  onClick={handleSaveSubdomain}
                  disabled={subdomainSaving}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gray-900 hover:bg-black text-white text-xs font-bold disabled:opacity-50 transition shadow-sm"
                >
                  {subdomainSaving ? 'Saving...' : 'Save Link Settings'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {deleteConfirmProj && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border">
            <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-center text-base mt-3 text-gray-900">Delete Website?</h3>
            <p className="text-xs text-gray-600 text-center mt-2 leading-relaxed">
              Are you sure you want to delete <strong className="text-gray-900">&quot;{deleteConfirmProj.business_name}&quot;</strong>? This will free up your website slot.
            </p>
            <div className="mt-5 flex gap-2">
              <button
                onClick={() => setDeleteConfirmProj(null)}
                disabled={deleting}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteProject(deleteConfirmProj)}
                disabled={deleting}
                className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700 disabled:opacity-50 transition"
              >
                {deleting ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
