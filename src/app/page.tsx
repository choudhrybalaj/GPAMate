
"use client";

import React, { useState, useMemo } from 'react';
import type { Semester, Subject, GpaData, CgpaData } from '@/types/gpa';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { GraduationCap, Heart, Plus, BookOpen } from 'lucide-react';
import { calculateGPA, gradeToPoint } from '@/lib/gpa-utils';
import { SemesterCard } from '@/components/gpa/SemesterCard';
import { SummaryCard } from '@/components/gpa/SummaryCard';
import { PerformanceCharts } from '@/components/gpa/PerformanceCharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

let semesterIdCounter = 1;
let subjectIdCounter = 1;

export default function GPAMatePage() {
  const [semesters, setSemesters] = useState<Semester[]>([
    { id: semesterIdCounter++, name: 'Semester 1', subjects: [{ id: subjectIdCounter++, name: '', grade: '', credit: 3 }] }
  ]);

  const handleAddSemester = () => {
    const newId = semesterIdCounter++;
    setSemesters([...semesters, { id: newId, name: `Semester ${newId}`, subjects: [{ id: subjectIdCounter++, name: '', grade: '', credit: 3 }] }]);
  };

  const handleRemoveSemester = (semesterIdToRemove: number) => {
    setSemesters(semesters.filter(s => s.id !== semesterIdToRemove));
  };

  const handleAddSubject = (semesterId: number) => {
    setSemesters(semesters.map(s => 
      s.id === semesterId 
        ? { ...s, subjects: [...s.subjects, { id: subjectIdCounter++, name: '', grade: '', credit: 3 }] } 
        : s
    ));
  };

  const handleRemoveSubject = (semesterId: number, subjectIdToRemove: number) => {
    setSemesters(semesters.map(s => {
      if (s.id === semesterId) {
        const updatedSubjects = s.subjects.filter(sub => sub.id !== subjectIdToRemove);
        return { ...s, subjects: updatedSubjects };
      }
      return s;
    }));
  };

  const handleInputChange = (semesterId: number, subjectId: number, field: keyof Omit<Subject, 'id'>, value: string | number) => {
    setSemesters(semesters.map(s => {
      if (s.id === semesterId) {
        const updatedSubjects = s.subjects.map(sub => {
          if (sub.id === subjectId) {
            return { ...sub, [field]: value };
          }
          return sub;
        });
        return { ...s, subjects: updatedSubjects };
      }
      return s;
    }));
  };

  const { semesterGpas, cgpaTrend, totalCredits, cgpa } = useMemo(() => {
    const semesterGpasData: GpaData[] = semesters.map(s => ({ 
      name: s.name, 
      GPA: parseFloat(calculateGPA(s.subjects)) 
    }));

    let cumulativeGpaSum = 0;
    const cgpaTrendData: CgpaData[] = semesterGpasData.map((s, i) => {
      const validGpas = semesterGpasData.slice(0, i + 1).filter(g => !isNaN(g.GPA));
      const sum = validGpas.reduce((acc, val) => acc + val.GPA, 0);
      return { 
        name: s.name, 
        CGPA: validGpas.length > 0 ? (sum / validGpas.length).toFixed(2) : "0.00"
      };
    });

    const allSubjects = semesters.flatMap(s => s.subjects);
    let totalPoints = 0;
    let totalCreditsData = 0;

    allSubjects.forEach(sub => {
      const credit = typeof sub.credit === 'string' ? parseFloat(sub.credit) : sub.credit;
      if (!isNaN(credit) && credit > 0) {
        const gp = gradeToPoint(sub.grade);
        totalPoints += gp * credit;
        totalCreditsData += credit;
      }
    });

    const cgpaData = totalCreditsData ? (totalPoints / totalCreditsData).toFixed(2) : "0.00";
    
    return {
      semesterGpas: semesterGpasData,
      cgpaTrend: cgpaTrendData,
      totalCredits: totalCreditsData,
      cgpa: cgpaData
    };
  }, [semesters]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
    },
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-indigo-950 flex flex-col items-center justify-start py-10 px-4 sm:px-6 lg:px-8">
      <motion.header 
        initial={{ opacity: 0, y: -20 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="text-center mb-8"
      >
        <h1 className="text-4xl sm:text-5xl font-bold text-primary flex items-center justify-center gap-3">
          <GraduationCap className="h-10 w-10" />
          GPAMate
        </h1>
        <p className="text-muted-foreground mt-2">Your friendly GPA & CGPA Calculator</p>
      </motion.header>

      <motion.div 
        className="w-full max-w-5xl grid gap-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {semesters.map((sem) => (
          <motion.div key={sem.id} variants={itemVariants}>
            <SemesterCard
              semester={sem}
              onAddSubject={handleAddSubject}
              onRemoveSubject={handleRemoveSubject}
              onInputChange={handleInputChange as any}
              onRemoveSemester={handleRemoveSemester}
            />
          </motion.div>
        ))}

        <motion.div variants={itemVariants}>
          <Button className="mt-4 w-full" onClick={handleAddSemester}>
            <Plus className="mr-2 h-4 w-4" /> Add New Semester
          </Button>
        </motion.div>

        {semesters.length > 0 && (
          <>
            <motion.div variants={itemVariants} className="mt-6">
              <SummaryCard totalCredits={totalCredits} cgpa={cgpa} />
            </motion.div>

            <motion.div variants={itemVariants} className="mt-6">
              <PerformanceCharts semesterGpas={semesterGpas} cgpaTrend={cgpaTrend} />
            </motion.div>
          </>
        )}

        <motion.div variants={itemVariants} className="mt-6">
          <Card className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg dark:bg-slate-900/70 dark:border-slate-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl font-semibold text-primary">
                <BookOpen className="h-6 w-6" />
                How It Works
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold text-lg text-accent">📘 Semester GPA Calculation</h3>
                <p className="text-muted-foreground mt-2">
                  I'll calculate your GPA by multiplying each grade point you receive by the number of credit hours for that course, adding up the totals, and then dividing by the total number of credit hours taken in that semester.
                </p>
                <div className="text-center p-4 rounded-lg mt-2">
                  <p className="text-lg font-mono">GPA = ∑(Grade Points × Credit Hours) / ∑(Credit Hours)</p>
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-lg text-accent">📗 CGPA Calculations (for all semesters)</h3>
                <p className="text-muted-foreground mt-2">You give me data for all the semesters you’ve completed. I’ll calculate your Cumulative GPA (CGPA) using:</p>
                <div className="text-center p-4 rounded-lg mt-2">
                   <p className="text-lg font-mono">CGPA = ∑(Grade Points × Credit Hours) / ∑(Credit Hours)</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      <footer className="mt-12 text-center text-muted-foreground text-sm">
        <p className="flex items-center justify-center gap-1.5">
          Made by Choudhry Balaj with <Heart className="h-4 w-4 text-red-500 fill-current" /> for students everywhere.
        </p>
      </footer>
    </main>
  );
}

    