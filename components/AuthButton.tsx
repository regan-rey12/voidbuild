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

  if (loading) {
    return (
      <div className="flex items-center gap-2 min-w-[80px] justify-end">
        <div className="w-8 h-8 rounded-full bg-gray-100 animate-pulse flex-shrink-0"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center gap-2 justify-end">
        <Link href="/auth" className="px-3.5 py-1.5 rounded-full bg-gray-900 text-white text-xs font-bold hover:bg-black whitespace-nowrap">Sign In</Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 justify-end">
      <div className="w-8 h-8 rounded-full bg-gray-900 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
        {(user.email?.[0] || 'U').toUpperCase()}
      </div>
      <button onClick={handleSignOut} className="text-xs text-gray-600 hover:text-black hover:underline">Sign Out</button>
    </div>
  );
}
