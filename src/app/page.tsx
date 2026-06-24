"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useState } from "react";
import { Countdown } from "./components/Countdown";
import Scene from "./components/Scene";

export default function LandingPage() {
  const [registrationOpen, setRegistrationOpen] = useState(false);

  return (
    <div className="relative min-h-screen text-ink overflow-hidden flex flex-col">
      {/* Animated 3D background */}
      <Scene />
      {/* Paper wash + concourse texture so the globe stays a quiet backdrop */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-paper/75 via-paper/55 to-paper/80" />
      <div className="absolute inset-0 -z-10 bg-security opacity-[0.35]" aria-hidden="true" />

      <div className="flex-grow flex items-center justify-center z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-16 sm:py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            {/* Passport line eyebrow */}
            <div className="flex items-center justify-center gap-3 mb-7">
              <span className="hidden sm:block h-px w-8 bg-brass/50" aria-hidden="true" />
              <span className="font-mono text-[0.6rem] sm:text-xs tracking-[0.25em] text-brass uppercase">
                International Program · Est. 2027
              </span>
              <span className="hidden sm:block h-px w-8 bg-brass/50" aria-hidden="true" />
            </div>

            <h1 className="title-float font-serif text-5xl sm:text-6xl lg:text-7xl font-semibold leading-[0.95] tracking-tight text-ink mb-7">
              Outside Classroom
              <br />
              <span className="italic text-brass">Learning 2027</span>
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="text-lg sm:text-xl text-ink-soft max-w-2xl mx-auto leading-relaxed mb-12"
          >
            Twelve cities. One term abroad. Choose a destination, claim your seat,
            and learn the world first-hand alongside your year group.
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
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4"
          >
            {registrationOpen ? (
              <Link
                href="/register"
                className="group inline-flex items-center justify-center gap-2 px-7 py-4 font-semibold text-paper bg-ink rounded-xl shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-brass focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
              >
                <span>Claim your seat</span>
                <svg className="w-5 h-5 transition-transform duration-200 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            ) : (
              <button
                disabled
                aria-disabled="true"
                className="inline-flex items-center justify-center gap-2 px-7 py-4 font-semibold text-ink/40 bg-ink/5 border border-line rounded-xl cursor-not-allowed"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span>Boarding not yet open</span>
              </button>
            )}

            <Link
              href="/check"
              className="inline-flex items-center justify-center px-7 py-4 font-semibold text-ink bg-paper/70 border border-ink/15 rounded-xl transition-all duration-200 hover:bg-ink/5 active:scale-[0.99] focus:outline-none focus-visible:ring-2 focus-visible:ring-ink/30 focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
            >
              Check my booking
            </Link>

            <Link
              href="/teacher"
              className="inline-flex items-center justify-center px-7 py-4 font-semibold text-ink bg-paper/70 border border-ink/15 rounded-xl transition-all duration-200 hover:bg-ink/5 active:scale-[0.99] focus:outline-none focus-visible:ring-2 focus-visible:ring-ink/30 focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
            >
              Portal
            </Link>
          </motion.div>
        </div>
      </div>

      <footer className="relative z-10 py-6 text-center font-mono text-[0.65rem] tracking-[0.2em] text-ink-soft/70 uppercase">
        © {new Date().getFullYear()} Outside Classroom Learning
      </footer>
    </div>
  );
}
