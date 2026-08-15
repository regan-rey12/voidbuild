"use client";
import { useEffect, useState } from 'react';
import { 
  getProjects, 
  deleteProject, 
  SavedProject, 
  getProjectStats, 
  updateProjectSubdomain,
  validateSubdomain,
  claimLocalProjects
} from '@/lib/projects';
import { getEffectiveUser, User } from '@/lib/auth';
import { getUserPlan, PLANS, Plan, canCreateProject, setUserPlan, getRemainingSites, syncUserPlanWithCloud } from '@/lib/payments';
import TopNav from '@/components/TopNav';
import Paywall from '@/components/Paywall';
import Link from 'next/link';
import { 
  Plus, 
  Trash2, 
  ExternalLink, 
  Edit3, 
  Copy, 
  Check, 
  AlertTriangle, 
  Sparkles,
  MessageCircle,
  Eye,
  Globe,
  Link as LinkIcon,
  X,
  Share2,
  Lock,
  ArrowRight
} from 'lucide-react';

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

  // Subdomain & Link Manager Modal State
  const [managingProj, setManagingProj] = useState<SavedProject | null>(null);
  const [subdomainInput, setSubdomainInput] = useState('');
  const [customDomainInput, setCustomDomainInput] = useState('');
  const [subdomainError, setSubdomainError] = useState<string | null>(null);
  const [subdomainSaving, setSubdomainSaving] = useState(false);
  const [subdomainSuccess, setSubdomainSuccess] = useState(false);

  const fetchUserProjects = async (currentUser: User | null) => {
    if (currentUser?.id) {
      try {
        await claimLocalProjects(currentUser.id);
        await syncUserPlanWithCloud(currentUser.id);
      } catch {}
    }
    getProjects().then(p => {
      const filtered = p.filter(proj => {
        const projAny = proj as any;
        if (projAny.user_id && currentUser && projAny.user_id !== currentUser.id && !projAny.user_id.startsWith('demo')) return false;
        return true;
      });
      setProjects(filtered);
      setLoading(false);
    });
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const payment = params.get('payment');
    const plan = params.get('plan') as Plan | null;
    if (payment === 'success' && plan && PLANS[plan]) {
      setUserPlan(plan);
      setPaymentMsg(`Payment successful! Your ${PLANS[plan].name} plan is now active.`);
      window.history.replaceState({}, '', '/dashboard');
    } else if (payment === 'failed') {
      setPaymentMsg('Payment was not completed. You can try again whenever you are ready.');
      window.history.replaceState({}, '', '/dashboard');
    }

    getEffectiveUser().then(u => {
      setUser(u);
      setAuthChecked(true);
      if (!u) {
        window.location.href = '/auth';
        return;
      }
      fetchUserProjects(u);
    });
  }, []);

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
      setProjects(prev => prev.filter(p => p.id !== proj.id));
      setDeleteConfirmProj(null);
      setStatusNotification(`Website "${proj.business_name}" deleted. You now have slot available to build a new website.`);
      setTimeout(() => setStatusNotification(null), 5000);
    } catch (e: any) {
      setStatusNotification(`Unable to delete website: ${e.message || 'Please try again'}`);
    } finally {
      setDeleting(false);
    }
  };

  const openLinkManager = (p: SavedProject) => {
    setManagingProj(p);
    setSubdomainInput(p.subdomain || p.id.split('-')[0] || 'my-shop');
    setCustomDomainInput(p.custom_domain || '');
    setSubdomainError(null);
    setSubdomainSuccess(false);
  };

  const handleSaveSubdomain = async () => {
    if (!managingProj) return;
    setSubdomainError(null);
    setSubdomainSaving(true);
    
    const val = validateSubdomain(subdomainInput);
    if (!val.valid) {
      setSubdomainError(val.error || 'Invalid subdomain');
      setSubdomainSaving(false);
      return;
    }

    const res = await updateProjectSubdomain(managingProj.id, subdomainInput, customDomainInput);
    if (!res.success) {
      setSubdomainError(res.error || 'Failed to update subdomain');
    } else {
      setProjects(prev => prev.map(p => p.id === managingProj.id ? { ...p, subdomain: subdomainInput.toLowerCase().trim(), custom_domain: customDomainInput.trim() || undefined } : p));
      setSubdomainSuccess(true);
      setTimeout(() => {
        setSubdomainSuccess(false);
      }, 3000);
    }
    setSubdomainSaving(false);
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
          <Link href="/auth" className="mt-6 inline-flex px-5 py-2.5 rounded-full bg-gray-900 text-white text-sm font-bold hover:bg-black transition">Sign In</Link>
        </div>
      </main>
    );
  }

  const currentPlan = getUserPlan();
  const planInfo = PLANS[currentPlan] || PLANS.free;
  const isLimitReached = !canCreateProject();
  const remainingSites = getRemainingSites();
  const globalStats = getProjectStats();

  const totalClicks = projects.reduce((acc, p) => acc + (p.whatsapp_clicks || 0), 0) + globalStats.clicks;
  const totalViews = projects.reduce((acc, p) => acc + (p.views || 1), 0) + globalStats.views;

  return (
    <main className="min-h-screen bg-gray-50">
      <TopNav currentPage="dashboard" />

      <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 md:py-10">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">Your Dashboard</h1>
            <div className="text-xs text-gray-500 mt-1 flex flex-wrap items-center gap-2">
              <span>Signed in as <strong className="text-gray-700">{user.email || user.phone || user.id.slice(0, 12)}</strong></span>
              <span>•</span>
              <span className="px-2 py-0.5 rounded-full bg-gray-200 text-gray-800 font-bold uppercase text-[10px]">
                {planInfo.name} Plan
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isLimitReached ? (
              <button
                onClick={() => setPaywallDismissed(false)}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-yellow-400 text-gray-950 text-xs font-bold hover:bg-yellow-500 transition shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5" />
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

        {/* Analytics Snapshot Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
          <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-green-50 text-green-700 border border-green-200 flex items-center justify-center flex-shrink-0">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-gray-500 font-medium">WhatsApp Inquiries</div>
              <div className="text-xl font-extrabold text-gray-900 mt-0.5">
                {totalClicks} <span className="text-[11px] font-normal text-gray-400">clicks</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center flex-shrink-0">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-gray-500 font-medium">Website Visits</div>
              <div className="text-xl font-extrabold text-gray-900 mt-0.5">
                {totalViews} <span className="text-[11px] font-normal text-gray-400">views</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 border border-purple-200 flex items-center justify-center flex-shrink-0">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-gray-500 font-medium">Active Website Slots</div>
              <div className="text-xl font-extrabold text-gray-900 mt-0.5">
                {projects.length} / {planInfo.limit}{' '}
                <span className="text-[11px] font-semibold text-gray-400">({remainingSites} free)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Notifications */}
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

        {/* Limit Reached Inline Pro Paywall */}
        {isLimitReached && !paywallDismissed && (
          <div className="mt-6" id="paywall-section">
            <Paywall
              limitReached={true}
              onDismiss={() => setPaywallDismissed(true)}
              onDeleteOldSite={() => {
                const el = document.getElementById('websites-grid');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
                setStatusNotification('Select an old website below and click delete to free up your 1 Free website slot.');
              }}
            />
          </div>
        )}

        {/* Websites Section */}
        <div id="websites-grid" className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wider">
              Your Published Websites ({projects.length})
            </h2>
            {remainingSites > 0 && (
              <span className="text-xs text-green-700 bg-green-50 border border-green-200 px-2.5 py-0.5 rounded-full font-semibold">
                {remainingSites} {remainingSites === 1 ? 'slot' : 'slots'} available
              </span>
            )}
          </div>

          {loading ? (
            <div className="text-center py-16">
              <div className="w-8 h-8 rounded-full border-4 border-gray-200 border-t-gray-900 animate-spin mx-auto"></div>
              <div className="text-gray-500 text-xs mt-3">Loading your websites...</div>
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center border-2 border-dashed rounded-2xl p-10 md:p-14 bg-white">
              <img src="/logo.png" alt="VoidBuild" className="w-12 h-12 object-contain mx-auto" />
              <div className="font-bold text-base mt-4 text-gray-900">No websites built yet</div>
              <div className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                Generate your first professional Ugandan shop website in 30 seconds.
              </div>
              <Link
                href="/builder"
                className="mt-5 inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-gray-900 text-white text-xs font-bold hover:bg-black transition shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                <span>Generate First Website Free</span>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {projects.map(p => {
                const subSlug = p.subdomain || p.id.split('-')[0] || 'shop';
                const directUrl = typeof window !== 'undefined' ? `${window.location.origin}/s/${subSlug}` : `/s/${subSlug}`;
                const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/p/${p.id}` : `/p/${p.id}`;

                return (
                  <div
                    key={p.id}
                    className="bg-white rounded-2xl border border-gray-200 p-5 hover:shadow-lg hover:border-gray-300 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-gray-100 uppercase font-bold text-gray-700">
                          {p.category || 'Business'}
                        </span>
                        <span className="text-[10px] text-gray-400 font-medium">
                          {p.created_at ? new Date(p.created_at).toLocaleDateString() : 'Active'}
                        </span>
                      </div>

                      <h3 className="font-bold text-base mt-3 text-gray-900 truncate">
                        {p.business_name || 'My Shop'}
                      </h3>

                      {/* Subdomain Link Chip */}
                      <div className="mt-2.5 flex items-center justify-between bg-gray-50 border border-gray-200 rounded-xl px-3 py-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <Globe className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
                          <span className="text-xs font-mono text-gray-800 truncate font-semibold">
                            {subSlug}.voidbuild.com
                          </span>
                        </div>
                        <button
                          onClick={() => openLinkManager(p)}
                          className="text-[11px] font-bold text-blue-600 hover:text-blue-800 hover:underline flex-shrink-0 ml-2"
                        >
                          Change
                        </button>
                      </div>

                      {/* Inquiry & Views Badges */}
                      <div className="mt-3 flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded-md">
                          <MessageCircle className="w-3 h-3" />
                          <span>{p.whatsapp_clicks || 0} WhatsApp clicks</span>
                        </span>
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md">
                          <Eye className="w-3 h-3" />
                          <span>{p.views || 1} views</span>
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
                          onClick={() => openLinkManager(p)}
                          className="inline-flex items-center justify-center p-2 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-600 transition"
                          title="Custom Subdomain & Link Settings"
                        >
                          <LinkIcon className="w-3.5 h-3.5" />
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
        </div>

        {/* Upgrade Card if on Free and has websites */}
        {!isLimitReached && projects.length > 0 && currentPlan === 'free' && (
          <div className="mt-12">
            <Paywall />
          </div>
        )}
      </div>

      {/* Subdomain & Custom Domain Link Manager Modal */}
      {managingProj && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border overflow-hidden">
            <div className="p-5 border-b flex items-center justify-between bg-gray-900 text-white">
              <div className="flex items-center gap-2.5">
                <img src="/logo.png" alt="VoidBuild" className="w-6 h-6 object-contain flex-shrink-0" />
                <h3 className="font-bold text-sm">Manage Website Link &amp; Domain</h3>
              </div>
              <button
                onClick={() => setManagingProj(null)}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-gray-300 hover:text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Subdomain Configuration */}
              <div>
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
                  Custom Subdomain (.voidbuild.com)
                </label>
                <div className="mt-2 flex rounded-xl border border-gray-300 overflow-hidden focus-within:ring-2 focus-within:ring-gray-900/10 focus-within:border-gray-900">
                  <span className="bg-gray-100 text-gray-500 text-xs px-3 py-2.5 flex items-center font-mono select-none">
                    https://
                  </span>
                  <input
                    value={subdomainInput}
                    onChange={(e) => {
                      setSubdomainInput(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''));
                      if (subdomainError) setSubdomainError(null);
                    }}
                    placeholder="my-shop-name"
                    className="flex-1 px-3 py-2.5 text-xs font-mono font-bold text-gray-900 outline-none"
                  />
                  <span className="bg-gray-100 text-gray-600 text-xs px-3 py-2.5 flex items-center font-mono font-semibold select-none">
                    .voidbuild.com
                  </span>
                </div>
                <p className="text-[11px] text-gray-500 mt-1.5">
                  Lowercase letters, numbers, and hyphens (3-30 chars).
                </p>

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

              {/* Custom Domain Section (Business & Pro) */}
              <div className="pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                    <span>Connect Custom Domain</span>
                    {currentPlan === 'free' || currentPlan === 'hustler' ? (
                      <span className="text-[9px] bg-yellow-100 text-yellow-900 px-2 py-0.5 rounded-full font-extrabold flex items-center gap-1">
                        <Lock className="w-3 h-3" /> BUSINESS PLAN
                      </span>
                    ) : null}
                  </label>
                </div>

                {currentPlan === 'business' || currentPlan === 'pro' ? (
                  <div className="mt-2">
                    <input
                      value={customDomainInput}
                      onChange={(e) => setCustomDomainInput(e.target.value)}
                      placeholder="e.g. www.aishasalon.ug"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs font-mono outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900"
                    />
                    <div className="mt-2 bg-gray-50 border rounded-xl p-3 text-[11px] text-gray-600 space-y-1">
                      <div className="font-bold text-gray-800">DNS Setup Instructions:</div>
                      <div>Create a <strong>CNAME</strong> record in your domain registrar (Namecheap, GoDaddy, etc.)</div>
                      <div><strong>Host:</strong> www &nbsp;|&nbsp; <strong>Points to:</strong> voidbuild.com</div>
                    </div>
                  </div>
                ) : (
                  <div className="mt-2 bg-gray-50 border border-gray-200 rounded-xl p-3 flex items-center justify-between text-xs">
                    <span className="text-gray-600">Upgrade to Business to attach your own domain (e.g. www.myshop.ug).</span>
                    <button
                      onClick={() => {
                        setManagingProj(null);
                        const el = document.getElementById('paywall-section');
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="ml-3 px-3 py-1.5 rounded-lg bg-gray-900 text-white text-[11px] font-bold hover:bg-black whitespace-nowrap"
                    >
                      Upgrade
                    </button>
                  </div>
                )}
              </div>

              {/* Share to WhatsApp Quick Action */}
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
                  {subdomainSaving ? 'Saving...' : 'Save Subdomain'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal (No browser confirm()) */}
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
