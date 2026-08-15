"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getEffectiveUser, signOut, User } from '../lib/auth';
import { LogOut, User as UserIcon } from 'lucide-react';

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
      <div className="w-[140px] min-w-[140px] flex items-center justify-end">
        <div className="w-8 h-8 rounded-full bg-gray-100 animate-pulse"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="w-[140px] min-w-[140px] flex items-center justify-end">
        <Link
          href="/auth"
          className="px-4 py-1.5 rounded-full bg-white border border-gray-200 text-gray-900 text-xs font-semibold hover:bg-gray-50 whitespace-nowrap transition shadow-sm"
        >
          Sign In
        </Link>
      </div>
    );
  }

  const initial = (user.email?.[0] || user.phone?.[0] || 'U').toUpperCase();

  return (
    <div className="w-[140px] min-w-[140px] flex items-center justify-end gap-2">
      <div
        className="w-7 h-7 rounded-full bg-gray-900 text-white flex items-center justify-center text-xs font-bold flex-shrink-0"
        title={user.email || user.phone || 'User'}
      >
        {initial}
      </div>
      <button
        onClick={handleSignOut}
        className="text-xs text-gray-500 hover:text-red-600 transition flex items-center gap-1 font-medium"
        title="Sign Out"
      >
        <span>Exit</span>
      </button>
    </div>
  );
}
