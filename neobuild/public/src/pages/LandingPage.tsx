import Benefits from '@/components/sections/Benefits';
import CTA from '@/components/sections/CTA';
import Hero from '@/components/sections/Hero';
import HowItWorks from '@/components/sections/HowItWorks';
import Testimonials from '@/components/sections/Testimonials';

const LandingPage = (): JSX.Element => {
  return (
    <>
      <Hero />
      <Benefits />
      <HowItWorks />
      <Testimonials />
      <CTA />
    </>
  );
};

export default LandingPage;
