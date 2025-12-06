"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";

interface City {
  city_id: string;
  name: string;
  quota: number;
  current_count: number;
  remaining: number;
}

interface FormData {
  student_id: string;
  name: string;
  surname: string;
  class: string;
  class_no: string;
}

export default function RegisterPage() {
  const [cities, setCities] = useState<City[]>([]);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
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
  const homeButtonClasses = "inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-700 border border-slate-200 rounded-full hover:bg-slate-50 hover:text-blue-600 transition-all shadow-sm";

  // Auto-hide error popup after 5 seconds
  useEffect(() => {
    if (showErrorPopup) {
      const timer = setTimeout(() => {
        setShowErrorPopup(false);
        setMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showErrorPopup]);

  // Fetch city status
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

  // Subscribe to real-time updates
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

  // Handle form submission - show confirmation
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.student_id.length !== 5) {
      setMessage({ type: "error", text: "Student ID must be exactly 5 digits" });
      setShowErrorPopup(true);
      return;
    }
    
    if (!selectedCity) {
      setMessage({ type: "error", text: "Please select a city" });
      setShowErrorPopup(true);
      return;
    }

    setShowConfirmation(true);
  };

  // Handle actual registration after confirmation
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

  return (
    <div className={`min-h-screen transition-colors duration-500 ${registrationSuccess ? "bg-gradient-to-b from-green-50 via-white to-green-50" : "bg-gradient-to-b from-blue-50 via-white to-blue-50"} text-slate-900`}>
      <AnimatePresence>
        {showErrorPopup && message && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-8 border border-red-100"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-red-50 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">
                    Registration Error
                  </h3>
                  <p className="text-slate-600 mb-6">
                    {message.text}
                  </p>
                  <button
                    onClick={() => {
                      setShowErrorPopup(false);
                      setMessage(null);
                      fetchCityStatus();
                    }}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3 rounded-xl transition-colors shadow-sm"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {showConfirmation ? (
          <motion.div
            key="confirmation"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="min-h-screen flex items-center justify-center p-4"
          >
            <div className="max-w-2xl w-full bg-white border border-slate-200 rounded-3xl shadow-xl p-8 sm:p-12">
              <div className="flex justify-end mb-6">
                <Link href="/" className={homeButtonClasses}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0h6" />
                  </svg>
                  Home
                </Link>
              </div>
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-50 rounded-full mb-6">
                  <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-3">
                  Confirm Your Information
                </h1>
                <p className="text-lg text-slate-600">
                  Please review your details before submitting
                </p>
              </div>

              <div className="bg-slate-50 rounded-2xl p-6 sm:p-8 space-y-4 mb-8 border border-slate-100">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Student ID</p>
                    <p className="text-lg font-semibold text-slate-900">{formData.student_id}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Name</p>
                    <p className="text-lg font-semibold text-slate-900">{formData.name} {formData.surname}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Class</p>
                    <p className="text-lg font-semibold text-slate-900">{formData.class}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Class Number</p>
                    <p className="text-lg font-semibold text-slate-900">{formData.class_no}</p>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-200">
                  <p className="text-sm text-slate-500 mb-1">Destination</p>
                  <p className="text-2xl font-bold text-blue-600">{selectedCityData?.name}</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => setShowConfirmation(false)}
                  className="flex-1 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold py-4 rounded-full transition-all shadow-sm"
                >
                  Go Back
                </button>
                <button
                  onClick={confirmRegistration}
                  disabled={loading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold py-4 rounded-full transition-all disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                >
                  {loading ? "Registering..." : "Confirm & Register"}
                </button>
              </div>
            </div>
          </motion.div>
        ) : registrationSuccess ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="min-h-screen flex items-center justify-center p-4"
          >
            <div className="max-w-2xl w-full bg-white border border-green-100 rounded-3xl shadow-xl p-8 sm:p-12">
              <div className="flex justify-end mb-6">
                <Link href="/" className={homeButtonClasses}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0h6" />
                  </svg>
                  Home
                </Link>
              </div>
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-green-50 rounded-full mb-6">
                  <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-3">
                  Registration Successful!
                </h1>
                <p className="text-lg text-slate-600">
                  Your trip has been confirmed
                </p>
              </div>

              <div className="bg-slate-50 rounded-2xl p-6 sm:p-8 space-y-4 mb-8 border border-slate-100">
                <h2 className="text-xl font-semibold text-slate-900 mb-6">Registration Details</h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Student ID</p>
                    <p className="text-lg font-semibold text-slate-900">{formData.student_id}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Name</p>
                    <p className="text-lg font-semibold text-slate-900">{formData.name} {formData.surname}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Class</p>
                    <p className="text-lg font-semibold text-slate-900">{formData.class}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Class Number</p>
                    <p className="text-lg font-semibold text-slate-900">{formData.class_no}</p>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-200">
                  <p className="text-sm text-slate-500 mb-1">Destination</p>
                  <p className="text-2xl font-bold text-green-600">{registeredCityName}</p>
                </div>
              </div>

              <button
                onClick={() => {
                  setRegistrationSuccess(false);
                  setFormData({
                    student_id: "",
                    name: "",
                    surname: "",
                    class: "",
                    class_no: "",
                  });
                  setSelectedCity(null);
                  setMessage(null);
                  fetchCityStatus();
                }}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-full transition-all shadow-md hover:shadow-lg"
              >
                Register Another Student
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="main"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
              <div className="flex justify-end mb-6">
                <Link href="/" className={homeButtonClasses}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0h6" />
                  </svg>
                  Home
                </Link>
              </div>
              <div className="mb-8 sm:mb-12 text-center sm:text-left">
                  <span className="inline-block py-1 px-3 rounded-full bg-blue-100 text-blue-700 text-sm font-semibold mb-4 tracking-wide uppercase">
                    Student Registration
                  </span>
                  <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">
                    Join the <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Adventure</span>
                  </h1>
                  <p className="text-lg text-slate-600 max-w-2xl">Select your destination and fill in your details below to secure your spot.</p>
              </div>

              {/* Two Column Layout for iPad Landscape */}
              <div className="flex flex-col md:flex-row gap-8 lg:gap-12">
                {/* Registration Form - Left Side */}
                <div className="flex-1">
                  <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 lg:p-10 sticky top-8 shadow-sm">
                    <h2 className="text-2xl font-bold text-slate-900 mb-6 sm:mb-8 flex items-center gap-3">
                      <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 text-sm font-bold">1</span>
                      Student Information
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          Student ID
                        </label>
                        <input
                          type="tel"
                          inputMode="numeric"
                          pattern="[0-9]{5}"
                          maxLength={5}
                          required
                          value={formData.student_id}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, '').slice(0, 5);
                            setFormData({ ...formData, student_id: value });
                          }}
                          className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 transition-all text-base placeholder:text-slate-400"
                          placeholder="12345"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-2">
                            First Name (In Thai)
                          </label>
                          <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) =>
                              setFormData({ ...formData, name: e.target.value })
                            }
                            className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 transition-all text-base placeholder:text-slate-400"
                            placeholder="Somchai"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Last Name (In Thai)
                          </label>
                          <input
                            type="text"
                            required
                            value={formData.surname}
                            onChange={(e) =>
                              setFormData({ ...formData, surname: e.target.value })
                            }
                            className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 transition-all text-base placeholder:text-slate-400"
                            placeholder="Rakna"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Class
                          </label>
                          <div className="relative">
                            <select
                              required
                              value={formData.class}
                              onChange={(e) =>
                                setFormData({ ...formData, class: e.target.value })
                              }
                              className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 transition-all text-base appearance-none"
                            >
                              <option value="" disabled>Select Class</option>
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
                            <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-slate-500">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </div>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Class Number
                          </label>
                          <input
                            type="tel"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            value={formData.class_no}
                            onChange={(e) =>
                              setFormData({ ...formData, class_no: e.target.value })
                            }
                            className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 transition-all text-base placeholder:text-slate-400"
                            placeholder="33"
                          />
                        </div>
                      </div>
                    </form>
                  </div>
                </div>

                {/* City Selection - Right Side */}
                <div className="flex-1">
                  <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 lg:p-10 shadow-sm">
                    <h3 className="text-2xl font-bold text-slate-900 mb-6 sm:mb-8 flex items-center gap-3">
                      <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 text-sm font-bold">2</span>
                      Choose Your Destination
                    </h3>
                    
                    <div className="grid grid-cols-1 gap-3 sm:gap-4 mb-6 sm:mb-8">
                      {cities.map((city) => (
                        <button
                          key={city.city_id}
                          onClick={() => city.remaining > 0 && setSelectedCity(city.city_id)}
                          disabled={city.remaining === 0}
                          className={`
                            relative p-5 sm:p-6 rounded-2xl border transition-all text-left group
                            ${
                              city.remaining === 0
                                ? "bg-slate-50 border-slate-200 opacity-60 cursor-not-allowed"
                                : selectedCity === city.city_id
                                ? "bg-blue-50 border-blue-500 ring-1 ring-blue-500 shadow-md"
                                : "bg-white border-slate-200 hover:border-blue-300 hover:shadow-md hover:bg-blue-50/30"
                            }
                          `}
                        >
                          <div className="flex justify-between items-start mb-4 sm:mb-6">
                            <h3 className={`text-xl sm:text-2xl font-bold ${selectedCity === city.city_id ? "text-blue-700" : "text-slate-900"}`}>
                              {city.name}
                            </h3>
                            {selectedCity === city.city_id && (
                              <div className="bg-blue-600 text-white rounded-full p-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                              </div>
                            )}
                          </div>
                          <div className="space-y-2 sm:space-y-3 text-sm">
                            <div className="flex justify-between items-center">
                              <span className={selectedCity === city.city_id ? "text-blue-700 font-medium" : "text-slate-500"}>
                                Available Seats
                              </span>
                              <span className={`text-xl sm:text-2xl font-bold tabular-nums ${selectedCity === city.city_id ? "text-blue-700" : "text-slate-900"}`}>
                                {city.remaining}
                              </span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                              <div 
                                className={`h-full rounded-full transition-all duration-500 ${selectedCity === city.city_id ? "bg-blue-600" : "bg-slate-300"}`}
                                style={{ width: `${(city.current_count / city.quota) * 100}%` }}
                              />
                            </div>
                            <div className="flex justify-between items-center text-xs text-slate-400 mt-1">
                              <span>{city.current_count} registered</span>
                              <span>{city.quota} total</span>
                            </div>
                          </div>
                          {city.remaining === 0 && (
                            <div className="absolute top-3 sm:top-4 right-3 sm:right-4 px-2 py-1 bg-slate-200 rounded text-xs font-bold text-slate-500 uppercase tracking-wide">
                              Full
                            </div>
                          )}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={handleSubmit}
                      disabled={loading || !selectedCity}
                      className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold py-4 px-6 rounded-full transition-all disabled:cursor-not-allowed text-lg shadow-lg hover:shadow-xl active:scale-[0.98]"
                    >
                      {loading ? "Registering..." : "Continue"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
