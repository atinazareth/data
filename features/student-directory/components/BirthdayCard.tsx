
import React from 'react';
import { Student } from '../../../types';
import { BirthdayStyles } from '../styles';

interface BirthdayCardProps {
  students: Student[];
  onStudentClick: (id: string) => void;
}

const BirthdayCard: React.FC<BirthdayCardProps> = ({ students, onStudentClick }) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (!students || !Array.isArray(students)) return null;

  const upcomingBirthdays = students
    .filter(s => s && s.birthday && typeof s.birthday === 'string')
    .map(s => {
      let day = 0;
      let month = 0;

      if (s.birthday.includes('/')) {
        const parts = s.birthday.split('/');
        day = Number(parts[0]);
        month = Number(parts[1]);
      } else if (s.birthday.includes('-') || s.birthday.includes('T')) {
        // Handle ISO strings or dash formats
        const d = new Date(s.birthday);
        if (!isNaN(d.getTime())) {
          day = d.getUTCDate();
          month = d.getUTCMonth() + 1;
        }
      }
      
      if (!day || !month || isNaN(day) || isNaN(month)) return null;

      const birthdayThisYear = new Date(today.getFullYear(), month - 1, day);
      if (birthdayThisYear < today) {
        birthdayThisYear.setFullYear(today.getFullYear() + 1);
      }

      const diffTime = birthdayThisYear.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      return {
        id: s.id,
        name: s.fullName,
        date: `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}`,
        isToday: diffDays === 0,
        daysUntil: diffDays
      };
    })
    .filter((b): b is any => b !== null && b.daysUntil >= 0 && b.daysUntil <= 7)
    .sort((a, b) => a.daysUntil - b.daysUntil);

  return (
    <div className={BirthdayStyles.container}>
      <div className={`${BirthdayStyles.header} justify-center`}>
        <span className="text-center w-full">أعياد الميلاد القادمة 🎂</span>
      </div>
      <div className="flex flex-col gap-3">
        {upcomingBirthdays.length > 0 ? upcomingBirthdays.map((b, idx) => (
          <div 
            key={idx} 
            className={b.isToday ? BirthdayStyles.itemToday : BirthdayStyles.itemNormal}
            onClick={() => onStudentClick(b.id)}
          >
            <span className={BirthdayStyles.nameText}>{b.name} {b.isToday && '🎉'}</span>
            <span className={BirthdayStyles.dateText}>{b.date}</span>
          </div>
        )) : (
          <span className="text-xs text-slate-400 text-center py-4">لا يوجد أعياد ميلاد قريبة</span>
        )}
      </div>
    </div>
  );
};

export default BirthdayCard;
