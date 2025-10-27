import React, { createContext, useContext, useState, useEffect } from 'react';

const CurrencyContext = createContext();

export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrency] = useState(() => {
    // Load from localStorage or default to HTG
    return localStorage.getItem('currency') || 'HTG';
  });

  const [exchangeRate, setExchangeRate] = useState(135); // 1 USD = 135 HTG
  const [currencySymbol, setCurrencySymbol] = useState('HTG');
  const [autoConversion, setAutoConversion] = useState(true);

  // Save to localStorage whenever currency changes
  useEffect(() => {
    localStorage.setItem('currency', currency);
    setCurrencySymbol(currency);
  }, [currency]);

  // Convert price based on selected currency and exchange rate
  const convertPrice = (priceInHTG) => {
    if (!autoConversion) return priceInHTG;
    
    if (currency === 'USD') {
      return priceInHTG / exchangeRate;
    }
    return priceInHTG;
  };

  // Format price with currency symbol
  const formatPrice = (priceInHTG) => {
    const convertedPrice = convertPrice(priceInHTG);
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(convertedPrice);
  };

  // Get full price string with symbol
  const getPriceString = (priceInHTG) => {
    const formatted = formatPrice(priceInHTG);
    return currency === 'USD' ? `$${formatted}` : `${formatted} HTG`;
  };

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency,
        exchangeRate,
        setExchangeRate,
        currencySymbol,
        autoConversion,
        setAutoConversion,
        convertPrice,
        formatPrice,
        getPriceString,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};

