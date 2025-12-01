import { Link } from 'react-router-dom';

const Hero = (): JSX.Element => {
  return (
    <section className='bg-white py-20 md:py-32'>
      <div className='container mx-auto px-4 sm:px-6 lg:px-8 text-center'>
        <h1 className='text-4xl md:text-6xl font-extrabold text-gray-900 tracking-tight'>
          Launch Your Store in <span className='text-brand-primary'>Minutes</span>, Not Weeks
        </h1>
        <p className='mt-6 max-w-2xl mx-auto text-lg md:text-xl text-gray-600'>
          Leverage our AI-powered platform to build and deploy a fully-functional e-commerce store without writing a single line of code.
        </p>
        <div className='mt-8 flex justify-center gap-x-4'>
          <Link
            to='/signup'
            className='inline-block bg-brand-primary text-white font-semibold px-8 py-3 rounded-lg shadow-md hover:bg-brand-800 transition-transform transform hover:-translate-y-1'
          >
            Start Building for Free
          </Link>
          <a
            href='#how-it-works'
            className='inline-block bg-white text-gray-700 font-semibold px-8 py-3 rounded-lg border border-gray-300 hover:bg-gray-100 transition-transform transform hover:-translate-y-1'
          >
            How It Works
          </a>
        </div>
      </div>
    </section>
  );
};

export default Hero;
