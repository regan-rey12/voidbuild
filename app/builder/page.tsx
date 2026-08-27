"use client";
import { useState, useEffect } from 'react';
import { Menu, X, Edit3, Check, Plus, Loader2, Sparkles, AlertCircle, Info } from 'lucide-react';
import TemplateRenderer from '@/components/TemplateRenderer';
import SaveButton from '@/components/SaveButton';
import EditorSidebar from '@/components/editor/EditorSidebar';
import { Template, TemplateBlock, BlockType } from '@/lib/types';
import sampleTemplate from '@/templates/salon-ug-1.json';
import { getTemplateByKey } from '@/lib/templates';
import { getProjectById } from '@/lib/projects';
import AuthButton from '@/components/AuthButton';
import Link from 'next/link';

export default function BuilderPage() {
  const [template, setTemplate] = useState<Template>(sampleTemplate as Template);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [showLeftDrawer, setShowLeftDrawer] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [inputError, setInputError] = useState<string | null>(null);
  const [isGeneratedOrLoaded, setIsGeneratedOrLoaded] = useState(false);
  const [dismissSampleBanner, setDismissSampleBanner] = useState(false);
  
  const steps = [
    'Analyzing your Ugandan business...', 
    'Crafting UGX pricing & services...', 
    'Connecting WhatsApp ordering & MTN MoMo...', 
    'Finalizing professional website layout...'
  ];

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const editId = params.get('editId');
    const templateParam = params.get('template');

    const load = async () => {
      if (editId) {
        try {
          const found = await getProjectById(editId);
          if (found?.template_json) {
            setTemplate(found.template_json);
            setEditMode(true);
            setIsGeneratedOrLoaded(true);
            return;
          }
        } catch {}
      }

      if (templateParam) {
        const selected = getTemplateByKey(templateParam);
        setTemplate(selected);
        setEditMode(true);
        setIsGeneratedOrLoaded(true);
      }
    };

    load();
  }, []);

  const generate = async () => {
    if (!input.trim() || input.length < 5) {
      setInputError('Please describe your business with at least 5 characters (e.g. Salon in Wandegeya Aisha braids 35k)');
      return;
    }
    setInputError(null);
    setGenerationError(null);
    setLoading(true);
    setStep(0);
    const interval = setInterval(() => setStep(s => Math.min(s + 1, steps.length - 1)), 1200);

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: input }),
      });

      const data = await res.json();
      if (!res.ok && data.error) {
        throw new Error(data.error);
      }

      if (data && data.blocks && Array.isArray(data.blocks)) {
        setTemplate(data);
        setEditMode(true);
        setIsGeneratedOrLoaded(true);
        setInput('');
      } else {
        throw new Error('Could not parse website layout. Please try a simpler description.');
      }
    } catch (e: any) {
      setGenerationError(e.message || 'Generation failed. Please try again.');
    } finally {
      clearInterval(interval);
      setLoading(false);
    }
  };

  const updateBlockData = (blockId: string, newData: any) => {
    setTemplate(prev => ({
      ...prev,
      blocks: prev.blocks.map(b => b.id === blockId ? { ...b, data: newData } : b)
    }));
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
    setTemplate(prev => ({
      ...prev,
      blocks: prev.blocks.filter(b => b.id !== blockId)
    }));
  };

  const addBlock = (type: BlockType) => {
    const newBlock: TemplateBlock = {
      id: type + '-' + Date.now(),
      type,
      data: { heading: 'New Section' },
      style: { primaryColor: template.blocks[0]?.style?.primaryColor || '#111827' }
    };
    setTemplate(prev => ({
      ...prev,
      blocks: [...prev.blocks.slice(0, -1), newBlock, prev.blocks[prev.blocks.length - 1]]
    }));
    setShowLeftDrawer(false);
  };

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col">
      <div className="sticky top-0 z-40 bg-white border-b">
        <div className="max-w-[1600px] mx-auto px-3 md:px-4 h-12 flex items-center justify-between gap-2">
          {/* Brand & Menu */}
          <div className="flex items-center gap-2 min-w-0 flex-shrink">
            <button
              onClick={() => setShowLeftDrawer(!showLeftDrawer)}
              className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-700 flex-shrink-0"
              aria-label="Menu"
            >
              {showLeftDrawer ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <Link href="/" className="flex items-center gap-2 flex-shrink-0">
              <img
                src="/logo.png"
                alt="VoidBuild Logo"
                className="w-7 h-7 object-contain flex-shrink-0"
              />
              <span className="font-bold text-sm text-gray-900 tracking-tight">voidbuild</span>
            </Link>
          </div>
          
          {/* Actions & Auth */}
          <div className="flex items-center gap-1.5 md:gap-2 flex-shrink-0">
            <Link href="/dashboard" className="hidden md:inline-flex text-xs text-gray-600 hover:text-black px-3 py-1.5 rounded-full hover:bg-gray-50 font-medium">Dashboard</Link>
            <button
              onClick={() => setEditMode(!editMode)}
              className={'inline-flex items-center gap-1 px-2.5 py-1 md:px-3.5 md:py-1.5 rounded-full text-xs font-bold border transition whitespace-nowrap ' + (editMode ? 'bg-gray-900 text-white border-gray-900 shadow-sm' : 'bg-white text-black border-gray-200 hover:bg-gray-50')}
            >
              {editMode ? <><Check className="w-3.5 h-3.5" /> <span>Edit ON</span></> : <><Edit3 className="w-3.5 h-3.5" /> <span>Edit</span></>}
            </button>
            <AuthButton />
          </div>
        </div>
        
        {/* Business Generator Prompt Bar */}
        <div className="max-w-[1600px] mx-auto px-3 md:px-4 pb-3">
          <div className="flex gap-2">
            <input
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                if (inputError) setInputError(null);
                if (generationError) setGenerationError(null);
              }}
              placeholder="Describe business: Salon in Wandegeya Aisha braids 35k"
              disabled={loading}
              className="flex-1 px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white text-sm outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 disabled:opacity-50 disabled:bg-gray-50"
              onKeyDown={(e) => { if (e.key === 'Enter') generate(); }}
            />
            <button onClick={() => generate()} disabled={loading} className="px-5 py-2.5 rounded-xl bg-gray-900 text-white font-bold text-sm disabled:opacity-50 hover:bg-black flex items-center gap-2 flex-shrink-0 shadow-sm">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</> : <><Sparkles className="w-4 h-4" /> Generate</>}
            </button>
          </div>
          {inputError && (
            <div className="mt-2 flex items-center gap-1.5 text-xs text-red-600 bg-red-50 p-2 rounded-lg border border-red-200">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{inputError}</span>
            </div>
          )}
          {generationError && (
            <div className="mt-2 flex items-center justify-between text-xs text-red-700 bg-red-50 p-2.5 rounded-xl border border-red-200">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{generationError}</span>
              </div>
              <button onClick={() => setGenerationError(null)} className="text-red-900 font-bold underline ml-2">Dismiss</button>
            </div>
          )}
        </div>
      </div>

      {/* Sample Guidance Banner */}
      {!isGeneratedOrLoaded && !dismissSampleBanner && (
        <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-amber-500/10 border-b border-amber-200/80 px-4 py-2 text-xs text-amber-950 flex items-center justify-between">
          <div className="flex items-center gap-2 max-w-4xl">
            <Info className="w-4 h-4 text-amber-700 flex-shrink-0" />
            <span>
              <strong>Sample Preview:</strong> You are viewing a sample template. Type your business description above to generate your custom site, or click <strong>Edit</strong> to customize this layout.
            </span>
          </div>
          <button
            onClick={() => setDismissSampleBanner(true)}
            className="text-amber-800 hover:text-black font-bold text-[11px] underline ml-2 flex-shrink-0"
          >
            Got it
          </button>
        </div>
      )}

      {showLeftDrawer && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowLeftDrawer(false)}></div>
          <div className="absolute left-0 top-0 h-full w-[82%] max-w-[300px] bg-white shadow-2xl flex flex-col">
            <div className="p-4 border-b flex items-center justify-between">
              <div className="flex items-center gap-2">
                <img src="/logo.png" alt="VoidBuild" className="w-7 h-7 object-contain flex-shrink-0" />
                <span className="font-bold text-sm text-gray-900">voidbuild</span>
              </div>
              <button onClick={() => setShowLeftDrawer(false)} className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-600"><X className="w-5 h-5" /></button>
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
                  <div className="text-[11px] text-gray-400 mt-2">You can come back and edit anytime via Dashboard → Edit</div>
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

      {loading && (
        <div className="fixed inset-0 z-50 bg-white/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border shadow-2xl rounded-2xl p-8 max-w-sm w-full text-center">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gray-900 text-white flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
            <div className="font-bold mt-4 text-gray-900">Generating your website...</div>
            <div className="text-sm text-gray-600 mt-2 flex items-center justify-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              {steps[step]}
            </div>
            <div className="mt-4 w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
              <div className="h-full bg-gray-900 transition-all duration-1000" style={{ width: `${((step + 1) / steps.length) * 100}%` }}></div>
            </div>
            <div className="mt-3 text-xs text-gray-400">This takes 5-10 seconds • You can edit text and images after</div>
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
              <span className="font-bold truncate text-gray-900">{template.name}</span>
              {!isGeneratedOrLoaded ? (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200 font-bold flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-600" />
                  <span>Sample Preview</span>
                </span>
              ) : (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-gray-100 hidden md:inline-flex font-medium text-gray-600">{template.category} • {template.blocks.length} sections</span>
              )}
            </div>
            <SaveButton template={template} />
          </div>
          <TemplateRenderer template={template} editMode={editMode} onUpdateBlock={updateBlockData} onMoveBlock={moveBlock} onDuplicateBlock={duplicateBlock} onDeleteBlock={deleteBlock} />
        </div>
      </div>
    </main>
  );
}
