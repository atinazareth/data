
import { useState, useEffect, useMemo } from 'react';
import { Student, FilterState } from '../../../types';
import { fetchStudents } from '../../../services/googleSheetsService';

export const useStudents = (filters: FilterState) => {
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchStudents();
      setAllStudents(data || []);
    } catch (err: any) {
      setError(err.message || 'خطأ في الاتصال بقاعدة البيانات. يرجى التحقق من اتصال الإنترنت أو إعدادات Google Sheets.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredStudents = useMemo(() => {
    if (!allStudents || !Array.isArray(allStudents)) return [];
    
    return allStudents.filter(student => {
      const searchStr = (filters.searchQuery || '').toLowerCase();
      const matchesSearch = 
        (student.fullName || '').toLowerCase().includes(searchStr) || 
        (student.nationalId || '').includes(searchStr);
        
      const matchesGender = filters.gender === 'الكل' || student.gender === filters.gender;
      const matchesDenomination = filters.denomination === 'الكل' || student.denomination === filters.denomination;
      const matchesEducationType = filters.educationType === 'الكل' || student.educationType === filters.educationType;
      const matchesLevel = filters.educationLevel === 'الكل' || student.educationLevel === filters.educationLevel;
      
      let age = 0;
      if (student.birthday && typeof student.birthday === 'string') {
        const parts = student.birthday.split('/');
        if (parts.length === 3) {
          const birthYear = parseInt(parts[2]);
          if (!isNaN(birthYear)) {
            age = new Date().getFullYear() - birthYear;
          }
        }
      }
      
      const matchesAge = age >= filters.ageRange[0] && age <= filters.ageRange[1];

      return matchesSearch && matchesGender && matchesDenomination && matchesEducationType && matchesLevel && matchesAge;
    });
  }, [allStudents, filters]);

  return { students: filteredStudents, allStudents, loading, error, refresh: loadData };
};
