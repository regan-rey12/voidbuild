"use client";
import { useState } from 'react';
import { Menu, X, Edit3, Check, Plus, AlertTriangle, RefreshCw } from 'lucide-react';
import TemplateRenderer from '../../components/TemplateRenderer';
import SaveButton from '../../components/SaveButton';
import EditorSidebar from '../../components/editor/EditorSidebar';
import { Template, TemplateBlock, BlockType } from '../../lib/types';
import sampleTemplate from '../../templates/salon-ug-1.json';
import AuthButton from '../../components/AuthButton';
import Link from 'next/link';

export default function BuilderPage() {
  const [template, setTemplate] = useState<Template>(sampleTemplate as Template);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [showLeftDrawer, setShowLeftDrawer] = useState(false);
  const [fallbackMessage, setFallbackMessage] = useState<string | null>(null);
  
  const steps = ['Understanding...', 'Crafting...', 'Building...'];

  const generate = async (forceRetry = false) => {
    if (!input.trim() || input.length < 5) {
      alert('Describe your business, e.g. Salon in Wandegeya');
      return;
    }
    setLoading(true);
    setFallbackMessage(null);
    setStep(0);
    const interval = setInterval(() => setStep(s => Math.min(s+1, steps.length-1)), 1200);
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: input }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      
      // Check if fallback was used - show user that generation failed but showing closest template
      if (data._fallback) {
        setFallbackMessage(data._message || 'AI was busy, showing closest template from our gallery. Your description: "' + input.slice(0, 50) + '". Try again in 30 seconds for AI version or edit this template.');
      } else {
        setFallbackMessage(null);
      }
      
      setTemplate(data);
      if (!data._fallback) setEditMode(true);
    } catch (e: any) {
      // Even on catch, try to show closest template as fallback, but tell user it failed
      setFallbackMessage(`Generation failed: ${e.message}. Showing closest template instead. Please try again with shorter description.`);
      // Try to get fallback via API with fallback flag - already handled in API, but if network error, keep current template
    } finally {
      clearInterval(interval);
      setLoading(false);
    }
  };

  const updateBlockData = (blockId: string, newData: any) => {
    setTemplate(prev => ({ ...prev, blocks: prev.blocks.map(b => b.id === blockId ? { ...b, data: newData } : b) }));
  };
  const moveBlock = (blockId: string, direction: 'up' | 'down') => {
    setTemplate(prev => {
      const idx = prev.blocks.findIndex(b => b.id === blockId);
      if (idx === -1) return prev;
      const newIdx = direction === 'up' ? idx - 1 : idx + 1;
      if (newIdx < 0 || newIdx >= prev.blocks.length) return prev;
      const newBlocks = [...prev.blocks];
      const temp = newBlocks[idx];
      newBlocks[idx] = newBlocks[newIdx];
      newBlocks[newIdx] = temp;
      return { ...prev, blocks: newBlocks };
    });
  };
  const duplicateBlock = (blockId: string) => {
    setTemplate(prev => {
      const idx = prev.blocks.findIndex(b => b.id === blockId);
      if (idx === -1) return prev;
      const block = prev.blocks[idx];
      const newBlock = { ...block, id: block.type + '-' + Date.now() };
      const newBlocks = [...prev.blocks];
      newBlocks.splice(idx + 1, 0, newBlock);
      return { ...prev, blocks: newBlocks };
    });
  };
  const deleteBlock = (blockId: string) => {
    if (!confirm('Delete section?')) return;
    setTemplate(prev => ({ ...prev, blocks: prev.blocks.filter(b => b.id !== blockId) }));
  };
  const addBlock = (type: BlockType) => {
    const newBlock: TemplateBlock = {
      id: type + '-' + Date.now(),
      type,
      data: { heading: 'New Section' },
      style: { primaryColor: template.blocks[0]?.style?.primaryColor || '#111827' }
    };
    setTemplate(prev => ({ ...prev, blocks: [...prev.blocks.slice(0, -1), newBlock, prev.blocks[prev.blocks.length - 1]] }));
    setShowLeftDrawer(false);
  };

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col">
      <div className="sticky top-0 z-40 bg-white border-b">
        <div className="max-w-[1600px] mx-auto px-3 md:px-4 h-12 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <button onClick={() => setShowLeftDrawer(!showLeftDrawer)} className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center">
              {showLeftDrawer ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <img src="/logo.png" alt="VoidBuild" className="w-7 h-7 rounded-lg object-contain border bg-white" />
            <Link href="/" className="font-bold text-sm hidden md:block">voidbuild</Link>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/dashboard" className="hidden md:inline-flex text-xs text-gray-600 hover:text-black px-3 py-1.5 rounded-full hover:bg-gray-50">Dashboard</Link>
            <button onClick={() => setEditMode(!editMode)} className={'hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ' + (editMode ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-black border-gray-200')}>
              {editMode ? <><Check className="w-3.5 h-3.5" /> Edit ON</> : <><Edit3 className="w-3.5 h-3.5" /> Edit</>}
            </button>
            <AuthButton />
          </div>
        </div>
        <div className="max-w-[1600px] mx-auto px-3 md:px-4 pb-3 flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Describe business: Salon Wandegeya Aisha braids 35k"
            className="flex-1 px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white text-sm outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900"
            onKeyDown={(e) => { if (e.key === 'Enter') generate(); }}
          />
          <button onClick={() => generate()} disabled={loading} className="px-5 py-2.5 rounded-xl bg-gray-900 text-white font-bold text-sm disabled:opacity-50 hover:bg-black">
            {loading ? '...' : 'Generate'}
          </button>
        </div>
        {loading && <div className="max-w-[1600px] mx-auto px-4 pb-2 text-[11px] text-gray-500">{steps[step]}</div>}
      </div>

      {/* Fallback banner - Shows when generation failed and closest template shown */}
      {fallbackMessage && (
        <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-3">
          <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
            <div className="flex gap-2.5">
              <div className="w-8 h-8 rounded-full bg-yellow-400 flex items-center justify-center flex-shrink-0"><AlertTriangle className="w-4 h-4" /></div>
              <div>
                <div className="font-bold text-sm text-yellow-900">AI Generation Failed - Showing Closest Template</div>
                <div className="text-xs text-yellow-800 mt-1 max-w-3xl">{fallbackMessage}</div>
              </div>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <button onClick={() => generate(true)} className="px-4 py-2 rounded-full bg-yellow-400 text-black text-xs font-bold hover:bg-yellow-500 flex items-center gap-1.5">
                <RefreshCw className="w-3.5 h-3.5" /> Try Again
              </button>
              <button onClick={() => setFallbackMessage(null)} className="px-4 py-2 rounded-full bg-white border text-xs font-bold">Dismiss</button>
            </div>
          </div>
        </div>
      )}

      {showLeftDrawer && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowLeftDrawer(false)}></div>
          <div className="absolute left-0 top-0 h-full w-[82%] max-w-[300px] bg-white shadow-2xl flex flex-col">
            <div className="p-4 border-b flex items-center justify-between">
              <div className="flex items-center gap-2"><img src="/logo.png" alt="" className="w-7 h-7 rounded-lg object-contain border" /><span className="font-bold text-sm">voidbuild</span></div>
              <button onClick={() => setShowLeftDrawer(false)} className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center"><X className="w-5 h-5" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-5">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Navigation</div>
                <div className="space-y-1">
                  <Link href="/" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 text-sm" onClick={() => setShowLeftDrawer(false)}>Home</Link>
                  <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-gray-100 text-sm font-medium" onClick={() => setShowLeftDrawer(false)}>Dashboard</Link>
                  <Link href="/pricing" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 text-sm" onClick={() => setShowLeftDrawer(false)}>Pricing</Link>
                </div>
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Your Project</div>
                <div className="bg-gray-50 border rounded-xl p-3">
                  <div className="font-bold text-sm truncate">{template.name}</div>
                  <div className="text-xs text-gray-500 mt-1">{template.category} • {template.blocks.length} sections</div>
                </div>
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Brand Color</div>
                <div className="flex flex-wrap gap-2">
                  {['#EC4899', '#F59E0B', '#EF4444', '#6366F1', '#10B981', '#111827', '#0EA5E9'].map(c => (
                    <button key={c} onClick={() => {
                      const newTemplate = { ...template, blocks: template.blocks.map(b => ({ ...b, style: { ...b.style, primaryColor: c } })) };
                      setTemplate(newTemplate);
                    }} className="w-8 h-8 rounded-full border-2 border-white shadow-sm" style={{ backgroundColor: c }} />
                  ))}
                </div>
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Add Section</div>
                <div className="grid grid-cols-2 gap-2">
                  {['hero','services','gallery','contact','pricing','stats','map','testimonials'].map(t => (
                    <button key={t} onClick={() => addBlock(t as BlockType)} className="border rounded-xl p-3 text-left hover:bg-gray-50 flex items-center gap-2">
                      <Plus className="w-3.5 h-3.5" /><span className="text-xs font-bold capitalize">{t}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        {editMode && (
          <div className="hidden md:block w-[280px] border-r bg-white sticky top-[96px] h-[calc(100vh-96px)] overflow-y-auto flex-shrink-0">
            <EditorSidebar template={template} onUpdate={setTemplate} onAddBlock={addBlock} />
          </div>
        )}
        <div className="flex-1 overflow-auto">
          <div className="bg-white border-b px-4 py-2.5 flex items-center justify-between">
            <div className="text-xs flex items-center gap-2 min-w-0">
              <span className="font-bold truncate">{template.name}</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-gray-100 hidden md:inline-flex">{template.category} • {template.blocks.length} sections</span>
              {fallbackMessage && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-yellow-100 border border-yellow-200 text-yellow-800 hidden md:inline-flex">Fallback template</span>}
            </div>
            <SaveButton template={template} />
          </div>
          <TemplateRenderer template={template} editMode={editMode} onUpdateBlock={updateBlockData} onMoveBlock={moveBlock} onDuplicateBlock={duplicateBlock} onDeleteBlock={deleteBlock} />
        </div>
      </div>
    </main>
  );
}
