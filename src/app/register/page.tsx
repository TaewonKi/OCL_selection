"use client";

export const dynamic = "force-dynamic";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import { Countdown } from "../components/Countdown";
import { AirplaneSeatMap } from "../components/AirplaneSeatMap";
import { ThailandMap } from "../components/ThailandMap";

interface City {
  city_id: string;
  name: string;
  quota: number;
  current_count: number;
  remaining: number;
  pin_province?: string | null;
}

interface FormData {
  student_id: string;
  name: string;
  surname: string;
  class: string;
  class_no: string;
}

const gateCode = (index: number) => `GATE ${(index + 1).toString().padStart(2, "0")}`;

export default function RegisterPage() {
  const [cities, setCities] = useState<City[]>([]);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [step, setStep] = useState<1 | 2>(1);
  const [formData, setFormData] = useState<FormData>({
    student_id: "",
    name: "",
    surname: "",
    class: "",
    class_no: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [registeredCityName, setRegisteredCityName] = useState<string>("");
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [registrationOpen, setRegistrationOpen] = useState(false);
  const homeButtonClasses =
    "inline-flex items-center gap-2 px-4 py-2 text-xs font-mono tracking-[0.15em] uppercase text-ink-soft border border-ink/15 rounded-lg hover:bg-ink/5 hover:text-ink transition-all";

  useEffect(() => {
    if (showErrorPopup) {
      const timer = setTimeout(() => {
        setShowErrorPopup(false);
        setMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showErrorPopup]);

  const fetchCityStatus = async () => {
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
      console.error("Error fetching city status:", error);
    }
  };

  useEffect(() => {
    fetchCityStatus();

    const channel = supabase
      .channel("students_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "students" },
        () => {
          fetchCityStatus();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Step 1 → 2: validate passenger details then reveal map
  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.student_id.length !== 5) {
      setMessage({ type: "error", text: "Student ID must be exactly 5 digits" });
      setShowErrorPopup(true);
      return;
    }
    setStep(2);
  };

  // Step 2 submit → show confirmation
  const handleSubmit = () => {
    if (!selectedCity) {
      setMessage({ type: "error", text: "Please select a destination" });
      setShowErrorPopup(true);
      return;
    }
    setShowConfirmation(true);
  };

  const confirmRegistration = async () => {
    setLoading(true);
    setMessage(null);
    setShowErrorPopup(false);
    setShowConfirmation(false);

    try {
      const functionsUrl = process.env.NEXT_PUBLIC_SUPABASE_FUNCTIONS_URL;
      const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      const response = await fetch(`${functionsUrl}/register-trip`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          'Authorization': `Bearer ${anonKey}`,
          'apikey': anonKey || '',
        },
        body: JSON.stringify({
          ...formData,
          city_id: selectedCity,
        }),
      });

      const data = await response.json();

      if (data.success) {
        const cityName = cities.find(c => c.city_id === selectedCity)?.name || "";
        setRegisteredCityName(cityName);
        setRegistrationSuccess(true);
      } else {
        setMessage({ type: "error", text: data.message });
        setShowErrorPopup(true);
      }
    } catch (error) {
      console.error("Failed to register student", error);
      setMessage({ type: "error", text: "Failed to register. Please try again." });
      setShowErrorPopup(true);
    } finally {
      setLoading(false);
    }
  };

  const selectedCityData = cities.find(c => c.city_id === selectedCity);
  const selectedIndex = cities.findIndex(c => c.city_id === selectedCity);

  return (
    <div className="min-h-screen bg-paper text-ink">
      {/* Error popup */}
      <AnimatePresence>
        {showErrorPopup && message && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/30 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-8 border border-oxblood/20"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-oxblood/10 rounded-full flex items-center justify-center text-oxblood">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="font-mono text-[0.65rem] tracking-[0.2em] uppercase text-oxblood mb-1">Denied</p>
                  <h3 className="text-lg font-semibold text-ink mb-2">We couldn&apos;t book that seat</h3>
                  <p className="text-ink-soft mb-6">{message.text}</p>
                  <button
                    onClick={() => { setShowErrorPopup(false); setMessage(null); }}
                    className="w-full bg-oxblood hover:bg-oxblood/90 text-white font-semibold py-3 rounded-xl transition-colors"
                  >
                    Try again
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">

        {/* ── Confirmation ── */}
        {showConfirmation ? (
          <motion.div
            key="confirmation"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="min-h-screen flex items-center justify-center p-4"
          >
            <div className="max-w-2xl w-full">
              <div className="flex items-center justify-between mb-6">
                <span className="font-mono text-xs tracking-[0.2em] uppercase text-ink-soft">Review</span>
                <Link href="/" className={homeButtonClasses}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0h6" />
                  </svg>
                  Home
                </Link>
              </div>

              <div className="bg-white border border-line rounded-3xl shadow-xl overflow-hidden">
                <div className="bg-board text-paper px-6 sm:px-8 py-4 flex items-center justify-between">
                  <span className="font-mono text-[0.65rem] sm:text-xs tracking-[0.25em] uppercase text-paper/80">
                    Boarding pass · OCL 2027
                  </span>
                  <span className="font-mono text-[0.65rem] sm:text-xs tracking-[0.25em] uppercase text-brass-soft">
                    {gateCode(selectedIndex)}
                  </span>
                </div>

                <div className="p-6 sm:p-10">
                  <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-ink mb-2">
                    Confirm your booking
                  </h1>
                  <p className="text-ink-soft mb-8">Check the details below before we issue your pass.</p>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-y-6 gap-x-4 bg-paper rounded-2xl p-6 border border-line bg-security mb-6">
                    <Field label="Passenger" value={`${formData.name} ${formData.surname}`} />
                    <Field label="Student ID" value={formData.student_id} mono />
                    <Field label="Class" value={formData.class} mono />
                    <Field label="Seat no." value={formData.class_no || "—"} mono />
                  </div>

                  <div className="flex items-end justify-between pt-2">
                    <div>
                      <p className="font-mono text-[0.65rem] tracking-[0.2em] uppercase text-ink-soft mb-1">Destination</p>
                      <p className="font-serif text-3xl font-semibold text-ink">{selectedCityData?.name}</p>
                    </div>
                    <span className="font-mono text-[0.65rem] tracking-[0.2em] uppercase text-brass">Confirmed seats</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 p-6 sm:p-8 pt-0">
                  <button
                    onClick={() => setShowConfirmation(false)}
                    className="flex-1 bg-white border border-ink/15 hover:bg-ink/5 text-ink font-semibold py-4 rounded-xl transition-all"
                  >
                    Go back
                  </button>
                  <button
                    onClick={confirmRegistration}
                    disabled={loading}
                    className="flex-1 bg-ink hover:bg-ink/90 disabled:bg-ink/40 text-paper font-semibold py-4 rounded-xl transition-all disabled:cursor-not-allowed"
                  >
                    {loading ? "Issuing pass…" : "Issue boarding pass"}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>

        ) : registrationSuccess ? (

          /* ── Success ── */
          <motion.div
            key="success"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="min-h-screen flex items-center justify-center p-4"
          >
            <div className="max-w-2xl w-full">
              <div className="flex items-center justify-between mb-6">
                <span className="font-mono text-xs tracking-[0.2em] uppercase text-stamp">Issued</span>
                <Link href="/" className={homeButtonClasses}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0h6" />
                  </svg>
                  Home
                </Link>
              </div>

              <div className="bg-white border border-stamp/30 rounded-3xl shadow-xl overflow-hidden">
                <div className="bg-stamp text-paper px-6 sm:px-8 py-4 flex items-center justify-between">
                  <span className="font-mono text-[0.65rem] sm:text-xs tracking-[0.25em] uppercase text-paper/90">
                    Boarding pass issued
                  </span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </div>

                <div className="p-6 sm:p-10">
                  <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-ink mb-2">You&apos;re booked.</h1>
                  <p className="text-ink-soft mb-8">Keep this for your records — show it to your teacher if asked.</p>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-y-6 gap-x-4 bg-paper rounded-2xl p-6 border border-line bg-security mb-6">
                    <Field label="Passenger" value={`${formData.name} ${formData.surname}`} />
                    <Field label="Student ID" value={formData.student_id} mono />
                    <Field label="Class" value={formData.class} mono />
                    <Field label="Seat no." value={formData.class_no || "—"} mono />
                  </div>

                  <div className="pt-2 mb-2">
                    <p className="font-mono text-[0.65rem] tracking-[0.2em] uppercase text-ink-soft mb-1">Destination</p>
                    <p className="font-serif text-3xl font-semibold text-stamp">{registeredCityName}</p>
                  </div>
                </div>

                <div className="p-6 sm:p-8 pt-0">
                  <button
                    onClick={() => {
                      setRegistrationSuccess(false);
                      setStep(1);
                      setFormData({ student_id: "", name: "", surname: "", class: "", class_no: "" });
                      setSelectedCity(null);
                      setMessage(null);
                    }}
                    className="w-full bg-ink hover:bg-ink/90 text-paper font-semibold py-4 rounded-xl transition-all"
                  >
                    Register another passenger
                  </button>
                </div>
              </div>
            </div>
          </motion.div>

        ) : (

          /* ── Main flow (step 1 & 2) ── */
          <motion.div
            key="main"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
              <div className="flex justify-end mb-8">
                <Link href="/" className={homeButtonClasses}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0h6" />
                  </svg>
                  Home
                </Link>
              </div>

              <div className="mb-8 text-center">
                <p className="font-mono text-xs tracking-[0.25em] uppercase text-brass mb-4">
                  Boarding · OCL 2027
                </p>
                <h1 className="font-serif text-4xl sm:text-5xl font-semibold text-ink mb-3 tracking-tight">
                  Reserve your seat
                </h1>
                <p className="text-lg text-ink-soft">
                  Enter your details, then choose a destination.
                </p>
              </div>

              <div className="mb-8">
                <Countdown onAvailabilityChange={setRegistrationOpen} />
              </div>

              <AnimatePresence mode="wait">

                {/* ── Step 1: Passenger details ── */}
                {step === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -30 }}
                    transition={{ duration: 0.25 }}
                  >
                    <div className="bg-white border border-line rounded-3xl p-6 sm:p-8 lg:p-10 shadow-sm">
                      <div className="flex items-center gap-3 mb-8">
                        <span className="font-mono text-xs font-bold text-brass">01</span>
                        <h2 className="font-serif text-2xl font-semibold text-ink">Passenger details</h2>
                      </div>

                      <form onSubmit={handleContinue} className="space-y-5 sm:space-y-6">
                        <div>
                          <label className="block font-mono text-[0.7rem] tracking-[0.15em] uppercase text-ink-soft mb-2">
                            Student ID
                          </label>
                          <input
                            type="tel"
                            inputMode="numeric"
                            pattern="[0-9]{5}"
                            maxLength={5}
                            required
                            disabled={!registrationOpen}
                            value={formData.student_id}
                            onChange={(e) => {
                              const value = e.target.value.replace(/\D/g, "").slice(0, 5);
                              setFormData({ ...formData, student_id: value });
                            }}
                            className="w-full px-4 py-3.5 bg-paper border border-line rounded-xl focus:outline-none focus:ring-2 focus:ring-ink/40 focus:border-transparent text-ink transition-all text-base font-mono tabular-nums placeholder:text-ink/30 disabled:opacity-50 disabled:cursor-not-allowed"
                            placeholder="12345"
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
                          <div>
                            <label className="block font-mono text-[0.7rem] tracking-[0.15em] uppercase text-ink-soft mb-2">
                              First name
                            </label>
                            <input
                              type="text"
                              required
                              disabled={!registrationOpen}
                              value={formData.name}
                              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                              className="w-full px-4 py-3.5 bg-paper border border-line rounded-xl focus:outline-none focus:ring-2 focus:ring-ink/40 focus:border-transparent text-ink transition-all text-base placeholder:text-ink/30 disabled:opacity-50 disabled:cursor-not-allowed"
                              placeholder="Somchai"
                            />
                          </div>
                          <div>
                            <label className="block font-mono text-[0.7rem] tracking-[0.15em] uppercase text-ink-soft mb-2">
                              Last name
                            </label>
                            <input
                              type="text"
                              required
                              disabled={!registrationOpen}
                              value={formData.surname}
                              onChange={(e) => setFormData({ ...formData, surname: e.target.value })}
                              className="w-full px-4 py-3.5 bg-paper border border-line rounded-xl focus:outline-none focus:ring-2 focus:ring-ink/40 focus:border-transparent text-ink transition-all text-base placeholder:text-ink/30 disabled:opacity-50 disabled:cursor-not-allowed"
                              placeholder="Rakna"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
                          <div>
                            <label className="block font-mono text-[0.7rem] tracking-[0.15em] uppercase text-ink-soft mb-2">
                              Class
                            </label>
                            <div className="relative">
                              <select
                                required
                                disabled={!registrationOpen}
                                value={formData.class}
                                onChange={(e) => setFormData({ ...formData, class: e.target.value })}
                                className="w-full px-4 py-3.5 bg-paper border border-line rounded-xl focus:outline-none focus:ring-2 focus:ring-ink/40 focus:border-transparent text-ink transition-all text-base appearance-none disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <option value="" disabled>Select class</option>
                                <option value="1/12">1/12</option>
                                <option value="1/13">1/13</option>
                                <option value="2/12">2/12</option>
                                <option value="2/13">2/13</option>
                                <option value="3/11">3/11</option>
                                <option value="3/12">3/12</option>
                                <option value="4/12">4/12</option>
                                <option value="4/13">4/13</option>
                                <option value="5/12">5/12</option>
                                <option value="5/13">5/13</option>
                                <option value="6/12">6/12</option>
                                <option value="6/13">6/13</option>
                              </select>
                              <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-ink-soft">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                              </div>
                            </div>
                          </div>
                          <div>
                            <label className="block font-mono text-[0.7rem] tracking-[0.15em] uppercase text-ink-soft mb-2">
                              Class number
                            </label>
                            <input
                              type="tel"
                              inputMode="numeric"
                              pattern="[0-9]*"
                              disabled={!registrationOpen}
                              value={formData.class_no}
                              onChange={(e) => setFormData({ ...formData, class_no: e.target.value })}
                              className="w-full px-4 py-3.5 bg-paper border border-line rounded-xl focus:outline-none focus:ring-2 focus:ring-ink/40 focus:border-transparent text-ink transition-all text-base font-mono tabular-nums placeholder:text-ink/30 disabled:opacity-50 disabled:cursor-not-allowed"
                              placeholder="33"
                            />
                          </div>
                        </div>

                        <button
                          type="submit"
                          disabled={!registrationOpen}
                          className="w-full bg-ink hover:bg-ink/90 active:scale-[0.99] disabled:bg-ink/15 disabled:text-ink/40 text-paper font-semibold py-4 px-6 rounded-xl transition-all disabled:cursor-not-allowed text-lg shadow-lg hover:shadow-xl mt-2"
                        >
                          {!registrationOpen ? "Boarding not open" : "Continue to destination →"}
                        </button>
                      </form>
                    </div>
                  </motion.div>
                )}

                {/* ── Step 2: Choose destination ── */}
                {step === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -30 }}
                    transition={{ duration: 0.25 }}
                  >
                    {/* Passenger summary strip */}
                    <div className="flex items-center justify-between bg-white border border-line rounded-2xl px-5 py-3.5 mb-6 shadow-sm">
                      <div className="flex items-center gap-4 min-w-0">
                        <span className="font-mono text-[0.6rem] tracking-[0.2em] uppercase text-brass shrink-0">Passenger</span>
                        <span className="font-semibold text-ink truncate">{formData.name} {formData.surname}</span>
                        <span className="font-mono text-xs text-ink-soft tabular-nums hidden sm:block">{formData.student_id}</span>
                        <span className="font-mono text-xs text-ink-soft hidden sm:block">{formData.class}</span>
                      </div>
                      <button
                        onClick={() => setStep(1)}
                        className="font-mono text-[0.65rem] tracking-[0.15em] uppercase text-ink-soft hover:text-ink transition-colors shrink-0 ml-4"
                      >
                        ← Edit
                      </button>
                    </div>

                    <div className="bg-white border border-line rounded-3xl p-6 sm:p-8 lg:p-10 shadow-sm">
                      <div className="flex items-center gap-3 mb-6">
                        <span className="font-mono text-xs font-bold text-brass">02</span>
                        <h2 className="font-serif text-2xl font-semibold text-ink">Choose your destination</h2>
                      </div>

                      <p className="font-mono text-[0.65rem] tracking-[0.1em] uppercase text-ink-soft mb-6">
                        Tap a pin to choose where you&apos;ll fly.
                      </p>

                      <ThailandMap
                        cities={cities}
                        selectedCity={selectedCity}
                        onSelect={setSelectedCity}
                        registrationOpen={registrationOpen}
                        mapClassName="max-w-[380px]"
                      />

                      {/* Selected destination cabin */}
                      <div className="mt-6 mb-8">
                        {selectedCityData ? (
                          <div className="relative flex items-center gap-4 sm:gap-5 rounded-2xl border border-brass/40 bg-brass/5 bg-security p-4 sm:p-5">
                            <div className="min-w-0 flex-1">
                              <p className="font-mono text-[0.6rem] tracking-[0.2em] uppercase text-ink-soft mb-1">
                                {gateCode(selectedIndex)} · Your cabin
                              </p>
                              <h3 className="font-serif text-2xl sm:text-3xl font-semibold text-brass mb-1">
                                {selectedCityData.name}
                              </h3>
                              <p className="font-mono text-[0.65rem] tracking-[0.1em] uppercase text-ink-soft tabular-nums">
                                {selectedCityData.current_count} / {selectedCityData.quota} taken · {selectedCityData.remaining} left
                              </p>
                            </div>
                            <AirplaneSeatMap
                              total={selectedCityData.quota}
                              taken={selectedCityData.current_count}
                              variant="selected"
                              className="w-[116px] sm:w-[136px] shrink-0 h-auto"
                            />
                            <span className="stamp stamp-in text-brass absolute -top-3 right-5">Selected</span>
                          </div>
                        ) : (
                          <div className="rounded-2xl border border-dashed border-line p-6 text-center font-mono text-[0.7rem] tracking-[0.15em] uppercase text-ink-soft">
                            Tap a destination to preview its cabin
                          </div>
                        )}
                      </div>

                      <button
                        onClick={handleSubmit}
                        disabled={loading || !selectedCity}
                        className="w-full bg-ink hover:bg-ink/90 active:scale-[0.99] disabled:bg-ink/15 disabled:text-ink/40 text-paper font-semibold py-4 px-6 rounded-xl transition-all disabled:cursor-not-allowed text-lg shadow-lg hover:shadow-xl"
                      >
                        {loading ? "Working…" : !selectedCity ? "Select a destination" : "Review & confirm"}
                      </button>
                    </div>
                  </motion.div>
                )}

              </AnimatePresence>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
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
