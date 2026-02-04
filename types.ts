
export type View = 'dashboard' | 'profile' | 'attendance' | 'payments' | 'teachers' | 'charts';

export interface Student {
  id: string;
  nationalId: string;
  fullName: string;
  fatherName?: string;
  educationType: string;
  birthday: string;
  phone: string;
  email?: string;
  address?: string;
  gender: 'Male' | 'Female' | string;
  educationLevel: string;
  denomination: string;
  job?: string;
  reasonToSign?: string;
  registrationYear: string; // New field
}

export interface FilterState {
  searchQuery: string;
  gender: string;
  denomination: string;
  educationType: string;
  educationLevel: string;
  registrationYear: string; // New filter
  ageRange: [number, number];
}

export interface AttendanceDay {
  date: string;
  isPresent: boolean;
}

export interface AttendanceRecord {
  studentId: string;
  studentName: string;
  percentage: number;
  semesters: {
    [key: string]: AttendanceDay[];
  };
}

export interface PaymentRecord {
  id: string;
  studentId: string;
  studentName: string;
  billNumber: string;
  amount: number;
  date: string;
  method: 'Cash' | 'Bank Transfer';
  status: 'Paid' | 'Pending';
}

export interface Teacher {
  id: string;
  name: string;
  subject: string;
  phone: string;
}
