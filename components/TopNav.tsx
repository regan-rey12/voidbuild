"use client";
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import Link from 'next/link';
import AuthButton from './AuthButton';

interface TopNavProps {
  currentPage?: 'home' | 'builder' | 'dashboard' | 'pricing' | 'auth';
  showBuilderActions?: boolean;
  builderActions?: React.ReactNode;
}

export default function TopNav({ currentPage = 'home', showBuilderActions = false, builderActions }: TopNavProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: '/#templates', label: 'Templates', page: 'home' },
    { href: '/pricing', label: 'Pricing', page: 'pricing' },
    { href: '/dashboard', label: 'Dashboard', page: 'dashboard' },
  ];

  return (
    <>
      <nav className="sticky top-0 z-40 bg-white border-b">
        <div className="max-w-6xl md:max-w-[1600px] mx-auto px-3 md:px-6 h-12 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center">
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <Link href="/" className="flex items-center gap-2">
              <img src="/logo.png" alt="VoidBuild" className="w-7 h-7 rounded-lg object-contain border bg-white" />
              <span className="font-bold text-sm">voidbuild</span>
            </Link>
            {currentPage !== 'home' && (
              <span className="hidden md:inline-flex ml-2 text-[11px] px-2 py-0.5 rounded-full bg-gray-100 border capitalize">{currentPage}</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-1 mr-1">
              {navLinks.map(link => (
                <Link key={link.href} href={link.href} className={`px-3 py-1.5 rounded-full text-xs font-medium hover:bg-gray-50 transition ${currentPage === link.page ? 'bg-gray-100 text-black' : 'text-gray-600'}`}>{link.label}</Link>
              ))}
            </div>
            
            {showBuilderActions && builderActions ? (
              <div className="hidden md:flex items-center gap-2">{builderActions}</div>
            ) : (
              <Link href="/builder" className="hidden md:inline-flex px-4 py-1.5 rounded-full bg-gray-900 text-white text-xs font-bold hover:bg-black">Build Website</Link>
            )}
            
            <AuthButton />
          </div>
        </div>

        {showBuilderActions && builderActions && (
          <div className="md:hidden px-3 pb-2.5 flex items-center gap-2 overflow-x-auto">
            {builderActions}
          </div>
        )}
      </nav>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileMenuOpen(false)}></div>
          <div className="absolute left-0 top-0 h-full w-[82%] max-w-[300px] bg-white shadow-2xl flex flex-col">
            <div className="p-4 border-b flex items-center justify-between">
              <div className="flex items-center gap-2"><img src="/logo.png" alt="" className="w-7 h-7 rounded-lg object-contain border" /><span className="font-bold text-sm">voidbuild</span></div>
              <button onClick={() => setMobileMenuOpen(false)} className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center"><X className="w-5 h-5" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-1">
                <Link href="/" className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm ${currentPage === 'home' ? 'bg-gray-100 font-medium' : 'hover:bg-gray-50'}`} onClick={() => setMobileMenuOpen(false)}>Home</Link>
                <Link href="/builder" className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm ${currentPage === 'builder' ? 'bg-gray-100 font-medium' : 'hover:bg-gray-50'}`} onClick={() => setMobileMenuOpen(false)}>Builder</Link>
                <Link href="/dashboard" className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm ${currentPage === 'dashboard' ? 'bg-gray-100 font-medium' : 'hover:bg-gray-50'}`} onClick={() => setMobileMenuOpen(false)}>Dashboard</Link>
                <Link href="/pricing" className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm ${currentPage === 'pricing' ? 'bg-gray-100 font-medium' : 'hover:bg-gray-50'}`} onClick={() => setMobileMenuOpen(false)}>Pricing</Link>
              </div>
            </div>
            <div className="p-4 border-t">
              <div className="text-[11px] text-gray-400">© 2026 voidbuild</div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
