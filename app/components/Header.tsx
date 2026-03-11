'use client';
import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation';
import { Info } from 'lucide-react';
import { cn } from "@/lib/utils"
const Header = () => {
    const path = usePathname()
    return (
        <header>
            <div className="main-container inner">
                <Link href="/">
                    <Image src="/logo.svg" alt="Coin Pulse Logo" width={132} height={40} />
                </Link>
                <nav className="flex items-center gap-4">
                    <div className="nav-link cursor-pointer text-purple-100 font-medium">Search Modal</div>
                    <Link href="/coins" className={cn('nav-link', { 'is-active': path === '/coins' })}>All Coins</Link>
                    <button className="rounded-full border-2 border-white p-1 text-white hover:bg-white hover:text-dark-700 transition-colors ml-2 flex items-center justify-center">
                        <Info size={20} />
                    </button>
                </nav>
            </div>
        </header>
    )
}

export default Header