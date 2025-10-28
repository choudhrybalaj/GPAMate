"use client";

import type { CgpaData, GpaData } from '@/types/gpa';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface PerformanceChartsProps {
  semesterGpas: GpaData[];
  cgpaTrend: CgpaData[];
}

export function PerformanceCharts({ semesterGpas, cgpaTrend }: PerformanceChartsProps) {
  return (
    <Card className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg dark:bg-slate-900/70 dark:border-slate-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl font-semibold text-primary">
          <BarChart3 className="h-6 w-6" />
          Performance Overview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="h-64">
            <h3 className="text-center font-medium text-muted-foreground mb-2">Semester GPA Trend</h3>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={semesterGpas}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" stroke="hsl(var(--foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis domain={[0, 4]} stroke="hsl(var(--foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    borderColor: 'hsl(var(--border))',
                    borderRadius: 'var(--radius)'
                  }}
                />
                <Legend />
                <Line type="monotone" dataKey="GPA" name="Semester GPA" stroke="hsl(var(--chart-1))" strokeWidth={3} dot={{ r: 4, fill: 'hsl(var(--chart-1))' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="h-64">
            <h3 className="text-center font-medium text-muted-foreground mb-2">Cumulative GPA (CGPA) Trend</h3>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={cgpaTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" stroke="hsl(var(--foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis domain={[0, 4]} stroke="hsl(var(--foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    borderColor: 'hsl(var(--border))',
                    borderRadius: 'var(--radius)'
                  }}
                />
                <Legend />
                <Line type="monotone" dataKey="CGPA" name="Overall CGPA" stroke="hsl(var(--chart-2))" strokeWidth={3} dot={{ r: 4, fill: 'hsl(var(--chart-2))' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
