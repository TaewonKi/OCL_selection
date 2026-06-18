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

  const homeButtonClasses =
    "inline-flex items-center gap-2 px-4 py-2 text-xs font-mono tracking-[0.15em] uppercase text-ink-soft border border-ink/15 rounded-lg hover:bg-ink/5 hover:text-ink transition-all";

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

  return (
    <div className="min-h-screen bg-paper text-ink">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="flex justify-end mb-8">
          <Link href="/" className={homeButtonClasses}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
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
          <div className="mb-8 sm:mb-10 text-center">
            <p className="font-mono text-xs tracking-[0.25em] uppercase text-brass mb-4">
              Booking lookup
            </p>
            <h1 className="font-serif text-4xl sm:text-5xl font-semibold text-ink mb-3 tracking-tight">
              Find your booking
            </h1>
            <p className="text-lg text-ink-soft max-w-2xl mx-auto">
              Enter your Student ID to pull up your destination and seat details.
            </p>
          </div>

          {/* Lookup form */}
          <div className="bg-white border border-line rounded-3xl p-6 sm:p-8 lg:p-10 shadow-sm mb-8">
            <form onSubmit={handleSubmit} className="max-w-md mx-auto">
              <div className="mb-6">
                <label className="block font-mono text-[0.7rem] tracking-[0.15em] uppercase text-ink-soft mb-2">
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
                  className="w-full px-4 py-3.5 bg-paper border border-line rounded-xl focus:outline-none focus:ring-2 focus:ring-ink/40 focus:border-transparent text-ink transition-all text-base font-mono tabular-nums placeholder:text-ink/30"
                  placeholder="12345"
                />
              </div>

              <button
                type="submit"
                disabled={loading || studentId.length !== 5}
                className="w-full bg-ink hover:bg-ink/90 active:scale-[0.99] disabled:bg-ink/15 disabled:text-ink/40 text-paper font-semibold py-4 px-6 rounded-xl transition-all disabled:cursor-not-allowed text-lg shadow-lg hover:shadow-xl"
              >
                {loading ? "Looking up…" : "Find booking"}
              </button>
            </form>
          </div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-oxblood/5 border border-oxblood/20 rounded-2xl p-6 mb-8"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-oxblood/10 rounded-full flex items-center justify-center text-oxblood">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="font-mono text-[0.65rem] tracking-[0.2em] uppercase text-oxblood mb-1">Not found</p>
                    <p className="text-ink-soft">
                      {error}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Result */}
          <AnimatePresence>
            {registrationData && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white border border-stamp/30 rounded-3xl shadow-xl overflow-hidden"
              >
                <div className="bg-stamp text-paper px-6 sm:px-8 py-4 flex items-center justify-between">
                  <span className="font-mono text-[0.65rem] sm:text-xs tracking-[0.25em] uppercase text-paper/90">
                    Booking confirmed
                  </span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </div>

                <div className="p-6 sm:p-10">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-y-6 gap-x-4 bg-paper rounded-2xl p-6 border border-line bg-security mb-6">
                    <Field label="Student ID" value={registrationData.student_id} mono />
                    <Field label="Passenger" value={`${registrationData.name} ${registrationData.surname}`} />
                    <Field label="Class" value={registrationData.class} mono />
                    <Field label="Seat no." value={registrationData.class_no || "—"} mono />
                  </div>

                  <div className="mb-6">
                    <p className="font-mono text-[0.65rem] tracking-[0.2em] uppercase text-ink-soft mb-1">Destination</p>
                    <p className="font-serif text-3xl font-semibold text-stamp">{registrationData.city}</p>
                  </div>

                  <div className="p-4 bg-brass/5 border border-brass/20 rounded-xl flex gap-3">
                    <svg className="w-5 h-5 text-brass flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-sm text-ink-soft">
                      Keep this for your records. For any changes, speak to your teacher.
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setRegistrationData(null);
                      setStudentId("");
                    }}
                    className="w-full mt-6 bg-white border border-ink/15 hover:bg-ink/5 text-ink font-semibold py-4 rounded-xl transition-all"
                  >
                    Look up another booking
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}

function Field({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <p className="font-mono text-[0.6rem] tracking-[0.2em] uppercase text-ink-soft mb-1">{label}</p>
      <p className={`text-lg font-semibold text-ink ${mono ? "font-mono tabular-nums" : ""}`}>{value}</p>
    </div>
  );
}
