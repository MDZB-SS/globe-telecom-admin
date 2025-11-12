'use client';

import { useEffect, useState } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

interface ServiceData {
  name: string;
  value: number;
  color: string;
}

interface ServicesChartProps {
  data: ServiceData[];
}

const COLORS = ['#b93737', '#0b1f3a', '#6b7280', '#9ca3af'];

export default function ServicesChart({ data }: ServicesChartProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    console.log('📊 ServicesChart monté, données:', data);
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
          <p className="text-lg font-medium mb-2">Aucun service avec données</p>
        </div>
      </div>
    );
  }

  // S'assurer que les données sont valides
  const validData = data.filter(d => d && d.name && typeof d.value === 'number' && d.value > 0);
  
  if (validData.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
        <div className="text-center">
          <p className="text-lg font-medium mb-2">Aucun service avec données</p>
          <p className="text-sm text-gray-400">Les services apparaîtront quand des demandes seront enregistrées</p>
        </div>
      </div>
    );
  }

  console.log('📊 ServicesChart rendu avec', validData.length, 'services');

  return (
    <div className="w-full" style={{ height: '300px' }}>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={validData}
            cx="50%"
            cy="45%"
            labelLine={false}
            label={({ name, percent }: any) => {
              if (percent < 0.05) return ''; // Masquer les labels trop petits
              return `${name}: ${(percent * 100).toFixed(0)}%`;
            }}
            outerRadius={90}
            innerRadius={40}
            paddingAngle={2}
            dataKey="value"
            fill="#8884d8"
            isAnimationActive={true}
          >
            {validData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.color || COLORS[index % COLORS.length]} 
              />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
            }}
            formatter={(value: any, name: any) => [
              `${value} demande${value > 1 ? 's' : ''}`, 
              name || 'Service'
            ]}
          />
          <Legend
            verticalAlign="bottom"
            height={60}
            iconType="circle"
            formatter={(value) => (
              <span style={{ color: '#0a0a0a', fontWeight: 500, fontSize: '12px' }}>{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

