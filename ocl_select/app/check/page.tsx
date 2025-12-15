"use client";

import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface RegistrationData {
  student_id: string;
  name: string;
  surname: string;
  class: string;
  class_no: string;
  city: string;
}

export default function CheckRegistrationPage() {
  const [studentId, setStudentId] = useState("");
  const [loading, setLoading] = useState(false);
  const [registrationData, setRegistrationData] = useState<RegistrationData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const homeButtonClasses = "inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-700 border border-slate-200 rounded-full hover:bg-slate-50 hover:text-blue-600 transition-all shadow-sm";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setRegistrationData(null);

    if (studentId.length !== 5) {
      setError("Student ID must be exactly 5 digits");
      setLoading(false);
      return;
    }

    try {
      const functionsUrl = process.env.NEXT_PUBLIC_SUPABASE_FUNCTIONS_URL;
      const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      
      const response = await fetch(`${functionsUrl}/check-registration`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          'Authorization': `Bearer ${anonKey}`,
          'apikey': anonKey || '',
        },
        body: JSON.stringify({ student_id: studentId }),
      });

      const data = await response.json();

      if (data.success) {
        setRegistrationData(data.data);
      } else {
        setError(data.message || "Registration not found");
      }
    } catch (err) {
      console.error("Error checking registration:", err);
      setError("Failed to check registration. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-blue-50 text-slate-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="flex justify-end mb-6">
          <Link href="/" className={homeButtonClasses}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0h6" />
            </svg>
            Home
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="mb-8 sm:mb-12 text-center">
            <span className="inline-block py-1 px-3 rounded-full bg-blue-100 text-blue-700 text-sm font-semibold mb-4 tracking-wide uppercase">
              Registration Check
            </span>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">
              Check Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Registration</span>
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Enter your Student ID to view your trip registration details
            </p>
          </div>

          {/* Search Form */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 lg:p-10 shadow-sm mb-8">
            <form onSubmit={handleSubmit} className="max-w-md mx-auto">
              <div className="mb-6">
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Student ID
                </label>
                <input
                  type="tel"
                  inputMode="numeric"
                  pattern="[0-9]{5}"
                  maxLength={5}
                  required
                  value={studentId}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 5);
                    setStudentId(value);
                  }}
                  className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 transition-all text-base placeholder:text-slate-400"
                  placeholder="12345"
                />
              </div>

              <button
                type="submit"
                disabled={loading || studentId.length !== 5}
                className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold py-4 px-6 rounded-full transition-all disabled:cursor-not-allowed text-lg shadow-lg hover:shadow-xl active:scale-[0.98]"
              >
                {loading ? "Checking..." : "Check Registration"}
              </button>
            </form>
          </div>

          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-8"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-red-900 mb-1">
                      Not Found
                    </h3>
                    <p className="text-red-700">
                      {error}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Registration Details */}
          <AnimatePresence>
            {registrationData && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 lg:p-10 shadow-sm"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex-shrink-0 w-16 h-16 bg-green-50 rounded-full flex items-center justify-center border-4 border-green-100">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">Registration Found!</h2>
                    <p className="text-slate-600">Your trip details are confirmed</p>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-2xl p-6 sm:p-8 space-y-4 border border-slate-100">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-semibold text-slate-500 mb-1 uppercase tracking-wide">Student ID</p>
                      <p className="text-lg font-bold text-slate-900">{registrationData.student_id}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-semibold text-slate-500 mb-1 uppercase tracking-wide">Name</p>
                      <p className="text-lg font-bold text-slate-900">{registrationData.name} {registrationData.surname}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-semibold text-slate-500 mb-1 uppercase tracking-wide">Class</p>
                      <p className="text-lg font-bold text-slate-900">{registrationData.class}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-semibold text-slate-500 mb-1 uppercase tracking-wide">Class Number</p>
                      <p className="text-lg font-bold text-slate-900">{registrationData.class_no || "N/A"}</p>
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-200">
                    <p className="text-sm font-semibold text-slate-500 mb-2 uppercase tracking-wide">Trip Destination</p>
                    <p className="text-2xl font-bold text-blue-600 mb-4">{registrationData.city}</p>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-xl">
                  <div className="flex gap-3">
                    <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-sm text-blue-900">
                      Please save this information for your records. For any changes or questions, contact your teacher.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setRegistrationData(null);
                    setStudentId("");
                  }}
                  className="w-full mt-6 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-4 rounded-full transition-all"
                >
                  Check Another Registration
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
