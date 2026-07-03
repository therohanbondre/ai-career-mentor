'use client';

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

export type ChartPoint = {
  label: string;
  value: number;
};

type SimpleLineChartProps = {
  data: ChartPoint[];
  className?: string;
};

export function SimpleLineChart({ data, className }: SimpleLineChartProps) {
  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
          <XAxis dataKey="label" className="text-xs" />
          <YAxis className="text-xs" />
          <Tooltip />
          <Line type="monotone" dataKey="value" stroke="var(--primary)" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export { LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Line };
