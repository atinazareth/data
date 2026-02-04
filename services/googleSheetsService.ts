
import { Student, PaymentRecord, AttendanceRecord, Teacher, AttendanceDay } from '../types';

const GOOGLE_SHEETS_API_URL = (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_GOOGLE_SHEETS_API_URL) || 'https://script.google.com/macros/s/AKfycbym6-IMkCea57D5SoFbJ83De9yztv8vTCkxdbh6Mq-OJcFgMzj2i4LN9xYEZeGHe4xcww/exec'
let cachedData: any = null;

export const clearCache = () => {
  cachedData = null;
};

/**
 * Normalizes date strings to DD/MM/YYYY.
 * Handles ISO strings (2023-12-31...), slashed strings, and missing values.
 */
const formatDateString = (dateStr: any): string => {
  if (!dateStr) return '';
  const str = String(dateStr).trim();
  
  // If it's an ISO string like "1991-04-18T21:00:00.000Z"
  if (str.includes('T') || (str.includes('-') && str.split('-').length === 3)) {
    try {
      const d = new Date(str);
      if (!isNaN(d.getTime())) {
        // Use UTC methods to prevent timezone shifts from changing the day
        const day = String(d.getUTCDate()).padStart(2, '0');
        const month = String(d.getUTCMonth() + 1).padStart(2, '0');
        const year = d.getUTCFullYear();
        return `${day}/${month}/${year}`;
      }
    } catch (e) {
      console.warn("Failed to parse ISO date", str);
    }
  }
  return str;
};

const fetchData = async () => {
  if (cachedData) return cachedData;
  
  try {
    const response = await fetch(GOOGLE_SHEETS_API_URL, {
      method: 'GET',
      mode: 'cors',
      cache: 'no-cache',
      redirect: 'follow'
    });

    if (!response.ok) {
      throw new Error(`Connection Error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error || 'حدث خطأ في جلب البيانات');
    }

    cachedData = data;
    return data;
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
};

const postToSheet = async (payload: any) => {
  try {
    await fetch(GOOGLE_SHEETS_API_URL, {
      method: 'POST',
      mode: 'no-cors',
      redirect: 'follow',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(payload)
    });
    clearCache();
    return true;
  } catch (error) {
    console.error('POST failed:', error);
    return false;
  }
};

export const updateAttendanceInSheet = async (studentName: string, date: string, status: boolean) => {
  return await postToSheet({ action: 'updateAttendance', studentName, date, status });
};

export const addNewStudent = async (studentData: Partial<Student>) => {
  return await postToSheet({ action: 'addStudent', ...studentData });
};

export const addNewPayment = async (paymentData: any) => {
  return await postToSheet({ action: 'addPayment', ...paymentData });
};

const getVal = (obj: any, key: string) => {
  if (!obj) return '';
  if (obj[key] !== undefined) return obj[key];
  const normalizedKey = key.trim();
  const foundKey = Object.keys(obj).find(k => k.trim() === normalizedKey);
  return foundKey ? obj[foundKey] : '';
};

export const fetchStudents = async (): Promise<Student[]> => {
  const data = await fetchData();
  return (data.students || []).map((s: any) => {
    const rawGender = String(getVal(s, 'الجنس') || '').toLowerCase().trim();
    const isMale = rawGender === 'male' || rawGender === 'ذكر';
    
    return {
      id: String(getVal(s, 'رقم الهوية') || Math.random().toString(36).substr(2, 9)),
      nationalId: String(getVal(s, 'رقم الهوية') || ''),
      fullName: String(getVal(s, 'الاسم الكامل') || ''),
      fatherName: String(getVal(s, 'اسم الاب') || ''),
      educationType: String(getVal(s, 'نوعية التعليم') || ''),
      birthday: formatDateString(getVal(s, 'عيد الميلاد')),
      phone: String(getVal(s, 'الهاتف') || ''),
      email: String(getVal(s, 'البريد الالكتروني') || ''),
      address: String(getVal(s, 'العنوان') || ''),
      gender: isMale ? 'Male' : 'Female',
      educationLevel: String(getVal(s, 'المستوى الدراسي') || ''),
      denomination: String(getVal(s, 'الطائفة') || ''),
      job: String(getVal(s, 'المهنة') || ''),
      reasonToSign: String(getVal(s, 'هدف التسجيل') || ''),
      registrationYear: String(getVal(s, 'سنة التسجيل') || '')
    };
  });
};

export const fetchPayments = async (): Promise<PaymentRecord[]> => {
  const data = await fetchData();
  return (data.payments || []).map((p: any, idx: number) => ({
    id: `p-${idx}`,
    studentId: String(getVal(p, 'رقم الهوية') || ''),
    studentName: String(getVal(p, 'الاسم الكامل') || ''),
    billNumber: String(getVal(p, 'رقم الوصل') || ''),
    amount: Number(getVal(p, 'مبلخ الدفع')) || 0,
    date: formatDateString(getVal(p, 'تاريخ الدفع')),
    method: String(getVal(p, 'طريقة الدفع')).toLowerCase().includes('bank') ? 'Bank Transfer' : 'Cash',
    status: 'Paid'
  }));
};

export const fetchAllAttendance = async (): Promise<any[]> => {
  const data = await fetchData();
  return Array.isArray(data?.attendance) ? data.attendance : [];
};

export const fetchTeachers = async (): Promise<Teacher[]> => {
  const data = await fetchData();
  if (!data || !data.teachers) return [];
  return (data.teachers || []).map((t: any, idx: number) => ({
    id: String(getVal(t, 'رقم الهوية') || idx.toString()),
    name: String(getVal(t, 'الاسم الكامل') || getVal(t, 'الاسم') || ''),
    subject: String(getVal(t, 'المادة') || ''),
    phone: String(getVal(t, 'الهاتف') || '')
  }));
};

export const fetchStudentPayments = async (studentId: string): Promise<PaymentRecord[]> => {
  const all = await fetchPayments();
  return all.filter(p => p.studentId === studentId);
};

export const fetchStudentAttendance = async (studentName: string): Promise<AttendanceRecord | undefined> => {
  const all = await fetchAllAttendance();
  const row = all.find((r: any) => (r['الاسم'] || r['studentName']) === studentName);
  if (!row) return undefined;

  const semesters: { [key: string]: AttendanceDay[] } = { '2025-A': [] };

  const sortedDates = Object.keys(row)
    .filter(key => key.match(/^\d{2}\/\d{2}\/\d{4}$/))
    .sort((a, b) => {
      const dA = new Date(a.split('/').reverse().join('-'));
      const dB = new Date(b.split('/').reverse().join('-'));
      return dA.getTime() - dB.getTime();
    });

  sortedDates.forEach(date => {
    semesters['2025-A'].push({
      date,
      isPresent: row[date] === true || String(row[date]).toLowerCase() === 'true'
    });
  });

  return {
    studentId: String(row['رقم الهوية'] || ''),
    studentName: studentName,
    percentage: 0,
    semesters
  };
};
