import { useAuth } from '@/hooks/useAuth';

const DashboardPage = (): JSX.Element => {
  const { user } = useAuth();

  return (
    <div className='container mx-auto px-4 sm:px-6 lg:px-8 py-12'>
      <div className='bg-white p-8 rounded-lg shadow-md'>
        <h1 className='text-3xl font-bold text-gray-900'>Welcome to your Dashboard</h1>
        <p className='mt-4 text-lg text-gray-600'>
          This is a protected area. You can only see this if you are logged in.
        </p>
        {user && (
          <div className='mt-6 p-4 bg-gray-100 rounded-md border border-gray-200'>
            <p className='text-gray-800'>
              <strong>Email:</strong> {user.email}
            </p>
            <p className='text-gray-800'>
              <strong>User ID:</strong> {user.id}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
