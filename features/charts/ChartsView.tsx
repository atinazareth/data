
import React, { useMemo, useEffect, useRef, useState } from 'react';
import { Student, FilterState } from '../../types';
import Chart from 'https://esm.sh/chart.js/auto';
import Filters from '../student-directory/components/Filters';

interface ChartsViewProps {
  students: Student[];
  allStudents: Student[];
  filters: FilterState;
  onFilterChange: (key: keyof FilterState, value: any) => void;
  years: string[];
  onBack: () => void;
}

type ChartCategory = 'demographics' | 'education' | 'religious';
type DataScope = 'filtered' | 'all';

const ChartsView: React.FC<ChartsViewProps> = ({ students, allStudents, filters, onFilterChange, years, onBack }) => {
  const [activeCategory, setActiveCategory] = useState<ChartCategory>('demographics');
  const [dataScope, setDataScope] = useState<DataScope>('filtered');
  
  const chart1Ref = useRef<HTMLCanvasElement>(null);
  const chart2Ref = useRef<HTMLCanvasElement>(null);
  const chart1Instance = useRef<Chart | null>(null);
  const chart2Instance = useRef<Chart | null>(null);

  const activeStudents = useMemo(() => {
    return dataScope === 'filtered' ? students : allStudents;
  }, [dataScope, students, allStudents]);

  const stats = useMemo(() => {
    const males = activeStudents.filter(s => s.gender === 'Male').length;
    const females = activeStudents.filter(s => s.gender === 'Female').length;
    const levels: Record<string, number> = {};
    const types: Record<string, number> = {};
    const denominations: Record<string, number> = {};

    activeStudents.forEach(s => {
      if (s.educationLevel) levels[s.educationLevel] = (levels[s.educationLevel] || 0) + 1;
      if (s.educationType) types[s.educationType] = (types[s.educationType] || 0) + 1;
      if (s.denomination) denominations[s.denomination] = (denominations[s.denomination] || 0) + 1;
    });

    return { males, females, levels, types, denominations };
  }, [activeStudents]);

  useEffect(() => {
    chart1Instance.current?.destroy();
    chart2Instance.current?.destroy();

    const commonFont = { family: 'Cairo', weight: 'bold' };

    if (activeCategory === 'demographics') {
      if (chart1Ref.current) {
        chart1Instance.current = new Chart(chart1Ref.current, {
          type: 'pie',
          data: {
            labels: ['ذكر ♂️', 'أنثى ♀️'],
            datasets: [{
              data: [stats.males, stats.females],
              backgroundColor: ['#3b82f6', '#f43f5e'],
              borderWidth: 0
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { position: 'bottom', labels: { font: commonFont } },
              tooltip: {
                callbacks: {
                  label: (context) => {
                    const total = stats.males + stats.females;
                    const value = context.parsed as number;
                    const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
                    return ` ${context.label}: ${value} (${percentage}%)`;
                  }
                }
              }
            }
          }
        });
      }
    } else if (activeCategory === 'education') {
      if (chart1Ref.current) {
        chart1Instance.current = new Chart(chart1Ref.current, {
          type: 'bar',
          data: {
            labels: Object.keys(stats.levels),
            datasets: [{
              label: 'المستوى الدراسي',
              data: Object.values(stats.levels),
              backgroundColor: '#8b5cf6',
              borderRadius: 8
            }]
          },
          options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: { 
              x: { beginAtZero: true, ticks: { precision: 0, font: commonFont } },
              y: { ticks: { font: commonFont } }
            }
          }
        });
      }
      if (chart2Ref.current) {
        chart2Instance.current = new Chart(chart2Ref.current, {
          type: 'doughnut',
          data: {
            labels: Object.keys(stats.types),
            datasets: [{
              data: Object.values(stats.types),
              backgroundColor: ['#10b981', '#f59e0b', '#3b82f6', '#8b5cf6'],
              borderWidth: 0
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { position: 'bottom', labels: { font: commonFont } } }
          }
        });
      }
    } else if (activeCategory === 'religious') {
      if (chart1Ref.current) {
        chart1Instance.current = new Chart(chart1Ref.current, {
          type: 'polarArea',
          data: {
            labels: Object.keys(stats.denominations),
            datasets: [{
              data: Object.values(stats.denominations),
              backgroundColor: ['#f43f5e', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#6366f1'],
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { position: 'bottom', labels: { font: commonFont } } }
          }
        });
      }
    }

    return () => {
      chart1Instance.current?.destroy();
      chart2Instance.current?.destroy();
    };
  }, [activeCategory, stats, dataScope]);

  const TabButton = ({ id, label, icon }: { id: ChartCategory, label: string, icon: string }) => (
    <button
      onClick={() => setActiveCategory(id)}
      className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all shadow-sm flex-1 md:flex-none justify-center ${
        activeCategory === id 
          ? 'bg-blue-600 text-white shadow-blue-100' 
          : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-100'
      }`}
    >
      <span>{icon}</span>
      <span>{label}</span>
    </button>
  );

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto">
      {/* Filtering Section inside Charts Page */}
      <div className="no-print">
        <Filters filters={filters} onFilterChange={onFilterChange} years={years} />
      </div>

      <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-6 md:p-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b border-slate-50 pb-6 gap-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-3xl font-black text-slate-800">مركز الإحصائيات</h2>
            <p className="text-slate-400 text-sm font-bold">
              عدد الطلاب في العرض الحالي: {activeStudents.length}
            </p>
          </div>
          
          <div className="bg-slate-50 p-2 rounded-2xl border border-slate-200 flex items-center gap-2">
            <span className="text-xs font-black text-slate-400 px-2">نطاق البيانات:</span>
            <div className="flex bg-white rounded-xl shadow-inner p-1">
              <button 
                onClick={() => setDataScope('filtered')}
                className={`px-4 py-1.5 rounded-lg text-xs font-black transition-all ${dataScope === 'filtered' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-slate-50'}`}
              >
                حسب الفلتر
              </button>
              <button 
                onClick={() => setDataScope('all')}
                className={`px-4 py-1.5 rounded-lg text-xs font-black transition-all ${dataScope === 'all' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-slate-50'}`}
              >
                كل الطلاب
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mb-8 justify-center">
          <TabButton id="demographics" label="الإحصاء السكاني" icon="👥" />
          <TabButton id="education" label="البيانات التعليمية" icon="🎓" />
          <TabButton id="religious" label="التوزيع الطائفي" icon="⛪" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 min-h-[450px]">
          <div className="bg-[#f8fafc] p-6 md:p-8 rounded-3xl border border-slate-200 flex flex-col shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h4 className="text-slate-800 font-black text-lg">
                  {activeCategory === 'demographics' ? 'التوزيع حسب الجنس' : 
                  activeCategory === 'education' ? 'المستويات الدراسية' : 
                  'توزيع الطوائف'}
              </h4>
              <span className="text-[10px] bg-white border border-slate-200 px-2 py-0.5 rounded-full text-slate-400 font-black">
                {activeCategory.toUpperCase()}
              </span>
            </div>
            <div className="flex-grow w-full relative">
              <canvas ref={chart1Ref}></canvas>
            </div>
          </div>
          
          {(activeCategory === 'education' || activeCategory === 'demographics') ? (
            <div className="bg-[#f8fafc] p-6 md:p-8 rounded-3xl border border-slate-200 flex flex-col shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h4 className="text-slate-800 font-black text-lg">
                  {activeCategory === 'demographics' ? 'ملخص الأرقام' : 'أنواع التعليم'}
                </h4>
                <span className="text-[10px] bg-white border border-slate-200 px-2 py-0.5 rounded-full text-slate-400 font-black uppercase">
                  {activeCategory === 'demographics' ? 'Summary' : 'Types'}
                </span>
              </div>
              <div className="flex-grow w-full relative">
                {activeCategory === 'demographics' ? (
                  <div className="flex flex-col gap-4 justify-center h-full">
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 flex justify-between items-center shadow-sm">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">♂️</span>
                          <span className="text-slate-500 font-bold">ذكور</span>
                        </div>
                        <span className="text-3xl font-black text-blue-600">{stats.males}</span>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 flex justify-between items-center shadow-sm">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">♀️</span>
                          <span className="text-slate-500 font-bold">إناث</span>
                        </div>
                        <span className="text-3xl font-black text-rose-500">{stats.females}</span>
                    </div>
                  </div>
                ) : (
                  <canvas ref={chart2Ref}></canvas>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 p-12 rounded-3xl border border-slate-200 flex items-center justify-center text-center">
              <div className="flex flex-col gap-4">
                <span className="text-6xl opacity-20">📊</span>
                <p className="text-slate-400 font-bold max-w-[200px]">اختر فئة من الأعلى لعرض المزيد من التفاصيل والبيانات</p>
              </div>
            </div>
          )}
        </div>
        
        <div className="mt-10 p-4 bg-blue-50/50 rounded-2xl border border-blue-100 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="animate-pulse">💡</span>
            <p className="text-blue-800 font-bold text-sm">
              {dataScope === 'filtered' 
                ? 'أنت تشاهد حالياً إحصائيات الطلاب المفلترين فقط.' 
                : 'أنت تشاهد إحصائيات لجميع الطلاب المسجلين في النظام.'}
            </p>
          </div>
          <button 
            onClick={onBack}
            className="text-blue-600 hover:text-blue-800 font-black text-sm underline"
          >
            العودة للوحة التحكم
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChartsView;
