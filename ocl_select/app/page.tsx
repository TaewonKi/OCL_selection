"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";

const Scene = dynamic(() => import("./components/Scene"), { ssr: false });

export default function LandingPage() {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950 text-white overflow-hidden">
      <Scene />
      
      {/* Navigation Bar */}
      <motion.nav 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-20 px-4 sm:px-6 lg:px-8 py-4"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-xl">🌍</span>
            <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-400">
              OCL 2026
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link 
              href="/teacher"
              className="hidden sm:inline-flex items-center px-3 py-1.5 text-xs font-medium text-blue-200 hover:text-white transition-colors"
            >
              Teacher Login
            </Link>
            <Link 
              href="/register"
              className="inline-flex items-center px-4 py-1.5 text-xs font-semibold bg-blue-500/20 backdrop-blur-sm border border-blue-400/30 rounded-full hover:bg-blue-500/30 transition-all"
            >
              Register
            </Link>
          </div>
        </div>
      </motion.nav>
      
      {/* Hero Section */}
      <div className="relative z-10 flex items-start min-h-screen w-full pt-40">
        <div className="w-full lg:w-1/2 px-8 sm:px-12 lg:px-20 py-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <span className="inline-flex items-center gap-1.5 py-1 px-2.5 rounded-full bg-gradient-to-r from-blue-500/10 to-cyan-500/10 backdrop-blur-md border border-blue-400/20 text-blue-200 text-[10px] font-semibold mb-4 tracking-wide">
              <span className="relative flex h-1 w-1">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1 w-1 bg-cyan-500"></span>
              </span>
              2026 APPLICATIONS OPEN
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black mb-6 tracking-tight">
              <span className="block text-white drop-shadow-2xl mb-2">
                Outside Classroom
              </span>
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-500 animate-gradient">
                Learning 2026
              </span>
            </h1>
          </motion.div>
          
          <motion.p 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="text-lg sm:text-xl text-blue-100/80 leading-relaxed mb-8 max-w-lg"
          >
            Expand your horizons beyond the classroom. Choose your destination and embark on an
            <span className="text-cyan-300 font-semibold"> unforgettable journey </span>
            of discovery around the globe.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row items-start gap-4"
          >
            <Link 
              href="/register"
              className="group relative inline-flex items-center justify-center px-8 py-4 font-bold text-white text-lg transition-all duration-300 bg-gradient-to-r from-blue-500 via-blue-600 to-cyan-500 rounded-full focus:outline-none focus:ring-4 focus:ring-blue-500/50 hover:shadow-2xl hover:shadow-blue-500/50 hover:scale-105 active:scale-100 overflow-hidden"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
              <span className="relative flex items-center gap-1.5">
                Start Your Journey
                <svg className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
            </Link>
            
            <Link 
              href="/teacher"
              className="inline-flex items-center justify-center px-8 py-4 font-semibold text-white text-lg transition-all duration-300 bg-white/5 backdrop-blur-md border-2 border-white/20 rounded-full hover:bg-white/10 hover:border-white/40 focus:outline-none focus:ring-4 focus:ring-white/20 hover:scale-105 active:scale-100"
            >
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Teacher Portal
              </span>
            </Link>
          </motion.div>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="relative z-10 py-6 border-t border-white/10 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center space-x-2">
              <span className="text-base">🌍</span>
              <span className="text-xs text-blue-200/60">
                © 2025 OCL Selection. All rights reserved.
              </span>
            </div>
            <div className="flex items-center gap-4 text-xs text-blue-200/60">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-white transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
