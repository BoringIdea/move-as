'use client'

import { Card } from '@/components/ui/card';
import { BarChart3 } from 'lucide-react';

export interface VolumeData {
  hour: string;
  volume: number;
  timestamp: number;
}

interface VolumeTrendChartProps {
  data: VolumeData[];
}

export function VolumeTrendChart({ data }: VolumeTrendChartProps) {
  if (!data || data.length === 0) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">24h Volume Trend</h3>
        <div className="h-[300px] flex items-center justify-center text-gray-400">
          No data available
        </div>
      </Card>
    );
  }

  const maxVolume = Math.max(...data.map(d => d.volume), 1); // Ensure at least 1 to avoid division by zero
  console.log('VolumeTrendChart - data points:', data.length, 'maxVolume:', maxVolume);
  
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-base md:text-lg font-semibold text-gray-900">24h Volume Trend</h3>
        <BarChart3 className="w-5 h-5 text-gray-400" />
      </div>

      {/* Scroll container for small screens */}
      <div className="flex gap-4 overflow-x-auto scrollbar-thin">
        {/* Y-axis labels */}
        <div className="flex-shrink-0 flex flex-col justify-between h-[280px] text-[10px] md:text-xs text-gray-500 py-1 pl-1">
          <span>${formatCurrency(maxVolume)}</span>
          <span>${formatCurrency(maxVolume / 2)}</span>
          <span>0</span>
        </div>

        {/* Chart area */}
        <div className="relative h-[280px] flex items-end justify-between gap-1 pr-2" style={{ minWidth: `${Math.max(data.length * 10, 520)}px` }}>
        {data.map((item, index) => {
          const heightPercent = maxVolume > 0 ? (item.volume / maxVolume) * 100 : 0;
          const heightPx = maxVolume > 0 ? Math.max((item.volume / maxVolume) * 280, item.volume > 0 ? 8 : 2) : 2;
          
          if (index === 0) {
            console.log('First bar - volume:', item.volume, 'maxVolume:', maxVolume, 'heightPx:', heightPx);
          }
          
          return (
            <div key={index} className="flex-1 flex flex-col justify-end items-center group h-full" style={{ minWidth: '8px' }}>
              <div className="w-full flex flex-col items-center">
                {/* Tooltip */}
                <div className="absolute opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 whitespace-nowrap -translate-y-full mb-2">
                  <div className="bg-gray-900 text-white text-xs rounded px-2 py-1">
                    <div className="font-semibold">${formatCurrency(item.volume)}</div>
                    <div className="text-gray-300">{item.hour}</div>
                  </div>
                </div>
                
                {/* Bar */}
                <div
                  className={`w-full rounded-t transition-all cursor-pointer ${
                    item.volume > 0 
                      ? 'bg-gradient-to-t from-blue-500 to-blue-400 hover:from-blue-600 hover:to-blue-500' 
                      : 'bg-gray-200'
                  }`}
                  style={{ height: `${heightPx}px` }}
                  title={`${item.hour}: $${formatCurrency(item.volume)}`}
                />
                
                {/* Hour label - show every 4 hours */}
                {index % 4 === 0 && (
                  <div className="text-[10px] md:text-xs text-gray-500 mt-2 absolute" style={{ bottom: '-24px' }}>
                    {item.hour}
                  </div>
                )}
              </div>
            </div>
          );
        })}
        </div>
      </div>

      {/* X-axis label */}
      <div className="mt-8 text-center text-[10px] md:text-xs text-gray-500">
        Time (24h)
      </div>
    </Card>
  );
}

function formatCurrency(value: number): string {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  } else if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  return value.toFixed(0);
}
