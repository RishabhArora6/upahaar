'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Upload, Clock, FileText, Settings, QrCode, Pill, CheckCircle2, Trash2, ShieldAlert, Ban, Activity } from 'lucide-react';
import Link from 'next/link';
import TwoFactorSetup from '../../components/TwoFactorSetup';
import GoogleTranslate from '../../components/GoogleTranslate';

export default function CitizenDashboard() {
  const [timeline, setTimeline] = useState<any[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [activeMedicines, setActiveMedicines] = useState<any[]>([]);
  const [takenMeds, setTakenMeds] = useState<number[]>([]);
  const [viewModes, setViewModes] = useState<Record<string, 'summary' | 'raw'>>({});
  const [notifications, setNotifications] = useState<any[]>([]);

  const fetchTimeline = async () => {
    const token = localStorage.getItem('upahaar_token');
    if (!token) return;
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/patients/timeline`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        const timelineData = data.timeline || [];
        setTimeline(timelineData);

        // Find the most recent prescription with parsed medicines
        const latestWithMeds = timelineData.find((t: any) => t.medicines && t.medicines !== "[]" && t.medicines !== "null");
        if (latestWithMeds) {
           try { 
             setActiveMedicines(JSON.parse(latestWithMeds.medicines)); 
             setTakenMeds([]); // Reset taken state for new prescriptions
           } catch (e) { 
             setActiveMedicines([]); 
           }
        } else {
           setActiveMedicines([]);
        }
      }
    } catch (err) {
      console.error('Failed to fetch timeline:', err);
    }
  };

  const handleDeleteRecord = async (id: string) => {
    if (!confirm("Are you sure you want to delete this medical record? This action cannot be undone.")) return;
    
    const token = localStorage.getItem('upahaar_token');
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/patients/prescriptions/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        fetchTimeline(); // Refresh timeline
      } else {
        const data = await response.json();
        alert(data.message || "Failed to delete record");
      }
    } catch (err) {
      console.error('Failed to fetch timeline:', err);
    }
  };

  const fetchNotifications = async () => {
    const token = localStorage.getItem('upahaar_token');
    if (!token) return;
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/patients/notifications`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  };

  const handleNotificationAction = async (id: string, action: 'acknowledge' | 'revoke') => {
    const token = localStorage.getItem('upahaar_token');
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/patients/notifications/${id}/${action}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        fetchNotifications();
      } else {
        const data = await response.json();
        alert(data.message || `Failed to ${action} notification`);
      }
    } catch (err) {
      console.error(`Failed to ${action} notification:`, err);
    }
  };

  useEffect(() => {
    fetchTimeline();
    fetchNotifications();
  }, []);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setIsUploading(true);
    
    const token = localStorage.getItem('upahaar_token');
    const formData = new FormData();
    formData.append('prescriptionFile', file);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/patients/prescriptions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
          // Do NOT set Content-Type here, let browser set multipart boundary
        },
        body: formData
      });

      const data = await response.json();
      if (response.ok) {
        alert("Prescription uploaded and processed by AI successfully!");
        setFile(null);
        fetchTimeline(); // Refresh the timeline to show the new document
      } else {
        alert("Upload failed: " + data.message);
      }
    } catch (err) {
      console.error(err);
      alert("Error connecting to server.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-medical-dark text-white p-6 flex flex-col min-h-[10vh] md:min-h-screen">
        <h2 className="text-2xl font-bold mb-8">UPAHAAR</h2>
        <nav className="flex-1 space-y-4">
          <Link href="/dashboard/citizen" className="flex items-center gap-3 bg-white/10 p-3 rounded-lg font-semibold">
            <Clock size={20} /> My Timeline
          </Link>
          <Link href="/dashboard/citizen/qr-card" className="flex items-center gap-3 hover:bg-white/5 p-3 rounded-lg transition-colors text-gray-300">
            <QrCode size={20} /> My QR Card
          </Link>
          <Link href="/dashboard/citizen/vitals" className="flex items-center gap-3 hover:bg-white/5 p-3 rounded-lg transition-colors text-gray-300">
            <Activity size={20} /> Vital Tracker
          </Link>
          <Link href="/dashboard/citizen/profile-setup" className="flex items-center gap-3 hover:bg-white/5 p-3 rounded-lg transition-colors text-gray-300">
            <Settings size={20} /> Edit Profile
          </Link>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 lg:p-10">
        <div className="max-w-5xl mx-auto space-y-8">
          
          <header className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-visible z-50">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Welcome back, Citizen</h1>
              <p className="text-gray-500">Manage your medical records securely.</p>
            </div>
            <div className="bg-medical-dark p-2 rounded-xl shadow-lg border border-gray-100">
               <GoogleTranslate />
            </div>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Timeline Column */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Security Notifications */}
              {notifications.filter(n => n.status === 'PENDING').length > 0 && (
                <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-2xl shadow-sm">
                  <h2 className="text-xl font-bold flex items-center gap-2 mb-4 text-red-800"><ShieldAlert size={24} /> Security Alerts</h2>
                  <div className="space-y-3">
                    {notifications.filter(n => n.status === 'PENDING').map((notif: any) => (
                      <div key={notif.id} className="bg-white p-4 rounded-xl shadow-sm border border-red-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div>
                          <p className="text-red-900 font-medium"><strong>Dr. {notif.doctor_name}</strong> accessed your profile via <strong>Facial Recognition</strong>.</p>
                          <p className="text-sm text-red-600 mt-1">{new Date(notif.created_at).toLocaleString()}</p>
                        </div>
                        <div className="flex gap-2 w-full sm:w-auto">
                          <button 
                            onClick={() => handleNotificationAction(notif.id, 'acknowledge')}
                            className="flex-1 sm:flex-none px-4 py-2 bg-green-100 text-green-700 hover:bg-green-200 font-bold rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
                          >
                            <CheckCircle2 size={16}/> Acknowledge
                          </button>
                          <button 
                            onClick={() => handleNotificationAction(notif.id, 'revoke')}
                            className="flex-1 sm:flex-none px-4 py-2 bg-red-600 text-white hover:bg-red-700 font-bold rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
                          >
                            <Ban size={16}/> Revoke Access
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Active Medication Reminders */}
              {activeMedicines.length > 0 && (
                <div className="bg-gradient-to-r from-medical-blue to-blue-600 rounded-3xl p-6 text-white shadow-xl">
                  <h2 className="text-xl font-bold flex items-center gap-2 mb-4"><Pill size={24} /> Active Medication Reminders</h2>
                  <div className="space-y-3">
                    {activeMedicines.map((med: any, idx: number) => (
                      <div key={idx} className="bg-white/10 backdrop-blur-sm p-4 rounded-xl flex items-center justify-between border border-white/20">
                        <div>
                          <h3 className={`font-bold text-lg ${takenMeds.includes(idx) ? 'line-through text-gray-300' : ''}`}>{med.name}</h3>
                          <p className="text-blue-100 text-sm">{med.frequency} • {med.duration}</p>
                        </div>
                        <button 
                          onClick={() => setTakenMeds(prev => prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx])}
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-colors ${
                            takenMeds.includes(idx) 
                              ? 'bg-green-500 text-white' 
                              : 'bg-white text-medical-blue hover:bg-blue-50'
                          }`}
                        >
                          <CheckCircle2 size={18} /> {takenMeds.includes(idx) ? 'Taken' : 'Take'}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <h2 className="text-xl font-bold text-medical-dark flex items-center gap-2"><Clock size={24} /> Medical Timeline</h2>
              
              <div className="space-y-4">
                {timeline.length === 0 ? (
                   <p className="text-gray-500 italic p-6 bg-white rounded-2xl border border-gray-100 shadow-sm text-center">No prescriptions uploaded yet. Use the tool on the right to upload your first record!</p>
                ) : (
                  timeline.map((item) => (
                    <motion.div 
                      initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                      key={item.id} 
                      className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 border-l-4 border-l-medical-blue relative"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-lg text-gray-800">Prescription Record</h3>
                          <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded">
                            {new Date(item.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <button 
                          onClick={() => handleDeleteRecord(item.id)}
                          className="text-red-400 hover:text-red-600 p-1 hover:bg-red-50 rounded-md transition-colors"
                          title="Delete Record"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <div className="flex justify-between items-center mb-3">
                        <a href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${item.file_url}`} target="_blank" rel="noreferrer" className="text-sm text-medical-blue hover:underline">View Original Document</a>
                        {item.raw_ocr_text && (
                          <div className="flex bg-gray-100 rounded-lg p-1">
                            <button 
                              onClick={() => setViewModes(prev => ({ ...prev, [item.id]: 'summary' }))}
                              className={`text-xs px-3 py-1 rounded-md font-bold transition-colors ${viewModes[item.id] !== 'raw' ? 'bg-white text-medical-blue shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                            >AI Summary</button>
                            <button 
                              onClick={() => setViewModes(prev => ({ ...prev, [item.id]: 'raw' }))}
                              className={`text-xs px-3 py-1 rounded-md font-bold transition-colors ${viewModes[item.id] === 'raw' ? 'bg-white text-medical-blue shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                            >Original OCR</button>
                          </div>
                        )}
                      </div>
                      
                      <div className="bg-blue-50 p-4 rounded-xl mt-3">
                        {viewModes[item.id] === 'raw' ? (
                          <p className="text-sm text-gray-700 font-mono whitespace-pre-line leading-relaxed"><span className="font-bold text-medical-dark block mb-2 font-sans tracking-wide uppercase text-xs">Raw OCR Transcription:</span>{item.raw_ocr_text}</p>
                        ) : (
                          <p className="text-sm text-medical-dark font-medium whitespace-pre-line"><span className="font-bold text-medical-dark block mb-1 tracking-wide uppercase text-xs">AI Summary:</span>{item.ai_extracted_data}</p>
                        )}
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </div>

            {/* Upload Column */}
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-medical-dark flex items-center gap-2"><Upload size={24} /> Upload Records</h2>
              
              <motion.div 
                whileHover={{ y: -2 }}
                className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100"
              >
                <form onSubmit={handleUpload} className="space-y-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer relative">
                    <input 
                      type="file" 
                      accept="image/png, image/jpeg, image/webp"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                      onChange={(e) => setFile(e.target.files?.[0] || null)}
                    />
                    <FileText size={40} className="mx-auto mb-3 text-gray-400" />
                    <p className="font-semibold text-gray-700">Drop prescription here</p>
                    <p className="text-xs text-gray-500 mt-1">JPG, PNG, WEBP (For AI Vision)</p>
                  </div>
                  
                  {file && <p className="text-sm text-green-600 font-medium text-center break-all">{file.name}</p>}

                  <button 
                    disabled={!file || isUploading}
                    className="w-full bg-medical-blue text-white py-3 rounded-xl font-bold shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isUploading ? 'Analyzing with AI...' : 'Upload Document'}
                  </button>
                </form>
              </motion.div>

              {/* Advanced Apps Links */}
              <div className="bg-medical-dark text-white p-6 rounded-2xl shadow-lg">
                 <h3 className="font-bold mb-4">Advanced Tools</h3>
                 <div className="space-y-3">
                    <Link href="/dashboard/citizen/pharmacy-finder" className="block bg-white/10 hover:bg-white/20 p-3 rounded-lg transition text-sm font-semibold">📍 Nearby Pharmacies</Link>
                    <Link href="/dashboard/citizen/vaccines" className="block bg-white/10 hover:bg-white/20 p-3 rounded-lg transition text-sm font-semibold">💉 Vaccine Scheduler</Link>
                 </div>
              </div>
              
              {/* Security Setup */}
              <TwoFactorSetup />
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
