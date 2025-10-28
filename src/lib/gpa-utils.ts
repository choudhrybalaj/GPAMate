import type { Subject } from '@/types/gpa';

export const calculateGPA = (subjects: Subject[]): string => {
  let totalPoints = 0;
  let totalCredits = 0;
  subjects.forEach(sub => {
    const credit = typeof sub.credit === 'string' ? parseFloat(sub.credit) : sub.credit;
    if (!isNaN(credit) && credit > 0) {
      const gp = typeof sub.gradePoint === 'string' ? parseFloat(sub.gradePoint) : sub.gradePoint;
      if (!isNaN(gp)) {
        totalPoints += gp * credit;
        totalCredits += credit;
      }
    }
  });
  return totalCredits ? (totalPoints / totalCredits).toFixed(2) : "0.00";
};
