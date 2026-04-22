'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
        {/* Animate the text content swap */}
        <AnimatePresence mode="wait" initial={false}>
          <motion.p
            key={expanded ? 'full' : 'preview'}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="text-sm text-gray-300 leading-relaxed"
          >
            {displayed}
          </motion.p>
        </AnimatePresence>

        {isLong && (
          <motion.button
            onClick={() => setExpanded((e) => !e)}
            whileHover={{ x: 3 }}
            whileTap={{ scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            className="flex items-center gap-1 text-xs font-medium text-[#adef37] hover:text-[#adef37]/80 transition-colors focus:outline-none"
            aria-expanded={expanded}
          >
            <AnimatePresence mode="wait" initial={false}>
              {expanded ? (
                <motion.span
                  key="less"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.15 }}
                  className="flex items-center gap-1"
                >
                  Show less <ChevronUp size={14} aria-hidden="true" />
                </motion.span>
              ) : (
                <motion.span
                  key="more"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.15 }}
                  className="flex items-center gap-1"
                >
                  Show more <ChevronDown size={14} aria-hidden="true" />
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        )}
      </div>
    </div>
  );
}
