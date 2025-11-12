'use client';

import { useEffect, useState } from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

interface DailyChartProps {
  data: Array<{
    date: string;
    messages: number;
    dateFormatted: string;
  }>;
}

export default function DailyChart({ data }: DailyChartProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    console.log('📊 DailyChart monté, données:', data);
  }, [data]);

  if (!mounted) {
    return (
      <div className="h-[300px] flex items-center justify-center text-gray-500 bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-globe-red border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-sm">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
        <div className="text-center">
          <p className="text-lg font-medium mb-2">Pas de données</p>
        </div>
      </div>
    );
  }

  console.log('📊 DailyChart rendu avec', data.length, 'points de données');

  // S'assurer que les données sont valides
  const validData = data.filter(d => d && typeof d.messages === 'number' && d.dateFormatted);
  
  if (validData.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
        <div className="text-center">
          <p className="text-lg font-medium mb-2">Pas de données valides</p>
          <p className="text-sm text-gray-400">Les données reçues ne sont pas au bon format</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full" style={{ height: '300px' }}>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart 
          data={validData} 
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorMessages" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#b93737" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#b93737" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="dateFormatted" 
            stroke="#6b7280" 
            fontSize={12}
            tick={{ fill: '#6b7280' }}
            angle={-45}
            textAnchor="end"
            height={60}
          />
          <YAxis 
            stroke="#6b7280" 
            fontSize={12} 
            allowDecimals={false}
            tick={{ fill: '#6b7280' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
            }}
            formatter={(value: any) => [`${value} message${value > 1 ? 's' : ''}`, 'Messages']}
            labelFormatter={(label) => `Date: ${label}`}
          />
          <Area
            type="monotone"
            dataKey="messages"
            stroke="#b93737"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorMessages)"
            isAnimationActive={true}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

