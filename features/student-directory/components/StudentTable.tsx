
import React from 'react';
import { Student } from '../../../types';
import { TableStyles } from '../styles';

interface StudentTableProps {
  students: Student[];
  loading: boolean;
  onStudentClick: (id: string) => void;
}

const StudentTable: React.FC<StudentTableProps> = ({ students, loading, onStudentClick }) => {
  // Ordered from Right to Left as they appear in the UI
  const headers = [
    '#',
    'رقم الهوية',
    'الاسم الكامل',
    'نوعية التعليم',
    'عيد الميلاد',
    'الهاتف',
    'الجنس',
    'المستوى الدراسي',
    'الطائفة'
  ];

  if (loading) {
    return (
      <div className="w-full bg-white rounded-2xl shadow-lg border border-slate-100 p-24 text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
        <p className="mt-4 text-slate-500 font-medium italic">يتم جلب سجلات الطلاب...</p>
      </div>
    );
  }

  return (
    <div className={TableStyles.container}>
      <div className="overflow-x-auto">
        <table className="w-full text-right border-collapse">
          <thead>
            <tr className={TableStyles.headerRow}>
              {headers.map((header, idx) => (
                <th key={idx} className={`${TableStyles.headerCell} ${idx === 0 ? 'w-16 text-center' : ''}`}>
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {students.length === 0 ? (
              <tr>
                <td colSpan={headers.length} className="px-6 py-20 text-center text-slate-400">
                  لم يتم العثور على أي نتائج
                </td>
              </tr>
            ) : (
              students.map((student, index) => (
                <tr key={student.id} className={TableStyles.row}>
                  <td className={`${TableStyles.cell} text-center text-slate-400 font-medium`}>{index + 1}</td>
                  <td 
                    className={TableStyles.cellId} 
                    onClick={() => onStudentClick(student.id)}
                  >
                    {student.nationalId}
                  </td>
                  <td className={TableStyles.cellName}>{student.fullName}</td>
                  <td className={TableStyles.cell}>{student.educationType}</td>
                  <td className={TableStyles.cell}>{student.birthday}</td>
                  <td className={`${TableStyles.cell} font-mono tracking-tight`}>{student.phone}</td>
                  <td className={TableStyles.cell}>{student.gender === 'Male' ? 'ذكر ♂️' : 'أنثى ♀️'}</td>
                  <td className={TableStyles.cell}>{student.educationLevel}</td>
                  <td className={TableStyles.cell}>{student.denomination}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StudentTable;
