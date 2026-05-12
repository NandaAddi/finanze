'use client';

import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { BarChart3 } from 'lucide-react';

const COLORS = ["#10b981", "#f43f5e", "#3b82f6", "#f59e0b", "#8b5cf6", "#ec4899", "#06b6d4"];

interface CategoryPieChartProps {
  data: any[];
}

export default function CategoryPieChart({ data }: CategoryPieChartProps) {
  if (data.length === 0) {
    return (
      <div className="h-[400px] w-full bg-card border border-border/50 rounded-xl p-6 shadow-sm flex flex-col items-center justify-center text-muted-foreground/30">
        <BarChart3 className="w-10 h-10 mb-2 opacity-20" />
        <span className="text-xs">No expense data</span>
      </div>
    );
  }

  return (
    <div className="h-[300px] md:h-[400px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius="60%"
            outerRadius="80%"
            paddingAngle={5}
            dataKey="value"
            stroke="none"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ backgroundColor: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '11px', color: 'hsl(var(--popover-foreground))' }}
            itemStyle={{ color: 'hsl(var(--popover-foreground))' }}
            formatter={(val: number) => `Rp ${val.toLocaleString('id-ID')}`}
          />
          <Legend 
            verticalAlign="bottom" 
            height={36} 
            iconType="circle" 
            iconSize={6}
            formatter={(value) => <span className="text-[10px] text-muted-foreground/80 lowercase">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
