
import React, { useState, useEffect, useMemo } from 'react';
import { PaymentRecord } from '../../types';
import { fetchPayments } from '../../services/googleSheetsService';

const PaymentsView: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [method, setMethod] = useState('الكل');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPayments()
      .then(data => {
        setPayments(data || []);
        setLoading(false);
      })
      .catch(err => {
        setError('فشل في تحميل سجلات الدفع');
        setLoading(false);
      });
  }, []);

  const handleClearFilters = () => {
    setMethod('الكل');
    setDateFrom('');
    setDateTo('');
  };

  const filteredPayments = useMemo(() => {
    return payments.filter(p => {
      const matchesMethod = method === 'الكل' || p.method === method;
      
      const dateParts = p.date.split('/');
      let pDate: Date | null = null;
      if (dateParts.length === 3) {
        pDate = new Date(parseInt(dateParts[2]), parseInt(dateParts[1]) - 1, parseInt(dateParts[0]));
      } else {
        pDate = new Date(p.date);
      }
      
      const from = dateFrom ? new Date(dateFrom) : null;
      const to = dateTo ? new Date(dateTo) : null;
      
      let matchesDate = true;
      if (pDate instanceof Date && !isNaN(pDate.getTime())) {
        if (from && pDate < from) matchesDate = false;
        if (to) {
          const toEndOfDay = new Date(to);
          toEndOfDay.setHours(23, 59, 59, 999);
          if (pDate > toEndOfDay) matchesDate = false;
        }
      }
      return matchesMethod && matchesDate;
    });
  }, [payments, method, dateFrom, dateTo]);

  const totalAmount = useMemo(() => {
    return filteredPayments.reduce((sum, p) => sum + p.amount, 0);
  }, [filteredPayments]);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 mb-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex flex-col">
            <h2 className="text-2xl font-black text-slate-800">إدارة المدفوعات</h2>
            <div className="text-blue-600 font-bold text-sm mt-1">
              إجمالي المبالغ المعروضة: <span className="text-lg font-black">₪{totalAmount}</span>
            </div>
          </div>
          <button 
            onClick={handleClearFilters}
            className="bg-red-500 hover:bg-red-600 text-white p-2.5 rounded-xl transition-all shadow-sm active:scale-95 flex items-center justify-center no-print"
            title="مسح الفلتر"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end border-b border-slate-50 pb-8 no-print">
          <div className="flex flex-col gap-2">
            <span className="text-slate-600 text-sm font-bold">طريقة الدفع</span>
            <select 
              value={method} 
              onChange={(e) => setMethod(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-slate-800 focus:ring-2 focus:ring-blue-100 outline-none appearance-none font-bold"
            >
              <option value="الكل">الكل</option>
              <option value="Cash">💵 نقداً (Cash)</option>
              <option value="Bank Transfer">🏦 تحويل بنكي</option>
            </select>
          </div>

          <div className="flex flex-col gap-2 relative">
            <span className="text-slate-600 text-sm font-bold">من تاريخ</span>
            <input 
              type="date" 
              value={dateFrom} 
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-4 text-slate-800 font-bold focus:ring-2 focus:ring-blue-100 outline-none cursor-pointer"
            />
          </div>

          <div className="flex flex-col gap-2 relative">
            <span className="text-slate-600 text-sm font-bold">إلى تاريخ</span>
            <input 
              type="date" 
              value={dateTo} 
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-4 text-slate-800 font-bold focus:ring-2 focus:ring-blue-100 outline-none cursor-pointer"
            />
          </div>
        </div>

        <div className="mt-8 overflow-x-auto">
          {loading ? (
             <div className="py-20 text-center text-slate-400 italic font-bold">جاري تحميل البيانات...</div>
          ) : error ? (
            <div className="py-20 text-center text-red-500 font-bold">{error}</div>
          ) : (
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-700 text-xs font-black border-b border-slate-100">
                  <th className="px-6 py-4">تاريخ الدفع</th>
                  <th className="px-6 py-4">رقم الوصل</th>
                  <th className="px-6 py-4">الاسم الكامل</th>
                  <th className="px-6 py-4">المبلغ</th>
                  <th className="px-6 py-4">طريقة الدفع</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredPayments.length > 0 ? filteredPayments.map(p => (
                  <tr key={p.id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="px-6 py-4 text-slate-700 font-bold">{p.date}</td>
                    <td className="px-6 py-4 font-mono text-blue-600 font-bold">{p.billNumber}</td>
                    <td className="px-6 py-4 font-bold text-slate-700">{p.studentName}</td>
                    <td className="px-6 py-4 text-slate-900 font-black text-lg">₪{p.amount}</td>
                    <td className="px-6 py-4">
                      <div className={`inline-flex px-4 py-1.5 rounded-full text-xs font-black shadow-sm ${p.method === 'Cash' ? 'bg-blue-100 text-blue-700 border border-blue-200' : 'bg-green-100 text-green-700 border border-green-200'}`}>
                        {p.method === 'Cash' ? 'Cash 💵' : 'Bank Transfer 🏦'}
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-20 text-center text-slate-400">
                      لا توجد مدفوعات مطابقة لمعايير البحث
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentsView;
