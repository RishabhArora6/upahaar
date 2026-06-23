'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Scan, Search, User, Clock, Shield, LogOut, CheckCircle, AlertCircle, Phone, Pill, BrainCircuit, Camera } from 'lucide-react';
import Link from 'next/link';
import Script from 'next/script';

export default function DoctorDashboard() {
  const [upahaarId, setUpahaarId] = useState('');
  const [patientData, setPatientData] = useState<any>(null);
  const [activeMedicines, setActiveMedicines] = useState<any[]>([]);
  
  // AI Search State
  const [aiSearchQuery, setAiSearchQuery] = useState('');
  const [aiSearchResult, setAiSearchResult] = useState<string | null>(null);
  const [aiSearchLoading, setAiSearchLoading] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewModes, setViewModes] = useState<Record<string, 'summary' | 'raw'>>({});

  // Scanner State
  const [isScanning, setIsScanning] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const codeReaderRef = useRef<any>(null);

  // Face Scanner State
  const [isFaceScanning, setIsFaceScanning] = useState(false);
  const faceVideoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    return () => {
      stopScanner();
      stopFaceScanner();
    };
  }, []);

  const startScanner = () => {
    setIsScanning(true);
    setError(null);
    setTimeout(() => {
      try {
        if (typeof window !== 'undefined' && (window as any).Html5QrcodeScanner) {
          const scanner = new (window as any).Html5QrcodeScanner(
            "qr-reader",
            { fps: 10, qrbox: { width: 250, height: 250 } },
            false
          );
          
          codeReaderRef.current = scanner;
          
          scanner.render(
            (decodedText: string) => {
              setUpahaarId(decodedText);
              scanner.clear();
              setIsScanning(false);
              fetchPatientData(decodedText);
            },
            (err: any) => {
              // ignore
            }
          );
        } else {
          setError("Scanner library not loaded yet. Try again in a moment.");
          setIsScanning(false);
        }
      } catch (err) {
        console.error(err);
        setError("Failed to start camera. Please type the ID manually.");
        setIsScanning(false);
      }
    }, 100);
  };

  const stopScanner = () => {
    setIsScanning(false);
    if (codeReaderRef.current) {
      try {
        codeReaderRef.current.clear();
      } catch(e) {}
    }
  };

  const startFaceScanner = async () => {
    setIsFaceScanning(true);
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      if (faceVideoRef.current) {
        faceVideoRef.current.srcObject = stream;
      }
    } catch (err) {
      setError("Camera access denied.");
      setIsFaceScanning(false);
    }
  };

  const stopFaceScanner = () => {
    setIsFaceScanning(false);
    const stream = faceVideoRef.current?.srcObject as MediaStream;
    if (stream) stream.getTracks().forEach(t => t.stop());
  };

  const captureAndScanFace = async () => {
    if (!faceVideoRef.current || !canvasRef.current) return;
    const video = faceVideoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d')?.drawImage(video, 0, 0);
    
    const base64Image = canvas.toDataURL('image/jpeg', 0.8);
    stopFaceScanner();
    
    setLoading(true);
    setError(null);
    setPatientData(null);
    
    try {
      const token = localStorage.getItem('upahaar_token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/doctors/scan-face`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: base64Image })
      });
      const data = await response.json();
      
      if (response.ok && data.upahaar_id) {
        setUpahaarId(data.upahaar_id);
        fetchPatientData(data.upahaar_id);
      } else {
        setError(data.message || "Face not recognized in database.");
        setLoading(false);
      }
    } catch (err) {
      setError("AI connection error.");
      setLoading(false);
    }
  };

  const handleManualSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (upahaarId.trim()) fetchPatientData(upahaarId.trim());
  };

  const fetchPatientData = async (id: string) => {
    setLoading(true);
    setError(null);
    setPatientData(null);
    const token = localStorage.getItem('upahaar_token');
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/doctors/scan/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      
      if (response.ok) {
        setPatientData(data);
        
        // Extract Active Medicines from the latest timeline item
        const timelineData = data.timeline || [];
        const latestWithMeds = timelineData.find((t: any) => t.medicines && t.medicines !== "[]" && t.medicines !== "null");
        if (latestWithMeds) {
           try { setActiveMedicines(JSON.parse(latestWithMeds.medicines)); } catch (e) { setActiveMedicines([]); }
        } else {
           setActiveMedicines([]);
        }

      } else {
        setError(data.message || "Failed to fetch patient data.");
      }
    } catch (err) {
      setError("Server connection error.");
    } finally {
      setLoading(false);
    }
  };

  const parseAllergies = (allergiesStr: string) => {
    if (!allergiesStr) return 'None reported';
    try {
      const parsed = JSON.parse(allergiesStr);
      const active = Object.keys(parsed).filter(k => k !== 'other' && parsed[k]);
      if (parsed.other) active.push(parsed.other);
      return active.length > 0 ? active.join(', ') : 'None reported';
    } catch { return 'None reported'; }
  };

  const handleAiSearch = async () => {
    if (!aiSearchQuery.trim() || !patientData) return;
    setAiSearchLoading(true);
    setAiSearchResult(null);
    try {
      const token = localStorage.getItem('upahaar_token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/doctors/scan/${patientData.patient.upahaar_id}/ai-search`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query: aiSearchQuery })
      });
      const data = await response.json();
      if (response.ok) {
        setAiSearchResult(data.summary);
      } else {
        setAiSearchResult("Error: " + data.message);
      }
    } catch (err) {
      setAiSearchResult("Failed to connect to AI service.");
    } finally {
      setAiSearchLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      <Script src="https://unpkg.com/html5-qrcode" strategy="lazyOnload" />
      <aside className="w-full md:w-64 bg-medical-dark text-white p-6 flex flex-col min-h-[10vh] md:min-h-screen">
        <h2 className="text-2xl font-bold mb-8">UPAHAAR</h2>
        <nav className="flex-1 space-y-4">
          <Link href="/dashboard/doctor" className="flex items-center gap-3 bg-white/10 p-3 rounded-lg font-semibold"><Scan size={20} /> Scan Patient</Link>
        </nav>
        <button onClick={() => { localStorage.clear(); window.location.href = '/auth/doctor/login'; }} className="flex items-center gap-2 text-red-400 hover:text-red-300 transition-colors mt-auto font-semibold">
          <LogOut size={18} /> Logout
        </button>
      </aside>

      <main className="flex-1 p-6 lg:p-10">
        <div className="max-w-6xl mx-auto space-y-8">
          
          <header className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Doctor Workspace</h1>
              <p className="text-gray-500">Scan citizen QR code to view their medical timeline.</p>
            </div>
            <Shield className="text-medical-blue" size={32} />
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column: Scanner & Search */}
            <div className="lg:col-span-1 space-y-6">
               <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center">
                  <h3 className="font-bold text-lg mb-4 text-gray-800">Scan QR Code</h3>
                  
                  {isScanning ? (
                    <div className="space-y-4">
                       <div className="w-full bg-white rounded-xl overflow-hidden relative border-2 border-medical-blue">
                         <div id="qr-reader" className="w-full h-full"></div>
                       </div>
                       <button onClick={stopScanner} className="text-sm font-semibold text-red-500 hover:underline">Cancel Scan</button>
                    </div>
                  ) : (
                    <button 
                      onClick={startScanner}
                      className="w-full bg-medical-blue hover:bg-blue-700 text-white p-12 rounded-xl flex flex-col items-center justify-center gap-4 transition-all"
                    >
                      <Scan size={48} className="opacity-80" />
                      <span className="font-bold">Start Camera Scanner</span>
                    </button>
                  )}

                  <div className="relative py-6">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
                    <div className="relative flex justify-center"><span className="bg-white px-4 text-sm text-gray-500 font-semibold uppercase tracking-wider">OR</span></div>
                  </div>

                  <form onSubmit={handleManualSearch} className="space-y-3">
                     <label className="block text-left text-sm font-semibold text-gray-700">Manual UPAHAAR ID</label>
                     <div className="flex gap-2">
                       <input 
                         type="text" 
                         placeholder="UPHR-123456" 
                         className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-medical-blue outline-none"
                         value={upahaarId}
                         onChange={(e) => setUpahaarId(e.target.value)}
                       />
                       <button type="submit" disabled={loading} className="bg-gray-800 hover:bg-black text-white px-4 rounded-lg flex justify-center items-center"><Search size={18}/></button>
                     </div>
                  </form>
               </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center">
                   <h3 className="font-bold text-lg mb-4 text-purple-800 flex justify-center items-center gap-2"><BrainCircuit size={20}/> AI Facial Recognition</h3>
                   
                   {isFaceScanning ? (
                     <div className="space-y-4">
                        <div className="w-full aspect-square bg-black rounded-xl overflow-hidden relative">
                          <video ref={faceVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                          <canvas ref={canvasRef} className="hidden" />
                          <div className="absolute inset-0 border-[4px] border-purple-500/50 rounded-xl m-4 z-10 pointer-events-none"></div>
                        </div>
                        <button onClick={captureAndScanFace} className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg font-bold transition-colors">Capture & Identify</button>
                        <button onClick={stopFaceScanner} className="text-sm font-semibold text-red-500 hover:underline block w-full">Cancel</button>
                     </div>
                   ) : (
                     <button 
                       onClick={startFaceScanner}
                       className="w-full bg-purple-100 hover:bg-purple-200 text-purple-700 p-8 rounded-xl flex flex-col items-center justify-center gap-3 transition-all"
                     >
                       <Camera size={40} className="opacity-80" />
                       <span className="font-bold">Scan Patient Face</span>
                     </button>
                   )}
                </div>
            </div>

            {/* Right Column: Patient Data */}
            <div className="lg:col-span-2">
               {loading ? (
                 <div className="bg-white p-10 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center h-full min-h-[400px]">
                   <div className="w-12 h-12 border-4 border-medical-blue border-t-transparent rounded-full animate-spin mb-4"></div>
                   <p className="text-gray-500 font-semibold">Decrypting medical records...</p>
                 </div>
               ) : error ? (
                 <div className="bg-red-50 p-10 rounded-2xl shadow-sm border border-red-100 flex flex-col items-center justify-center h-full min-h-[400px]">
                   <AlertCircle size={48} className="text-red-400 mb-4" />
                   <h2 className="text-xl font-bold text-gray-800 mb-2">Access Denied</h2>
                   <p className="text-gray-600 text-center">{error}</p>
                 </div>
               ) : patientData ? (
                 <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                    
                    {/* Patient Overview */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-wrap gap-6 items-start">
                       <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                          <User size={40} className="text-medical-blue" />
                       </div>
                       <div className="flex-1 min-w-[200px]">
                          <h2 className="text-2xl font-bold text-gray-800">{patientData.patient.full_name}</h2>
                          <p className="text-gray-500 font-mono tracking-widest">{patientData.patient.upahaar_id}</p>
                          <div className="flex gap-4 mt-3">
                             <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-xs font-bold border border-red-200">
                               Blood: {patientData.patient.blood_group || 'Unknown'}
                             </span>
                             <span className="flex items-center gap-1 text-sm text-gray-600 font-semibold">
                               <Phone size={14} /> {patientData.patient.phone}
                             </span>
                          </div>
                       </div>
                       <div className="w-full lg:w-auto bg-gray-50 p-4 rounded-xl border border-gray-200 text-sm">
                          <strong className="block text-gray-700 mb-1">Allergies</strong>
                          <p className="text-red-600 font-medium capitalize">{parseAllergies(patientData.patient.allergies)}</p>
                       </div>
                    </div>

                    {/* Active Medications (Ongoing) */}
                    {activeMedicines.length > 0 && (
                      <div className="bg-gradient-to-r from-medical-blue to-blue-600 p-6 rounded-2xl shadow-sm text-white">
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><Pill size={20} /> Ongoing Medications</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                           {activeMedicines.map((med, idx) => (
                              <div key={idx} className="bg-white/10 p-3 rounded-xl border border-white/20">
                                 <strong className="block text-lg">{med.name}</strong>
                                 <span className="text-sm text-blue-100">{med.frequency} • {med.duration}</span>
                              </div>
                           ))}
                        </div>
                      </div>
                    )}

                    {/* AI Medical History Search */}
                    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-2xl shadow-sm border border-indigo-100">
                      <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-indigo-900"><BrainCircuit size={20} className="text-indigo-600" /> AI Disease Search</h3>
                      <p className="text-sm text-indigo-700 mb-4">Search this patient's entire medical history for specific diseases or conditions. The AI will extract relevant incidents and prescribed medications.</p>
                      
                      <div className="flex gap-3 mb-4">
                        <input 
                          type="text" 
                          placeholder="e.g. Asthma, Diabetes, Knee Pain..." 
                          className="flex-1 p-3 rounded-xl border border-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                          value={aiSearchQuery}
                          onChange={(e) => setAiSearchQuery(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleAiSearch()}
                        />
                        <button 
                          onClick={handleAiSearch}
                          disabled={aiSearchLoading || !aiSearchQuery.trim()}
                          className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                        >
                          {aiSearchLoading ? 'Analyzing...' : 'Search History'}
                        </button>
                      </div>

                      {aiSearchResult && (
                        <div className="bg-white p-5 rounded-xl border border-indigo-200 shadow-sm mt-4">
                          <strong className="text-indigo-900 block mb-2 text-sm uppercase tracking-wide">AI Analysis Result:</strong>
                          <p className="text-gray-700 whitespace-pre-line leading-relaxed">{aiSearchResult}</p>
                        </div>
                      )}
                    </div>

                    {/* Timeline */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                       <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2"><Clock size={20} /> Historical Timeline</h3>
                       
                       <div className="space-y-4 pl-4 border-l-2 border-medical-blue/20">
                          {patientData.timeline.length === 0 ? (
                            <p className="text-gray-500 italic ml-4">No historical records available for this patient.</p>
                          ) : (
                            patientData.timeline.map((record: any) => (
                              <div key={record.id} className="relative pl-6 pb-6 last:pb-0">
                                <div className="absolute left-[-21px] top-1 bg-medical-blue text-white rounded-full p-1 border-4 border-white shadow-sm">
                                  <CheckCircle size={14} />
                                </div>
                                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 mt-2">
                                  <div className="flex justify-between items-start mb-2">
                                    <h4 className="font-bold text-gray-800">Prescription Upload</h4>
                                    <span className="text-xs font-bold text-gray-500">{new Date(record.created_at).toLocaleDateString()}</span>
                                  </div>
                                  <div className="flex justify-between items-center mb-3">
                                    <a href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${record.file_url}`} target="_blank" rel="noreferrer" className="text-xs font-bold text-medical-blue hover:underline">View Original File</a>
                                    {record.raw_ocr_text && (
                                      <div className="flex bg-white border border-gray-200 rounded-lg p-1 shadow-sm">
                                        <button 
                                          onClick={() => setViewModes(prev => ({ ...prev, [record.id]: 'summary' }))}
                                          className={`text-[10px] px-2 py-1 rounded-md font-bold transition-colors ${viewModes[record.id] !== 'raw' ? 'bg-medical-blue text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                        >AI Summary</button>
                                        <button 
                                          onClick={() => setViewModes(prev => ({ ...prev, [record.id]: 'raw' }))}
                                          className={`text-[10px] px-2 py-1 rounded-md font-bold transition-colors ${viewModes[record.id] === 'raw' ? 'bg-medical-blue text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                        >Original OCR</button>
                                      </div>
                                    )}
                                  </div>
                                  
                                  {viewModes[record.id] === 'raw' ? (
                                    <p className="text-sm text-gray-700 whitespace-pre-line bg-white p-3 rounded-lg border border-gray-200 font-mono leading-relaxed"><span className="font-bold text-medical-dark block mb-2 font-sans tracking-wide uppercase text-[10px]">Raw OCR Transcription:</span>{record.raw_ocr_text}</p>
                                  ) : (
                                    <p className="text-sm text-gray-700 whitespace-pre-line bg-white p-3 rounded-lg border border-gray-200"><span className="font-bold text-medical-dark block mb-1 tracking-wide uppercase text-[10px]">AI Diagnosis & Medicines:</span>{record.ai_extracted_data}</p>
                                  )}
                                </div>
                              </div>
                            ))
                          )}
                       </div>
                    </div>

                 </motion.div>
               ) : (
                 <div className="bg-white p-10 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center h-full min-h-[400px] text-center">
                   <Shield size={64} className="text-gray-200 mb-4" />
                   <h2 className="text-xl font-bold text-gray-400 mb-2">Awaiting Scan</h2>
                   <p className="text-gray-400">Scan a patient's QR code or enter their ID manually to securely view their medical records.</p>
                 </div>
               )}
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
