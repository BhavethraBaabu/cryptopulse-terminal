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
        // Ping/Pong Heartbeat 
        pingInterval = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            
            ws.send(JSON.stringify({ type: "ping" }));
          }
        }, 30000); 
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
        wsRef.current.onclose = null; 
        wsRef.current.close();
      }
    };
  }, [coinIds.join(',')]);

  return prices;
}
