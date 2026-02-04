
import React, { useState, useEffect, useMemo } from 'react';
import SearchBar from './features/student-directory/components/SearchBar';
import Filters from './features/student-directory/components/Filters';
import StudentTable from './features/student-directory/components/StudentTable';
import StudentProfile from './features/student-profile/components/StudentProfile';
import StudentForm from './features/student-directory/components/StudentForm';
import BirthdayCard from './features/student-directory/components/BirthdayCard';
import AttendanceView from './features/attendance/AttendanceView';
import PaymentsView from './features/payments/PaymentsView';
import TeachersView from './features/teachers/TeachersView';
import ChartsView from './features/charts/ChartsView';
import { fetchStudents, clearCache } from './services/googleSheetsService';
import { FilterState, View, Student } from './types';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('ati_auth') === 'true';
  });
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState(false);

  const [view, setView] = useState<View | 'add-student'>('dashboard');
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [dataError, setDataError] = useState<string | null>(null);

  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    gender: 'الكل',
    denomination: 'الكل',
    educationType: 'الكل',
    educationLevel: 'الكل',
    registrationYear: 'الكل',
    ageRange: [0, 100]
  });

  const loadInitialData = async (forceRefresh = false) => {
    if (forceRefresh) clearCache();
    setLoading(true);
    setDataError(null);
    try {
      const data = await fetchStudents();
      setAllStudents(data);
    } catch (err: any) {
      setDataError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadInitialData();
      const interval = setInterval(() => loadInitialData(true), 300000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (window.btoa(password) === "YTF0Mmkz") {
      setIsAuthenticated(true);
      sessionStorage.setItem('ati_auth', 'true');
      setLoginError(false);
    } else {
      setLoginError(true);
      setPassword('');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('ati_auth');
    setPassword(''); // Clear password field on logout
    setView('dashboard');
  };

  const handleFilterChange = (key: keyof FilterState, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleBack = () => {
    setView('dashboard');
    setSelectedStudentId(null);
  };

  const uniqueRegistrationYears = useMemo(() => {
    const years = new Set<string>();
    allStudents.forEach(s => {
      if (s.registrationYear) years.add(s.registrationYear);
    });
    return Array.from(years).sort().reverse();
  }, [allStudents]);

  const filteredStudents = useMemo(() => {
    return allStudents.filter(student => {
      const searchStr = (filters.searchQuery || '').toLowerCase();
      const matchesSearch = 
        (student.fullName || '').toLowerCase().includes(searchStr) || 
        (student.nationalId || '').includes(searchStr);
      const matchesGender = filters.gender === 'الكل' || student.gender === filters.gender;
      const matchesDenomination = filters.denomination === 'الكل' || student.denomination === filters.denomination;
      const matchesEducationType = filters.educationType === 'الكل' || student.educationType === filters.educationType;
      const matchesLevel = filters.educationLevel === 'الكل' || student.educationLevel === filters.educationLevel;
      const matchesYear = filters.registrationYear === 'الكل' || student.registrationYear === filters.registrationYear;
      
      let age = 0;
      if (student.birthday) {
        const parts = student.birthday.split('/');
        if (parts.length === 3) {
          const birthYear = parseInt(parts[2]);
          age = new Date().getFullYear() - birthYear;
        }
      }
      const matchesAge = age >= filters.ageRange[0] && age <= filters.ageRange[1];

      return matchesSearch && matchesGender && matchesDenomination && matchesEducationType && matchesLevel && matchesYear && matchesAge;
    });
  }, [allStudents, filters]);

  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 bg-[#f3f7ff] flex flex-col items-center justify-center p-6 text-right" dir="rtl">
        <div className="bg-white p-12 rounded-[2.5rem] shadow-2xl w-full max-w-md border border-slate-100 text-center animate-in fade-in zoom-in duration-300">
          <div className="w-40 h-40 mx-auto mb-8 bg-blue-50 rounded-3xl p-5 shadow-inner border border-blue-100 flex items-center justify-center overflow-hidden">
             <img src="logo_png.png" alt="ATI Logo" className="w-full h-full object-contain" />
          </div>
          
          <h2 className="text-3xl font-black text-slate-800 mb-2">تسجيل الدخول للنظام</h2>
          <p className="text-slate-400 font-bold mb-10 text-sm">يرجى إدخال كلمة المرور للوصول إلى البيانات</p>
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="كلمة المرور"
                dir="ltr"
                className={`w-full bg-slate-50 border ${loginError ? 'border-red-300 ring-4 ring-red-50' : 'border-slate-100'} rounded-2xl py-4 px-6 pr-14 text-center text-lg font-black text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-100/50 focus:border-blue-400 transition-all placeholder-slate-300`}
                autoFocus
              />
              <button
                type="button"
                onMouseDown={() => setShowPassword(true)}
                onMouseUp={() => setShowPassword(false)}
                onMouseLeave={() => setShowPassword(false)}
                onTouchStart={() => setShowPassword(true)}
                onTouchEnd={() => setShowPassword(false)}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-blue-500 transition-colors cursor-pointer select-none"
                title="اضغط باستمرار لرؤية كلمة المرور"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </button>
            </div>
            
            {loginError && <p className="text-red-500 text-sm font-bold animate-bounce">كلمة المرور غير صحيحة!</p>}
            
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-2xl shadow-xl shadow-blue-100 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <span>دخول</span>
            </button>
          </form>
          
          <div className="mt-12 text-slate-300 text-[10px] font-black uppercase tracking-widest">
            ANNUNCIATION THEOLOGICAL INSTITUTE © 2025
          </div>
        </div>
      </div>
    );
  }

  const selectedStudent = allStudents.find(s => s.id === selectedStudentId);

  const DashboardCard = ({ label, icon, onClick, color = "blue" }: any) => {
    const colorMap: Record<string, string> = {
      blue: "bg-blue-50 text-blue-600 hover:bg-blue-600",
      emerald: "bg-emerald-50 text-emerald-600 hover:bg-emerald-600",
      amber: "bg-amber-50 text-amber-600 hover:bg-amber-600",
      indigo: "bg-indigo-50 text-indigo-600 hover:bg-indigo-600",
      rose: "bg-rose-50 text-rose-600 hover:bg-rose-600",
      slate: "bg-slate-50 text-slate-600 hover:bg-slate-600"
    };

    return (
      <button 
        onClick={onClick}
        className={`${colorMap[color]} group w-full p-6 rounded-2xl border border-transparent hover:border-white transition-all duration-200 shadow-sm hover:shadow-lg flex items-center justify-center gap-3`}
      >
        <div className="text-2xl group-hover:scale-110 transition-transform group-hover:text-white">{icon}</div>
        <span className="text-lg font-black group-hover:text-white">{label}</span>
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-[#f3f7ff] pb-12" dir="rtl">
      {/* Top Header */}
      <header className="bg-white/70 backdrop-blur-lg border-b border-slate-100 sticky top-0 z-30 px-4 md:px-12 py-5 no-print">
        <div className="max-w-[1700px] mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 cursor-pointer" onClick={() => setView('dashboard')}>
            <div className="w-20 h-20 bg-white rounded-2xl p-2 shadow-lg border border-slate-50 flex items-center justify-center">
               <img src="logo_png.png" alt="Logo" className="w-full h-full object-contain" />
            </div>
          </div>

          <div className="flex-grow max-w-2xl px-4">
            <SearchBar value={filters.searchQuery} onChange={(val) => handleFilterChange('searchQuery', val)} />
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => window.print()} 
              className="p-3 bg-white hover:bg-slate-50 text-slate-600 rounded-2xl border border-slate-100 shadow-sm transition-all"
              title="طباعة السجل"
            >
              🖨️
            </button>
            <button 
              onClick={() => loadInitialData(true)} 
              className={`p-3 bg-white hover:bg-blue-50 text-blue-600 rounded-2xl border border-slate-100 shadow-sm transition-all ${loading ? 'animate-spin' : ''}`}
              title="تحديث البيانات"
            >
              🔄
            </button>
            <button 
              onClick={handleLogout} 
              className="p-3 bg-white hover:bg-red-50 text-red-500 rounded-2xl border border-slate-100 shadow-sm transition-all"
              title="خروج"
            >
              🚪
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-[1700px] mx-auto mt-12 px-4 md:px-8">
        {dataError ? (
          <div className="max-w-xl mx-auto bg-white p-12 text-center rounded-[2.5rem] shadow-2xl border border-red-50">
            <div className="text-6xl mb-6">⚠️</div>
            <p className="text-red-500 font-black text-xl mb-4">{dataError}</p>
            <button onClick={() => loadInitialData(true)} className="bg-blue-600 text-white font-bold py-3 px-8 rounded-2xl shadow-lg shadow-blue-100">إعادة المحاولة</button>
          </div>
        ) : view === 'attendance' ? (
          <div className="space-y-4">
             <button onClick={handleBack} className="text-blue-600 font-black text-sm flex items-center gap-2 hover:underline">
               <span>رجوع</span>
               <span>←</span>
             </button>
             <AttendanceView onBack={handleBack} />
          </div>
        ) : view === 'payments' ? (
          <div className="space-y-4">
             <button onClick={handleBack} className="text-blue-600 font-black text-sm flex items-center gap-2 hover:underline">
               <span>رجوع</span>
               <span>←</span>
             </button>
             <PaymentsView onBack={handleBack} />
          </div>
        ) : view === 'teachers' ? (
          <div className="space-y-4">
             <button onClick={handleBack} className="text-blue-600 font-black text-sm flex items-center gap-2 hover:underline">
               <span>رجوع</span>
               <span>←</span>
             </button>
             <TeachersView onBack={handleBack} />
          </div>
        ) : view === 'charts' ? (
          <div className="space-y-4">
             <button onClick={handleBack} className="text-blue-600 font-black text-sm flex items-center gap-2 hover:underline">
               <span>رجوع</span>
               <span>←</span>
             </button>
             <ChartsView students={filteredStudents} allStudents={allStudents} filters={filters} onFilterChange={handleFilterChange} years={uniqueRegistrationYears} onBack={handleBack} />
          </div>
        ) : view === 'add-student' ? (
          <div className="space-y-4">
             <button onClick={handleBack} className="text-blue-600 font-black text-sm flex items-center gap-2 hover:underline">
               <span>رجوع</span>
               <span>←</span>
             </button>
             <StudentForm onBack={handleBack} onSave={() => { loadInitialData(true); handleBack(); }} />
          </div>
        ) : selectedStudentId && selectedStudent ? (
          <div className="space-y-4">
             <button onClick={handleBack} className="text-blue-600 font-black text-sm flex items-center gap-2 hover:underline">
               <span>رجوع</span>
               <span>←</span>
             </button>
             <StudentProfile student={selectedStudent} onBack={handleBack} onRefresh={() => loadInitialData(true)} />
          </div>
        ) : view === 'dashboard' ? (
          <div className="space-y-8 animate-in fade-in duration-500">
            {/* Action Buttons Grid */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <DashboardCard label="الحضور" icon="📝" color="emerald" onClick={() => setView('attendance')} />
              <DashboardCard label="المالية" icon="💳" color="amber" onClick={() => setView('payments')} />
              <DashboardCard label="المعلمين" icon="👨‍🏫" color="indigo" onClick={() => setView('teachers')} />
              <DashboardCard label="الإحصائيات" icon="📈" color="slate" onClick={() => setView('charts')} />
              <DashboardCard label="إضافة طالب" icon="👤➕" color="blue" onClick={() => setView('add-student')} />
            </div>

            <div className="flex flex-col gap-8">
              {/* Row 1: Filters and Birthday Card side-by-side on LG+ screens */}
              <div className="flex flex-col lg:flex-row gap-8 items-stretch">
                <div className="flex-grow w-full lg:w-3/4">
                  <Filters filters={filters} onFilterChange={handleFilterChange} years={uniqueRegistrationYears} />
                </div>
                <div className="w-full lg:w-1/4 shrink-0 no-print flex">
                  <BirthdayCard students={allStudents} onStudentClick={setSelectedStudentId} />
                </div>
              </div>

              {/* Row 2: Full Width Table */}
              <div className="w-full space-y-6">
                <div className="flex justify-between items-center px-4">
                  <h3 className="text-2xl font-black text-slate-800">قائمة الطلاب المتاحة</h3>
                </div>
                <StudentTable students={filteredStudents} loading={loading} onStudentClick={setSelectedStudentId} />
              </div>
            </div>
          </div>
        ) : null}
      </main>
    </div>
  );
};

export default App;
