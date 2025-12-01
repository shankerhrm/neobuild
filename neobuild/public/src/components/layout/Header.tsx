import { useState } from 'react';
import { Menu, X, User, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Link, useNavigate } from 'react-router-dom';

const Header = (): JSX.Element => {
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const navLinks = [
    { name: 'Features', href: '/#benefits' },
    { name: 'How It Works', href: '/#how-it-works' },
    { name: 'Testimonials', href: '/#testimonials' },
  ];

  return (
    <header className='bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-200'>
      <div className='container mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex items-center justify-between h-16'>
          <div className='flex-shrink-0'>
            <Link to='/' className='flex items-center'>
              <img src='/logo_techbilla.png' alt='Neo Commerce Logo' className='h-8 w-auto' />
            </Link>
          </div>
          <div className='hidden md:block'>
            <div className='ml-10 flex items-baseline space-x-4'>
              {navLinks.map((link) => (
                <a key={link.name} href={link.href} className='text-gray-600 hover:text-brand-primary px-3 py-2 rounded-md text-sm font-medium transition-colors'>
                  {link.name}
                </a>
              ))}
            </div>
          </div>
          <div className='hidden md:flex items-center gap-4'>
            {user ? (
              <div className='relative'>
                <button onClick={() => setIsProfileOpen(!isProfileOpen)} className='flex items-center justify-center w-10 h-10 bg-brand-100 rounded-full text-brand-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary'>
                  <User size={20} />
                </button>
                {isProfileOpen && (
                  <div className='absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5'>
                    <Link to='/dashboard' className='block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100'>Dashboard</Link>
                    <button onClick={handleSignOut} className='w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50'>
                      <LogOut size={16} />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className='flex items-center gap-2'>
                <Link to='/signin' className='text-gray-600 hover:text-brand-primary px-4 py-2 rounded-md text-sm font-medium transition-colors'>
                  Sign In
                </Link>
                <Link to='/signup' className='bg-brand-primary text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-brand-800 transition-colors'>
                  Sign Up Free
                </Link>
              </div>
            )}
          </div>
          <div className='-mr-2 flex md:hidden'>
            <button
              onClick={() => setIsOpen(!isOpen)}
              type='button'
              className='bg-white inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-brand-primary hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-brand-primary'
              aria-controls='mobile-menu'
              aria-expanded='false'
            >
              <span className='sr-only'>Open main menu</span>
              {isOpen ? <X className='block h-6 w-6' /> : <Menu className='block h-6 w-6' />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className='md:hidden' id='mobile-menu'>
          <div className='px-2 pt-2 pb-3 space-y-1 sm:px-3'>
            {navLinks.map((link) => (
              <a key={link.name} href={link.href} className='text-gray-600 hover:text-brand-primary block px-3 py-2 rounded-md text-base font-medium transition-colors'>
                {link.name}
              </a>
            ))}
          </div>
          <div className='pt-4 pb-3 border-t border-gray-200 px-2'>
            {user ? (
               <div className='flex flex-col gap-2'>
                <Link to='/dashboard' className='w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100'>Dashboard</Link>
                <button onClick={handleSignOut} className='w-full text-left flex items-center gap-2 px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50'>
                  <LogOut size={16} />
                  Logout
                </button>
               </div>
            ) : (
              <div className='flex flex-col gap-2'>
                <Link to='/signin' className='w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-base font-medium text-gray-700 bg-white hover:bg-gray-50'>
                  Sign In
                </Link>
                <Link to='/signup' className='w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-brand-primary hover:bg-brand-800'>
                  Sign Up Free
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
