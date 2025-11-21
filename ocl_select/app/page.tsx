import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-black flex flex-col">
      {/* Hero Section */}
      <div className="flex-grow flex items-center justify-center bg-blue-600 dark:bg-blue-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-20">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-8 tracking-tight">
            Outside Classroom Learning 2026
          </h1>
          <p className="text-xl sm:text-2xl text-blue-100 max-w-3xl mx-auto font-light leading-relaxed mb-12">
            Expand your horizons beyond the classroom. Choose your destination and embark on an unforgettable journey of discovery.
          </p>
          
          <Link 
            href="/register"
            className="inline-block bg-white text-blue-600 font-bold text-xl px-10 py-4 rounded-full shadow-lg hover:bg-blue-50 transition-all transform hover:scale-105 active:scale-95"
          >
            Start Registration
          </Link>
        </div>
      </div>
      
      <footer className="bg-white dark:bg-black py-6 text-center text-gray-500 dark:text-gray-400 text-sm">
        © 2025 OCL Selection. All rights reserved.
      </footer>
    </div>
  );
}
