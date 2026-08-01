"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getEffectiveUser, signOut, User } from '../lib/auth';

export default function AuthButton() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getEffectiveUser().then(u => {
      setUser(u);
      setLoading(false);
    });
  }, []);

  const handleSignOut = async () => {
    await signOut();
    window.location.href = '/';
  };

  if (loading) return <div className="w-8 h-8 rounded-full bg-gray-100 animate-pulse"></div>;

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Link href="/auth" className="px-3 py-1.5 rounded-full bg-gray-900 text-white text-xs font-bold">Sign In</Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <div className="hidden md:flex flex-col items-end">
        <div className="text-xs font-semibold">{user.email || user.phone || 'Guest'}</div>
        <div className="text-[10px] text-gray-500">{user.id.slice(0, 8)}...</div>
      </div>
      <div className="w-8 h-8 rounded-full bg-gray-900 text-white flex items-center justify-center text-xs font-bold">
        {(user.email?.[0] || user.phone?.[0] || 'G').toUpperCase()}
      </div>
      <button onClick={handleSignOut} className="text-[11px] text-gray-500 hover:underline">Sign Out</button>
    </div>
  );
}
