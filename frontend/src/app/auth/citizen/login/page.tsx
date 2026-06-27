'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function CitizenLogin() {
  const [credentials, setCredentials] = useState({ upahaar_id: '', password: '', totp_code: '' });
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('upahaar_token', data.token);
        
        if (data.is_setup_complete) {
          alert("Login successful! Welcome back.");
          window.location.href = '/dashboard/citizen';
        } else {
          alert("Login successful! Please complete your profile setup.");
          window.location.href = '/dashboard/citizen/profile-setup';
        }
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to connect to the backend server. Is it running on port 5000?');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-medical-light to-blue-50 flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white/20"
      >
        <div className="bg-medical-dark p-8 text-white text-center">
          <h2 className="text-3xl font-bold mb-2">Welcome Back</h2>
          <p className="text-blue-200">Access your digital health records</p>
        </div>

        <div className="p-8">
          <motion.form 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onSubmit={handleLogin} 
            className="space-y-6"
          >
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">UPAHAAR ID</label>
              <input 
                type="text" required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-medical-blue outline-none bg-gray-50/50"
                placeholder="UPHR-1234567890"
                onChange={e => setCredentials({...credentials, upahaar_id: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Password</label>
              <input 
                type="password" required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-medical-blue outline-none bg-gray-50/50"
                placeholder="••••••••"
                onChange={e => setCredentials({...credentials, password: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Authenticator Code (Optional)</label>
              <input 
                type="text"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-medical-blue outline-none bg-gray-50/50"
                placeholder="Leave blank if 2FA is off"
                onChange={e => setCredentials({...credentials, totp_code: e.target.value})}
              />
            </div>
            <motion.button 
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              className={`w-full py-4 text-white rounded-xl font-bold text-lg shadow-lg flex items-center justify-center gap-2 transition-all ${isLoading ? 'bg-gray-400 cursor-not-allowed shadow-none' : 'bg-medical-dark shadow-blue-900/30'}`}
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Logging in...
                </>
              ) : 'Login'}
            </motion.button>
            <p className="text-center text-sm text-gray-600">
              New to UPAHAAR? <Link href="/auth/citizen/register" className="text-medical-blue font-semibold hover:underline">Register</Link>
            </p>
          </motion.form>
        </div>
      </motion.div>
    </div>
  );
}
