"use client";
import { ArrowUp, ArrowDown, Copy, Trash2 } from 'lucide-react';

interface Props {
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
}

export default function BlockToolbar({ onMoveUp, onMoveDown, onDuplicate, onDelete, canMoveUp, canMoveDown }: Props) {
  return (
    <div className="flex items-center gap-0.5 bg-white border border-gray-200 shadow-lg rounded-full px-1.5 py-1">
      <button onClick={onMoveUp} disabled={!canMoveUp} className="w-7 h-7 rounded-full hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition" title="Move up">
        <ArrowUp className="w-4 h-4" />
      </button>
      <button onClick={onMoveDown} disabled={!canMoveDown} className="w-7 h-7 rounded-full hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition" title="Move down">
        <ArrowDown className="w-4 h-4" />
      </button>
      <div className="w-px h-4 bg-gray-200 mx-1"></div>
      <button onClick={onDuplicate} className="w-7 h-7 rounded-full hover:bg-gray-100 flex items-center justify-center transition" title="Duplicate">
        <Copy className="w-4 h-4" />
      </button>
      <button onClick={onDelete} className="w-7 h-7 rounded-full hover:bg-red-50 text-red-600 flex items-center justify-center transition" title="Delete">
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}
