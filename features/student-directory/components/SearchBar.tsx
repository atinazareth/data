
import React from 'react';

interface SearchBarProps {
  value: string;
  onChange: (val: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ value, onChange }) => {
  return (
    <div className="relative w-full">
      <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
        <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      <input
        type="text"
        className="w-full bg-white border border-slate-200 rounded-full py-2.5 pr-12 pl-6 text-sm text-slate-800 focus:outline-none focus:ring-4 focus:ring-blue-50/50 focus:border-blue-300 transition-all text-right placeholder-slate-400 shadow-sm"
        placeholder="ابحث بالاسم أو الرقم..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
};

export default SearchBar;
