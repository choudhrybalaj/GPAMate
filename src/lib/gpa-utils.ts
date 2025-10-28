import type { Subject } from '@/types/gpa';

export const gradeToPoint = (grade: string): number => {
  if (grade) {
    const gradeMap: { [key: string]: number } = {
      'A+': 4.0, 'A': 3.9, 'A-': 3.8, 'B+': 3.4, 'B': 3.1, 'B-': 2.8, 'C': 2.3, 'D': 1.5, 'F': 0
    };
    return gradeMap[grade.toUpperCase()] ?? 0;
  }
  return 0;
};

export const calculateGPA = (subjects: Subject[]): string => {
  let totalPoints = 0;
  let totalCredits = 0;
  subjects.forEach(sub => {
    const credit = typeof sub.credit === 'string' ? parseFloat(sub.credit) : sub.credit;
    if (!isNaN(credit) && credit > 0) {
      const gp = gradeToPoint(sub.grade);
      totalPoints += gp * credit;
      totalCredits += credit;
    }
  });
  return totalCredits ? (totalPoints / totalCredits).toFixed(2) : "0.00";
};
