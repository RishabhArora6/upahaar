import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-medical-light p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl w-full text-center">
        <h1 className="text-4xl font-bold text-medical-dark mb-4">Welcome to UPAHAAR</h1>
        <p className="text-gray-600 mb-8">
          Unified Permanent Account for Healthcare Access & Authorization Registry.
          Your complete, secure digital medical identity.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link href="/auth/citizen/login" className="px-6 py-3 bg-medical-blue text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors">
            Citizen Login
          </Link>
          <Link href="/auth/doctor/login" className="px-6 py-3 bg-white text-medical-blue border-2 border-medical-blue rounded-lg font-semibold hover:bg-blue-50 transition-colors">
            Doctor Login
          </Link>
        </div>
      </div>
    </main>
  );
}
