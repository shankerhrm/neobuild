import { Outlet, Link, useLocation as useRouterLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { LogOut, LayoutDashboard, History, ShieldCheck } from 'lucide-react';
import { clsx } from 'clsx';

export default function Layout() {
  const { signOut, profile } = useAuth();
  const location = useRouterLocation();

  const isActive = (path: string) => location.pathname === path;
  const isAdmin = profile?.role === 'admin';

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <span className="text-xl font-bold text-brand-600">SiteTrack</span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-1">
                {isAdmin ? (
                  <Link 
                    to="/admin"
                    className={clsx(
                      "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors",
                      isActive('/admin') ? "bg-brand-50 text-brand-700" : "text-gray-600 hover:bg-gray-50 hover:text-brand-600"
                    )}
                  >
                    <LayoutDashboard className="h-4 w-4 mr-2" />
                    Dashboard
                  </Link>
                ) : (
                  <>
                    <Link 
                      to="/"
                      className={clsx(
                        "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors",
                        isActive('/') ? "bg-brand-50 text-brand-700" : "text-gray-600 hover:bg-gray-50 hover:text-brand-600"
                      )}
                    >
                      <LayoutDashboard className="h-4 w-4 mr-2" />
                      Track Visit
                    </Link>
                    <Link 
                      to="/history"
                      className={clsx(
                        "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors",
                        isActive('/history') ? "bg-brand-50 text-brand-700" : "text-gray-600 hover:bg-gray-50 hover:text-brand-600"
                      )}
                    >
                      <History className="h-4 w-4 mr-2" />
                      My History
                    </Link>
                  </>
                )}
              </div>
              <div className="flex items-center space-x-3 ml-4 pl-4 border-l border-gray-200">
                <div className="flex flex-col items-end">
                   <span className="text-sm font-bold text-gray-800 hidden sm:block leading-none">{profile?.full_name || "User"}</span>
                   <span className="text-xs text-gray-500 hidden sm:block">{isAdmin ? 'Administrator' : 'Sales Engineer'}</span>
                </div>
                <button 
                  onClick={() => signOut()}
                  className="p-2 rounded-full text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
}