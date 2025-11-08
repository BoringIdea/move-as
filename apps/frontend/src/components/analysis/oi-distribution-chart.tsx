'use client'

import { Card } from '@/components/ui/card';
import { PieChart } from 'lucide-react';
import type { Market } from './markets-table';

interface OIDistributionChartProps {
  markets: Market[];
}

export function OIDistributionChart({ markets }: OIDistributionChartProps) {
  const totalOI = markets.reduce((sum, m) => sum + m.open_interest, 0);
  
  // Get top 5 markets by OI and group the rest as "Others"
  const sortedMarkets = [...markets]
    .sort((a, b) => b.open_interest - a.open_interest);
  
  const top5Markets = sortedMarkets.slice(0, 5);
  const othersMarkets = sortedMarkets.slice(5);
  
  const othersOI = othersMarkets.reduce((sum, m) => sum + m.open_interest, 0);
  
  const data = [
    ...top5Markets.map((m, index) => ({
      name: m.market_name,
      value: m.open_interest,
      percentage: (m.open_interest / totalOI) * 100,
      color: COLORS[index % COLORS.length],
    })),
  ];
  
  if (othersOI > 0) {
    data.push({
      name: 'Others',
      value: othersOI,
      percentage: (othersOI / totalOI) * 100,
      color: '#9ca3af',
    });
  }

  // Calculate pie chart segments
  let currentAngle = -90; // Start from top
  const segments = data.map(item => {
    const angle = (item.percentage / 100) * 360;
    const segment = {
      ...item,
      startAngle: currentAngle,
      endAngle: currentAngle + angle,
    };
    currentAngle += angle;
    return segment;
  });

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-base md:text-lg font-semibold text-gray-900">Open Interest Distribution</h3>
        <PieChart className="w-5 h-5 text-gray-400" />
      </div>

      <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-8">
        {/* Pie Chart */}
        <div className="relative w-40 h-40 md:w-48 md:h-48">
          <svg viewBox="0 0 200 200" className="w-full h-full transform -rotate-90">
            {segments.map((segment, index) => {
              const path = createArcPath(100, 100, 80, segment.startAngle, segment.endAngle);
              return (
                <g key={index}>
                  <path
                    d={path}
                    fill={segment.color}
                    className="transition-all hover:opacity-80 cursor-pointer"
                  />
                </g>
              );
            })}
            {/* Center circle for donut effect */}
            <circle cx="100" cy="100" r="50" fill="white" />
          </svg>
          
          {/* Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-xl md:text-2xl font-bold text-gray-900">
              ${formatCurrency(totalOI)}
            </div>
            <div className="text-xs md:text-sm text-gray-500">Total OI</div>
          </div>
        </div>

        {/* Legend */}
        <div className="w-full md:flex-1 space-y-3">
          {data.map((item, index) => (
            <div key={index} className="flex items-center justify-between text-sm md:text-base">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 md:w-3.5 md:h-3.5 rounded-sm"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm font-medium text-gray-700">
                  {item.name}
                </span>
              </div>
              <div className="text-right">
                <div className="text-sm md:text-base font-semibold text-gray-900">
                  {item.percentage.toFixed(1)}%
                </div>
                <div className="text-xs md:text-sm text-gray-500">
                  ${formatCurrency(item.value)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

function createArcPath(
  x: number,
  y: number,
  radius: number,
  startAngle: number,
  endAngle: number
): string {
  const start = polarToCartesian(x, y, radius, endAngle);
  const end = polarToCartesian(x, y, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';

  return [
    'M', start.x, start.y,
    'A', radius, radius, 0, largeArcFlag, 0, end.x, end.y,
    'L', x, y,
    'Z'
  ].join(' ');
}

function polarToCartesian(
  centerX: number,
  centerY: number,
  radius: number,
  angleInDegrees: number
) {
  const angleInRadians = (angleInDegrees * Math.PI) / 180;
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
}

function formatCurrency(value: number): string {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(2)}M`;
  } else if (value >= 1000) {
    return `${(value / 1000).toFixed(2)}K`;
  }
  return value.toFixed(0);
}

const COLORS = [
  '#3b82f6', // blue
  '#10b981', // green
  '#f59e0b', // orange
  '#8b5cf6', // purple
  '#ec4899', // pink
];
