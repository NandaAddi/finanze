'use client';

import React from 'react';
import { BarChart, Bar, ResponsiveContainer, Tooltip, Cell } from 'recharts';

interface WeeklyExpenseChartProps {
  data: any[];
}

export default function WeeklyExpenseChart({ data }: WeeklyExpenseChartProps) {
  return (
    <div className="h-[80px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <Bar dataKey="amount" radius={[2, 2, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={index === 5 ? '#f43f5e' : 'hsl(var(--muted))'} />
            ))}
          </Bar>
          <Tooltip 
            contentStyle={{ backgroundColor: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', fontSize: '10px', color: 'hsl(var(--popover-foreground))' }}
            itemStyle={{ color: 'hsl(var(--popover-foreground))' }}
            cursor={{ fill: 'hsl(var(--muted) / 0.1)' }}
            labelStyle={{ display: 'none' }}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
