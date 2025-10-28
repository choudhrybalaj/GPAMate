export interface Subject {
  id: number;
  name: string;
  gradePoint: number | string;
  credit: number | string;
}

export interface Semester {
  id: number;
  name: string;
  subjects: Subject[];
}

export interface GpaData {
  name: string;
  GPA: number;
}

export interface CgpaData {
  name: string;
  CGPA: string;
}
