"use client";
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
    <div className="flex items-center gap-1 bg-white border shadow-lg rounded-full px-2 py-1 text-xs">
      <button onClick={onMoveUp} disabled={!canMoveUp} className="w-7 h-7 rounded-full hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center" title="Move up">↑</button>
      <button onClick={onMoveDown} disabled={!canMoveDown} className="w-7 h-7 rounded-full hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center" title="Move down">↓</button>
      <div className="w-px h-4 bg-gray-200 mx-1"></div>
      <button onClick={onDuplicate} className="w-7 h-7 rounded-full hover:bg-gray-100 flex items-center justify-center" title="Duplicate">⎘</button>
      <button onClick={onDelete} className="w-7 h-7 rounded-full hover:bg-red-50 text-red-600 flex items-center justify-center" title="Delete">✕</button>
    </div>
  );
}
