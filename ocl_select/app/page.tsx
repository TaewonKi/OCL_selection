"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { useState } from "react";
import { Countdown } from "./components/Countdown";

const Scene = dynamic(() => import("./components/Scene"), { ssr: false });

export default function LandingPage() {
  const [registrationOpen, setRegistrationOpen] = useState(false);
  return (
    <div className="relative min-h-screen bg-gradient-to-b from-blue-50 via-white to-blue-50 text-slate-900 overflow-hidden flex flex-col">
      <Scene />
      
      {/* Hero Section */}
      <div className="flex-grow flex items-center justify-center z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <span className="inline-block py-1 px-3 rounded-full bg-blue-100 text-blue-700 text-sm font-semibold mb-6 tracking-wide uppercase">
              Explore The World
            </span>
            <h1 className="text-5xl sm:text-6xl lg:text-8xl font-extrabold mb-8 tracking-tight text-slate-900">
              Outside Classroom <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                Learning 2026
              </span>
            </h1>
          </motion.div>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="text-xl sm:text-2xl text-slate-600 max-w-3xl mx-auto font-medium leading-relaxed mb-12"
          >
            Expand your horizons beyond the classroom. Choose your destination and embark on an unforgettable journey of discovery.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
            className="mb-12"
          >
            <Countdown className="mx-auto max-w-2xl" onAvailabilityChange={setRegistrationOpen} />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            {registrationOpen ? (
              <Link 
                href="/register"
                className="group relative inline-flex items-center justify-center px-8 py-4 font-bold text-white transition-all duration-200 bg-blue-600 font-pj rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 hover:bg-blue-700 hover:shadow-lg active:scale-95"
              >
                <span className="relative text-lg">Start Registration</span>
                <svg className="relative w-5 h-5 ml-2 transition-transform duration-200 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            ) : (
              <button 
                disabled
                className="relative inline-flex items-center justify-center px-8 py-4 font-bold text-slate-400 transition-all duration-200 bg-slate-100 font-pj rounded-full cursor-not-allowed opacity-60"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span className="relative text-lg">Registration Opens Soon</span>
              </button>
            )}
            
            <Link 
              href="/teacher"
              className="inline-flex items-center justify-center px-8 py-4 font-bold text-slate-700 transition-all duration-200 bg-white border border-slate-200 rounded-full hover:bg-slate-50 hover:text-blue-600 hover:border-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-200 active:scale-95 shadow-sm"
            >
              Teacher Portal
            </Link>
          </motion.div>
        </div>
      </div>
      
      <footer className="relative z-10 py-6 text-center text-slate-500 text-sm">
        © 2025 OCL Selection. All rights reserved.
      </footer>
    </div>
  );
}
