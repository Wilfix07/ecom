import React from 'react';
import { CurrencyProvider } from './contexts/CurrencyContext';
import EcommercePlatform from './components/EcommercePlatform';

function App() {
  return (
    <CurrencyProvider>
      <EcommercePlatform />
    </CurrencyProvider>
  );
}

export default App;

