'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

export default function ProfileSetup() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [bloodGroup, setBloodGroup] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [visionLeft, setVisionLeft] = useState('');
  const [visionRight, setVisionRight] = useState('');
  const [identifyingMarks, setIdentifyingMarks] = useState('');
  const [otherDefects, setOtherDefects] = useState('');

  // Complex Objects
  const [allergies, setAllergies] = useState({ peanuts: false, dust: false, pollen: false, penicillin: false, other: '' });
  const [hearing, setHearing] = useState({ mildDeafness: false, fullDeafness: false });
  const [mentalIllness, setMentalIllness] = useState({ anxiety: false, depression: false, adhd: false, other: '' });
  const [respiratory, setRespiratory] = useState({ asthma: false, copd: false, other: '' });
  const [nervousSystem, setNervousSystem] = useState({ epilepsy: false, parkinsons: false, other: '' });
  const [heartProblem, setHeartProblem] = useState({ hypertension: false, arrhythmia: false, other: '' });
  
  // Family History (Simple implementation)
  const [familyHistory, setFamilyHistory] = useState({ relation: 'None', disease: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const token = localStorage.getItem('upahaar_token');
    if (!token) {
      alert("No token found. Please login again.");
      return;
    }

    const payload = {
      blood_group: bloodGroup,
      height_cm: parseFloat(height) || null,
      weight_kg: parseFloat(weight) || null,
      vision_left: visionLeft,
      vision_right: visionRight,
      hearing_status: JSON.stringify(hearing),
      allergies,
      family_history: familyHistory,
      mental_health: mentalIllness,
      respiratory_disorders: respiratory,
      nervous_disorders: nervousSystem,
      heart_problems: heartProblem,
      identifying_features: identifyingMarks + (otherDefects ? ` | Other Defects: ${otherDefects}` : '')
    };

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/patients/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (response.ok) {
        alert("Profile saved successfully!");
        window.location.href = '/dashboard/citizen';
      } else {
        alert(data.message || 'Failed to save profile');
      }
    } catch (err) {
      console.error(err);
      alert('Error connecting to backend server');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
          <div className="bg-medical-blue p-8 text-white">
            <h1 className="text-3xl font-extrabold mb-2">Complete Your Medical Profile</h1>
            <p className="text-blue-100">Please provide detailed health information. You will only have to do this once.</p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            
            {/* Section 1: Basic Vitals & Info */}
            <div>
              <h2 className="text-xl font-bold text-gray-800 border-b pb-2 mb-4">Basic Vitals & Identification</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Blood Group</label>
                  <input type="text" required placeholder="e.g. O+, A-" className="w-full px-4 py-2 rounded-xl border focus:ring-2 focus:ring-medical-blue outline-none" onChange={e => setBloodGroup(e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Height (cm)</label>
                  <input type="number" placeholder="175" className="w-full px-4 py-2 rounded-xl border focus:ring-2 focus:ring-medical-blue outline-none" onChange={e => setHeight(e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Weight (kg)</label>
                  <input type="number" placeholder="70" className="w-full px-4 py-2 rounded-xl border focus:ring-2 focus:ring-medical-blue outline-none" onChange={e => setWeight(e.target.value)} />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Birth / Identification Mark</label>
                  <input type="text" placeholder="e.g. Scar on left cheek, Mole on right arm" className="w-full px-4 py-2 rounded-xl border focus:ring-2 focus:ring-medical-blue outline-none" onChange={e => setIdentifyingMarks(e.target.value)} />
                </div>
              </div>
            </div>

            {/* Section 2: Sensory */}
            <div>
              <h2 className="text-xl font-bold text-gray-800 border-b pb-2 mb-4">Sensory (Vision & Hearing)</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Hearing Issues</label>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="mildDeaf" onChange={e => setHearing({...hearing, mildDeafness: e.target.checked})} />
                    <label htmlFor="mildDeaf">Mild Deafness</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="fullDeaf" onChange={e => setHearing({...hearing, fullDeafness: e.target.checked})} />
                    <label htmlFor="fullDeaf">Full Deafness</label>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Vision (Left Eye)</label>
                    <input type="text" placeholder="-1.5" className="w-full px-4 py-2 rounded-xl border focus:ring-2 focus:ring-medical-blue outline-none" onChange={e => setVisionLeft(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Vision (Right Eye)</label>
                    <input type="text" placeholder="-1.5" className="w-full px-4 py-2 rounded-xl border focus:ring-2 focus:ring-medical-blue outline-none" onChange={e => setVisionRight(e.target.value)} />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 3: Allergies & Family History */}
            <div>
              <h2 className="text-xl font-bold text-gray-800 border-b pb-2 mb-4">Allergies & Family History</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Allergies</label>
                  <div className="space-y-2 mb-3">
                    <label className="flex items-center gap-2"><input type="checkbox" onChange={e => setAllergies({...allergies, peanuts: e.target.checked})} /> Peanuts</label>
                    <label className="flex items-center gap-2"><input type="checkbox" onChange={e => setAllergies({...allergies, dust: e.target.checked})} /> Dust Mites</label>
                    <label className="flex items-center gap-2"><input type="checkbox" onChange={e => setAllergies({...allergies, pollen: e.target.checked})} /> Pollen</label>
                    <label className="flex items-center gap-2"><input type="checkbox" onChange={e => setAllergies({...allergies, penicillin: e.target.checked})} /> Penicillin</label>
                  </div>
                  <input type="text" placeholder="Other allergies..." className="w-full px-4 py-2 rounded-lg border outline-none" onChange={e => setAllergies({...allergies, other: e.target.value})} />
                </div>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Family Disease History</label>
                  <select className="w-full px-4 py-2 rounded-lg border outline-none mb-3 bg-white" onChange={e => setFamilyHistory({...familyHistory, relation: e.target.value})}>
                    <option>None</option>
                    <option>Father</option>
                    <option>Mother</option>
                    <option>Grandparents</option>
                  </select>
                  {familyHistory.relation !== 'None' && (
                    <input type="text" placeholder="Describe disease (e.g. Diabetes)" className="w-full px-4 py-2 rounded-lg border outline-none" onChange={e => setFamilyHistory({...familyHistory, disease: e.target.value})} />
                  )}
                </div>
              </div>
            </div>

            {/* Section 4: Systemic Conditions */}
            <div>
              <h2 className="text-xl font-bold text-gray-800 border-b pb-2 mb-4">Systemic Conditions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Mental Illness */}
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Mental Illness</label>
                  <div className="space-y-2 mb-3">
                    <label className="flex items-center gap-2"><input type="checkbox" onChange={e => setMentalIllness({...mentalIllness, anxiety: e.target.checked})} /> Anxiety</label>
                    <label className="flex items-center gap-2"><input type="checkbox" onChange={e => setMentalIllness({...mentalIllness, depression: e.target.checked})} /> Depression</label>
                  </div>
                  <input type="text" placeholder="Other mental illness..." className="w-full px-4 py-2 rounded-lg border outline-none" onChange={e => setMentalIllness({...mentalIllness, other: e.target.value})} />
                </div>

                {/* Respiratory */}
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Respiratory System</label>
                  <div className="space-y-2 mb-3">
                    <label className="flex items-center gap-2"><input type="checkbox" onChange={e => setRespiratory({...respiratory, asthma: e.target.checked})} /> Asthma</label>
                    <label className="flex items-center gap-2"><input type="checkbox" onChange={e => setRespiratory({...respiratory, copd: e.target.checked})} /> COPD</label>
                  </div>
                  <input type="text" placeholder="Other respiratory issues..." className="w-full px-4 py-2 rounded-lg border outline-none" onChange={e => setRespiratory({...respiratory, other: e.target.value})} />
                </div>

                {/* Heart */}
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Heart Problem</label>
                  <div className="space-y-2 mb-3">
                    <label className="flex items-center gap-2"><input type="checkbox" onChange={e => setHeartProblem({...heartProblem, hypertension: e.target.checked})} /> Hypertension</label>
                    <label className="flex items-center gap-2"><input type="checkbox" onChange={e => setHeartProblem({...heartProblem, arrhythmia: e.target.checked})} /> Arrhythmia</label>
                  </div>
                  <input type="text" placeholder="Other heart issues..." className="w-full px-4 py-2 rounded-lg border outline-none" onChange={e => setHeartProblem({...heartProblem, other: e.target.value})} />
                </div>

                {/* Nervous System */}
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Nervous System</label>
                  <div className="space-y-2 mb-3">
                    <label className="flex items-center gap-2"><input type="checkbox" onChange={e => setNervousSystem({...nervousSystem, epilepsy: e.target.checked})} /> Epilepsy</label>
                  </div>
                  <input type="text" placeholder="Other nervous issues..." className="w-full px-4 py-2 rounded-lg border outline-none" onChange={e => setNervousSystem({...nervousSystem, other: e.target.value})} />
                </div>

              </div>
            </div>

            {/* Other Defects */}
            <div>
               <label className="block text-sm font-semibold text-gray-700 mb-2">Any other defects?</label>
               <input type="text" placeholder="Describe any other medical defects not covered above" className="w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-medical-blue outline-none" onChange={e => setOtherDefects(e.target.value)} />
            </div>

            <div className="pt-4 border-t">
              <motion.button 
                whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                className="w-full py-4 bg-medical-dark text-white rounded-xl font-bold text-lg shadow-xl shadow-blue-900/20 disabled:opacity-50"
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving Profile...' : 'Save Complete Profile'}
              </motion.button>
            </div>
            
          </form>
        </motion.div>
      </div>
    </div>
  );
}
