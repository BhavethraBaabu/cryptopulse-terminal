'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface CoinDescriptionProps {
  description: string;
  coinName: string;
}

function stripHtml(html: string): string {
  return html
    .replace(/<a\b[^>]*>(.*?)<\/a>/gi, '$1')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

const PREVIEW_LENGTH = 360;

export default function CoinDescription({ description, coinName }: CoinDescriptionProps) {
  const [expanded, setExpanded] = useState(false);
  const clean = stripHtml(description);

  if (!clean) return null;

  const isLong = clean.length > PREVIEW_LENGTH;
  const displayed = expanded || !isLong ? clean : `${clean.slice(0, PREVIEW_LENGTH).trimEnd()}…`;

  return (
    <div className="w-full mt-8 space-y-3">
      <h4 className="text-xl md:text-2xl font-semibold">About {coinName}</h4>
      <div className="bg-dark-500 rounded-lg px-5 py-5 space-y-3">
        <p className="text-sm text-gray-300 leading-relaxed">{displayed}</p>
        {isLong && (
          <button
            onClick={() => setExpanded((e) => !e)}
            className="flex items-center gap-1 text-xs font-medium text-[#adef37] hover:text-[#adef37]/80 transition-colors focus:outline-none"
            aria-expanded={expanded}
          >
            {expanded ? (
              <>Show less <ChevronUp size={14} aria-hidden="true" /></>
            ) : (
              <>Show more <ChevronDown size={14} aria-hidden="true" /></>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
