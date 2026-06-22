'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Syringe, Calendar, Clock, AlertCircle, CheckCircle } from 'lucide-react';
import Link from 'next/link';

interface Vaccine {
  name: string;
  targetAge: number;
  description: string;
}

const vaccineSchedule: Vaccine[] = [
  { name: 'DPT Booster-1, OPV Booster, MR-2, JE-2', targetAge: 2, description: 'Crucial boosters for Diphtheria, Pertussis, Tetanus, Polio, Measles, Rubella, and Japanese Encephalitis.' },
  { name: 'DPT Booster-2', targetAge: 5, description: 'Second booster dose for Diphtheria, Pertussis, and Tetanus before school entry.' },
  { name: 'Td (Tetanus & Diphtheria)', targetAge: 10, description: 'Adolescent booster for Tetanus and Diphtheria.' },
  { name: 'Td (Tetanus & Diphtheria)', targetAge: 16, description: 'Young adult booster for Tetanus and Diphtheria.' }
];

export default function VaccineScheduler() {
  const [dob, setDob] = useState<string | null>(null);
  const [age, setAge] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('upahaar_token');
      if (!token) return;

      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/patients/profile`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          if (data.dob) {
            setDob(data.dob);
            calculateAge(data.dob);
          }
        }
      } catch (err) {
        console.error('Failed to fetch profile', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const calculateAge = (dobString: string) => {
    const birthDate = new Date(dobString);
    const today = new Date();
    let calculatedAge = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      calculatedAge--;
    }
    setAge(calculatedAge);
  };

  const getStatus = (targetAge: number) => {
    if (age === null) return null;
    if (age > targetAge) return { status: 'Overdue / Completed', color: 'text-green-600', bg: 'bg-green-100', icon: <CheckCircle size={16}/> };
    if (age === targetAge) return { status: 'Due Now', color: 'text-red-600', bg: 'bg-red-100', icon: <AlertCircle size={16}/> };
    return { status: 'Upcoming', color: 'text-blue-600', bg: 'bg-blue-100', icon: <Clock size={16}/> };
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      <aside className="w-full md:w-64 bg-medical-dark text-white p-6 flex flex-col min-h-[10vh] md:min-h-screen">
        <h2 className="text-2xl font-bold mb-8">UPAHAAR</h2>
        <nav className="flex-1 space-y-4">
          <Link href="/dashboard/citizen" className="block hover:bg-white/5 p-3 rounded-lg transition-colors text-gray-300">My Timeline</Link>
          <Link href="/dashboard/citizen/vaccines" className="flex items-center gap-3 bg-white/10 p-3 rounded-lg font-semibold"><Syringe size={20} /> Vaccines</Link>
        </nav>
      </aside>

      <main className="flex-1 p-6 lg:p-10">
        <div className="max-w-4xl mx-auto space-y-8">
          
          <header className="bg-medical-blue p-8 rounded-3xl text-white shadow-xl relative overflow-hidden">
             <div className="relative z-10">
                <h1 className="text-3xl font-extrabold mb-2 flex items-center gap-3"><Syringe size={32} /> Smart Vaccine Scheduler</h1>
                <p className="text-blue-100 max-w-xl">We analyze your age and calculate your upcoming government-mandated vaccinations automatically.</p>
             </div>
             <Syringe size={150} className="absolute -right-10 -bottom-10 text-white/10 rotate-12" />
          </header>

          {loading ? (
             <div className="text-center p-10"><p className="text-gray-500 font-semibold animate-pulse">Loading medical profile...</p></div>
          ) : !dob ? (
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-red-100 text-center">
               <AlertCircle size={48} className="mx-auto text-red-400 mb-4" />
               <h2 className="text-xl font-bold text-gray-800 mb-2">Date of Birth Missing</h2>
               <p className="text-gray-600 mb-6">We cannot suggest vaccines without knowing your age. Please update your Date of Birth in your profile.</p>
               <Link href="/dashboard/citizen/profile-setup" className="bg-medical-blue text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition">Update Profile</Link>
            </div>
          ) : (
            <div className="space-y-6">
               <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                  <div className="bg-blue-50 p-4 rounded-xl text-medical-blue">
                     <Calendar size={32} />
                  </div>
                  <div>
                     <p className="text-sm text-gray-500 font-bold uppercase tracking-wide">Patient Age</p>
                     <p className="text-2xl font-extrabold text-gray-800">{age} Years Old</p>
                  </div>
               </div>

               <div className="space-y-4">
                  <h3 className="text-xl font-bold text-medical-dark mb-4">Mandatory Vaccine Schedule</h3>
                  
                  {vaccineSchedule.map((vac, idx) => {
                     const statusInfo = getStatus(vac.targetAge);
                     
                     return (
                       <motion.div 
                         initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}
                         key={idx} 
                         className={`bg-white p-6 rounded-2xl shadow-sm border-l-4 ${age === vac.targetAge ? 'border-red-500 shadow-md transform scale-[1.01]' : 'border-gray-200'} transition-all`}
                       >
                          <div className="flex justify-between items-start mb-3">
                             <div>
                               <h4 className="font-bold text-lg text-gray-800">{vac.name}</h4>
                               <p className="text-sm text-gray-500 font-medium">Scheduled at: {vac.targetAge} Years</p>
                             </div>
                             {statusInfo && (
                                <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${statusInfo.bg} ${statusInfo.color}`}>
                                   {statusInfo.icon} {statusInfo.status}
                                </span>
                             )}
                          </div>
                          <p className="text-gray-600 text-sm bg-gray-50 p-3 rounded-lg border border-gray-100">{vac.description}</p>
                       </motion.div>
                     );
                  })}
               </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
