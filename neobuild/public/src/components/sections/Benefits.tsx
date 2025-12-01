import { Zap, ShieldCheck, Code } from 'lucide-react';
import { ReactNode } from 'react';

interface BenefitCardProps {
  icon: ReactNode;
  title: string;
  description: string;
}

const BenefitCard = ({ icon, title, description }: BenefitCardProps): JSX.Element => (
  <div className='bg-white p-8 rounded-xl shadow-lg border border-gray-200/50 transition-transform transform hover:-translate-y-2'>
    <div className='flex items-center justify-center h-12 w-12 rounded-full bg-brand-100 text-brand-primary mb-4'>
      {icon}
    </div>
    <h3 className='text-xl font-bold text-gray-900'>{title}</h3>
    <p className='mt-2 text-gray-600'>{description}</p>
  </div>
);

const Benefits = (): JSX.Element => {
  const benefitsData = [
    {
      icon: <Zap size={24} />,
      title: 'From Idea to Live Store',
      description: 'Our AI scaffolds your entire project in minutes. Just describe your brand, and watch your store come to life instantly.'
    },
    {
      icon: <ShieldCheck size={24} />,
      title: 'Production-Ready',
      description: 'Get a complete solution with secure authentication, a pre-configured database, and a beautiful, responsive UI out of the box.'
    },
    {
      icon: <Code size={24} />,
      title: 'Own Your Code',
      description: 'Export your entire codebase anytime. It\'s standard React & TypeScript, so you can extend, customize, or host it anywhere.'
    }
  ];

  return (
    <section id='benefits' className='py-20 bg-gray-50'>
      <div className='container mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='text-center mb-12'>
          <h2 className='text-3xl md:text-4xl font-extrabold text-gray-900'>Everything You Need to Succeed</h2>
          <p className='mt-4 max-w-2xl mx-auto text-lg text-gray-600'>
            We provide the foundation, so you can focus on what matters: your business.
          </p>
        </div>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
          {benefitsData.map((benefit, index) => (
            <BenefitCard key={index} icon={benefit.icon} title={benefit.title} description={benefit.description} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Benefits;
