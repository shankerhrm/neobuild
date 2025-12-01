const Testimonials = (): JSX.Element => {
  const testimonials = [
    {
      quote: 'Neo Commerce is a game-changer. We launched our new brand in a weekend, something that would have taken months and thousands of dollars with an agency.',
      name: 'Sarah L.',
      title: 'Founder of Stellar Goods',
      avatar: 'https://placehold.co/100x100/6c9cff/FFFFFF/png?text=SL'
    },
    {
      quote: 'The ability to export the code is what sold me. I\'m not locked into a platform, and my developers can build custom features on a solid foundation.',
      name: 'Mike R.',
      title: 'CTO, TechForward Inc.',
      avatar: 'https://placehold.co/100x100/5078e9/FFFFFF/png?text=MR'
    }
  ];

  return (
    <section id='testimonials' className='py-20 bg-gray-50'>
      <div className='container mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-12 items-center'>
          <div className='text-center lg:text-left'>
            <h2 className='text-3xl md:text-4xl font-extrabold text-gray-900'>Loved by Modern Entrepreneurs</h2>
            <p className='mt-4 text-lg text-gray-600'>
              Don\'t just take our word for it. See what our customers are saying about building their businesses with Neo Commerce.
            </p>
          </div>
          <div className='space-y-8'>
            {testimonials.map((testimonial, index) => (
              <blockquote key={index} className='bg-white p-6 rounded-lg shadow-md border border-gray-200/60'>
                <p className='text-gray-700 italic'>"{testimonial.quote}"</p>
                <footer className='mt-4 flex items-center'>
                  <img className='h-12 w-12 rounded-full object-cover' src={testimonial.avatar} alt={`Avatar of ${testimonial.name}`} />
                  <div className='ml-4'>
                    <p className='font-bold text-gray-900'>{testimonial.name}</p>
                    <p className='text-sm text-gray-500'>{testimonial.title}</p>
                  </div>
                </footer>
              </blockquote>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
