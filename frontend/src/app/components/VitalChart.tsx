'use client';

import { useState } from 'react';
import { Heart, Activity, Droplets } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function VitalChart({ vitals }: { vitals: any[] }) {
  const [activeTab, setActiveTab] = useState<'bp' | 'heart' | 'sugar'>('bp');

  // Format dates for the chart
  const formattedData = (vitals || []).map((v: any) => ({
    ...v,
    dateLabel: new Date(v.recorded_at).toLocaleDateString() + ' ' + new Date(v.recorded_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }));

  if (formattedData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-gray-400 bg-gray-50 rounded-xl border border-gray-100">
        <Activity size={32} className="mb-2 opacity-50" />
        <p className="text-sm">No vital records available for this patient.</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm mt-4">
      <div className="flex gap-2 border-b border-gray-100 pb-3 mb-3 overflow-x-auto">
        <button 
          onClick={() => setActiveTab('bp')}
          className={`px-3 py-1.5 rounded-lg text-sm font-bold flex items-center gap-2 whitespace-nowrap transition-colors ${activeTab === 'bp' ? 'bg-red-50 text-red-600 border border-red-200' : 'text-gray-500 hover:bg-gray-50'}`}
        >
          <Heart size={16} /> Blood Pressure
        </button>
        <button 
          onClick={() => setActiveTab('heart')}
          className={`px-3 py-1.5 rounded-lg text-sm font-bold flex items-center gap-2 whitespace-nowrap transition-colors ${activeTab === 'heart' ? 'bg-pink-50 text-pink-600 border border-pink-200' : 'text-gray-500 hover:bg-gray-50'}`}
        >
          <Activity size={16} /> Heart Rate
        </button>
        <button 
          onClick={() => setActiveTab('sugar')}
          className={`px-3 py-1.5 rounded-lg text-sm font-bold flex items-center gap-2 whitespace-nowrap transition-colors ${activeTab === 'sugar' ? 'bg-yellow-50 text-yellow-600 border border-yellow-200' : 'text-gray-500 hover:bg-gray-50'}`}
        >
          <Droplets size={16} /> Sugar Level
        </button>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={formattedData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.5} />
            <XAxis dataKey="dateLabel" tick={{fontSize: 10}} />
            <YAxis tick={{fontSize: 12}} />
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: '12px' }}/>
            {activeTab === 'bp' && (
              <>
                <Line type="monotone" dataKey="bp_systolic" name="Systolic BP" stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} connectNulls />
                <Line type="monotone" dataKey="bp_diastolic" name="Diastolic BP" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} connectNulls />
              </>
            )}
            {activeTab === 'heart' && (
              <Line type="monotone" dataKey="heart_rate" name="Heart Rate (BPM)" stroke="#ec4899" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} connectNulls />
            )}
            {activeTab === 'sugar' && (
              <Line type="monotone" dataKey="sugar_level" name="Sugar Level (mg/dL)" stroke="#eab308" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} connectNulls />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
