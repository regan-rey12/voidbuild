"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getEffectiveUser, signOut, User } from '@/lib/auth';

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
      <div className="w-auto md:w-[140px] md:min-w-[140px] flex items-center justify-end">
        <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-gray-100 animate-pulse"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="w-auto md:w-[140px] md:min-w-[140px] flex items-center justify-end">
        <Link
          href="/auth"
          className="px-3 py-1 md:px-4 md:py-1.5 rounded-full bg-white border border-gray-200 text-gray-900 text-xs font-semibold hover:bg-gray-50 whitespace-nowrap transition shadow-sm"
        >
          Sign In
        </Link>
      </div>
    );
  }

  const initial = (user.email?.[0] || user.phone?.[0] || 'U').toUpperCase();

  return (
    <div className="w-auto md:w-[140px] md:min-w-[140px] flex items-center justify-end gap-1.5 md:gap-2">
      <div
        className="w-7 h-7 rounded-full bg-gray-900 text-white flex items-center justify-center text-xs font-bold flex-shrink-0 shadow-sm"
        title={user.email || user.phone || 'User'}
      >
        {initial}
      </div>
      <button
        onClick={handleSignOut}
        className="hidden sm:inline text-xs text-gray-500 hover:text-red-600 transition font-medium"
        title="Sign Out"
      >
        <span>Exit</span>
      </button>
    </div>
  );
}
