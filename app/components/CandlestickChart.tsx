"use client";

import { useEffect, useRef } from "react";
import { createChart, ColorType, CandlestickSeries } from "lightweight-charts";

export default function CandlestickChart() {
  const chartContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Create chart
    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 400,
      layout: {
        background: { type: ColorType.Solid, color: "#0f172a" },
        textColor: "#d1d5db",
      },
      grid: {
        vertLines: { color: "#1e293b" },
        horzLines: { color: "#1e293b" },
      },
    });

    // Add candlestick series
    const candlestickSeries = chart.addSeries(CandlestickSeries);

    // Sample candlestick data
    candlestickSeries.setData([
      { time: "2024-03-01", open: 62000, high: 63000, low: 61000, close: 62500 },
      { time: "2024-03-02", open: 62500, high: 64000, low: 62000, close: 63800 },
      { time: "2024-03-03", open: 63800, high: 64500, low: 63000, close: 64000 },
      { time: "2024-03-04", open: 64000, high: 65500, low: 63500, close: 65000 },
      { time: "2024-03-05", open: 65000, high: 66000, low: 64500, close: 65800 },
    ]);

    // Cleanup chart when component unmounts
    return () => {
      chart.remove();
    };
  }, []);

  return (
    <div
      ref={chartContainerRef}
      style={{
        width: "100%",
        height: "400px",
        borderRadius: "12px",
        overflow: "hidden",
      }}
    />
  );
}