'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, Activity, Droplets, Plus } from 'lucide-react';
import Link from 'next/link';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function VitalsDashboard() {
  const [vitals, setVitals] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'bp' | 'heart' | 'sugar'>('bp');
  const [loading, setLoading] = useState(true);
  
  // Form state
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    bp_systolic: '',
    bp_diastolic: '',
    heart_rate: '',
    sugar_level: ''
  });

  const fetchVitals = async () => {
    const token = localStorage.getItem('upahaar_token');
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/patients/vitals`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        // Format dates for the chart
        const formattedData = (data.vitals || []).map((v: any) => ({
          ...v,
          dateLabel: new Date(v.recorded_at).toLocaleDateString() + ' ' + new Date(v.recorded_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }));
        setVitals(formattedData);
      }
    } catch (err) {
      console.error('Failed to fetch vitals:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVitals();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('upahaar_token');
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/patients/vitals`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          bp_systolic: formData.bp_systolic ? Number(formData.bp_systolic) : null,
          bp_diastolic: formData.bp_diastolic ? Number(formData.bp_diastolic) : null,
          heart_rate: formData.heart_rate ? Number(formData.heart_rate) : null,
          sugar_level: formData.sugar_level ? Number(formData.sugar_level) : null,
        })
      });
      
      if (response.ok) {
        setFormData({ bp_systolic: '', bp_diastolic: '', heart_rate: '', sugar_level: '' });
        setIsAdding(false);
        fetchVitals();
      } else {
        alert("Failed to save vitals.");
      }
    } catch (err) {
      console.error('Failed to save vitals:', err);
    }
  };

  const renderChart = () => {
    if (vitals.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-64 text-gray-400">
          <Activity size={48} className="mb-4 opacity-50" />
          <p>No vital records found. Add your first reading below!</p>
        </div>
      );
    }

    return (
      <div className="h-80 w-full mt-6">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={vitals} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.5} />
            <XAxis dataKey="dateLabel" tick={{fontSize: 12}} />
            <YAxis />
            <Tooltip />
            <Legend />
            {activeTab === 'bp' && (
              <>
                <Line type="monotone" dataKey="bp_systolic" name="Systolic BP" stroke="#ef4444" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} connectNulls />
                <Line type="monotone" dataKey="bp_diastolic" name="Diastolic BP" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} connectNulls />
              </>
            )}
            {activeTab === 'heart' && (
              <Line type="monotone" dataKey="heart_rate" name="Heart Rate (BPM)" stroke="#ec4899" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} connectNulls />
            )}
            {activeTab === 'sugar' && (
              <Line type="monotone" dataKey="sugar_level" name="Sugar Level (mg/dL)" stroke="#eab308" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} connectNulls />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      <main className="flex-1 p-6 lg:p-10">
        <div className="max-w-5xl mx-auto space-y-8">
          
          <header className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div>
              <Link href="/dashboard/citizen" className="text-medical-blue text-sm font-bold hover:underline mb-2 inline-block">← Back to Dashboard</Link>
              <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2"><Activity className="text-red-500"/> Vital Tracker</h1>
              <p className="text-gray-500">Monitor your health metrics over time.</p>
            </div>
            <button 
              onClick={() => setIsAdding(!isAdding)}
              className="bg-medical-blue hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-bold shadow-sm transition-colors flex items-center gap-2"
            >
              <Plus size={18} /> Record Vitals
            </button>
          </header>

          {isAdding && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="bg-white p-6 rounded-2xl shadow-sm border border-medical-blue/30 overflow-hidden">
              <h3 className="font-bold text-lg mb-4 text-gray-800">New Vital Reading</h3>
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">Systolic BP</label>
                  <input type="number" placeholder="120" value={formData.bp_systolic} onChange={e => setFormData({...formData, bp_systolic: e.target.value})} className="w-full border p-2 rounded-lg outline-none focus:ring-2 focus:ring-medical-blue" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">Diastolic BP</label>
                  <input type="number" placeholder="80" value={formData.bp_diastolic} onChange={e => setFormData({...formData, bp_diastolic: e.target.value})} className="w-full border p-2 rounded-lg outline-none focus:ring-2 focus:ring-medical-blue" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">Heart Rate (BPM)</label>
                  <input type="number" placeholder="72" value={formData.heart_rate} onChange={e => setFormData({...formData, heart_rate: e.target.value})} className="w-full border p-2 rounded-lg outline-none focus:ring-2 focus:ring-medical-blue" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">Sugar Level (mg/dL)</label>
                  <input type="number" placeholder="95" value={formData.sugar_level} onChange={e => setFormData({...formData, sugar_level: e.target.value})} className="w-full border p-2 rounded-lg outline-none focus:ring-2 focus:ring-medical-blue" />
                </div>
                <div className="lg:col-span-4 flex justify-end gap-2 mt-2">
                  <button type="button" onClick={() => setIsAdding(false)} className="px-4 py-2 text-gray-500 font-bold hover:bg-gray-100 rounded-lg">Cancel</button>
                  <button type="submit" className="px-4 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 shadow-sm">Save Reading</button>
                </div>
              </form>
            </motion.div>
          )}

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex gap-2 border-b border-gray-100 pb-4 mb-4 overflow-x-auto">
              <button 
                onClick={() => setActiveTab('bp')}
                className={`px-4 py-2 rounded-xl font-bold flex items-center gap-2 whitespace-nowrap transition-colors ${activeTab === 'bp' ? 'bg-red-50 text-red-600 border border-red-200' : 'text-gray-500 hover:bg-gray-50'}`}
              >
                <Heart size={18} /> Blood Pressure
              </button>
              <button 
                onClick={() => setActiveTab('heart')}
                className={`px-4 py-2 rounded-xl font-bold flex items-center gap-2 whitespace-nowrap transition-colors ${activeTab === 'heart' ? 'bg-pink-50 text-pink-600 border border-pink-200' : 'text-gray-500 hover:bg-gray-50'}`}
              >
                <Activity size={18} /> Heart Rate
              </button>
              <button 
                onClick={() => setActiveTab('sugar')}
                className={`px-4 py-2 rounded-xl font-bold flex items-center gap-2 whitespace-nowrap transition-colors ${activeTab === 'sugar' ? 'bg-yellow-50 text-yellow-600 border border-yellow-200' : 'text-gray-500 hover:bg-gray-50'}`}
              >
                <Droplets size={18} /> Sugar Level
              </button>
            </div>
            
            {loading ? (
              <div className="flex justify-center items-center h-64"><div className="animate-spin w-8 h-8 border-4 border-medical-blue border-t-transparent rounded-full"></div></div>
            ) : (
              renderChart()
            )}
          </div>
          
        </div>
      </main>
    </div>
  );
}
