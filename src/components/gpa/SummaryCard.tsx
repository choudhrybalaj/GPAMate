"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Target } from 'lucide-react';

interface SummaryCardProps {
  totalCredits: number;
  cgpa: string;
}

export function SummaryCard({ totalCredits, cgpa }: SummaryCardProps) {
  return (
    <Card className="bg-gradient-to-r from-indigo-100 to-blue-100 dark:from-indigo-900/50 dark:to-blue-900/50 rounded-2xl shadow-lg text-center">
      <CardHeader>
        <CardTitle className="flex items-center justify-center gap-2 text-2xl font-semibold text-primary">
          <Target className="h-6 w-6" />
          Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-lg text-foreground/80">
          Total Credits Earned: <span className="font-bold text-foreground">{totalCredits}</span>
        </p>
        <p className="text-lg text-foreground/80">
          Overall CGPA: <span className="font-bold text-foreground">{cgpa}</span>
        </p>
      </CardContent>
    </Card>
  );
}
