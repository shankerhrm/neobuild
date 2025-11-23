export interface Feature {
  text: string;
  included: boolean;
}

export interface Plan {
  name: string;
  description: string;
  price: number;
  features: Feature[];
  cta: string;
  recommended?: boolean;
}

export const pricingPlans: Plan[] = [
  {
    name: 'Starter',
    description: 'Perfect for individuals and small projects.',
    price: 15,
    features: [
      { text: '5 Projects', included: true },
      { text: 'Basic Analytics', included: true },
      { text: '24/7 Email Support', included: false },
      { text: 'Advanced Reporting', included: false },
    ],
    cta: 'Choose Starter',
  },
  {
    name: 'Pro',
    description: 'Ideal for growing businesses and professionals.',
    price: 45,
    features: [
      { text: '25 Projects', included: true },
      { text: 'Advanced Analytics', included: true },
      { text: '24/7 Email Support', included: true },
      { text: 'Advanced Reporting', included: false },
    ],
    cta: 'Choose Pro',
    recommended: true,
  },
  {
    name: 'Enterprise',
    description: 'For large organizations needing more power.',
    price: 95,
    features: [
      { text: 'Unlimited Projects', included: true },
      { text: 'Advanced Analytics', included: true },
      { text: '24/7 Email Support', included: true },
      { text: 'Advanced Reporting', included: true },
    ],
    cta: 'Contact Sales',
  },
];
