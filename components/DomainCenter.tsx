"use client";

import { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  Clock3,
  Copy,
  Globe2,
  Lock,
  RefreshCw,
  Search,
  ShieldCheck,
  ShoppingBag,
  Trash2,
} from 'lucide-react';
import { getAccessToken } from '@/lib/auth';
import type { Plan } from '@/lib/payments';

interface VerificationRecord {
  type?: string;
  domain?: string;
  value?: string;
  reason?: string;
}

interface SearchResult {
  domain: string;
  available: boolean | null;
  firstYear: number | null;
  renewal: number | null;
  currency: string;
  registrar: string;
  configurationRequired?: boolean;
}

interface DomainOrderSummary {
  id: string;
  domain: string;
  action: string;
  status: string;
  expiryDate?: string | null;
  registrationDate?: string | null;
  transferCode?: string | null;
  registrant?: { email?: string; organization?: string } | null;
  error?: string | null;
}

interface DomainCenterProps {
  projectId: string;
  currentDomain?: string;
  plan: Plan;
  onDomainChange: (domain?: string) => void;
}

type Tab = 'existing' | 'new';
type DomainStatus = 'none' | 'pending_dns' | 'verifying' | 'active' | 'error' | 'removed' | 'provider_unconfigured';

const emptyRegistrant = {
  firstName: '',
  lastName: '',
  organization: '',
  email: '',
  phone: '',
  country: 'UG',
  city: 'Kampala',
  address: '',
  postalCode: '',
};

function money(value: number | null, currency = 'UGX') {
  if (value === null || value === undefined) return 'Price unavailable';
  return `${currency} ${new Intl.NumberFormat('en-UG').format(value)}`;
}

function statusLabel(status: DomainStatus) {
  switch (status) {
    case 'active': return 'Active';
    case 'verifying': return 'Checking DNS';
    case 'pending_dns': return 'Waiting for DNS';
    case 'provider_unconfigured': return 'Setup required';
    case 'error': return 'Needs attention';
    case 'removed': return 'Disconnected';
    default: return 'Not connected';
  }
}

