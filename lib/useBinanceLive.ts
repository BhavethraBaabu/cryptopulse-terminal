import { useEffect, useState, useRef } from 'react';

export function useBinanceLive(symbols: string[]) {
  const [data, setData] = useState<Record<string, { price: number, change: number }>>({});
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!symbols || symbols.length === 0) return;
    
    // Create combined stream URL
    const streams = symbols.map(s => `${s.toLowerCase()}@ticker`).join('/');
    const url = `wss://stream.binance.us:9443/stream?streams=${streams}`;
    
    let reconnectTimeout: ReturnType<typeof setTimeout>;
    
    const connect = () => {
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.data) {
            const streamData = msg.data;
            setData(prev => ({
              ...prev,
              [streamData.s]: {
                price: parseFloat(streamData.c),
                change: parseFloat(streamData.P)
              }
            }));
          }
        } catch(e) {}
      };

      ws.onclose = () => {
        reconnectTimeout = setTimeout(connect, 3000);
      };
      
      ws.onerror = () => {
        ws.close();
      };
    };

    connect();

    return () => {
      clearTimeout(reconnectTimeout);
      if (wsRef.current) {
        wsRef.current.onclose = null; // Prevent reconnect loop
        wsRef.current.close();
      }
    };
  }, [symbols]);

  return data;
}
