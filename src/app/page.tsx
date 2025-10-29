
"use client";

import React, { useState, useMemo, useRef } from 'react';
import type { Semester, Subject, GpaData, CgpaData } from '@/types/gpa';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { GraduationCap, Heart, Plus, BookOpen, Download } from 'lucide-react';
import { calculateGPA } from '@/lib/gpa-utils';
import { SemesterCard } from '@/components/gpa/SemesterCard';
import { SummaryCard } from '@/components/gpa/SummaryCard';
import { PerformanceCharts } from '@/components/gpa/PerformanceCharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { ReportTemplate } from '@/components/gpa/ReportTemplate';

let subjectIdCounter = 1;
let semesterIdCounter = 1;


export default function GPAMatePage() {
  const [semesters, setSemesters] = useState<Semester[]>([
    { id: semesterIdCounter++, name: 'Semester 1', subjects: [{ id: subjectIdCounter++, name: '', gradePoint: 4.0, credit: 3 }] }
  ]);
  const [includeVu001Credit, setIncludeVu001Credit] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [userName, setUserName] = useState('');
  const [degreeName, setDegreeName] = useState('');
  const reportRef = useRef<HTMLDivElement>(null);


  const handleAddSemester = () => {
    const newSemesterName = `Semester ${semesters.length + 1}`;
    setSemesters([...semesters, { id: semesterIdCounter++, name: newSemesterName, subjects: [{ id: subjectIdCounter++, name: '', gradePoint: 4.0, credit: 3 }] }]);
  };
  
  const handleRemoveSemester = (semesterIdToRemove: number) => {
    const updatedSemesters = semesters.filter(s => s.id !== semesterIdToRemove);
    // Re-assign names based on their new order
    const finalSemesters = updatedSemesters.map((s, index) => ({
        ...s,
        name: `Semester ${index + 1}`
    }));
    setSemesters(finalSemesters);
  };
  
  const handleAddSubject = (semesterId: number) => {
    setSemesters(semesters.map(s => 
      s.id === semesterId 
        ? { ...s, subjects: [...s.subjects, { id: subjectIdCounter++, name: '', gradePoint: 4.0, credit: 3 }] } 
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
            let processedValue = value;
            if (field === 'gradePoint' || field === 'credit') {
              processedValue = typeof value === 'string' ? parseFloat(value) : value;
              if (field === 'gradePoint') {
                if (processedValue > 4) processedValue = 4;
                if (processedValue < 0) processedValue = 0;
              }
            }
            return { ...sub, [field]: processedValue };
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

    let cumulativePoints = 0;
    let cumulativeCredits = 0;
    const cgpaTrendData: CgpaData[] = semesters.map((s, i) => {
      let semesterPoints = 0;
      let semesterCredits = 0;

      s.subjects.forEach(sub => {
        const credit = typeof sub.credit === 'string' ? parseFloat(sub.credit) : sub.credit;
        if (!isNaN(credit) && credit > 0) {
          const gp = typeof sub.gradePoint === 'string' ? parseFloat(sub.gradePoint) : sub.gradePoint;
          if(!isNaN(gp)) {
            semesterPoints += gp * credit;
            semesterCredits += credit;
          }
        }
      });

      cumulativePoints += semesterPoints;
      cumulativeCredits += semesterCredits;

      return {
        name: s.name,
        CGPA: cumulativeCredits > 0 ? (cumulativePoints / cumulativeCredits).toFixed(2) : "0.00"
      };
    });

    const allSubjects = semesters.flatMap(s => s.subjects);
    let totalPoints = 0;
    let totalCreditsData = 0;

    allSubjects.forEach(sub => {
      const credit = typeof sub.credit === 'string' ? parseFloat(sub.credit) : sub.credit;
      if (!isNaN(credit)) {
        totalCreditsData += credit;
        const gp = typeof sub.gradePoint === 'string' ? parseFloat(sub.gradePoint) : sub.gradePoint;
        if(!isNaN(gp) && credit > 0) {
            totalPoints += gp * credit;
        }
      }
    });
    
    let gpaRelevantCredits = 0;
    allSubjects.forEach(sub => {
        const credit = typeof sub.credit === 'string' ? parseFloat(sub.credit) : sub.credit;
        const gp = typeof sub.gradePoint === 'string' ? parseFloat(sub.gradePoint) : sub.gradePoint;
        if(!isNaN(gp) && !isNaN(credit) && credit > 0){
            gpaRelevantCredits += credit;
        }
    });


    const cgpaData = gpaRelevantCredits ? (totalPoints / gpaRelevantCredits).toFixed(2) : "0.00";
    
    return {
      semesterGpas: semesterGpasData,
      cgpaTrend: cgpaTrendData,
      totalCredits: includeVu001Credit ? totalCreditsData + 1 : totalCreditsData,
      cgpa: cgpaData
    };
  }, [semesters, includeVu001Credit]);
  
  const handleDownloadPdf = async () => {
    const reportElement = reportRef.current;
    if (!reportElement || !userName || !degreeName) return;

    // Temporarily make the report visible for capturing
    reportElement.style.display = 'block';
    
    const canvas = await html2canvas(reportElement, {
      scale: 2, // Higher scale for better quality
      useCORS: true,
      backgroundColor: null,
    });
    
    // Hide the report element again
    reportElement.style.display = 'none';

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'pt',
      format: 'a4',
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    const ratio = canvasWidth / canvasHeight;
    
    const width = pdfWidth;
    const height = width / ratio;

    let finalHeight = height;
    let finalWidth = width;

    if (height > pdfHeight) {
        finalHeight = pdfHeight;
        finalWidth = finalHeight * ratio;
    }

    pdf.addImage(imgData, 'PNG', 0, 0, finalWidth, finalHeight);
    pdf.save(`${userName.replace(' ', '_')}_GPAMate_Report.pdf`);
    setIsDialogOpen(false);
  };


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
              onInputChange={handleInputChange}
              onRemoveSemester={handleRemoveSemester}
              isOnlySemester={semesters.length === 1}
            />
          </motion.div>
        ))}

        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4">
          <Button className="w-full" onClick={handleAddSemester}>
            <Plus className="mr-2 h-4 w-4" /> Add New Semester
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="w-full">
                    <Download className="mr-2 h-4 w-4" /> Download as PDF
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Enter Report Details</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="user-name">Your Name</Label>
                        <Input id="user-name" placeholder="e.g. John Doe" value={userName} onChange={(e) => setUserName(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="degree-name">Degree Name</Label>
                        <Input id="degree-name" placeholder="e.g. B.Sc. Computer Science" value={degreeName} onChange={(e) => setDegreeName(e.target.value)} />
                    </div>
                </div>
                <Button onClick={handleDownloadPdf} disabled={!userName || !degreeName}>
                    Generate and Download
                </Button>
            </DialogContent>
          </Dialog>
        </motion.div>

        {semesters.length > 0 && (
          <>
            <motion.div variants={itemVariants}>
                <Card className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg dark:bg-slate-900/70 dark:border-slate-800 p-6">
                    <div className="flex items-center space-x-2">
                        <Checkbox id="vu001-credit" checked={includeVu001Credit} onCheckedChange={(checked) => setIncludeVu001Credit(Boolean(checked))} />
                        <Label htmlFor="vu001-credit" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            Add Credit hour of VU001
                        </Label>
                    </div>
                </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <SummaryCard totalCredits={totalCredits} cgpa={cgpa} />
            </motion.div>

            <motion.div variants={itemVariants} className="pb-8">
              <PerformanceCharts semesterGpas={semesterGpas} cgpaTrend={cgpaTrend} />
            </motion.div>
          </>
        )}

        <motion.div variants={itemVariants}>
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
                  The semester GPA is calculated by multiplying the grade points for each course by the credit hours for that course, summing those values, and then dividing by the total number of credit hours for that semester.
                </p>
                <div className="text-center p-4 rounded-lg mt-2">
                  <p className="text-lg font-mono">GPA = ∑(Grade Points × Credit Hours) / ∑(Credit Hours)</p>
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-lg text-accent">📗 CGPA Calculations (for all semesters)</h3>
                <p className="text-muted-foreground mt-2">Your Cumulative GPA (CGPA) is calculated by taking the sum of all grade points multiplied by their respective credit hours across all semesters and dividing by the total sum of all credit hours.</p>
                <div className="text-center p-4 rounded-lg mt-2">
                   <p className="text-lg font-mono">CGPA = ∑(Grade Points × Credit Hours) / ∑(Credit Hours)</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      <footer className="mt-12 text-center text-muted-foreground text-sm">
        <p>Made with <Heart className="inline h-4 w-4 text-red-500 fill-current" /> by Choudhry Balaj for students everywhere.</p>
      </footer>
      
      {/* Hidden element for PDF generation */}
      <div ref={reportRef} style={{ display: 'none', position: 'absolute', left: '-9999px', width: '800px' }}>
         <ReportTemplate
            userName={userName}
            degreeName={degreeName}
            semesters={semesters}
            semesterGpas={semesterGpas}
            cgpaTrend={cgpaTrend}
            summary={{ totalCredits, cgpa }}
          />
      </div>

    </main>
  );
}
