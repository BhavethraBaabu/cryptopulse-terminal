'use client';
import React, { useState } from 'react';

export default function CoinIcon({ symbol, className }: { symbol: string, className?: string }) {
  const [hasError, setHasError] = useState(false);

  return (
    <>
      {!hasError && (
        <img
          src={`https://assets.coincap.io/assets/icons/${symbol.toLowerCase()}@2x.png`}
          alt={symbol}
          className={className}
          onError={() => setHasError(true)}
        />
      )}
      <span className={`absolute ${hasError ? 'z-0' : 'z-[-1] opacity-0'} text-inherit`}>
        {symbol[0]}
      </span>
    </>
  );
}
