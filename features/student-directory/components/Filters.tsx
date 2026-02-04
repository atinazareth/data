
import React from 'react';
import { FilterState } from '../../../types';

interface FiltersProps {
  filters: FilterState;
  onFilterChange: (key: keyof FilterState, value: any) => void;
  years?: string[];
}

const Filters: React.FC<FiltersProps> = ({ filters, onFilterChange, years = ['2024', '2025'] }) => {
  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Math.min(Number(e.target.value), filters.ageRange[1] - 1);
    onFilterChange('ageRange', [val, filters.ageRange[1]]);
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Math.max(Number(e.target.value), filters.ageRange[0] + 1);
    onFilterChange('ageRange', [filters.ageRange[0], val]);
  };

  const handleClearFilters = () => {
    onFilterChange('gender', 'الكل');
    onFilterChange('denomination', 'الكل');
    onFilterChange('educationType', 'الكل');
    onFilterChange('educationLevel', 'الكل');
    onFilterChange('registrationYear', 'الكل');
    onFilterChange('ageRange', [0, 100]);
    onFilterChange('searchQuery', '');
  };

  const FilterRow = ({ label, value, options, icon, field }: any) => (
    <div className="flex items-center justify-start gap-3">
      <span className="text-slate-600 text-sm font-bold min-w-[80px] text-right">{label}</span>
      <div className="relative flex-grow max-w-[200px]">
        <select 
          value={value} 
          onChange={(e) => onFilterChange(field, e.target.value)}
          className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-100 appearance-none font-bold"
        >
          {options.map((opt: any) => (
            <option key={opt.val} value={opt.val}>{opt.label}</option>
          ))}
        </select>
        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none">{icon}</span>
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 relative no-print">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-slate-800 font-black text-lg">تصفية النتائج 👥</h3>
        <button 
          onClick={handleClearFilters}
          className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg transition-all shadow-sm active:scale-95 flex items-center justify-center"
          title="مسح التصفية"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-4">
        <FilterRow 
          label="الجنس" field="gender" value={filters.gender} icon="👥"
          options={[{val:'الكل', label:'الكل'}, {val:'Male', label:'♂️ ذكر'}, {val:'Female', label:'♀️ أنثى'}]}
        />
        <FilterRow 
          label="الطائفة" field="denomination" value={filters.denomination} icon="⛪"
          options={[
            {val:'الكل', label:'الكل'}, 
            {val:'انجليكان', label:'انجليكان'}, 
            {val:'روم أرثوذكس', label:'روم أرثوذكس'},
            {val:'روم كاثوليك', label:'روم كاثوليك'},
            {val:'كاثوليك', label:'كاثوليك'},
            {val:'لاتين', label:'لاتين'},
            {val:'موارنة', label:'موارنة'}
          ]}
        />
        <FilterRow 
          label="نوع التعليم" field="educationType" value={filters.educationType} icon="🎓"
          options={[{val:'الكل', label:'الكل'}, {val:'نظامي', label:'نظامي'}, {val:'مستمع', label:'مستمع'}]}
        />
        <FilterRow 
          label="المستوى" field="educationLevel" value={filters.educationLevel} icon="📖"
          options={[
            {val:'الكل', label:'الكل'}, 
            {val:'B.A', label:'B.A'}, 
            {val:'M.A', label:'M.A'}, 
            {val:'PHD', label:'PHD'}, 
            {val:'اكاديمي', label:'اكاديمي'}, 
            {val:'بجروت كامل', label:'بجروت كامل'}, 
            {val:'تقني', label:'تقني'}, 
            {val:'هندسي', label:'هندسي'}, 
            {val:'other', label:'other'}
          ]}
        />
        <FilterRow 
          label="سنة التسجيل" field="registrationYear" value={filters.registrationYear} icon="📅"
          options={[{val:'الكل', label:'الكل'}, ...years.map(y => ({val: y, label: y}))]}
        />

        <div className="md:col-span-1 pt-4">
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center w-full">
              <span className="text-slate-700 text-xs font-black">العمر</span>
              <span className="text-blue-600 text-sm font-black">{filters.ageRange[0]} - {filters.ageRange[1]}</span>
            </div>
            <div className="relative w-full h-8 flex items-center">
              <div className="absolute h-1.5 w-full bg-slate-100 rounded-full"></div>
              <div className="absolute h-1.5 bg-blue-500 rounded-full"
                style={{ right: `${filters.ageRange[0]}%`, left: `${100 - filters.ageRange[1]}%` }}></div>
              <input type="range" min="0" max="100" value={filters.ageRange[0]} onChange={handleMinChange}
                className="absolute w-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-600 [&::-webkit-slider-thumb]:appearance-none" />
              <input type="range" min="0" max="100" value={filters.ageRange[1]} onChange={handleMaxChange}
                className="absolute w-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-600 [&::-webkit-slider-thumb]:appearance-none" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Filters;
