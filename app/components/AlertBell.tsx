'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Bell } from 'lucide-react';
import { getTriggeredCount } from '@/app/actions/alerts';

export default function AlertBell() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    // Fetch triggered count on mount and every 60 seconds
    const check = async () => {
      try {
        const n = await getTriggeredCount();
        setCount(n);
      } catch {}
    };

    check();
    const id = setInterval(check, 60_000);
    return () => clearInterval(id);
  }, []);

  return (
    <Link
      href="/alerts"
      aria-label={count > 0 ? `${count} price alert${count > 1 ? 's' : ''} triggered` : 'Price alerts'}
      className="relative flex items-center justify-center w-9 h-9 rounded-xl hover:bg-white/5 transition-colors"
    >
      <Bell
        size={18}
        className={count > 0 ? 'text-[#adef37]' : 'text-gray-400'}
        aria-hidden="true"
      />
      {count > 0 && (
        <span
          className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center"
          aria-hidden="true"
        >
          {count > 9 ? '9+' : count}
        </span>
      )}
    </Link>
  );
}
