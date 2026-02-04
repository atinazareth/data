
import React, { useState } from 'react';
import { addNewStudent } from '../../../services/googleSheetsService';

const FormInputField = ({ label, name, type = "text", required = false, value, onChange }: any) => (
  <div className="flex flex-col gap-1">
    <label className="text-slate-600 text-xs font-black mr-2 text-right">{label} {required && '*'}</label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      required={required}
      className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 font-bold focus:ring-4 focus:ring-blue-50 focus:border-blue-300 outline-none transition-all text-right"
    />
  </div>
);

const FormSelectField = ({ label, name, value, options, onChange }: any) => (
  <div className="flex flex-col gap-1">
    <label className="text-slate-600 text-xs font-black mr-2 text-right">{label} *</label>
    <select
      name={name}
      value={value}
      onChange={onChange}
      required
      className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 font-bold focus:ring-4 focus:ring-blue-50 focus:border-blue-300 outline-none transition-all cursor-pointer text-right"
    >
      {options.map((opt: any) => (
        <option key={opt.val} value={opt.val}>{opt.label}</option>
      ))}
    </select>
  </div>
);

interface StudentFormProps {
  onBack: () => void;
  onSave: () => void;
}

const StudentForm: React.FC<StudentFormProps> = ({ onBack, onSave }) => {
  const getTodayFormatted = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const [formData, setFormData] = useState({
    nationalId: '',
    fullName: '',
    fatherName: '',
    phone: '',
    email: '',
    birthday: getTodayFormatted(),
    address: '',
    gender: 'Male',
    educationLevel: 'B.A',
    denomination: 'لاتين',
    educationType: 'نظامي',
    registrationYear: '2025',
    reasonToSign: '',
    job: ''
  });

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const dateParts = formData.birthday.split('-');
      const formattedBirthday = dateParts.length === 3 ? `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}` : formData.birthday;
      
      const isSuccess = await addNewStudent({
        ...formData,
        birthday: formattedBirthday
      });
      
      if (isSuccess) {
        setSuccess(true);
        setTimeout(() => {
          onSave();
        }, 1200);
      } else {
        alert('حدث خطأ أثناء إرسال البيانات.');
        setSaving(false);
      }
    } catch (error) {
      console.error(error);
      alert('حدث خطأ غير متوقع.');
      setSaving(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-4xl mx-auto bg-white rounded-[2.5rem] p-20 shadow-2xl border border-slate-100 animate-in fade-in zoom-in duration-500 text-center">
        <div className="text-7xl mb-6 animate-bounce">🎉</div>
        <h2 className="text-3xl font-black text-slate-800 mb-4">تم حفظ بيانات الطالب بنجاح!</h2>
        <p className="text-slate-500 font-bold">يتم الآن تحديث السجلات...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-[2.5rem] p-8 md:p-12 shadow-2xl border border-slate-100 animate-in fade-in zoom-in duration-300 text-right" dir="rtl">
      <div className="flex justify-between items-center mb-10 border-b border-slate-50 pb-6">
        <h2 className="text-3xl font-black text-slate-800">إضافة طالب جديد 👤</h2>
        <button onClick={onBack} className="text-slate-400 hover:text-slate-600 font-bold transition-colors">إلغاء</button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormInputField label="رقم الهوية" name="nationalId" value={formData.nationalId} onChange={handleChange} required />
          <FormInputField label="الاسم الكامل" name="fullName" value={formData.fullName} onChange={handleChange} required />
          <FormInputField label="اسم الأب" name="fatherName" value={formData.fatherName} onChange={handleChange} required />
          <FormInputField label="الهاتف" name="phone" value={formData.phone} onChange={handleChange} required />
          <FormInputField label="البريد الالكتروني" name="email" value={formData.email} onChange={handleChange} type="email" required />
          <FormInputField label="تاريخ الميلاد" name="birthday" value={formData.birthday} onChange={handleChange} type="date" required />
          <FormInputField label="العنوان" name="address" value={formData.address} onChange={handleChange} required />
          <FormInputField label="المهنة" name="job" value={formData.job} onChange={handleChange} required />
          
          <FormSelectField label="الجنس" name="gender" value={formData.gender} onChange={handleChange} options={[{val: 'Male', label: 'ذكر ♂️'}, {val: 'Female', label: 'أنثى ♀️'}]} />
          
          <FormSelectField label="المستوى الدراسي" name="educationLevel" value={formData.educationLevel} onChange={handleChange} options={[
            {val: 'B.A', label: 'B.A'}, 
            {val: 'M.A', label: 'M.A'}, 
            {val: 'PHD', label: 'PHD'}, 
            {val: 'اكاديمي', label: 'اكاديمي'}, 
            {val: 'بجروت كامل', label: 'بجروت كامل'}, 
            {val: 'تقني', label: 'تقني'}, 
            {val: 'هندسي', label: 'هندسي'}, 
            {val: 'other', label: 'other'}
          ]} />
          
          <FormSelectField label="الطائفة" name="denomination" value={formData.denomination} onChange={handleChange} options={[
            {val: 'انجليكان', label: 'انجليكان'}, 
            {val: 'روم أرثوذكس', label: 'روم أرثوذكس'},
            {val: 'روم كاثوليك', label: 'روم كاثوليك'},
            {val: 'كاثوليك', label: 'كاثوليك'},
            {val: 'لاتين', label: 'لاتين'},
            {val: 'موارنة', label: 'موارنة'}
          ]} />
          
          <FormSelectField label="نوع التعليم 🎓" name="educationType" value={formData.educationType} onChange={handleChange} options={[{val: 'نظامي', label: 'نظامي'}, {val: 'مستمع', label: 'مستمع'}]} />
          
          <FormSelectField label="سنة التسجيل 🗓️" name="registrationYear" value={formData.registrationYear} onChange={handleChange} options={[
            {val: '2024', label: '2024'}, 
            {val: '2025', label: '2025'},
            {val: '2026', label: '2026'}
          ]} />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-slate-600 text-xs font-black mr-2 text-right">هدف التسجيل *</label>
          <textarea
            name="reasonToSign"
            value={formData.reasonToSign}
            onChange={handleChange}
            required
            className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 font-bold focus:ring-4 focus:ring-blue-50 focus:border-blue-300 outline-none transition-all h-32 text-right"
          />
        </div>

        <div className="pt-6">
          <button
            type="submit"
            disabled={saving}
            className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-5 rounded-2xl shadow-xl shadow-blue-100 transition-all active:scale-[0.98] ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {saving ? 'جاري الحفظ...' : 'حفظ بيانات الطالب'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default StudentForm;
