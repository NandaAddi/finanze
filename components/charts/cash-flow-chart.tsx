'use client';

import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface CashFlowChartProps {
  data: any[];
}

export default function CashFlowChart({ data }: CashFlowChartProps) {
  return (
    <div className="h-[280px] md:h-[400px] w-full p-2 md:p-6">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.1}/>
              <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
          <XAxis 
            dataKey="name" 
            axisLine={false} 
            tickLine={false} 
            fontSize={10} 
            tick={{fill: 'hsl(var(--muted-foreground))'}} 
            dy={10}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            fontSize={10} 
            tick={{fill: 'hsl(var(--muted-foreground))'}}
            tickFormatter={(val) => `Rp${(val/1000000).toFixed(0)}M`}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', fontSize: '12px', borderRadius: '8px', color: 'hsl(var(--popover-foreground))' }}
            itemStyle={{ fontSize: '11px', color: 'hsl(var(--popover-foreground))' }}
          />
          <Area type="monotone" dataKey="Income" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorIncome)" />
          <Area type="monotone" dataKey="Expense" stroke="#f43f5e" strokeWidth={2} fillOpacity={1} fill="url(#colorExpense)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
