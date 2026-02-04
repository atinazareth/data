
import React, { useState, useEffect, useMemo } from 'react';
import { fetchAllAttendance, updateAttendanceInSheet } from '../../services/googleSheetsService';

const AttendanceView: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [selectedYear, setSelectedYear] = useState<number | null>(2025);
  const [rawMatrix, setRawMatrix] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState<Record<string, boolean>>({}); // Tracking update state

  const loadData = () => {
    setLoading(true);
    setError(null);
    fetchAllAttendance()
      .then(data => {
        setRawMatrix(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        setError('تعذر تحميل سجلات الحضور. يرجى التحقق من اتصال البيانات.');
        setLoading(false);
      });
  };

  useEffect(() => {
    loadData();
  }, []);

  const processedData = useMemo(() => {
    if (!rawMatrix || !Array.isArray(rawMatrix) || rawMatrix.length === 0) {
      return { students: [], dates: [] };
    }

    const allDates = new Set<string>();
    rawMatrix.forEach(row => {
      if (row && typeof row === 'object') {
        Object.keys(row).forEach(key => {
          // Robust check for date format dd/mm/yyyy
          if (typeof key === 'string' && (key.match(/^\d{1,2}\/\d{1,2}\/\d{4}$/) || key.match(/^\d{4}-\d{2}-\d{2}/))) {
            allDates.add(key);
          }
        });
      }
    });

    const sortedDates = Array.from(allDates).sort((a, b) => {
      try {
        const parse = (s: string) => {
          if (s.includes('/')) {
            return new Date(s.split('/').reverse().join('-'));
          }
          return new Date(s);
        };
        const dA = parse(a);
        const dB = parse(b);
        return dA.getTime() - dB.getTime();
      } catch (e) {
        return 0;
      }
    });

    const students = rawMatrix.map((row, idx) => {
      const name = String(row['الاسم'] || row['studentName'] || `طالب ${idx + 1}`).trim();
      let attended = 0;
      let total = 0;
      
      sortedDates.forEach(date => {
        if (row[date] !== undefined && row[date] !== null && row[date] !== '') {
          total++;
          const val = row[date];
          if (val === true || String(val).toLowerCase() === 'true') {
            attended++;
          }
        }
      });

      return {
        id: idx,
        name,
        checks: row,
        fraction: `${attended}/${total}`,
        percentage: total > 0 ? Math.round((attended / total) * 100) : 0
      };
    });

    return { students, dates: sortedDates };
  }, [rawMatrix]);

  const toggleAttendance = async (studentName: string, date: string, currentVal: any) => {
    const isPresent = currentVal === true || String(currentVal).toLowerCase() === 'true';
    const newVal = !isPresent;
    const updateKey = `${studentName}-${date}`;

    // Optimistic UI update
    setRawMatrix(prev => prev.map(row => {
      const currentName = String(row['الاسم'] || row['studentName'] || "").trim();
      if (currentName === studentName.trim()) {
        return { ...row, [date]: newVal };
      }
      return row;
    }));

    setUpdating(prev => ({ ...prev, [updateKey]: true }));
    try {
      await updateAttendanceInSheet(studentName.trim(), date, newVal);
    } catch (e) {
      console.error('Failed to update sheet', e);
      alert('فشل تحديث البيانات في Google Sheets. يرجى المحاولة لاحقاً.');
      // Rollback on error
      setRawMatrix(prev => prev.map(row => {
        const currentName = String(row['الاسم'] || row['studentName'] || "").trim();
        if (currentName === studentName.trim()) {
          return { ...row, [date]: isPresent };
        }
        return row;
      }));
    } finally {
      setUpdating(prev => ({ ...prev, [updateKey]: false }));
    }
  };

  const getDayName = (dateStr: string) => {
    try {
      const days = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
      const dateToParse = dateStr.includes('/') ? dateStr.split('/').reverse().join('-') : dateStr;
      const d = new Date(dateToParse);
      if (isNaN(d.getTime())) return '';
      return days[d.getDay()];
    } catch (e) {
      return '';
    }
  };

  if (loading) return <div className="p-20 text-center font-bold text-slate-400 animate-pulse">جاري جلب سجل الحضور...</div>;
  
  if (error) return (
    <div className="p-12 text-center bg-white rounded-3xl border border-red-100 shadow-sm">
      <div className="text-4xl mb-4">🚫</div>
      <div className="font-bold text-red-500 mb-4">{error}</div>
      <button 
        onClick={loadData}
        className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold"
      >إعادة محاولة</button>
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow-xl overflow-hidden border border-slate-300">
      <div className="bg-slate-100 p-4 border-b border-slate-300 flex justify-between items-center no-print">
         <div className="flex items-center gap-4">
            <h2 className="text-xl font-black text-slate-800">سجل الحضور - {selectedYear}</h2>
            <div className="text-[10px] bg-blue-100 text-blue-700 px-2 py-1 rounded font-bold">يمكنك الضغط على المربعات للتعديل</div>
            <button onClick={loadData} className="text-xs bg-white border border-slate-300 px-2 py-1 rounded hover:bg-slate-50">🔄 تحديث</button>
         </div>
         <button onClick={onBack} className="text-blue-600 font-bold underline">إغلاق</button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-[#c2d9b6]">
              <th className="border border-slate-400 p-2 text-center text-sm font-black w-20">النسبة</th>
              <th className="border border-slate-400 p-2 text-right font-black min-w-[180px]">الاسم</th>
              {processedData.dates.length > 0 ? processedData.dates.map((date, i) => (
                <th key={i} className="border border-slate-400 p-0 text-center min-w-[60px]">
                  <div className="bg-[#c2d9b6] p-1 text-[11px] font-bold border-b border-slate-400">
                    {getDayName(date)}
                  </div>
                  <div className="p-1 text-[11px] font-black bg-white/50">
                    {date}
                  </div>
                </th>
              )) : <th className="border border-slate-400 p-2 text-center text-slate-500">لا توجد تواريخ</th>}
            </tr>
          </thead>
          <tbody>
            {processedData.students.length > 0 ? processedData.students.map((student, idx) => (
              <tr key={idx} className="hover:bg-slate-50 transition-colors">
                <td className="border border-slate-400 p-1 text-center bg-[#c2d9b6]/20">
                  <div className="text-xs font-black">{student.percentage}%</div>
                  <div className="text-[10px] text-slate-500">{student.fraction}</div>
                </td>
                <td className="border border-slate-400 p-2 text-right font-bold text-slate-800 bg-[#c2d9b6]/10">
                  {student.name}
                </td>
                {processedData.dates.map((date, i) => {
                  const val = student.checks[date];
                  const isPresent = val === true || String(val).toLowerCase() === 'true';
                  const isUpdating = updating[`${student.name}-${date}`];
                  const colColor = i % 2 === 0 ? 'bg-[#fcf3cf]' : 'bg-[#d6eaf8]';
                  
                  return (
                    <td 
                      key={i} 
                      className={`border border-slate-400 p-2 text-center cursor-pointer transition-all hover:brightness-95 ${colColor}`}
                      onClick={() => toggleAttendance(student.name, date, val)}
                    >
                      <div className={`w-6 h-6 mx-auto rounded flex items-center justify-center border-2 shadow-sm transition-all ${
                        isPresent 
                        ? 'bg-[#d35400] border-[#d35400] text-white' 
                        : 'bg-white border-slate-300 text-transparent'
                      } ${isUpdating ? 'opacity-30 animate-pulse' : ''}`}>
                        {isPresent && <span className="text-xs">✓</span>}
                      </div>
                    </td>
                  );
                })}
              </tr>
            )) : (
              <tr>
                <td colSpan={processedData.dates.length + 2} className="p-10 text-center text-slate-400 italic">
                  لا توجد سجلات حضور مسجلة.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AttendanceView;
