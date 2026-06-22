'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Activity } from 'lucide-react';

export default function DoctorRegister() {
  const [formData, setFormData] = useState({
    full_name: '', email: '', phone: '', password: '', role: 'DOCTOR'
  });
  const [loading, setLoading] = useState(false);
  const [successId, setSuccessId] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/auth/register`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      if (response.ok) {
        setSuccessId(data.upahaar_id);
      } else {
        alert(data.message || 'Registration failed');
      }
    } catch (err) {
      alert("Server error");
    } finally {
      setLoading(false);
    }
  };

  if (successId) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md bg-white py-12 px-8 shadow-xl rounded-2xl text-center border-t-4 border-medical-dark">
          <Activity className="mx-auto text-medical-dark mb-4" size={48} />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Doctor Registration Complete</h2>
          <p className="text-gray-600 mb-6">Your Official DOCTOR ID is:</p>
          <div className="text-3xl font-mono font-bold text-medical-blue bg-blue-50 py-4 rounded-xl mb-6">{successId}</div>
          <p className="text-sm text-red-500 font-bold mb-6">Write this down. You need it to login.</p>
          <a href="/auth/doctor/login" className="w-full inline-block bg-medical-dark text-white py-3 rounded-xl font-bold">Login to Doctor Dashboard</a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="text-center text-3xl font-extrabold text-gray-900">Doctor Portal</h2>
        <p className="mt-2 text-center text-sm text-gray-600">Register as a Healthcare Provider</p>
      </div>
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white py-8 px-4 shadow sm:rounded-xl sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div><label className="block text-sm font-medium text-gray-700">Full Name (Dr.)</label><input required className="mt-1 w-full border rounded-lg p-2" type="text" onChange={e => setFormData({...formData, full_name: e.target.value})}/></div>
            <div><label className="block text-sm font-medium text-gray-700">Email address</label><input required className="mt-1 w-full border rounded-lg p-2" type="email" onChange={e => setFormData({...formData, email: e.target.value})}/></div>
            <div><label className="block text-sm font-medium text-gray-700">Phone</label><input required className="mt-1 w-full border rounded-lg p-2" type="tel" onChange={e => setFormData({...formData, phone: e.target.value})}/></div>
            <div><label className="block text-sm font-medium text-gray-700">Password</label><input required className="mt-1 w-full border rounded-lg p-2" type="password" onChange={e => setFormData({...formData, password: e.target.value})}/></div>
            <button disabled={loading} type="submit" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-medical-dark hover:bg-gray-800">{loading ? 'Processing...' : 'Register'}</button>
            <div className="text-sm text-center"><a href="/auth/doctor/login" className="font-medium text-medical-dark hover:text-gray-900">Already registered? Sign in</a></div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
