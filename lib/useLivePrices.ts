import { useState, useEffect, useRef } from 'react';

export function useLivePrices(coinIds: string[]) {
  const [prices, setPrices] = useState<Record<string, number>>({});
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!coinIds || coinIds.length === 0) return;

    let reconnectTimeout: ReturnType<typeof setTimeout>;
    let pingInterval: ReturnType<typeof setInterval>;
    
    const connect = () => {
      const assetsUrl = coinIds.join(',');
      const ws = new WebSocket(`wss://ws.coincap.io/prices?assets=${assetsUrl}`);
      wsRef.current = ws;

      ws.onopen = () => {
        // Ping/Pong Heartbeat to keep connection alive if needed
        pingInterval = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            // CoinCap doesn't strict require ping for this stream, but sending a harmless payload 
            // keeps proxy/firewalls from dropping idle persistent connections
            ws.send(JSON.stringify({ type: "ping" }));
          }
        }, 30000); // every 30 seconds
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          const newPrices: Record<string, number> = {};
          for (const key in data) {
            newPrices[key] = parseFloat(data[key]);
          }
          setPrices(prev => ({ ...prev, ...newPrices }));
        } catch (e) {
          // Ignore parse errors from ping rejections etc
        }
      };

      ws.onclose = () => {
        clearInterval(pingInterval);
        // Auto-reconnect logic
        reconnectTimeout = setTimeout(connect, 3000);
      };
      
      ws.onerror = (err) => {
        ws.close();
      };
    };

    connect();

    return () => {
      clearTimeout(reconnectTimeout);
      clearInterval(pingInterval);
      if (wsRef.current) {
        wsRef.current.onclose = null; // prevent reconnect loop on unmount
        wsRef.current.close();
      }
    };
  }, [coinIds.join(',')]);

  return prices;
}
