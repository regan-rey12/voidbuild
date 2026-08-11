"use client";
import { useEffect, useState } from 'react';
import { getProjects, SavedProject } from '../../lib/projects';
import { getEffectiveUser, User } from '../../lib/auth';
import { getUserPlan, PLANS, canCreateProject, setUserPlan } from '../../lib/payments';
import TopNav from '../../components/TopNav';
import Paywall from '../../components/Paywall';
import Link from 'next/link';

export default function Dashboard() {
  const [projects, setProjects] = useState<SavedProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [paymentMsg, setPaymentMsg] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const payment = params.get('payment');
    const plan = params.get('plan') as any;
    if (payment === 'success' && plan) {
      setUserPlan(plan);
      setPaymentMsg(`Payment successful! ${plan} plan unlocked.`);
      window.history.replaceState({}, '', '/dashboard');
    } else if (payment === 'failed') {
      setPaymentMsg('Payment failed or cancelled. Try again.');
      window.history.replaceState({}, '', '/dashboard');
    }

    getEffectiveUser().then(u => {
      setUser(u);
      setAuthChecked(true);
      if (!u) {
        window.location.href = '/auth';
        return;
      }
      getProjects().then(p => {
        const filtered = p.filter(proj => {
          const projAny = proj as any;
          if (projAny.user_id && u && projAny.user_id !== u.id) return false;
          return true;
        });
        setProjects(filtered);
        setLoading(false);
      });
    });
  }, []);

  if (!authChecked) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 rounded-full border-4 border-gray-200 border-t-gray-900 animate-spin mx-auto"></div>
          <div className="mt-3 text-sm text-gray-500">Checking account...</div>
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white border rounded-2xl p-8 max-w-md w-full text-center">
          <img src="/logo.png" alt="" className="w-10 h-10 rounded-xl mx-auto border object-contain bg-white p-1" />
          <h1 className="mt-4 font-bold">Sign in required</h1>
          <p className="text-sm text-gray-600 mt-2">Dashboard is only accessible after login.</p>
          <Link href="/auth" className="mt-6 inline-flex px-5 py-2.5 rounded-full bg-gray-900 text-white text-sm font-bold">Sign In</Link>
        </div>
      </main>
    );
  }

  const limitReached = !canCreateProject();
  const currentPlan = getUserPlan();

  return (
    <main className="min-h-screen bg-gray-50">
      <TopNav currentPage="dashboard" />

      <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 md:py-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">Your Websites</h1>
            <div className="text-xs text-gray-500 mt-1">
              Signed in as {user.email || user.phone || user.id.slice(0, 12)} • {projects.length} / {PLANS[currentPlan].limit} sites • {PLANS[currentPlan].name}
            </div>
          </div>
          <Link href="/builder" className="px-4 py-2 rounded-full bg-gray-900 text-white text-xs font-bold text-center">+ New Website</Link>
        </div>

        {paymentMsg && (
          <div className="mt-6 bg-green-50 border border-green-200 text-green-800 rounded-xl p-4 flex items-center justify-between">
            <div>
              <div className="font-bold text-sm">✓ {paymentMsg}</div>
              <div className="text-xs mt-1">Your plan is now active.</div>
            </div>
            <button onClick={() => setPaymentMsg('')} className="text-xs underline">Close</button>
          </div>
        )}

        {limitReached && (
          <div className="mt-6">
            <Paywall limitReached={true} />
          </div>
        )}

        {loading ? (
          <div className="mt-12 text-center text-gray-500 text-sm">Loading...</div>
        ) : projects.length === 0 ? (
          <div className="mt-12 text-center border-2 border-dashed rounded-2xl p-8 md:p-12 bg-white">
            <img src="/logo.png" alt="" className="w-10 h-10 rounded-xl mx-auto border object-contain bg-white p-1" />
            <div className="font-bold text-sm mt-3">No websites yet</div>
            <div className="text-xs text-gray-500 mt-1">Create your first website in 30 seconds</div>
            <Link href="/builder" className="mt-4 inline-flex px-5 py-2.5 rounded-full bg-gray-900 text-white text-xs font-bold">Generate Website</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
            {projects.map(p => (
              <div key={p.id} className="bg-white rounded-xl border p-4 hover:shadow-md transition">
                <div className="flex items-center justify-between">
                  <div className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 uppercase font-semibold">{p.category}</div>
                  <div className="text-[10px] text-gray-400">{p.created_at ? new Date(p.created_at).toLocaleDateString() : ''}</div>
                </div>
                <div className="font-semibold mt-3 text-sm truncate">{p.business_name}</div>
                <div className="text-[11px] text-gray-500 mt-1">{p.template_json?.blocks?.length} sections</div>
                <div className="mt-4 flex gap-2">
                  <a href={`/p/${p.id}`} className="flex-1 text-center px-3 py-2 rounded-lg bg-gray-100 text-xs font-medium">View Live</a>
                  <a href={`/builder?editId=${p.id}`} className="flex-1 text-center px-3 py-2 rounded-lg bg-gray-900 text-white text-xs font-bold">Edit Again</a>
                  <button onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/p/${p.id}`); alert('Link copied'); }} className="px-3 py-2 rounded-lg bg-gray-100 text-xs font-medium">Copy</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {!limitReached && projects.length > 0 && (
          <div className="mt-8">
            <Paywall />
          </div>
        )}
      </div>
    </main>
  );
}
