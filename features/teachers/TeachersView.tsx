
import React, { useState, useEffect } from 'react';
import { Teacher } from '../../types';
import { fetchTeachers } from '../../services/googleSheetsService';

const TeachersView: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTeachers()
      .then(data => {
        setTeachers(data);
        setLoading(false);
      })
      .catch(err => {
        setError('فشل في تحميل سجلات المعلمين');
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-20 text-center font-bold text-slate-400 animate-pulse">جاري جلب سجل المعلمين...</div>;
  
  if (error) return <div className="p-10 text-center text-red-500 font-bold">{error}</div>;

  return (
    <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100 p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8 border-b border-slate-50 pb-6">
         <h2 className="text-3xl font-black text-slate-800">قائمة المعلمين</h2>
         <div className="text-blue-600 font-black px-4 py-2 bg-blue-50 rounded-xl">
           العدد الإجمالي: {teachers.length}
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teachers.length > 0 ? teachers.map((teacher, idx) => (
          <div key={idx} className="bg-[#f3f7ff] border border-blue-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4 mb-4">
               <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-2xl shadow-sm">
                 👨‍🏫
               </div>
               <div>
                 <h3 className="text-xl font-bold text-slate-800">{teacher.name}</h3>
                 <p className="text-blue-600 font-bold text-sm">{teacher.subject}</p>
               </div>
            </div>
            <div className="border-t border-blue-50 pt-4 mt-2">
              <div className="flex justify-between items-center">
                <span className="text-slate-500 text-xs font-bold">الهاتف:</span>
                <span className="text-slate-800 font-mono font-bold tracking-tight">{teacher.phone}</span>
              </div>
            </div>
          </div>
        )) : (
          <div className="col-span-full py-20 text-center text-slate-400 italic">
            لا توجد سجلات معلمين مسجلة في ورقة البيانات.
          </div>
        )}
      </div>
    </div>
  );
};

export default TeachersView;
