'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function CitizenRegister() {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: '',
    dob: '',
    face_photo: null as File | null,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: 'CITIZEN',
          full_name: formData.full_name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          dob: formData.dob,
          face_photo_url: 'dummy-url-for-now'
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        alert(`Registration successful! Your UPAHAAR ID is: ${data.upahaar_id}`);
        window.location.href = '/auth/citizen/login';
      } else {
        alert(`Error: ${data.message}`);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to connect to the backend server. Is it running on port 5000?');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-medical-light to-blue-50 flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white/20"
      >
        <div className="bg-medical-blue p-8 text-white text-center">
          <h2 className="text-3xl font-bold mb-2">Citizen Registration</h2>
          <p className="text-blue-100">Create your unified digital medical identity</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Full Name</label>
              <input 
                type="text" required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-medical-blue focus:border-transparent outline-none transition-all bg-gray-50/50"
                placeholder="John Doe"
                onChange={e => setFormData({...formData, full_name: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Email Address</label>
              <input 
                type="email" required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-medical-blue focus:border-transparent outline-none transition-all bg-gray-50/50"
                placeholder="john@example.com"
                onChange={e => setFormData({...formData, email: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Phone Number (For OTP)</label>
              <input 
                type="tel" required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-medical-blue focus:border-transparent outline-none transition-all bg-gray-50/50"
                placeholder="+91 9876543210"
                onChange={e => setFormData({...formData, phone: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Date of Birth</label>
              <input 
                type="date" required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-medical-blue focus:border-transparent outline-none transition-all bg-gray-50/50"
                onChange={e => setFormData({...formData, dob: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Secure Password</label>
              <input 
                type="password" required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-medical-blue focus:border-transparent outline-none transition-all bg-gray-50/50"
                placeholder="••••••••"
                onChange={e => setFormData({...formData, password: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-2 mt-4">
            <label className="text-sm font-semibold text-gray-700">Face Recognition Photo (Emergency Access)</label>
            <div className="border-2 border-dashed border-medical-blue/30 rounded-xl p-6 text-center hover:bg-blue-50/50 transition-colors cursor-pointer">
              <input 
                type="file" accept="image/*"
                className="hidden" id="face-upload"
                onChange={e => setFormData({...formData, face_photo: e.target.files?.[0] || null})}
              />
              <label htmlFor="face-upload" className="cursor-pointer">
                <span className="text-medical-blue font-semibold">Click to upload</span> or drag and drop
                <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 5MB</p>
              </label>
              {formData.face_photo && <p className="mt-2 text-sm text-green-600 font-medium">Selected: {formData.face_photo.name}</p>}
            </div>
          </div>

          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-4 bg-medical-blue text-white rounded-xl font-bold text-lg shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all"
            type="submit"
          >
            Create UPAHAAR Account
          </motion.button>
          
          <p className="text-center text-sm text-gray-600 mt-4">
            Already have an account? <Link href="/auth/citizen/login" className="text-medical-blue font-semibold hover:underline">Login here</Link>
          </p>
        </form>
      </motion.div>
    </div>
  );
}
