'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useUser, UserButton, SignInButton } from '@clerk/nextjs';
import { BarChart2, Wallet, Star, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import AlertBell from './AlertBell';

const PUBLIC_NAV = [
  { href: '/', label: 'Home', onlyHome: true },
  { href: '/coins', label: 'Markets' },
];

const PROTECTED_NAV = [
  { href: '/watchlist', label: 'Watchlist', icon: Star },
  { href: '/portfolio', label: 'Portfolio', icon: Wallet },
  { href: '/practice', label: 'Practice', icon: BarChart2 },
  { href: '/alerts', label: 'Alerts' },
];

export default function Header() {
  const path = usePathname();
  const { isSignedIn, isLoaded } = useUser();

  const isActive = (href: string, onlyHome?: boolean) =>
    onlyHome ? path === href : path === href || (href !== '/' && path.startsWith(href));

  return (
    <header>
      <div className="main-container inner">
        {/* Logo */}
        <Link href="/" aria-label="CoinPulse home">
          <Image src="/logo.svg" alt="CoinPulse" width={132} height={40} priority />
        </Link>

        {/* Nav */}
        <nav aria-label="Main navigation">
          {PUBLIC_NAV.map(({ href, label, onlyHome }) => (
            <Link
              key={href}
              href={href}
              className={cn('nav-link', {
                'is-active': isActive(href, onlyHome),
                'is-home': onlyHome,
              })}
            >
              {label}
            </Link>
          ))}

          {/* Protected links — only shown when signed in */}
          {isLoaded && isSignedIn &&
            PROTECTED_NAV.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={cn('nav-link', { 'is-active': isActive(href) })}
              >
                {label}
              </Link>
            ))}
        </nav>

        {/* Auth */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Alert bell — only when signed in */}
          {isLoaded && isSignedIn && <AlertBell />}

          {/* Show nothing until Clerk loads to avoid layout flash */}
          {isLoaded && (
            isSignedIn ? (
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: 'w-9 h-9 ring-2 ring-[#adef37]/30 hover:ring-[#adef37]/60 transition-all',
                    userButtonPopoverCard: 'bg-dark-400 border border-white/10 shadow-xl',
                    userButtonPopoverActionButton: 'hover:bg-dark-500 text-white',
                    userButtonPopoverActionButtonText: 'text-white',
                    userButtonPopoverFooter: 'hidden',
                  },
                }}
              />
            ) : (
              <SignInButton mode="redirect" fallbackRedirectUrl="/">
                <button
                  className="px-4 py-2 text-sm font-semibold text-black bg-[#adef37] rounded-xl hover:bg-[#adef37]/90 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#adef37]"
                  aria-label="Sign in to CoinPulse"
                >
                  Sign In
                </button>
              </SignInButton>
            )
          )}
        </div>
      </div>
    </header>
  );
}
