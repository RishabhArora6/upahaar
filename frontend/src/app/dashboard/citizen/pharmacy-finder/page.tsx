'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Navigation, Star, Phone, Clock, AlertCircle } from 'lucide-react';
import Link from 'next/link';

interface Pharmacy {
  place_id: string;
  name: string;
  vicinity: string;
  rating?: number;
  user_ratings_total?: number;
  opening_hours?: {
    open_now: boolean;
  };
}

export default function PharmacyFinder() {
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        await fetchPharmacies(latitude, longitude);
      },
      (err) => {
        setError("Location access denied or unavailable. Please enable location services to find nearby pharmacies.");
        setLoading(false);
      }
    );
  }, []);

  const fetchPharmacies = async (lat: number, lng: number) => {
    const token = localStorage.getItem('upahaar_token');
    if (!token) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/patients/pharmacies?lat=${lat}&lng=${lng}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      
      if (response.ok) {
        setPharmacies(data.pharmacies || []);
      } else {
        setError(data.message || "Failed to fetch pharmacies.");
      }
    } catch (err) {
      setError("Error connecting to server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      <aside className="w-full md:w-64 bg-medical-dark text-white p-6 flex flex-col min-h-[10vh] md:min-h-screen">
        <h2 className="text-2xl font-bold mb-8">UPAHAAR</h2>
        <nav className="flex-1 space-y-4">
          <Link href="/dashboard/citizen" className="block hover:bg-white/5 p-3 rounded-lg transition-colors text-gray-300">My Timeline</Link>
          <Link href="/dashboard/citizen/vaccines" className="block hover:bg-white/5 p-3 rounded-lg transition-colors text-gray-300">Vaccine Scheduler</Link>
          <Link href="/dashboard/citizen/pharmacy-finder" className="flex items-center gap-3 bg-white/10 p-3 rounded-lg font-semibold"><MapPin size={20} /> Pharmacies</Link>
        </nav>
      </aside>

      <main className="flex-1 p-6 lg:p-10">
        <div className="max-w-5xl mx-auto space-y-8">
          
          <header className="bg-gradient-to-r from-medical-blue to-blue-500 p-8 rounded-3xl text-white shadow-xl relative overflow-hidden">
             <div className="relative z-10">
                <h1 className="text-3xl font-extrabold mb-2 flex items-center gap-3"><MapPin size={32} /> Nearby Pharmacies</h1>
                <p className="text-blue-100 max-w-xl">Find open pharmacies and medical stores within a 5km radius of your current location.</p>
             </div>
             <Navigation size={150} className="absolute -right-10 -bottom-10 text-white/10 rotate-12" />
          </header>

          {loading ? (
             <div className="text-center p-20">
               <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="mx-auto w-12 h-12 border-4 border-medical-blue border-t-transparent rounded-full mb-4"></motion.div>
               <p className="text-gray-500 font-semibold">Locating you & finding pharmacies...</p>
             </div>
          ) : error ? (
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-red-100 text-center">
               <AlertCircle size={48} className="mx-auto text-red-400 mb-4" />
               <h2 className="text-xl font-bold text-gray-800 mb-2">Location Error</h2>
               <p className="text-gray-600 mb-6">{error}</p>
            </div>
          ) : pharmacies.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center">
               <MapPin size={48} className="mx-auto text-gray-300 mb-4" />
               <h2 className="text-xl font-bold text-gray-800">No Pharmacies Found</h2>
               <p className="text-gray-600">We couldn't find any registered pharmacies within 5km of your location.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {pharmacies.map((pharmacy, idx) => (
                 <motion.div 
                   initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
                   key={pharmacy.place_id} 
                   className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all flex flex-col"
                 >
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-gray-800 mb-2">{pharmacy.name}</h3>
                      <p className="text-sm text-gray-500 flex items-start gap-2 mb-4">
                        <MapPin size={16} className="shrink-0 mt-0.5" />
                        {pharmacy.vicinity}
                      </p>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                       {pharmacy.rating ? (
                         <div className="flex items-center gap-1 text-sm font-bold text-gray-700">
                           <Star size={16} className="text-yellow-400 fill-yellow-400" />
                           {pharmacy.rating} <span className="text-gray-400 font-normal">({pharmacy.user_ratings_total})</span>
                         </div>
                       ) : (
                         <span className="text-sm text-gray-400">No ratings</span>
                       )}

                       {pharmacy.opening_hours ? (
                          pharmacy.opening_hours.open_now ? (
                            <span className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-md">
                              <Clock size={12} /> Open Now
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded-md">
                              <Clock size={12} /> Closed
                            </span>
                          )
                       ) : (
                         <span className="text-xs text-gray-400">Hours unknown</span>
                       )}
                    </div>
                 </motion.div>
               ))}
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
