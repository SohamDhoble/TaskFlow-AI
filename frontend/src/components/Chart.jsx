import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';

const COLORS_STATUS = ['#6366F1', '#F59E0B', '#10B981'];
const COLORS_PRIORITY = ['#EF4444', '#F59E0B', '#10B981'];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass rounded-xl px-4 py-3 shadow-xl">
        <p className="text-sm font-semibold text-text-primary">{label}</p>
        {payload.map((entry, i) => (
          <p key={i} className="text-sm text-text-secondary">
            <span className="inline-block w-3 h-3 rounded-full mr-2" style={{ backgroundColor: entry.color }} />
            {entry.name}: <span className="font-semibold text-text-primary">{entry.value}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const CustomLegend = ({ payload }) => (
  <div className="flex items-center justify-center gap-4 mt-2">
    {payload.map((entry, i) => (
      <div key={i} className="flex items-center gap-2">
        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
        <span className="text-xs font-medium text-text-secondary">{entry.value}</span>
      </div>
    ))}
  </div>
);

export const TasksByStatusChart = ({ data }) => {
  const chartData = [
    { name: 'Todo', count: data?.todo || 0 },
    { name: 'In Progress', count: data?.in_progress || 0 },
    { name: 'Done', count: data?.done || 0 },
  ];

  return (
    <div className="bg-dark-card border border-dark-border rounded-2xl p-6">
      <h3 className="text-lg font-bold text-text-primary mb-1">Tasks by Status</h3>
      <p className="text-sm text-text-secondary mb-6">Overview of task distribution</p>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={chartData} barCategoryGap="30%">
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
          <XAxis dataKey="name" stroke="#94A3B8" fontSize={12} fontWeight={500} tickLine={false} axisLine={false} />
          <YAxis stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(99, 102, 241, 0.05)' }} />
          <Bar dataKey="count" name="Tasks" radius={[8, 8, 0, 0]}>
            {chartData.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS_STATUS[index]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export const TasksByPriorityChart = ({ data }) => {
  const chartData = [
    { name: 'High', value: data?.high || 0 },
    { name: 'Medium', value: data?.medium || 0 },
    { name: 'Low', value: data?.low || 0 },
  ].filter((d) => d.value > 0);

  if (chartData.length === 0) {
    chartData.push({ name: 'No Tasks', value: 1 });
  }

  return (
    <div className="bg-dark-card border border-dark-border rounded-2xl p-6">
      <h3 className="text-lg font-bold text-text-primary mb-1">Tasks by Priority</h3>
      <p className="text-sm text-text-secondary mb-6">Priority distribution breakdown</p>
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={4}
            dataKey="value"
            stroke="none"
          >
            {chartData.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS_PRIORITY[index % COLORS_PRIORITY.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend content={<CustomLegend />} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
