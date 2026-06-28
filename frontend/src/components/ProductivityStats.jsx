import React, { useContext } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { ThemeContext } from '../context/ThemeContext';

const data = [
  { name: 'Mon', focusTime: 120 },
  { name: 'Tue', focusTime: 180 },
  { name: 'Wed', focusTime: 240 },
  { name: 'Thu', focusTime: 150 },
  { name: 'Fri', focusTime: 200 },
  { name: 'Sat', focusTime: 90 },
  { name: 'Sun', focusTime: 60 },
];

const ProductivityStats = () => {
  const { isDark } = useContext(ThemeContext);

  const textColor = isDark ? '#a1a1a6' : '#86868b';
  const barColor = 'var(--accent-color)';

  return (
    <div style={{ width: '100%', height: '250px', marginTop: '20px' }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 5, right: 0, left: -20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--glass-border)" />
          <XAxis 
            dataKey="name" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: textColor, fontSize: 12 }} 
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: textColor, fontSize: 12 }} 
          />
          <Tooltip 
            cursor={{ fill: 'rgba(0,0,0,0.05)' }} 
            contentStyle={{ 
              backgroundColor: 'var(--glass-bg)', 
              borderRadius: '8px',
              border: '1px solid var(--glass-border)',
              boxShadow: 'var(--glass-shadow)',
              color: 'var(--text-primary)'
            }} 
          />
          <Bar dataKey="focusTime" fill={barColor} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ProductivityStats;
