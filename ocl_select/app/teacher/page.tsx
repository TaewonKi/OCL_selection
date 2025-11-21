"use client";

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
    <div className="min-h-screen bg-white dark:bg-black">
      <div className="bg-blue-600 dark:bg-blue-900 text-white py-12 mb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold">Teacher Dashboard</h1>
          <p className="text-blue-100 mt-2">Monitor student enrollments</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {/* Filter Section */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Filter by Destination
            </label>
            {students.length > 0 && (
              <button
                onClick={exportToGoogleSheets}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Export to CSV
              </button>
            )}
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4">
            <button
              onClick={() => setSelectedCity(null)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                selectedCity === null
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
            >
              All Destinations
            </button>
            {cities.map((city) => (
              <button
                key={city.city_id}
                onClick={() => setSelectedCity(city.city_id)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedCity === city.city_id
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                }`}
              >
                {city.name} ({city.current_count}/{city.quota})
              </button>
            ))}
          </div>
        </div>

        {/* Class Filter Section */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Filter by Class
          </label>
          <div className="flex gap-4 overflow-x-auto pb-4">
            <button
              onClick={() => setSelectedClass(null)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                selectedClass === null
                  ? "bg-purple-600 text-white"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
            >
              All Classes
            </button>
            {uniqueClasses.map((classItem) => (
              <button
                key={classItem}
                onClick={() => setSelectedClass(classItem)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedClass === classItem
                    ? "bg-purple-600 text-white"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                }`}
              >
                {classItem}
              </button>
            ))}
          </div>
        </div>

        {/* Students Table */}
        <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Student ID
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Class
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Class No
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Destination
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Registered At
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-black divide-y divide-gray-200 dark:divide-gray-800">
                {loading ? (
                  <tr key="loading">
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                      Loading students...
                    </td>
                  </tr>
                ) : students.length === 0 ? (
                  <tr key="no-students">
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                      No students found.
                    </td>
                  </tr>
                ) : (
                  students.map((student, index) => (
                    <tr key={student.id || student.student_id || index} className="hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {student.student_id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {student.name} {student.surname}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {student.class}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {student.class_no}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 dark:text-blue-400 font-medium">
                        {student.cities?.name || cities.find(c => c.city_id === student.city_id)?.name || 'Unknown'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {new Date(student.created_at).toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="bg-gray-50 dark:bg-gray-900 px-6 py-4 border-t border-gray-200 dark:border-gray-800">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Total Students: <span className="font-medium text-gray-900 dark:text-white">{students.length}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
