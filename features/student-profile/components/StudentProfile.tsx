
import React, { useState, useEffect } from 'react';
import { Student, PaymentRecord, AttendanceRecord } from '../../../types';
import { fetchStudentPayments, fetchStudentAttendance, addNewPayment, clearCache } from '../../../services/googleSheetsService';

const ProfileDataField = ({ label, value, icon, fullWidth }: any) => (
  <div className={`bg-[#f3f7ff] border border-blue-50 rounded-xl px-4 py-3 flex items-center justify-between gap-4 shadow-sm ${fullWidth ? 'md:col-span-2' : ''}`}>
    <div className="flex items-center gap-1 shrink-0">
      <span className="text-slate-600 text-sm font-black text-right min-w-[70px]">
        {label} {icon}
      </span>
      <span className="text-slate-400 font-bold">:</span>
    </div>
    <div className="text-slate-900 text-base font-bold text-right flex-grow overflow-hidden text-ellipsis">
      {value || "---"}
    </div>
  </div>
);

interface StudentProfileProps {
  student: Student;
  onBack: () => void;
  onRefresh: () => void;
}

const StudentProfile: React.FC<StudentProfileProps> = ({ student, onBack, onRefresh }) => {
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord | undefined>(undefined);
  const [activeSemester, setActiveSemester] = useState('2025-A');
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [isSavingPayment, setIsSavingPayment] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  
  const getTodayFormatted = () => {
    return new Date().toISOString().split('T')[0];
  };

  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    billNumber: 'no',
    date: getTodayFormatted(),
    method: 'Cash'
  });

  const loadData = async () => {
    try {
      const pData = await fetchStudentPayments(student.id);
      setPayments(pData);
      const aData = await fetchStudentAttendance(student.fullName);
      setAttendance(aData);
    } catch (err) {
      console.error("Error loading student profile data", err);
    }
  };

  useEffect(() => {
    loadData();
  }, [student.id, student.fullName]);
  
  const handleAddPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingPayment(true);
    try {
      const dateParts = paymentForm.date.split('-');
      const formattedDate = dateParts.length === 3 ? `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}` : paymentForm.date;

      const payload = {
        studentId: student.nationalId,
        studentName: student.fullName,
        ...paymentForm,
        date: formattedDate,
        amount: Number(paymentForm.amount)
      };
      
      const success = await addNewPayment(payload);
      
      if (success) {
        setPaymentSuccess(true);
        setPaymentForm({ amount: '', billNumber: 'no', date: getTodayFormatted(), method: 'Cash' });

        setTimeout(async () => {
          setPaymentSuccess(false);
          setShowPaymentForm(false);
          clearCache();
          await loadData();
          onRefresh();
        }, 1500);
      } else {
        alert('خطأ في الاتصال بالخادم');
      }
    } catch (error) {
      console.error(error);
      alert('خطأ في الاتصال بالخادم');
    } finally {
      setIsSavingPayment(false);
    }
  };

  const handleBillNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    // Prevent deletion of 'no' and only allow digits after it
    if (val.startsWith('no')) {
      const digits = val.slice(2).replace(/\D/g, '');
      setPaymentForm(prev => ({ ...prev, billNumber: 'no' + digits }));
    } else {
      // If user tries to delete 'no', force it back
      setPaymentForm(prev => ({ ...prev, billNumber: 'no' }));
    }
  };

  const calculateAge = (birthday: string) => {
    if (!birthday) return "---";
    const parts = birthday.split('/');
    if (parts.length !== 3) return "---";
    const birthDate = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    return age;
  };

  const semesterData = attendance?.semesters[activeSemester] || [];
  const totalLessons = semesterData.length;
  const attendedLessons = semesterData.filter(d => d.isPresent).length;
  const attendancePercentage = totalLessons > 0 ? Math.round((attendedLessons / totalLessons) * 100) : 0;

  return (
    <div className="max-w-6xl mx-auto bg-white rounded-3xl p-6 md:p-10 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.1)] border border-slate-100 text-right" dir="rtl">
      <div className="flex justify-between items-center border-b-2 border-slate-50 pb-6 mb-8">
        <div className="flex items-center gap-4 text-right">
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-3xl shadow-sm border border-blue-100">
            👤
          </div>
          <div className="flex flex-col">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">{student.fullName}</h2>
            <span className="text-xs text-blue-600 font-bold mt-1">سنة التسجيل: {student.registrationYear}</span>
          </div>
        </div>
        <button onClick={onBack} className="text-slate-400 hover:text-slate-600 transition-colors">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ProfileDataField label="الاسم الكامل" value={student.fullName} />
        <ProfileDataField label="اسم الأب" value={student.fatherName} />
        <ProfileDataField label="الهاتف" value={student.phone} icon="📞" />
        <ProfileDataField label="البريد الالكتروني" value={student.email} icon="✉️" />
        <ProfileDataField label="تاريخ الميلاد" value={student.birthday} icon="📅" />
        <ProfileDataField label="العمر" value={calculateAge(student.birthday).toString()} icon="⏳" />
        <ProfileDataField label="العنوان" value={student.address} icon="📍" />
        <ProfileDataField label="الجنس" value={student.gender === 'Male' ? 'ذكر ♂️' : 'أنثى ♀️'} />
        <ProfileDataField label="المستوى" value={student.educationLevel} />
        <ProfileDataField label="الطائفة" value={student.denomination} />
        <ProfileDataField label="نوع التعليم" value={student.educationType} icon="🎓" />
        <ProfileDataField label="سنة التسجيل" value={student.registrationYear} icon="🗓️" />
      </div>

      <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <span className="text-xl">📝</span>
              <h3 className="text-xl font-bold text-slate-800">الحضور ({attendedLessons}/{totalLessons})</h3>
            </div>
            <div className="bg-[#d35400] text-white px-4 py-1.5 rounded-full text-sm font-black shadow-md">
              {attendancePercentage}%
            </div>
          </div>
          <div className="overflow-y-auto bg-white rounded-2xl border border-slate-200 h-[400px]">
            {semesterData.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {semesterData.map((day, idx) => (
                  <div key={idx} className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors">
                    <span className="text-slate-700 font-bold">{day.date}</span>
                    <div className={`w-6 h-6 rounded flex items-center justify-center border-2 ${
                      day.isPresent ? 'bg-[#d35400] border-[#d35400] text-white' : 'bg-white border-slate-300 text-transparent'
                    }`}>
                      {day.isPresent && '✓'}
                    </div>
                  </div>
                ))}
              </div>
            ) : <div className="p-10 text-center text-slate-400 italic font-bold">لا توجد بيانات</div>}
          </div>
        </div>

        <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <span className="text-xl">💳</span>
              <h3 className="text-xl font-bold text-slate-800">المدفوعات</h3>
            </div>
            {!showPaymentForm && (
              <button onClick={() => setShowPaymentForm(true)} className="bg-blue-600 text-white text-xs font-black px-4 py-2 rounded-xl shadow-sm hover:bg-blue-700 transition-all active:scale-95">
                + دفعة جديدة
              </button>
            )}
          </div>

          {showPaymentForm && (
            <div className="bg-white p-6 rounded-2xl border border-blue-100 mb-6 shadow-md animate-in slide-in-from-top duration-300">
              {paymentSuccess ? (
                <div className="py-8 text-center animate-in fade-in zoom-in duration-300">
                  <div className="text-5xl mb-3">💳✅</div>
                  <h4 className="text-xl font-black text-green-600">تم تسجيل الدفع بنجاح!</h4>
                  <p className="text-slate-500 text-sm font-bold mt-2">جاري تحديث السجل...</p>
                </div>
              ) : (
                <form onSubmit={handleAddPayment} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-black text-slate-500 text-right">المبلغ (₪) *</label>
                      <input type="number" required value={paymentForm.amount} onChange={e => setPaymentForm({...paymentForm, amount: e.target.value})} className="bg-slate-50 border border-slate-200 p-2 rounded-lg font-bold outline-none focus:border-blue-300 text-slate-900 text-right" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-black text-slate-500 text-right">رقم الوصل *</label>
                      <input 
                        type="text" 
                        required 
                        value={paymentForm.billNumber} 
                        onChange={handleBillNumberChange} 
                        className="bg-slate-50 border border-slate-200 p-2 rounded-lg font-bold outline-none focus:border-blue-300 text-slate-900 text-right" 
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-black text-slate-500 text-right">التاريخ *</label>
                      <input type="date" required value={paymentForm.date} onChange={e => setPaymentForm({...paymentForm, date: e.target.value})} className="bg-slate-50 border border-slate-200 p-2 rounded-lg font-bold outline-none focus:border-blue-300 text-slate-900 text-right" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-black text-slate-500 text-right">طريقة الدفع *</label>
                      <select required value={paymentForm.method} onChange={e => setPaymentForm({...paymentForm, method: e.target.value})} className="bg-slate-50 border border-slate-200 p-2 rounded-lg font-bold outline-none focus:border-blue-300 text-slate-900 text-right">
                        <option value="Cash">Cash 💵</option>
                        <option value="Bank Transfer">Bank 🏦</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button type="submit" disabled={isSavingPayment} className="flex-grow bg-blue-600 text-white font-black py-2 rounded-xl text-sm shadow-md transition-all active:scale-95">
                      {isSavingPayment ? 'جاري الحفظ...' : 'حفظ'}
                    </button>
                    <button type="button" onClick={() => setShowPaymentForm(false)} className="px-4 py-2 text-slate-400 font-bold text-sm">إلغاء</button>
                  </div>
                </form>
              )}
            </div>
          )}

          <div className="overflow-auto bg-white rounded-2xl border border-slate-200 flex-grow h-[400px]">
            {payments.length > 0 ? (
              <table className="w-full text-right border-collapse">
                <thead className="sticky top-0 bg-blue-50/80 backdrop-blur-sm z-10 border-b border-slate-200">
                  <tr className="text-[10px] font-black uppercase text-slate-500">
                    <th className="p-3 text-right">تاريخ</th>
                    <th className="p-3 text-right">الوصل</th>
                    <th className="p-3 text-right">المبلغ</th>
                    <th className="p-3 text-right">طريقة الدفع</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {payments.map((p, i) => (
                    <tr key={i} className="text-xs hover:bg-slate-50">
                      <td className="p-3 text-slate-800 font-bold">{p.date}</td>
                      <td className="p-3 font-mono text-blue-700 font-black">{p.billNumber}</td>
                      <td className="p-3 font-black text-slate-900">₪{p.amount}</td>
                      <td className="p-3">
                        <span className={`inline-flex px-3 py-1 rounded-lg text-[10px] font-black shadow-sm ${
                          p.method === 'Cash' ? 'bg-blue-100 text-blue-700 border border-blue-200' : 'bg-green-100 text-green-700 border border-green-200'
                        }`}>
                          {p.method === 'Cash' ? 'Cash 💵' : 'Bank 🏦'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : <div className="p-10 text-center text-slate-400 italic font-bold">لا توجد مدفوعات</div>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;
