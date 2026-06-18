"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface City {
  city_id: string;
  name: string;
  quota: number;
  current_count: number;
  remaining: number;
}

interface Student {
  id: string;
  student_id: string;
  name: string;
  surname: string;
  class: string;
  class_no: string;
  city_id: string;
  created_at: string;
  cities: {
    name: string;
  };
}

export default function TeacherPage() {
  const [cities, setCities] = useState<City[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [uniqueClasses, setUniqueClasses] = useState<string[]>([]);
  const homeButtonClasses = "inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-700 border border-slate-200 rounded-full hover:bg-slate-50 hover:text-blue-600 transition-all shadow-sm";

  const exportToGoogleSheets = () => {
    // Get the filtered city name
    const cityName = selectedCity 
      ? cities.find(c => c.city_id === selectedCity)?.name || 'All Destinations'
      : 'All Destinations';

    // Prepare CSV data
    const headers = ['Student ID', 'First Name', 'Last Name', 'Class', 'Class No', 'Destination', 'Registered At'];
    const rows = students.map(student => [
      student.student_id,
      student.name,
      student.surname,
      student.class,
      student.class_no,
      student.cities?.name || cities.find(c => c.city_id === student.city_id)?.name || 'Unknown',
      new Date(student.created_at).toLocaleString()
    ]);

    // Create CSV content
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${cityName.replace(/\s+/g, '_')}_Students_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const fetchCities = async () => {
    try {
      const functionsUrl = process.env.NEXT_PUBLIC_SUPABASE_FUNCTIONS_URL;
      const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      const response = await fetch(`${functionsUrl}/city-status`, {
        headers: {
          'Authorization': `Bearer ${anonKey}`,
          'apikey': anonKey || '',
        },
      });
      const data = await response.json();
      setCities(data.cities || []);
    } catch (error) {
      console.error("Error fetching cities:", error);
    }
  };

  const fetchStudents = async (cityId: string | null) => {
    setLoading(true);
    try {
      const functionsUrl = process.env.NEXT_PUBLIC_SUPABASE_FUNCTIONS_URL;
      const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      
      let url = `${functionsUrl}/get-students`;
      if (cityId) {
        url += `?city_id=${cityId}`;
      }

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${anonKey}`,
          'apikey': anonKey || '',
        },
      });
      const data = await response.json();
      setAllStudents(data.students || []);
      setStudents(data.students || []);
      
      // Extract unique classes
      const classes = Array.from(new Set((data.students || []).map((s: Student) => s.class).filter(Boolean))) as string[];
      setUniqueClasses(classes.sort());
    } catch (error) {
      console.error("Error fetching students:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCities();
    fetchStudents(null);
  }, []);

  useEffect(() => {
    fetchStudents(selectedCity);
  }, [selectedCity]);

  // Apply filters
  useEffect(() => {
    let filtered = [...allStudents];
    
    if (selectedClass) {
      filtered = filtered.filter(s => s.class === selectedClass);
    }
    
    setStudents(filtered);
  }, [selectedClass, allStudents]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-blue-50 text-slate-900">
      <div className="bg-white border-b border-slate-200 py-8 mb-8 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="inline-block py-1 px-3 rounded-full bg-blue-100 text-blue-700 text-sm font-semibold mb-2 tracking-wide uppercase">
                Admin Portal
              </span>
              <h1 className="text-3xl font-bold text-slate-900">Teacher Dashboard</h1>
              <p className="text-slate-600 mt-1">Monitor student enrollments and manage trip data</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Link href="/" className={homeButtonClasses}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0h6" />
                </svg>
                Home
              </Link>
              {students.length > 0 && (
                <button
                  onClick={exportToGoogleSheets}
                  className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-full transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2 active:scale-95"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Export CSV
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {/* Filter Section */}
        <div className="mb-8 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-3">
              Filter by Destination
            </label>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              <button
                onClick={() => setSelectedCity(null)}
                className={`px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all border ${
                  selectedCity === null
                    ? "bg-blue-600 text-white border-blue-600 shadow-md"
                    : "bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50"
                }`}
              >
                All Destinations
              </button>
              {cities.map((city) => (
                <button
                  key={city.city_id}
                  onClick={() => setSelectedCity(city.city_id)}
                  className={`px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all border ${
                    selectedCity === city.city_id
                      ? "bg-blue-600 text-white border-blue-600 shadow-md"
                      : "bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50"
                  }`}
                >
                  {city.name} <span className="ml-1 opacity-80 font-normal">({city.current_count}/{city.quota})</span>
                </button>
              ))}
            </div>
          </div>

          {/* Class Filter Section */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-3">
              Filter by Class
            </label>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              <button
                onClick={() => setSelectedClass(null)}
                className={`px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all border ${
                  selectedClass === null
                    ? "bg-indigo-600 text-white border-indigo-600 shadow-md"
                    : "bg-white text-slate-600 border-slate-200 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50"
                }`}
              >
                All Classes
              </button>
              {uniqueClasses.map((classItem) => (
                <button
                  key={classItem}
                  onClick={() => setSelectedClass(classItem)}
                  className={`px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all border ${
                    selectedClass === classItem
                      ? "bg-indigo-600 text-white border-indigo-600 shadow-md"
                      : "bg-white text-slate-600 border-slate-200 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50"
                  }`}
                >
                  {classItem}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Students Table */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Student ID
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Class
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Class No
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Destination
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Registered At
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {loading ? (
                  <tr key="loading">
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                      <div className="flex justify-center items-center gap-2">
                        <svg className="animate-spin h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Loading students...
                      </div>
                    </td>
                  </tr>
                ) : students.length === 0 ? (
                  <tr key="no-students">
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                      No students found matching your filters.
                    </td>
                  </tr>
                ) : (
                  students.map((student, index) => (
                    <tr key={student.id || student.student_id || index} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-900">
                        {student.student_id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                        {student.name} {student.surname}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                        {student.class}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                        {student.class_no}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {student.cities?.name || cities.find(c => c.city_id === student.city_id)?.name || 'Unknown'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                        {new Date(student.created_at).toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex justify-between items-center">
            <p className="text-sm text-slate-500">
              Showing <span className="font-bold text-slate-900">{students.length}</span> students
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
