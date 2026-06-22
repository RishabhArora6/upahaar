'use client';

import { motion } from 'framer-motion';
import { AlertTriangle, Activity, Pill, CheckCircle2, History } from 'lucide-react';

export default function PatientTimeline({ params }: { params: { id: string } }) {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Patient Header */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-800">John Doe</h1>
            <p className="text-gray-500 font-mono mt-1">{params.id}</p>
          </div>
          <div className="flex flex-wrap gap-4">
            <div className="bg-red-50 text-red-700 px-4 py-2 rounded-lg border border-red-100 text-center">
              <span className="block text-xs font-bold uppercase tracking-wider">Blood Type</span>
              <span className="text-xl font-bold">O+</span>
            </div>
            <div className="bg-orange-50 text-orange-700 px-4 py-2 rounded-lg border border-orange-100 text-center">
              <span className="block text-xs font-bold uppercase tracking-wider">Allergies</span>
              <span className="text-lg font-bold">Penicillin</span>
            </div>
          </div>
        </motion.div>

        {/* AI Medical Summary */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-medical-dark to-medical-blue p-6 rounded-2xl text-white shadow-lg relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-4 opacity-20 transform translate-x-4 -translate-y-4">
            <Activity size={120} />
          </div>
          <h2 className="text-xl font-bold mb-3 flex items-center gap-2 relative z-10">
            <span className="bg-white/20 p-2 rounded-lg backdrop-blur-md"><Activity size={20} /></span>
            AI Medical Summary
          </h2>
          <p className="text-blue-50 leading-relaxed max-w-3xl relative z-10 text-lg font-light">
            Patient has a history of respiratory issues, specifically Asthma since childhood. 
            Recently diagnosed with Acute Bronchitis in Oct 2023. Currently on regular inhalers 
            and Amoxicillin. No history of major cardiac or nervous system disorders.
          </p>
        </motion.div>

        {/* Drug Conflict Detection (AI Alert) */}
        <motion.div 
          initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
          className="bg-red-50 border-l-4 border-red-500 p-5 rounded-r-xl shadow-sm"
        >
          <div className="flex items-start gap-4">
            <AlertTriangle className="text-red-500 shrink-0 mt-1" size={28} />
            <div>
              <h3 className="font-bold text-red-800 text-lg">AI Drug Conflict Warning!</h3>
              <p className="text-red-700 mt-1 leading-relaxed">
                You are about to prescribe <strong className="bg-red-200 px-1 rounded">Amoxicillin</strong>. Patient has a documented allergy to <strong className="bg-red-200 px-1 rounded">Penicillin</strong> class antibiotics. Severe anaphylaxis risk.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Timeline */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-8 flex items-center gap-2">
            <History className="text-medical-blue" />
            Medical Timeline
          </h2>
          
          <div className="relative border-l-2 border-blue-100 ml-4 space-y-10 pb-4">
            
            {/* Timeline Item 1 */}
            <div className="relative pl-8">
              <div className="absolute w-5 h-5 bg-medical-blue rounded-full -left-[11px] top-1 border-4 border-white shadow-sm"></div>
              <div className="mb-2 text-sm text-gray-500 font-semibold uppercase tracking-wide">Oct 15, 2023</div>
              <div className="bg-gray-50 p-5 rounded-xl border border-gray-100 hover:shadow-md transition-shadow">
                <h4 className="font-bold text-gray-800 text-lg">Acute Bronchitis</h4>
                <p className="text-sm text-gray-600 mb-4">City General Hospital • Dr. Smith</p>
                <div className="flex flex-wrap items-center gap-2 text-sm bg-white p-2 rounded-lg border border-gray-200 inline-flex">
                  <Pill size={16} className="text-medical-blue" />
                  <span className="font-medium text-gray-700">Amoxicillin (500mg)</span>
                  <span className="text-gray-300">|</span>
                  <span className="text-gray-500">5 days</span>
                </div>
              </div>
            </div>

            {/* Timeline Item 2 */}
            <div className="relative pl-8">
              <div className="absolute w-5 h-5 bg-gray-300 rounded-full -left-[11px] top-1 border-4 border-white"></div>
              <div className="mb-2 text-sm text-gray-500 font-semibold uppercase tracking-wide">Mar 10, 2022</div>
              <div className="bg-gray-50 p-5 rounded-xl border border-gray-100 hover:shadow-md transition-shadow">
                <h4 className="font-bold text-gray-800 text-lg">Routine Checkup & Blood Test</h4>
                <p className="text-sm text-gray-600 mb-4">Health Clinic • Dr. Adams</p>
                <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 p-2 rounded-lg border border-green-200 inline-flex shadow-sm">
                  <CheckCircle2 size={16} />
                  <span className="font-medium">All vitals normal</span>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
