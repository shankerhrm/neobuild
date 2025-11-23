import React from 'react';
import PricingCard from '@/components/PricingCard';
import { pricingPlans, Plan } from '@/data/pricingData';

const PricingPage: React.FC = () => {
  return (
    <div className='bg-gray-50 py-12 sm:py-20'>
      <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
        <div className='text-center'>
          <h1 className='text-3xl font-extrabold text-gray-900 sm:text-4xl lg:text-5xl'>
            Find the perfect plan for your needs
          </h1>
          <p className='mt-4 text-lg text-gray-600'>
            Start for free, then grow with us. Simple, transparent pricing.
          </p>
        </div>

        <div className='mt-16 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3'>
          {pricingPlans.map((plan: Plan, index: number) => (
            <PricingCard 
              key={plan.name} 
              plan={plan} 
              style={{ animationDelay: `${index * 150}ms` }} 
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default PricingPage;
