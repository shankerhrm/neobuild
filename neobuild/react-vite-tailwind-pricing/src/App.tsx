import React from 'react';
import PricingPage from '@/pages/PricingPage';
import ErrorBoundary from '@/components/ErrorBoundary';

function App(): React.ReactElement {
  return (
    <ErrorBoundary>
      <main className='min-h-screen w-full'>
        <PricingPage />
      </main>
    </ErrorBoundary>
  );
}

export default App;
