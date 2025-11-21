"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

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

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedCity) {
      setMessage({ type: "error", text: "Please select a city" });
      setShowErrorPopup(true);
      return;
    }

    setLoading(true);
    setMessage(null);
    setShowErrorPopup(false);

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
      setMessage({ type: "error", text: "Failed to register. Please try again." });
      setShowErrorPopup(true);
    } finally {
      setLoading(false);
    }
  };

  // Success page
  if (registrationSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-400 to-green-600 dark:from-green-700 dark:to-green-900 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-white dark:bg-gray-900 rounded-3xl shadow-2xl p-8 sm:p-12">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 dark:bg-green-900/50 rounded-full mb-6">
              <svg className="w-10 h-10 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-3">
              Registration Successful!
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Your trip has been confirmed
            </p>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-6 sm:p-8 space-y-4 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Registration Details</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Student ID</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">{formData.student_id}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Name</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">{formData.name} {formData.surname}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Class</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">{formData.class}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Class Number</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">{formData.class_no}</p>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Destination</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{registeredCityName}</p>
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
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-4 rounded-xl transition-all"
          >
            Register Another Student
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      {/* Error Popup */}
      {showErrorPopup && message && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-8 animate-[scale-in_0.2s_ease-out]">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Registration Error
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  {message.text}
                </p>
                <button
                  onClick={() => {
                    setShowErrorPopup(false);
                    setMessage(null);
                    fetchCityStatus();
                  }}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3 rounded-xl transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="mb-8 sm:mb-12">
            <h1 className="text-3xl sm:text-4xl font-bold text-blue-600 dark:text-blue-400 mb-3">Trip Registration</h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">Select your destination and fill in your details below.</p>
        </div>

        {/* Two Column Layout for iPad Landscape */}
        <div className="flex flex-col md:flex-row gap-8 lg:gap-12">
          {/* Registration Form - Left Side */}
          <div className="flex-1">
            <div className="bg-white dark:bg-black border border-blue-100 dark:border-blue-900 rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-10 sticky top-8 shadow-sm">
              <h2 className="text-2xl sm:text-3xl font-semibold text-blue-600 dark:text-blue-400 mb-6 sm:mb-8">
                Student Information
              </h2>

              <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                    Student ID
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.student_id}
                    onChange={(e) =>
                      setFormData({ ...formData, student_id: e.target.value })
                    }
                    className="w-full px-4 py-3 sm:py-3.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white transition-all text-base"
                    placeholder="12345"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                      First Name
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full px-4 py-3 sm:py-3.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white transition-all text-base"
                      placeholder="Somchai"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                      Last Name
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.surname}
                      onChange={(e) =>
                        setFormData({ ...formData, surname: e.target.value })
                      }
                      className="w-full px-4 py-3 sm:py-3.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white transition-all text-base"
                      placeholder="Rakna"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                      Class
                    </label>
                    <input
                      type="text"
                      value={formData.class}
                      onChange={(e) =>
                        setFormData({ ...formData, class: e.target.value })
                      }
                      className="w-full px-4 py-3 sm:py-3.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white transition-all text-base"
                      placeholder="1/12"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                      Class Number
                    </label>
                    <input
                      type="text"
                      value={formData.class_no}
                      onChange={(e) =>
                        setFormData({ ...formData, class_no: e.target.value })
                      }
                      className="w-full px-4 py-3 sm:py-3.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white transition-all text-base"
                      placeholder="33"
                    />
                  </div>
                </div>
              </form>
            </div>
          </div>

          {/* City Selection - Right Side */}
          <div className="flex-1">
            <div className="bg-white dark:bg-black border border-blue-100 dark:border-blue-900 rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-10 shadow-sm">
              <h3 className="text-xl sm:text-2xl font-semibold text-blue-600 dark:text-blue-400 mb-4 sm:mb-6">
                Choose Your Destination
              </h3>
              
              <div className="grid grid-cols-1 gap-3 sm:gap-4 mb-6 sm:mb-8">
                {cities.map((city) => (
                  <button
                    key={city.city_id}
                    onClick={() => city.remaining > 0 && setSelectedCity(city.city_id)}
                    disabled={city.remaining === 0}
                    className={`
                      relative p-5 sm:p-6 rounded-2xl border transition-all text-left
                      ${
                        city.remaining === 0
                          ? "bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800 opacity-40 cursor-not-allowed"
                          : selectedCity === city.city_id
                          ? "bg-blue-500 border-blue-500 text-white shadow-lg scale-[1.02]"
                          : "bg-white dark:bg-black border-blue-100 dark:border-blue-900 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md active:scale-[0.98]"
                      }
                    `}
                  >
                    <div className="flex justify-between items-start mb-4 sm:mb-6">
                      <h3 className="text-xl sm:text-2xl font-semibold">{city.name}</h3>
                      {selectedCity === city.city_id && (
                        <svg className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <div className="space-y-2 sm:space-y-3 text-sm">
                      <div className="flex justify-between items-center">
                        <span className={selectedCity === city.city_id ? "text-blue-100" : "text-gray-500 dark:text-gray-400"}>
                          Available
                        </span>
                        <span className="text-xl sm:text-2xl font-semibold tabular-nums">
                          {city.remaining}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className={selectedCity === city.city_id ? "text-blue-100" : "text-gray-400 dark:text-gray-500"}>
                          {city.current_count} / {city.quota}
                        </span>
                      </div>
                    </div>
                    {city.remaining === 0 && (
                      <div className="absolute top-3 sm:top-4 right-3 sm:right-4 text-xs font-medium text-gray-400">
                        Full
                      </div>
                    )}
                  </button>
                ))}
              </div>

              <button
                onClick={handleSubmit}
                disabled={loading || !selectedCity}
                className="w-full bg-blue-500 hover:bg-blue-600 active:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 dark:disabled:bg-gray-800 dark:disabled:text-gray-600 text-white font-semibold py-3.5 sm:py-4 px-6 rounded-xl transition-all disabled:cursor-not-allowed text-base active:scale-[0.98]"
              >
                {loading ? "Registering..." : "Continue"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
