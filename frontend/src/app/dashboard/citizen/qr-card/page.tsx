'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Phone, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function CitizenQRCard() {
  const [profile, setProfile] = useState<any>(null);
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
          setProfile(data);
        }
      } catch (err) {
        console.error('Failed to fetch profile', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const getAllergiesString = () => {
    if (!profile?.allergies) return 'None reported';
    try {
      const parsed = JSON.parse(profile.allergies);
      const active = Object.keys(parsed).filter(k => k !== 'other' && parsed[k]);
      if (parsed.other) active.push(parsed.other);
      return active.length > 0 ? active.join(', ') : 'None reported';
    } catch {
      return 'None reported';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500 font-semibold animate-pulse">Loading secure medical ID...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-red-500 font-semibold">Failed to load profile. Please log in again.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-md w-full space-y-8">
        
        <div className="text-center">
          <Link href="/dashboard/citizen" className="text-sm font-bold text-medical-blue hover:underline mb-4 inline-block">&larr; Back to Dashboard</Link>
          <h2 className="text-3xl font-extrabold text-gray-900">Your Health Card</h2>
          <p className="mt-2 text-sm text-gray-600">
            Show this QR to any authorized doctor for instant timeline access.
          </p>
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 relative"
        >
          {/* Card Header */}
          <div className="bg-gradient-to-r from-medical-blue to-medical-dark p-6 text-white text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 -mt-4 -mr-4 bg-white/10 w-24 h-24 rounded-full blur-xl"></div>
            <Shield className="mx-auto mb-2 opacity-80" size={36} />
            <h3 className="text-2xl font-bold tracking-wider">UPAHAAR</h3>
            <p className="text-blue-200 text-sm uppercase tracking-widest mt-1 font-medium">Digital Medical Identity</p>
          </div>

          {/* User Info */}
          <div className="p-6 text-center border-b border-gray-100 bg-gray-50/50">
            <h4 className="text-2xl font-bold text-gray-800">{profile.full_name}</h4>
            <p className="text-gray-500 font-mono mt-1 tracking-widest text-lg">{profile.upahaar_id}</p>
          </div>

          {/* QR Code Placeholder */}
          <div className="p-8 flex justify-center bg-white">
            <div className="bg-white p-4 rounded-2xl shadow-[inset_0_-2px_10px_rgba(0,0,0,0.05)] border border-gray-200 inline-block relative hover:scale-105 transition-transform cursor-pointer">
              <div className="w-48 h-48 bg-gray-50 rounded-lg flex items-center justify-center relative overflow-hidden">
                {/* Fallback to a fast, reliable Image API to avoid npm install errors */}
                <img 
                   src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${profile.upahaar_id}`} 
                   alt="QR Code" 
                   className="relative z-10 w-[150px] h-[150px]" 
                />
              </div>
            </div>
          </div>

          {/* Emergency Info */}
          <div className="bg-red-50 p-6 flex flex-col gap-4 border-t border-red-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-red-700">
                <AlertCircle size={20} />
                <span className="font-bold text-lg">Emergency Info</span>
              </div>
              {profile.blood_group ? (
                <span className="bg-red-100 text-red-800 px-4 py-1.5 rounded-full text-sm font-bold border border-red-200 shadow-sm">
                  Blood: {profile.blood_group}
                </span>
              ) : (
                <span className="bg-orange-100 text-orange-800 px-4 py-1.5 rounded-full text-sm font-bold border border-orange-200 shadow-sm">
                  Profile Incomplete
                </span>
              )}
            </div>
            
            <div className="text-sm text-red-800 space-y-2">
              <p className="bg-red-100/50 p-2 rounded-lg border border-red-100">
                <strong className="block text-xs uppercase tracking-wide opacity-80">Allergies</strong> 
                <span className="capitalize">{getAllergiesString()}</span>
              </p>
              <p className="flex items-center gap-2 bg-red-100/50 p-2 rounded-lg border border-red-100">
                <Phone size={16} className="opacity-80 shrink-0" /> 
                <span className="font-medium break-all">{profile.phone} (Primary Phone)</span>
              </p>
            </div>
          </div>

        </motion.div>

      </div>
    </div>
  );
}
