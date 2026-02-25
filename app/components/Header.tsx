'use client';
import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation';
import { cn } from "@/lib/utils"
const Header = () => {
    const path = usePathname()
    return (
        <header>
            <div className="main-container inner">
                <Link href="/">
                    <Image src="/logo.svg" alt="Coin Pulse Logo" width={132} height={40} />
                </Link>
                <nav>
                    <Link href="/" className={cn('nav-link', { 'is-active': path === '/', 'is-home': true })}>Home</Link>
                    <div className="nav-link cursor-default">Search Model</div>
                    <Link href="/coins" className={cn('nav-link', { 'is-active': path === '/coins' })}>All Coins</Link>
                </nav>
            </div>
        </header>
    )
}

export default Header