import React from 'react';
import { Check, X } from 'lucide-react';
import { Plan } from '@/data/pricingData';

interface PricingCardProps {
  plan: Plan;
  style?: React.CSSProperties;
}

const PricingCard: React.FC<PricingCardProps> = ({ plan, style }) => {
  const isRecommended = plan.recommended;

  const cardClasses = `
    flex flex-col rounded-2xl border p-8 text-center shadow-lg animate-fade-in-up
    ${isRecommended ? 'border-primary-dark' : 'border-gray-200'}
  `;

  const buttonClasses = `
    mt-8 block w-full rounded-md py-3 text-sm font-semibold transition-transform duration-200 hover:scale-105
    ${isRecommended 
      ? 'bg-primary-dark text-white hover:bg-primary-darker'
      : 'bg-primary-lightest text-primary-darkest hover:bg-primary-light'
    }
  `;

  return (
    <div className={cardClasses} style={style}>
      {isRecommended && (
        <div className='absolute -top-4 left-1/2 -translate-x-1/2 transform rounded-full bg-primary-dark px-4 py-1 text-sm font-semibold text-white'>
          Recommended
        </div>
      )}
      <h3 className='text-lg font-semibold leading-8 text-gray-900'>{plan.name}</h3>
      <p className='mt-4 text-sm leading-6 text-gray-600'>{plan.description}</p>
      <div className='mt-6 flex items-baseline justify-center gap-x-1'>
        <span className='text-4xl font-bold tracking-tight text-gray-900'>${plan.price}</span>
        <span className='text-sm font-semibold leading-6 text-gray-600'>/month</span>
      </div>
      <ul role='list' className='mt-8 space-y-3 text-sm leading-6 text-gray-600'>
        {plan.features.map((feature) => (
          <li key={feature.text} className='flex gap-x-3'>
            {feature.included ? (
              <Check className='h-6 w-5 flex-none text-primary-dark' aria-hidden='true' />
            ) : (
              <X className='h-6 w-5 flex-none text-gray-400' aria-hidden='true' />
            )}
            {feature.text}
          </li>
        ))}
      </ul>
      <a href='#' className={buttonClasses}>
        {plan.cta}
      </a>
    </div>
  );
};

export default PricingCard;
