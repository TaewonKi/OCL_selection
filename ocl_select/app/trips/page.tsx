"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function TripsPage() {
  const trips = [
    {
      id: 1,
      emoji: "🏞️",
      title: "Khao Kho - Phu Tub Berk - Phu Ruea",
      subtitle: "Northern Thailand's Cool Climate & Mountain Scenery",
      duration: "5 Days/4 Nights",
      date: "January 19 - 23, 2026",
      provinces: "Phuket → Bangkok → Phetchabun → Loei → Saraburi",
      highlights: [
        "Wat Phra That Pha Son Kaew: A breathtaking temple in Khao Kho known for its vibrant 5 million mosaic tiles and five majestic white Buddha statues",
        "Phu Tub Berk: Summit the highest point in Phetchabun to experience cool weather and sea of fog views",
        "Si Thep Historic Park: Explore Thailand's 7th UNESCO World Heritage Site from the Dvaravati and Khmer eras",
        "Bung Sampao Floating Market: Experience local river life and commerce near Saraburi/Ayutthaya"
      ]
    },
    {
      id: 2,
      emoji: "🏛️",
      title: "World Heritage Charm of Sukhothai",
      subtitle: "Ancient Thai History & Traditional Culture",
      duration: "Flexible Duration",
      date: "January 19 - 23, 2026",
      provinces: "Bangkok → Sukhothai",
      highlights: [
        "Sukhothai & Si Satchanalai Historical Parks: Cycle among the glorious ruins of the first Thai capital",
        "Traditional Thai Living: Stay in a traditional Thai-style house for an immersive cultural experience",
        "Hands-on Workshops: Learn cooking local food and crafting Krathong from natural materials",
        "Morning Alms Offering: Participate in a meaningful Buddhist tradition with local monks"
      ]
    },
    {
      id: 3,
      emoji: "🌸",
      title: "Hokkaido Flower Park Khao Yai",
      subtitle: "Nature, Agriculture, Art & Modern Entertainment",
      duration: "5 Days/4 Nights",
      date: "January 19 - 23, 2026",
      provinces: "Saraburi → Nakhon Ratchasima (Khao Yai) → Bangkok",
      highlights: [
        "Hokkaido Flower Park Khao Yai: Explore expansive flower fields with Japanese ambiance during peak bloom season",
        "Fah Sai Farm Chokchai: Learn about integrated agriculture at a large modern farm",
        "Khao Yai Art Museum: View contemporary art in a beautiful natural setting",
        "Prasat Mueang Sing: Visit a historical Khmer temple in Kanchanaburi",
        "Korat Zoo & Chocolate Ville: Balance education with relaxation and entertainment"
      ]
    },
    {
      id: 4,
      emoji: "🛶",
      title: "Exploring Nan City",
      subtitle: "Lanna Heritage, Local Craftsmanship & Nature",
      duration: "5 Days/4 Nights",
      date: "January 19 - 23, 2026",
      provinces: "Phuket → Bangkok → Nan",
      highlights: [
        "Nan's Iconic Temples: Visit Wat Phumin (famous for 'Whispering Lovers' mural), Wat Phra That Chae Haeng, and Wat Phra That Khao Noi",
        "Si Nan National Park & Sao Din Na Noi: Witness unique soil pillars and scenic river views",
        "Lao-style Bike Workshop & Weaving Group: Engage with local crafts and traditional skills",
        "Nan National Museum: Learn about the history of the former Nan Kingdom"
      ]
    },
    {
      id: 5,
      emoji: "⛰️",
      title: "Chiang Mai - Chiang Rai in the Cold Season",
      subtitle: "Northern Mountain Views, Royal Projects & Lanna Culture",
      duration: "5 Days/4 Nights",
      date: "January 19 - 23, 2026",
      provinces: "Phuket → Chiang Mai → Chiang Rai → Phuket",
      highlights: [
        "Doi Inthanon Summit: Reach Thailand's highest peak and explore the Royal Agricultural Research Center",
        "Doi Tung Royal Villa & Projects: Visit Princess Mother's residence in Lanna-Swiss chalet style and Mae Fah Luang Garden",
        "Mae Kampong Village: Experience a charming traditional mountain village community",
        "Chiang Rai's Art & Nature: Visit Rai Boonrod Farm (Singha Park) and the Cultural and Artistic Learning Center"
      ]
    },
    {
      id: 6,
      emoji: "🏝️",
      title: "The Charm of the Old Town - Story of Phuket",
      subtitle: "Phuket's Local History, Culinary Arts & Community Tourism",
      duration: "4 Days/3 Nights",
      date: "January 19 - 22, 2026",
      provinces: "Phuket (Local Trip)",
      highlights: [
        "Phuket Art Village: Meet local artists and see contemporary work focused on recycled and upcycled art",
        "Inthara Farm & Chalong Bay Rum Distillery: Learn about island agriculture, mangrove planting, and rum distillation",
        "Phuket Old Town Exploration: Walking tour of Sino-Portuguese architecture with traditional dessert making workshops",
        "Sitao Studio: Hands-on pottery and ceramics workshop",
        "Baan Teelanka: Visit the quirky Upside Down House for fun photo opportunities"
      ]
    },
    {
      id: 7,
      emoji: "🚂",
      title: "Bangkok - Suphanburi - Ayutthaya",
      subtitle: "Central Plain History, Agriculture & Metropolitan Life",
      duration: "5 Days/4 Nights",
      date: "January 19 - 23, 2026",
      provinces: "Bangkok → Suphanburi → Ayutthaya",
      highlights: [
        "Suphanburi Farmers' Wisdom Center: Learn about traditional Thai rice farming and agricultural life",
        "Ayutthaya's Ancient Capitals: Explore Wat Maha That (Buddha head in tree) and Wat Chai Mongkhon",
        "Ayutthaya Floating Market: Try local snacks and experience boat commerce",
        "Modern Bangkok: Chao Phraya River cruise, visit Iconsiam shopping, and entertainment at Asiatique"
      ]
    }
  ];

  const homeButtonClasses = "inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-700 border border-slate-200 rounded-full hover:bg-slate-50 hover:text-blue-600 transition-all shadow-sm";

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-blue-50 text-slate-900">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
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

          <div className="mb-8 sm:mb-12 text-center">
            <span className="inline-block py-1 px-3 rounded-full bg-blue-100 text-blue-700 text-sm font-semibold mb-4 tracking-wide uppercase">
              Explore Destinations
            </span>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">
              Discover Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Journey</span>
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Choose your adventure from our curated collection of educational trips across Thailand
            </p>
          </div>

          {/* Trips Grid */}
          <div className="space-y-8">
            {trips.map((trip, index) => (
              <motion.div 
                key={trip.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 lg:p-10 shadow-sm hover:shadow-md transition-all"
              >
                <div className="flex items-start gap-4 mb-6">
                  <div className="text-5xl sm:text-6xl bg-blue-50 w-20 h-20 rounded-2xl flex items-center justify-center flex-shrink-0">
                    {trip.emoji}
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
                      {trip.title}
                    </h2>
                    <p className="text-lg text-blue-600 font-medium">
                      {trip.subtitle}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div>
                    <p className="text-sm font-semibold text-slate-500 mb-1 uppercase tracking-wide">Duration</p>
                    <p className="text-base font-bold text-slate-900">{trip.duration}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-500 mb-1 uppercase tracking-wide">Date</p>
                    <p className="text-base font-bold text-slate-900">{trip.date}</p>
                  </div>
                  <div className="sm:col-span-2 lg:col-span-1">
                    <p className="text-sm font-semibold text-slate-500 mb-1 uppercase tracking-wide">Route</p>
                    <p className="text-base font-bold text-slate-900">{trip.provinces}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 mr-3">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </span>
                    Trip Highlights
                  </h3>
                  <ul className="space-y-3 pl-2">
                    {trip.highlights.map((highlight, index) => (
                      <li key={index} className="flex items-start group">
                        <span className="inline-block w-1.5 h-1.5 bg-blue-400 rounded-full mt-2.5 mr-3 flex-shrink-0 group-hover:bg-blue-600 transition-colors"></span>
                        <span className="text-slate-600 leading-relaxed group-hover:text-slate-900 transition-colors">{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Register CTA */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
            className="mt-12 text-center p-8 sm:p-12 bg-white rounded-3xl border border-slate-200 shadow-lg relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>
            <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-4">
              Ready to Start Your Adventure?
            </h3>
            <p className="text-lg text-slate-600 mb-8 max-w-2xl mx-auto">
              Secure your spot today. Spaces are limited for each trip.
            </p>
            <Link 
              href="/register"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg px-10 py-4 rounded-full shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 active:translate-y-0"
            >
              Register Now
            </Link>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
