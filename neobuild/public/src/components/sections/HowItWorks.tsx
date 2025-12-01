import { Bot, Pencil, Rocket } from 'lucide-react';
import { ReactNode } from 'react';

interface StepProps {
  icon: ReactNode;
  title: string;
  description: string;
  stepNumber: number;
}

const Step = ({ icon, title, description, stepNumber }: StepProps): JSX.Element => (
  <div className='relative pl-12 pb-8'>
     <div className='absolute left-0 top-0 flex items-center justify-center w-10 h-10 rounded-full bg-brand-primary text-white font-bold text-lg'>
        {stepNumber}
     </div>
     <div className='absolute left-5 top-10 h-full border-l-2 border-dashed border-brand-200'></div>
     <div className='flex items-center mb-2'>
        <div className='text-brand-800 mr-3'>{icon}</div>
        <h3 className='text-xl font-bold text-gray-900'>{title}</h3>
     </div>
     <p className='text-gray-600'>{description}</p>
  </div>
);

const HowItWorks = (): JSX.Element => {
  const steps = [
    {
      icon: <Bot size={24} />,
      title: 'Describe Your Vision',
      description: 'Tell our AI about your business, products, and brand identity using simple, natural language.'
    },
    {
      icon: <Pencil size={24} />,
      title: 'Customize & Refine',
      description: 'Visually edit your generated storefront, tweak layouts, and add your content with our intuitive editor.'
    },
    {
      icon: <Rocket size={24} />,
      title: 'Launch Your Store',
      description: 'Connect your domain and go live with a single click. Your store is deployed on a global, high-performance network.'
    }
  ];

  return (
    <section id='how-it-works' className='py-20 bg-white'>
      <div className='container mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='text-center mb-12'>
          <h2 className='text-3xl md:text-4xl font-extrabold text-gray-900'>Get Started in 3 Simple Steps</h2>
          <p className='mt-4 max-w-2xl mx-auto text-lg text-gray-600'>
            From concept to a live e-commerce store in record time.
          </p>
        </div>
        <div className='max-w-2xl mx-auto'>
          {steps.map((step, index) => (
            <Step key={index} stepNumber={index + 1} icon={step.icon} title={step.title} description={step.description} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
