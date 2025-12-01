import { Link } from 'react-router-dom';

const CTA = (): JSX.Element => {
  return (
    <section id='cta' className='bg-brand-800'>
      <div className='container mx-auto py-20 px-4 sm:px-6 lg:px-8'>
        <div className='max-w-3xl mx-auto text-center'>
          <h2 className='text-3xl md:text-4xl font-extrabold text-white'>
            Ready to Build Your E-commerce Empire?
          </h2>
          <p className='mt-4 text-lg text-brand-200'>
            Join thousands of creators and entrepreneurs launching their stores with the power of AI. No credit card required.
          </p>
          <div className='mt-8'>
            <Link
              to='/signup'
              className='inline-block bg-white text-brand-primary font-semibold px-10 py-4 rounded-lg shadow-lg hover:bg-gray-100 transition-transform transform hover:-translate-y-1 text-lg'
            >
              Start Free Today
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;
