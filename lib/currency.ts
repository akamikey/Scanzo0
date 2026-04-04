import { COUNTRIES } from './countries';

export interface CurrencyData {
  amount: number;
  currency: string;
  symbol: string;
}

export const getCurrencyData = (amountInInr: number, countryName?: string): CurrencyData => {
  let isIndia = countryName === 'India';
  
  // If no countryName provided (not logged in), try to guess based on browser info
  if (!countryName) {
    try {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const locale = navigator.language;
      
      // If it's clearly India, use INR
      if (timezone.includes('Kolkata') || timezone.includes('Calcutta') || locale.includes('IN')) {
        isIndia = true;
      } else {
        // Otherwise default to USD for international visitors
        isIndia = false;
      }
    } catch (e) {
      // Fallback to India if detection fails
      isIndia = true;
    }
  }
  
  if (isIndia) {
    return {
      amount: amountInInr,
      currency: 'INR',
      symbol: '₹'
    };
  } else {
    // Standard conversion: 250 INR = 3 USD
    // Rate: 0.012 (approx 83.33 INR/USD)
    const usdAmount = amountInInr * 0.012;
    return {
      amount: Number(usdAmount.toFixed(2)),
      currency: 'USD',
      symbol: '$'
    };
  }
};

export const formatPrice = (amountInInr: number, countryName?: string) => {
  const data = getCurrencyData(amountInInr, countryName);
  
  const decimals = data.currency === 'INR' ? 0 : 2;
  
  return `${data.symbol}${data.amount.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`;
};
