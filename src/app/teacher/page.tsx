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

  const totalSeats = cities.reduce((sum, c) => sum + c.quota, 0);
  const totalBooked = cities.reduce((sum, c) => sum + c.current_count, 0);

  return (
    <div className="min-h-screen bg-paper text-ink">
      {/* Programme office header */}
      <div className="bg-board text-paper board-sheen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5">
            <div>
              <p className="font-mono text-xs tracking-[0.25em] uppercase text-brass-soft mb-3">
                Programme Office
              </p>
              <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-paper">Enrolment manifest</h1>
              <p className="text-paper/70 mt-2">
                Live record of every passenger and their destination.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-mono tracking-[0.15em] uppercase text-paper/80 border border-paper/25 rounded-lg hover:bg-paper/10 hover:text-paper transition-all"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0h6" />
                </svg>
                Home
              </Link>
              {students.length > 0 && (
                <button
                  onClick={exportToGoogleSheets}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-brass hover:bg-brass-soft text-ink font-semibold rounded-lg transition-all active:scale-95"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Export CSV
                </button>
              )}
            </div>
          </div>

          {/* Manifest summary */}
          <div className="mt-8 flex flex-wrap gap-x-10 gap-y-4 font-mono text-xs tracking-[0.15em] uppercase text-paper/60">
            <span>Passengers booked · <span className="text-paper tabular-nums">{totalBooked}</span></span>
            <span>Total seats · <span className="text-paper tabular-nums">{totalSeats}</span></span>
            <span>Destinations · <span className="text-paper tabular-nums">{cities.length}</span></span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {/* Filters */}
        <div className="mb-8 space-y-6">
          <div>
            <p className="font-mono text-[0.7rem] tracking-[0.2em] uppercase text-ink-soft mb-3">
              Filter by destination
            </p>
            <div className="flex gap-2.5 overflow-x-auto pb-2">
              <FilterChip active={selectedCity === null} accent="ink" onClick={() => setSelectedCity(null)}>
                All destinations
              </FilterChip>
              {cities.map((city) => (
                <FilterChip
                  key={city.city_id}
                  active={selectedCity === city.city_id}
                  accent="ink"
                  onClick={() => setSelectedCity(city.city_id)}
                >
                  {city.name}
                  <span className="ml-1.5 opacity-70 tabular-nums">{city.current_count}/{city.quota}</span>
                </FilterChip>
              ))}
            </div>
          </div>

          <div>
            <p className="font-mono text-[0.7rem] tracking-[0.2em] uppercase text-ink-soft mb-3">
              Filter by class
            </p>
            <div className="flex gap-2.5 overflow-x-auto pb-2">
              <FilterChip active={selectedClass === null} accent="brass" onClick={() => setSelectedClass(null)}>
                All classes
              </FilterChip>
              {uniqueClasses.map((classItem) => (
                <FilterChip
                  key={classItem}
                  active={selectedClass === classItem}
                  accent="brass"
                  onClick={() => setSelectedClass(classItem)}
                >
                  {classItem}
                </FilterChip>
              ))}
            </div>
          </div>
        </div>

        {/* Manifest table */}
        <div className="bg-white border border-line rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-line">
              <thead className="bg-paper">
                <tr>
                  {["Student ID", "Passenger", "Class", "Seat no.", "Destination", "Booked at"].map((h) => (
                    <th
                      key={h}
                      scope="col"
                      className="px-6 py-4 text-left font-mono text-[0.65rem] font-bold text-ink-soft uppercase tracking-[0.15em]"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-line">
                {loading ? (
                  <tr key="loading">
                    <td colSpan={6} className="px-6 py-14 text-center text-ink-soft">
                      <div className="flex justify-center items-center gap-2 font-mono text-xs tracking-[0.15em] uppercase">
                        <svg className="animate-spin h-5 w-5 text-ink" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Loading manifest…
                      </div>
                    </td>
                  </tr>
                ) : students.length === 0 ? (
                  <tr key="no-students">
                    <td colSpan={6} className="px-6 py-14 text-center text-ink-soft">
                      No passengers match these filters yet.
                    </td>
                  </tr>
                ) : (
                  students.map((student, index) => (
                    <tr key={student.id || student.student_id || index} className="hover:bg-paper transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap font-mono text-sm font-semibold text-ink tabular-nums">
                        {student.student_id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-ink">
                        {student.name} {student.surname}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-mono text-sm text-ink-soft">
                        {student.class}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-mono text-sm text-ink-soft tabular-nums">
                        {student.class_no}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md font-mono text-[0.65rem] tracking-[0.12em] uppercase bg-brass/12 text-brass border border-brass/25">
                          {student.cities?.name || cities.find(c => c.city_id === student.city_id)?.name || 'Unknown'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-mono text-xs text-ink-soft">
                        {new Date(student.created_at).toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="bg-paper px-6 py-4 border-t border-line flex justify-between items-center">
            <p className="font-mono text-xs tracking-[0.15em] uppercase text-ink-soft">
              Showing <span className="font-bold text-ink tabular-nums">{students.length}</span> passengers
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function FilterChip({
  active,
  accent,
  onClick,
  children,
}: {
  active: boolean;
  accent: "ink" | "brass";
  onClick: () => void;
  children: React.ReactNode;
}) {
  const activeClasses =
    accent === "ink"
      ? "bg-ink text-paper border-ink shadow-sm"
      : "bg-brass text-ink border-brass shadow-sm";
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`px-4 py-2 rounded-lg font-mono text-xs tracking-[0.1em] uppercase whitespace-nowrap border transition-all ${
        active ? activeClasses : "bg-white text-ink-soft border-line hover:border-ink/30 hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}
