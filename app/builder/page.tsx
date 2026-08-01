"use client";
import { useState } from 'react';
import TemplateRenderer from '../../components/TemplateRenderer';
import SaveButton from '../../components/SaveButton';
import EditorSidebar from '../../components/editor/EditorSidebar';
import { Template, TemplateBlock, BlockType } from '../../lib/types';
import sampleTemplate from '../../templates/salon-ug-1.json';
import Link from 'next/link';

export default function BuilderPage() {
  const [template, setTemplate] = useState<Template>(sampleTemplate as Template);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [showMobileEditor, setShowMobileEditor] = useState(false);
  
  const steps = ['Understanding...', 'Crafting UGX...', 'Adding WhatsApp...', 'Building...'];

  const generate = async () => {
    if (!input.trim() || input.length < 5) {
      alert('Describe your business, e.g. Salon in Wandegeya called Aisha');
      return;
    }
    setLoading(true);
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
      setTemplate(data);
      setEditMode(true);
    } catch (e: any) {
      alert(`Failed: ${e.message}`);
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
      [newBlocks[idx], newBlocks[newIdx]] = [newBlocks[newIdx], newBlocks[idx]];
      return { ...prev, blocks: newBlocks };
    });
  };
  const duplicateBlock = (blockId: string) => {
    setTemplate(prev => {
      const idx = prev.blocks.findIndex(b => b.id === blockId);
      if (idx === -1) return prev;
      const block = prev.blocks[idx];
      const newBlock = { ...block, id: `${block.type}-${Date.now()}` };
      const newBlocks = [...prev.blocks];
      newBlocks.splice(idx + 1, 0, newBlock);
      return { ...prev, blocks: newBlocks };
    });
  };
  const deleteBlock = (blockId: string) => {
    if (!confirm('Delete this block?')) return;
    setTemplate(prev => ({ ...prev, blocks: prev.blocks.filter(b => b.id !== blockId) }));
  };
  const addBlock = (type: BlockType) => {
    const newBlock: TemplateBlock = {
      id: `${type}-${Date.now()}`,
      type,
      data: { heading: 'New Block', title: 'New Title' },
      style: { primaryColor: template.blocks[0]?.style?.primaryColor || '#111827' }
    };
    setTemplate(prev => ({ ...prev, blocks: [...prev.blocks.slice(0, -1), newBlock, prev.blocks[prev.blocks.length - 1]] }));
    setShowMobileEditor(false);
  };

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top bar - mobile responsive: smaller padding, stacked */}
      <div className="sticky top-0 z-[100] bg-gray-900 text-white px-3 md:px-4 py-2.5 border-b">
        <div className="max-w-[1600px] mx-auto flex flex-col gap-2 md:flex-row md:items-center md:gap-3">
          <div className="flex items-center justify-between md:justify-start gap-3">
            <div className="flex items-center gap-2">
              <Link href="/" className="font-bold text-sm">voidbuild</Link>
              <span className="text-[10px] text-gray-400 hidden md:inline">Builder</span>
              <Link href="/dashboard" className="text-[11px] text-gray-400 underline md:ml-2">Dashboard</Link>
            </div>
            <div className="flex md:hidden items-center gap-2">
              <button onClick={() => setEditMode(!editMode)} className={`px-3 py-1.5 rounded-full text-[11px] font-bold ${editMode ? 'bg-blue-500 text-white' : 'bg-white text-black'}`}>{editMode ? 'Edit ON' : 'Edit OFF'}</button>
              <button onClick={() => setShowMobileEditor(!showMobileEditor)} className="px-3 py-1.5 rounded-full bg-gray-800 text-white text-[11px]">Blocks</button>
            </div>
          </div>
          <div className="flex-1 flex gap-2 max-w-3xl w-full">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="e.g. Salon Wandegeya Aisha braids 35k"
              className="flex-1 px-3 py-2 rounded-lg text-black text-[13px] outline-none"
              onKeyDown={(e) => e.key === 'Enter' && generate()}
            />
            <button onClick={generate} disabled={loading} className="px-4 py-2 rounded-lg bg-white text-black font-bold text-xs whitespace-nowrap disabled:opacity-50">{loading ? '...' : 'Generate'}</button>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <button onClick={() => setEditMode(!editMode)} className={`px-3 py-1.5 rounded-full text-xs font-bold ${editMode ? 'bg-blue-500 text-white' : 'bg-white text-black'}`}>{editMode ? 'Edit ON' : 'Edit OFF'}</button>
          </div>
        </div>
        {loading && <div className="max-w-[1600px] mx-auto mt-1.5 text-[11px] text-gray-400 flex items-center gap-1.5"><span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>{steps[step]}</div>}
      </div>

      {/* Save bar - not sticky on mobile to save viewport */}
      <div className="bg-white border-b md:sticky md:top-[48px] z-40">
        <div className="max-w-[1600px] mx-auto px-4 py-2.5 flex items-center justify-between gap-3">
          <div className="text-xs flex items-center gap-2 min-w-0">
            <span className="font-bold truncate">{template.name}</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-gray-100 flex-shrink-0">{template.category}</span>
            {editMode && <span className="hidden md:inline text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">Click text/image to edit</span>}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <SaveButton template={template} />
          </div>
        </div>
      </div>

      {/* Mobile editor bottom sheet */}
      {showMobileEditor && (
        <div className="md:hidden fixed inset-0 z-[90] bg-black/50" onClick={() => setShowMobileEditor(false)}>
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl max-h-[70vh] overflow-y-auto p-4" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-3">
              <div className="font-bold text-sm">Add Block</div>
              <button onClick={() => setShowMobileEditor(false)} className="w-8 h-8 rounded-full bg-gray-100">✕</button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {['hero','services','gallery','contact','pricing','stats','map'].map(t => (
                <button key={t} onClick={() => addBlock(t as any)} className="border rounded-lg p-3 text-left hover:bg-gray-50">
                  <div className="text-xs font-bold capitalize">{t}</div>
                  <div className="text-[10px] text-gray-500">Add {t}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-1">
        {editMode && (
          <div className="hidden md:block sticky top-[96px] h-[calc(100vh-96px)] flex-shrink-0">
            <EditorSidebar template={template} onUpdate={setTemplate} onAddBlock={addBlock} />
          </div>
        )}
        <div className="flex-1 overflow-auto">
          <TemplateRenderer template={template} editMode={editMode} onUpdateBlock={updateBlockData} onMoveBlock={moveBlock} onDuplicateBlock={duplicateBlock} onDeleteBlock={deleteBlock} />
        </div>
      </div>
    </main>
  );
}
