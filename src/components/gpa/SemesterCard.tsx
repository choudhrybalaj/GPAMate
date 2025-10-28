"use client";

import type { Semester, Subject } from '@/types/gpa';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash2 } from 'lucide-react';
import { calculateGPA } from '@/lib/gpa-utils';

interface SemesterCardProps {
  semester: Semester;
  onAddSubject: (semesterId: number) => void;
  onRemoveSubject: (semesterId: number, subjectId: number) => void;
  onInputChange: (semesterId: number, subjectId: number, field: keyof Subject, value: string) => void;
  onRemoveSemester: (semesterId: number) => void;
}

export function SemesterCard({ semester, onAddSubject, onRemoveSubject, onInputChange, onRemoveSemester }: SemesterCardProps) {
  const semesterGpa = calculateGPA(semester.subjects);

  return (
    <Card className="rounded-2xl shadow-xl bg-white/70 backdrop-blur-lg border border-indigo-100 dark:bg-slate-900/70 dark:border-slate-800">
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <CardTitle className="text-2xl font-semibold text-primary">{semester.name}</CardTitle>
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" size="sm" onClick={() => onAddSubject(semester.id)}>
              <Plus className="mr-2 h-4 w-4" /> Add Subject
            </Button>
            <Button variant="destructive" size="sm" onClick={() => onRemoveSemester(semester.id)}>
              <Trash2 className="mr-2 h-4 w-4" /> Remove Semester
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-y-2 text-sm font-medium text-muted-foreground px-2 hidden md:grid md:grid-cols-11 md:gap-4 items-center">
            <div className="md:col-span-3">Subject Name</div>
            <div className="md:col-span-2">Grade (A+, B...)</div>
            <div className="md:col-span-2">Percentage (%)</div>
            <div className="md:col-span-2">Credit Hours</div>
            <div className="md:col-span-2"></div>
        </div>

        {semester.subjects.map((sub) => (
          <div key={sub.id} className="grid grid-cols-1 md:grid-cols-11 gap-2 md:gap-4 mb-3 items-center p-2 rounded-lg hover:bg-slate-100/50 dark:hover:bg-slate-800/50">
            <Input
              placeholder="e.g. Calculus"
              aria-label="Subject Name"
              className="md:col-span-3"
              value={sub.name}
              onChange={(e) => onInputChange(semester.id, sub.id, 'name', e.target.value)}
            />
            <Input
              placeholder="e.g. A-"
              aria-label="Grade"
              className="md:col-span-2"
              value={sub.grade}
              onChange={(e) => onInputChange(semester.id, sub.id, 'grade', e.target.value)}
            />
            <Input
              placeholder="e.g. 88"
              aria-label="Percentage"
              type="number"
              className="md:col-span-2"
              value={sub.percentage}
              onChange={(e) => onInputChange(semester.id, sub.id, 'percentage', e.target.value)}
            />
            <Input
              placeholder="e.g. 3"
              aria-label="Credit Hours"
              type="number"
              className="md:col-span-2"
              value={String(sub.credit)}
              onChange={(e) => onInputChange(semester.id, sub.id, 'credit', e.target.value)}
            />
            <div className="md:col-span-2 flex justify-end">
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive" onClick={() => onRemoveSubject(semester.id, sub.id)}>
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Remove Subject</span>
                </Button>
            </div>
          </div>
        ))}
        <p className="text-primary font-medium mt-4 text-right pr-2">
          Semester GPA: <span className="font-bold text-lg">{semesterGpa}</span>
        </p>
      </CardContent>
    </Card>
  );
}
