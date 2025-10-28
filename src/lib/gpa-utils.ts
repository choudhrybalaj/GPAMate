import type { Subject } from '@/types/gpa';

export const gradeToPoint = (grade: string, percentage: string): number => {
  const parsedPercentage = parseFloat(percentage);

  if (grade) {
    const gradeMap: { [key: string]: number } = {
      'A+': 4.0, 'A': 4.0, 'A-': 3.8, 'B+': 3.4, 'B': 3.1, 'B-': 2.8, 'C': 2.3, 'D': 1.5, 'F': 0
    };
    return gradeMap[grade.toUpperCase()] ?? 0;
  }

  if (!isNaN(parsedPercentage)) {
    if (parsedPercentage >= 90) return 4.0;
    if (parsedPercentage >= 85) return 4.0;
    if (parsedPercentage >= 80) return 3.8;
    if (parsedPercentage >= 75) return 3.4;
    if (parsedPercentage >= 71) return 3.1;
    if (parsedPercentage >= 68) return 2.8;
    if (parsedPercentage >= 61) return 2.3;
    if (parsedPercentage >= 50) return 1.5;
    return 0;
  }

  return 0;
};

export const calculateGPA = (subjects: Subject[]): string => {
  let totalPoints = 0;
  let totalCredits = 0;
  subjects.forEach(sub => {
    const credit = typeof sub.credit === 'string' ? parseFloat(sub.credit) : sub.credit;
    if (!isNaN(credit) && credit > 0) {
      const gp = gradeToPoint(sub.grade, sub.percentage);
      totalPoints += gp * credit;
      totalCredits += credit;
    }
  });
  return totalCredits ? (totalPoints / totalCredits).toFixed(2) : "0.00";
};
