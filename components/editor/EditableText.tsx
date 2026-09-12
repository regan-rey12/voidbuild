"use client";
import { useState, useEffect } from 'react';

interface Props {
  value: string;
  onChange: (newValue: string) => void;
  editMode: boolean;
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span' | 'div';
  className?: string;
  multiline?: boolean;
  placeholder?: string;
}

export default function EditableText({ value, onChange, editMode, as = 'div', className = '', multiline = false, placeholder }: Props) {
  const [editing, setEditing] = useState(false);
  const [temp, setTemp] = useState(value);

  useEffect(() => setTemp(value), [value]);

  if (!editMode) {
    const Tag = as;
    return <Tag className={className}>{value}</Tag>;
  }

  if (!editing) {
    const Tag = as;
    return (
      <Tag
        className={`${className} cursor-pointer hover:outline hover:outline-2 hover:outline-blue-400 hover:outline-dashed rounded px-1 -mx-1 transition relative group`}
        onClick={() => setEditing(true)}
        title="Click to edit"
      >
        {value || <span className="opacity-40 italic">{placeholder || 'Click to edit'}</span>}
        <span className="absolute -top-2 -right-2 bg-blue-500 text-white text-[8px] px-1 py-0.5 rounded opacity-0 group-hover:opacity-100 transition">EDIT</span>
      </Tag>
    );
  }

  if (multiline) {
    return (
      <textarea
        value={temp}
        onChange={(e) => setTemp(e.target.value)}
        onBlur={() => {
          onChange(temp);
          setEditing(false);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            setTemp(value);
            setEditing(false);
          }
        }}
        autoFocus
        rows={3}
        className={`${className} w-full bg-white !text-gray-900 placeholder:text-gray-400 border-2 border-blue-500 rounded-lg p-2 outline-none resize-none`}
        placeholder={placeholder}
      />
    );
  }

  return (
    <input
      type="text"
      value={temp}
      onChange={(e) => setTemp(e.target.value)}
      onBlur={() => {
        onChange(temp);
        setEditing(false);
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          onChange(temp);
          setEditing(false);
        }
        if (e.key === 'Escape') {
          setTemp(value);
          setEditing(false);
        }
      }}
      autoFocus
      className={`${className} w-full bg-white !text-gray-900 placeholder:text-gray-400 border-2 border-blue-500 rounded-lg px-2 py-1 outline-none`}
      placeholder={placeholder}
    />
  );
}