export default function DomainCenter({ projectId, currentDomain, plan, onDomainChange }: DomainCenterProps) {
  const [tab, setTab] = useState<Tab>('existing');
  const [domain, setDomain] = useState(currentDomain || '');
  const [status, setStatus] = useState<DomainStatus>(currentDomain ? 'pending_dns' : 'none');
  const [verification, setVerification] = useState<VerificationRecord[]>([]);
  const [latestOrder, setLatestOrder] = useState<DomainOrderSummary | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedDomain, setSelectedDomain] = useState<SearchResult | null>(null);
  const [registrant, setRegistrant] = useState(emptyRegistrant);
  const [orderBusy, setOrderBusy] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const isEligible = plan === 'business' || plan === 'pro';

  useEffect(() => {
    setDomain(currentDomain || '');
    if (!currentDomain) {
      setStatus('none');
      setVerification([]);
      return;
    }

    const load = async () => {
      try {
        const token = await getAccessToken();
        if (!token) return;
        const response = await fetch(`/api/domains/${encodeURIComponent(projectId)}`, { headers: { Authorization: `Bearer ${token}` } });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.error || 'Unable to load domain status.');
        setDomain(data.domain || currentDomain);
        setStatus(data.status || 'pending_dns');
        setVerification(Array.isArray(data.verification) ? data.verification : []);
        if (data.error) setMessage(data.error);
      } catch (error: any) {
        setMessage(error?.message || 'Unable to load domain status.');
      }
    };

    const loadOrder = async () => {
      try {
        const token = await getAccessToken();
        if (!token) return;
        const response = await fetch(`/api/domain-orders?projectId=${encodeURIComponent(projectId)}`, { headers: { Authorization: `Bearer ${token}` } });
        const data = await response.json().catch(() => ({}));
        if (response.ok && Array.isArray(data.orders)) {
          const matching = data.orders.find((order: DomainOrderSummary) => order.domain === currentDomain);
          if (matching?.status === 'registering') {
            const detailResponse = await fetch(`/api/domain-orders/${encodeURIComponent(matching.id)}`, { headers: { Authorization: `Bearer ${token}` } });
            const detail = await detailResponse.json().catch(() => ({}));
            setLatestOrder(detailResponse.ok ? detail.order || matching : matching);
          } else {
            setLatestOrder(matching || null);
          }
        }
      } catch {}
    };

    void load();
    void loadOrder();
  }, [currentDomain, projectId]);

  const updateRegistrant = (key: keyof typeof emptyRegistrant, value: string) => {
    setRegistrant((previous) => ({ ...previous, [key]: value }));
  };

  const connectExisting = async () => {
    if (!domain.trim()) {
      setMessage('Enter the domain you already own.');
      return;
    }
    setBusy(true);
    setMessage(null);
    try {
      const token = await getAccessToken();
      if (!token) throw new Error('Please sign in again to connect a domain.');
      const response = await fetch('/api/domains', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ projectId, domain }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'Unable to connect this domain.');
      setDomain(data.domain || domain.trim().toLowerCase());
      setStatus(data.status || 'pending_dns');
      setVerification(Array.isArray(data.verification) ? data.verification : []);
      onDomainChange(data.domain || domain.trim().toLowerCase());
      setMessage(data.verified ? 'Domain connected and ready.' : 'Domain saved. Add the DNS record below, then check again.');
    } catch (error: any) {
      setStatus('error');
      setMessage(error?.message || 'Unable to connect this domain.');
    } finally {
      setBusy(false);
    }
  };

  const verifyExisting = async () => {
    setBusy(true);
    setStatus('verifying');
    setMessage(null);
    try {
      const token = await getAccessToken();
      if (!token) throw new Error('Please sign in again to check DNS.');
      const response = await fetch(`/api/domains/${encodeURIComponent(projectId)}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ domain }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'Unable to check DNS right now.');
      setStatus(data.status || 'pending_dns');
      setVerification(Array.isArray(data.verification) ? data.verification : []);
      setMessage(data.verified ? 'Domain connected and ready.' : 'DNS is not ready yet. Check the record and try again.');
    } catch (error: any) {
      setStatus('error');
      setMessage(error?.message || 'Unable to check DNS right now.');
    } finally {
      setBusy(false);
    }
  };

  const disconnect = async () => {
    if (!domain || !window.confirm(`Disconnect ${domain}? The website will keep working on its VoidBuild address.`)) return;
    setBusy(true);
    setMessage(null);
    try {
      const token = await getAccessToken();
      if (!token) throw new Error('Please sign in again to disconnect this domain.');
      const response = await fetch(`/api/domains/${encodeURIComponent(projectId)}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'Unable to disconnect this domain.');
      setDomain('');
      setStatus('removed');
      setVerification([]);
      onDomainChange(undefined);
      setMessage('Domain disconnected. Your VoidBuild address is still available.');
    } catch (error: any) {
      setStatus('error');
      setMessage(error?.message || 'Unable to disconnect this domain.');
    } finally {
      setBusy(false);
    }
  };

  const search = async () => {
    if (!query.trim()) {
      setMessage('Enter a name to search, such as yourbusiness.');
      return;
    }
    setSearching(true);
    setMessage(null);
    setSelectedDomain(null);
    try {
      const token = await getAccessToken();
      if (!token) throw new Error('Please sign in again to search domains.');
      const response = await fetch(`/api/domains/search?query=${encodeURIComponent(query.trim())}`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'Unable to search domains right now.');
      setResults(Array.isArray(data.results) ? data.results : []);
    } catch (error: any) {
      setResults([]);
      setMessage(error?.message || 'Unable to search domains right now.');
    } finally {
      setSearching(false);
    }
  };

  const renewDomain = async () => {
    if (!latestOrder) return;
    setOrderBusy(true);
    setMessage(null);
    try {
      const token = await getAccessToken();
      if (!token) throw new Error('Please sign in again to renew this domain.');
      const response = await fetch(`/api/domain-orders/${encodeURIComponent(latestOrder.id)}/renew`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'Unable to start renewal payment.');
      if (!data.order?.redirectUrl) throw new Error('The payment provider did not return a checkout link.');
      window.location.href = data.order.redirectUrl;
    } catch (error: any) {
      setMessage(error?.message || 'Unable to start renewal payment.');
      setOrderBusy(false);
    }
  };

  const buyDomain = async () => {
    if (!selectedDomain) return;
    setOrderBusy(true);
    setMessage(null);
    try {
      const token = await getAccessToken();
      if (!token) throw new Error('Please sign in again to continue.');
      const response = await fetch('/api/domain-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ projectId, domain: selectedDomain.domain, registrant }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'Unable to start domain payment.');
      if (!data.order?.redirectUrl) throw new Error('The payment provider did not return a checkout link.');
      window.location.href = data.order.redirectUrl;
    } catch (error: any) {
      setMessage(error?.message || 'Unable to start domain payment.');
      setOrderBusy(false);
    }
  };

  const statusTone = useMemo(() => {
    if (status === 'active') return 'border-green-200 bg-green-50 text-green-900';
    if (status === 'error' || status === 'provider_unconfigured') return 'border-red-200 bg-red-50 text-red-900';
    return 'border-amber-200 bg-amber-50 text-amber-950';
  }, [status]);

  const copyValue = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(value);
      window.setTimeout(() => setCopied(null), 2200);
    } catch {
      setMessage('Copy failed. Select the value manually.');
    }
  };

  if (!isEligible) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 text-xs text-gray-700 flex items-start gap-3">
        <Lock className="w-4 h-4 mt-0.5 text-gray-500 flex-shrink-0" />
        <div><div className="font-bold text-gray-900">Custom domains are available on Business and Pro.</div><div className="mt-1">Upgrade your plan to connect a domain you own or register a new one.</div></div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
      <div className="p-4 sm:p-5 border-b border-gray-100 bg-gray-50/70">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2"><Globe2 className="w-4 h-4 text-gray-700" /><h3 className="text-sm font-bold text-gray-900">Domain Center</h3></div>
            <p className="mt-1 text-[11px] text-gray-600">Connect a domain you own or register a new .com domain through Vercel.</p>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wide text-gray-500">{plan}</span>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2 rounded-xl bg-gray-200/70 p-1">
          <button onClick={() => { setTab('existing'); setMessage(null); }} className={`rounded-lg px-3 py-2 text-[11px] font-bold transition ${tab === 'existing' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}>Connect existing</button>
          <button onClick={() => { setTab('new'); setMessage(null); }} className={`rounded-lg px-3 py-2 text-[11px] font-bold transition ${tab === 'new' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}>Get a new domain</button>
        </div>
      </div>

      {tab === 'existing' ? (
        <div className="p-4 sm:p-5 space-y-3">
          <div className="flex flex-col sm:flex-row gap-2">
            <input value={domain} onChange={(event) => { setDomain(event.target.value); setMessage(null); }} readOnly={status === 'active'} placeholder="yourbusiness.ug or www.yourbusiness.com" className={`min-w-0 flex-1 rounded-xl border px-3.5 py-2.5 text-xs font-mono outline-none ${status === 'active' ? 'border-green-200 bg-green-50 text-green-800' : 'border-gray-300 focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10'}`} />
            {domain && status !== 'none' && status !== 'removed' ? <button onClick={disconnect} disabled={busy} className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-red-200 px-4 py-2.5 text-[11px] font-bold text-red-700 hover:bg-red-50 disabled:opacity-50"><Trash2 className="w-3.5 h-3.5" />Disconnect</button> : <button onClick={connectExisting} disabled={busy || !domain.trim()} className="rounded-xl bg-gray-900 px-4 py-2.5 text-[11px] font-bold text-white hover:bg-black disabled:opacity-50">{busy ? 'Working...' : 'Connect domain'}</button>}
          </div>

          {domain && status !== 'none' && (
            <div className={`rounded-xl border p-3 ${statusTone}`}>
              <div className="flex items-center gap-2 text-[11px] font-bold"><>{status === 'active' ? <CheckCircle2 className="w-4 h-4" /> : status === 'error' ? <AlertTriangle className="w-4 h-4" /> : <Clock3 className="w-4 h-4" />}</><span>{statusLabel(status)}</span></div>
              {status === 'active' && <a href={`https://${domain}`} target="_blank" rel="noopener noreferrer" className="mt-1 block break-all font-mono text-[11px] underline">https://{domain}</a>}
              {status === 'pending_dns' || status === 'verifying' || status === 'error' ? (
                <>
                  <p className="mt-1.5 text-[11px] leading-relaxed">Add the exact DNS record below at your registrar. DNS changes can take a few minutes, then check again.</p>
                  {verification.length > 0 && <div className="mt-2 space-y-2">{verification.map((record, index) => <div key={`${record.domain || 'record'}-${index}`} className="rounded-lg border border-amber-200 bg-white p-2.5 text-[11px] text-gray-800"><div><strong>Type:</strong> {record.type || 'TXT'}</div>{record.domain && <div><strong>Name:</strong> <span className="font-mono break-all">{record.domain}</span></div>}{record.value && <div className="mt-1 flex items-start justify-between gap-2"><span className="min-w-0 break-all"><strong>Value:</strong> <span className="font-mono">{record.value}</span></span><button onClick={() => copyValue(record.value || '')} className="inline-flex items-center gap-1 text-blue-700 font-bold flex-shrink-0">{copied === record.value ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}Copy</button></div>}</div>)}</div>}
                  <button onClick={verifyExisting} disabled={busy} className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-gray-900 px-3 py-2 text-[11px] font-bold text-white disabled:opacity-50"><RefreshCw className={`w-3.5 h-3.5 ${busy ? 'animate-spin' : ''}`} />{busy ? 'Checking...' : 'Check DNS'}</button>
                </>
              ) : null}
            </div>
          )}
          {latestOrder && <div className="rounded-xl border border-gray-200 bg-gray-50 p-3 text-[11px] text-gray-700"><div className="flex items-center justify-between gap-3"><strong className="text-gray-900">Registration details</strong>{latestOrder.status === 'registered' || latestOrder.status === 'renewal_due' ? <button onClick={renewDomain} disabled={orderBusy} className="rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-[10px] font-bold hover:bg-gray-100 disabled:opacity-50">{orderBusy ? 'Working...' : 'Renew domain'}</button> : null}</div><div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-1.5"><span>Expiry: <strong>{latestOrder.expiryDate ? new Date(latestOrder.expiryDate).toLocaleDateString() : 'Pending registrar confirmation'}</strong></span><span>Status: <strong>{latestOrder.status}</strong></span>{latestOrder.registrant?.email && <span className="truncate">Owner email: <strong>{latestOrder.registrant.email}</strong></span>}{latestOrder.transferCode && <span className="flex items-center gap-1">Transfer code: <strong className="font-mono">{latestOrder.transferCode}</strong><button onClick={() => copyValue(latestOrder.transferCode || '')} className="text-blue-700 font-bold">{copied === latestOrder.transferCode ? 'Copied' : 'Copy'}</button></span>}</div>{latestOrder.error && <div className="mt-2 text-red-700">{latestOrder.error}</div>}</div>}
          {message && <div className={`rounded-lg border p-2.5 text-[11px] ${status === 'error' || status === 'provider_unconfigured' ? 'border-red-200 bg-red-50 text-red-700' : 'border-gray-200 bg-gray-50 text-gray-700'}`}>{message}</div>}
          <div className="flex items-start gap-2 text-[11px] leading-relaxed text-gray-500"><ShieldCheck className="w-4 h-4 mt-0.5 text-gray-400 flex-shrink-0" /><span>Your site stays available on its VoidBuild address while DNS is being verified. Domain registration and renewal are separate from your annual plan.</span></div>
        </div>
      ) : (
        <div className="p-4 sm:p-5 space-y-4">
          <div className="flex gap-2">
            <input value={query} onChange={(event) => setQuery(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') void search(); }} placeholder="Search your business name" className="min-w-0 flex-1 rounded-xl border border-gray-300 px-3.5 py-2.5 text-xs outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10" />
            <button onClick={search} disabled={searching} className="inline-flex items-center gap-1.5 rounded-xl bg-gray-900 px-4 py-2.5 text-[11px] font-bold text-white hover:bg-black disabled:opacity-50"><Search className="w-3.5 h-3.5" />{searching ? 'Searching...' : 'Search'}</button>
          </div>

          {results.length > 0 && <div className="space-y-2">{results.map((result) => <div key={result.domain} className={`rounded-xl border p-3 ${result.available === true ? 'border-green-200 bg-green-50/50' : 'border-gray-200 bg-gray-50'}`}><div className="flex items-center justify-between gap-3"><div className="min-w-0"><div className="truncate font-mono text-xs font-bold text-gray-900">{result.domain}</div><div className="mt-1 text-[10px] text-gray-500">{result.available === true ? 'Available' : result.available === false ? 'Not available' : 'Availability unavailable'} · {result.registrar}</div></div>{result.available === true && <button onClick={() => setSelectedDomain(result)} className={`rounded-lg px-3 py-1.5 text-[10px] font-bold ${selectedDomain?.domain === result.domain ? 'bg-green-700 text-white' : 'bg-white text-gray-800 border border-gray-200 hover:border-gray-400'}`}>{selectedDomain?.domain === result.domain ? 'Selected' : 'Choose'}</button>}</div>{result.available === true && <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-gray-600"><span>First year: <strong>{money(result.firstYear, result.currency)}</strong></span><span>Renewal: <strong>{money(result.renewal, result.currency)}</strong></span></div>}{result.configurationRequired && <div className="mt-2 text-[10px] text-amber-800">Registrar or price configuration is still required before checkout.</div>}</div>)}</div>}

          {selectedDomain && <div className="rounded-xl border border-blue-200 bg-blue-50 p-3"><div className="flex items-center gap-2 text-xs font-bold text-blue-950"><ShoppingBag className="w-4 h-4" />Register {selectedDomain.domain}</div>{currentDomain && <div className="mt-2 rounded-lg border border-amber-200 bg-amber-50 p-2.5 text-[11px] text-amber-900"><strong>This website already uses {currentDomain}.</strong> Disconnect it before registering a different domain. <button onClick={() => setTab('existing')} className="ml-1 font-bold underline">Manage current domain</button></div>}<div className="mt-1 text-[11px] text-blue-900">First year: <strong>{money(selectedDomain.firstYear, selectedDomain.currency)}</strong>. Renewal: <strong>{money(selectedDomain.renewal, selectedDomain.currency)}</strong>.</div><div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">{(['firstName', 'lastName', 'email', 'phone', 'organization', 'city', 'address', 'postalCode'] as Array<keyof typeof emptyRegistrant>).map((key) => <label key={key} className={key === 'address' ? 'sm:col-span-2' : ''}><span className="mb-1 block text-[10px] font-bold capitalize text-blue-950">{key === 'postalCode' ? 'Postal code' : key === 'firstName' ? 'First name' : key === 'lastName' ? 'Last name' : key}</span><input value={registrant[key]} onChange={(event) => updateRegistrant(key, event.target.value)} className="w-full rounded-lg border border-blue-200 bg-white px-2.5 py-2 text-[11px] outline-none focus:border-blue-500" /></label>)}</div><div className="mt-3 flex items-center justify-between gap-3"><span className="text-[10px] text-blue-900">Your contact details are sent to the authorized registrar for domain ownership.</span><button onClick={buyDomain} disabled={orderBusy || !!currentDomain || selectedDomain.firstYear === null || selectedDomain.renewal === null} className="inline-flex items-center gap-1.5 rounded-lg bg-gray-900 px-3 py-2 text-[11px] font-bold text-white disabled:opacity-50">{orderBusy ? 'Starting payment...' : 'Continue to payment'}</button></div></div>}

          {message && <div className="rounded-lg border border-gray-200 bg-gray-50 p-2.5 text-[11px] text-gray-700">{message}</div>}
          <div className="flex items-start gap-2 text-[11px] leading-relaxed text-gray-500"><ShieldCheck className="w-4 h-4 mt-0.5 text-gray-400 flex-shrink-0" /><span>Registration is a separate domain order. Your VoidBuild subscription price and renewal date do not change.</span></div>
        </div>
      )}
    </div>
  );
}
