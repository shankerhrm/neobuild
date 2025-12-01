import { Outlet } from 'react-router-dom';
import Footer from './Footer';
import Header from './Header';

const Layout = (): JSX.Element => {
  return (
    <div className='flex flex-col min-h-screen'>
      <Header />
      <main className='flex-grow'>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
