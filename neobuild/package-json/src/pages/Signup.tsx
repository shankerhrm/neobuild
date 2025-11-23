import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { MapPin } from 'lucide-react';

export default function Signup() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(null);
    try {
      const { error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: fullName } } });
      if (error) throw error;
      navigate('/');
    } catch (err: any) { setError(err.message); } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <MapPin className="h-12 w-12 text-brand-600 mx-auto" />
        <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Create Account</h2>
      </div>
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSignup}>
            {error && <div className="text-red-600 text-sm">{error}</div>}
            <input type="text" required value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Full Name" className="w-full border rounded p-2" />
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" className="w-full border rounded p-2" />
            <input type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" className="w-full border rounded p-2" />
            <button type="submit" disabled={loading} className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-600 hover:bg-brand-700">{loading ? 'Creating...' : 'Sign up'}</button>
          </form>
          <div className="mt-6 text-center">
            <Link to="/login" className="text-brand-600 hover:text-brand-500">Sign in instead</Link>
          </div>
        </div>
      </div>
    </div>
  );
}