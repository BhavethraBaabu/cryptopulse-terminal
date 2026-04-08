'use client';

import dynamic from 'next/dynamic';
import { ApexOptions } from 'apexcharts';

const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

interface AllocationChartProps {
  labels: string[];
  values: number[];
}

export default function AllocationChart({ labels, values }: AllocationChartProps) {
  const options: ApexOptions = {
    chart: { type: 'donut', background: 'transparent', animations: { enabled: false } },
    labels,
    colors: ['#adef37', '#2ebe7b', '#76da44', '#a3aed0', '#dabe44', '#ff685f', '#60a5fa', '#f97316'],
    legend: {
      position: 'bottom',
      labels: { colors: '#a3aed0' },
      fontFamily: 'inherit',
    },
    dataLabels: {
      style: { fontFamily: 'inherit', fontSize: '11px' },
      dropShadow: { enabled: false },
    },
    plotOptions: {
      pie: {
        donut: {
          size: '65%',
          labels: {
            show: true,
            total: {
              show: true,
              label: 'Holdings',
              color: '#a3aed0',
              fontSize: '13px',
              fontFamily: 'inherit',
              formatter: () => `${labels.length}`,
            },
          },
        },
      },
    },
    stroke: { width: 2, colors: ['#1a2027'] },
    tooltip: {
      theme: 'dark',
      y: { formatter: (v) => `$${v.toLocaleString('en-US', { maximumFractionDigits: 2 })}` },
    },
  };

  return (
    <ReactApexChart
      options={options}
      series={values}
      type="donut"
      height={280}
    />
  );
}
