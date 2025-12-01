import { useState, FormEvent } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

const SignUpPage = (): JSX.Element => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { signUp } = useAuth();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { error } = await signUp({ email, password });
      if (error) {
        setError(error.message);
      } else {
        setSuccess(true);
      }
    } catch (err) {
      setError('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className='flex items-center justify-center min-h-[calc(100vh-128px)] bg-gray-50 py-12 px-4 sm:px-6 lg:px-8'>
        <div className='max-w-md w-full space-y-8 p-10 bg-white shadow-lg rounded-xl text-center'>
          <h2 className='text-2xl font-bold text-gray-900'>Check your email!</h2>
          <p className='text-gray-600'>We've sent a confirmation link to {email}. Please click the link to complete your registration.</p>
        </div>
      </div>
    );
  }

  return (
    <div className='flex items-center justify-center min-h-[calc(100vh-128px)] bg-gray-50 py-12 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-md w-full space-y-8 p-10 bg-white shadow-lg rounded-xl'>
        <div>
          <h2 className='mt-6 text-center text-3xl font-extrabold text-gray-900'>Create an account</h2>
          <p className='mt-2 text-center text-sm text-gray-600'>
            Already have an account?{' '}
            <Link to='/signin' className='font-medium text-brand-primary hover:text-brand-800'>
              Sign in
            </Link>
          </p>
        </div>
        <form className='mt-8 space-y-6' onSubmit={handleSubmit}>
          <div className='rounded-md shadow-sm -space-y-px'>
            <div>
              <label htmlFor='email-address' className='sr-only'>Email address</label>
              <input id='email-address' name='email' type='email' autoComplete='email' required value={email} onChange={(e) => setEmail(e.target.value)} className='appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-brand-500 focus:border-brand-500 focus:z-10 sm:text-sm' placeholder='Email address' />
            </div>
            <div>
              <label htmlFor='password' className='sr-only'>Password</label>
              <input id='password' name='password' type='password' autoComplete='new-password' required value={password} onChange={(e) => setPassword(e.target.value)} className='appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-brand-500 focus:border-brand-500 focus:z-10 sm:text-sm' placeholder='Password (min. 6 characters)' />
            </div>
          </div>

          {error && <p className='text-sm text-red-600'>{error}</p>}

          <div>
            <button type='submit' disabled={loading} className='group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-brand-primary hover:bg-brand-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 disabled:bg-brand-300'>
              {loading && <Loader2 className='animate-spin mr-2' size={20} />}
              Create account
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignUpPage;
