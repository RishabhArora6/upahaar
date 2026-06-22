'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield } from 'lucide-react';

export default function DoctorLogin() {
  const [upahaarId, setUpahaarId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ upahaar_id: upahaarId, password })
      });

      const data = await response.json();

      if (response.ok) {
        if (data.role !== 'DOCTOR') {
            setError("Access denied: You are not registered as a Doctor.");
            setLoading(false);
            return;
        }
        localStorage.setItem('upahaar_token', data.token);
        localStorage.setItem('upahaar_role', data.role);
        window.location.href = '/dashboard/doctor';
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      setError('Error connecting to server. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center"><Shield className="text-medical-dark" size={48} /></div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Doctor Portal</h2>
        <p className="mt-2 text-center text-sm text-gray-600">Secure access for healthcare providers</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white py-8 px-4 shadow sm:rounded-xl sm:px-10 border-t-4 border-medical-dark">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm font-semibold">{error}</div>}
            <div><label className="block text-sm font-medium text-gray-700">Doctor UPAHAAR ID</label><input required className="mt-1 w-full border border-gray-300 rounded-lg p-3" type="text" placeholder="UPHR-XXXXXX" value={upahaarId} onChange={(e) => setUpahaarId(e.target.value)} /></div>
            <div><label className="block text-sm font-medium text-gray-700">Password</label><input required className="mt-1 w-full border border-gray-300 rounded-lg p-3" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} /></div>
            <button disabled={loading} type="submit" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-medical-dark hover:bg-gray-800 transition-colors disabled:opacity-50">
              {loading ? 'Authenticating...' : 'Secure Login'}
            </button>
            <div className="text-sm text-center mt-4"><a href="/auth/doctor/register" className="font-medium text-medical-dark hover:underline">New Doctor? Register here</a></div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
