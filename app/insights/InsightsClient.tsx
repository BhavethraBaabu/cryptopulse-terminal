'use client';

import { useState, useRef } from 'react';
import { Sparkles, RefreshCw, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

// Minimal markdown renderer for Claude's output
function renderMarkdown(text: string) {
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  let key = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.startsWith('### ')) {
      elements.push(<h3 key={key++} className="text-base font-semibold text-white mt-4 mb-1">{line.slice(4)}</h3>);
    } else if (line.startsWith('## ')) {
      elements.push(<h2 key={key++} className="text-lg font-semibold text-[#adef37] mt-5 mb-1.5">{line.slice(3)}</h2>);
    } else if (line.startsWith('# ')) {
      elements.push(<h1 key={key++} className="text-xl font-bold text-white mt-5 mb-2">{line.slice(2)}</h1>);
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      elements.push(
        <li key={key++} className="text-gray-300 text-sm ml-4 list-disc leading-relaxed">
          {inlineFormat(line.slice(2))}
        </li>
      );
    } else if (/^\d+\.\s/.test(line)) {
      elements.push(
        <li key={key++} className="text-gray-300 text-sm ml-4 list-decimal leading-relaxed">
          {inlineFormat(line.replace(/^\d+\.\s/, ''))}
        </li>
      );
    } else if (line.trim() === '') {
      elements.push(<div key={key++} className="h-2" />);
    } else {
      elements.push(
        <p key={key++} className="text-gray-300 text-sm leading-relaxed">
          {inlineFormat(line)}
        </p>
      );
    }
  }

  return elements;
}

function inlineFormat(text: string): React.ReactNode {
  // Bold **text**
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="text-white font-semibold">{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}

export default function InsightsClient({ hasData }: { hasData: boolean }) {
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [generated, setGenerated] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const generate = async () => {
    setLoading(true);
    setOutput('');
    setError('');
    setGenerated(false);

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch('/api/insights', {
        method: 'POST',
        signal: controller.signal,
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Error ${res.status}`);
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error('No response body');

      const decoder = new TextDecoder();
      let done = false;

      while (!done) {
        const { value, done: d } = await reader.read();
        done = d;
        if (value) setOutput((prev) => prev + decoder.decode(value, { stream: !done }));
      }

      setGenerated(true);
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        setError(err.message ?? 'Failed to generate insights. Check your ANTHROPIC_API_KEY.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 mt-2">
      {/* Generate button */}
      <div className="flex items-center gap-4">
        <button
          onClick={generate}
          disabled={loading}
          className={cn(
            'flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all',
            loading
              ? 'bg-[#adef37]/50 text-black/60 cursor-not-allowed'
              : 'bg-[#adef37] text-black hover:bg-[#adef37]/90',
          )}
        >
          {loading ? (
            <RefreshCw size={15} className="animate-spin" />
          ) : (
            <Sparkles size={15} />
          )}
          {loading ? 'Analysing…' : generated ? 'Regenerate Analysis' : 'Analyse My Portfolio'}
        </button>

        {!hasData && !loading && (
          <p className="text-xs text-gray-500">
            Add positions or make practice trades to get richer insights.
          </p>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/30 rounded-xl p-4">
          <AlertCircle size={16} className="text-red-400 shrink-0 mt-0.5" />
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* Streaming output */}
      {(output || loading) && (
        <div className="bg-dark-500 border border-white/5 rounded-2xl p-6 min-h-40">
          {loading && !output && (
            <div className="flex items-center gap-2 text-gray-400 text-sm animate-pulse">
              <Sparkles size={14} className="text-[#adef37]" />
              Claude is thinking…
            </div>
          )}
          <div className="space-y-0.5">
            {renderMarkdown(output)}
            {loading && (
              <span className="inline-block w-1.5 h-4 bg-[#adef37] animate-pulse ml-0.5 rounded-sm" />
            )}
          </div>
        </div>
      )}

      {/* Empty state */}
      {!output && !loading && !error && (
        <div className="bg-dark-500 border border-white/5 rounded-2xl p-8 text-center space-y-3">
          <div className="w-14 h-14 rounded-full bg-dark-400 flex items-center justify-center mx-auto">
            <Sparkles className="text-[#adef37]" size={24} />
          </div>
          <p className="text-white font-medium">AI Portfolio Analyst</p>
          <p className="text-sm text-gray-400 max-w-sm mx-auto">
            Claude will analyse your real portfolio positions, practice trades, and P&L to give you personalised insights and learning tips.
          </p>
        </div>
      )}
    </div>
  );
}
