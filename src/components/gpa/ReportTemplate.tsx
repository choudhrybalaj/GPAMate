"use client";

import React from 'react';
import type { Semester, GpaData, CgpaData } from '@/types/gpa';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SummaryCard } from './SummaryCard';
import { calculateGPA } from '@/lib/gpa-utils';

interface ReportTemplateProps {
  userName: string;
  degreeName: string;
  semesters: Semester[];
  semesterGpas: GpaData[];
  cgpaTrend: CgpaData[];
  summary: {
    totalCredits: number;
    cgpa: string;
  };
}

export const ReportTemplate: React.FC<ReportTemplateProps> = ({
  userName,
  degreeName,
  semesters,
  semesterGpas,
  cgpaTrend,
  summary,
}) => {
  return (
    <div className="p-8 bg-white dark:bg-slate-950 font-sans">
      <header className="text-center mb-8">
        <h1 className="text-3xl font-bold text-primary">GPAMate Report</h1>
        <p className="text-xl font-semibold mt-2">{userName}</p>
        <p className="text-md text-muted-foreground">{degreeName}</p>
      </header>

      <div className="space-y-8">
        {semesters.map((sem) => (
          <Card key={sem.id} className="shadow-md">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-xl font-semibold text-primary">{sem.name}</CardTitle>
                <p className="text-lg font-bold">GPA: {calculateGPA(sem.subjects)}</p>
              </div>
            </CardHeader>
            <CardContent>
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b">
                    <th className="p-2">Subject Name</th>
                    <th className="p-2 text-center">Grade Point</th>
                    <th className="p-2 text-center">Credit Hours</th>
                  </tr>
                </thead>
                <tbody>
                  {sem.subjects.map((sub) => (
                    <tr key={sub.id} className="border-b">
                      <td className="p-2">{sub.name || '-'}</td>
                      <td className="p-2 text-center">{sub.gradePoint}</td>
                      <td className="p-2 text-center">{sub.credit}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        ))}

        <SummaryCard totalCredits={summary.totalCredits} cgpa={summary.cgpa} />
      </div>

      <footer className="text-center mt-8 text-xs text-muted-foreground">
        <p>Report generated with GPAMate on {new Date().toLocaleDateString()}</p>
      </footer>
    </div>
  );
};
