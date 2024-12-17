// lib/config/payment.ts
export const PAYMENT_CONFIG = {
    TIPS: {
      MIN_AMOUNT: 5, // 5 PLN
      MAX_AMOUNT: 500, // 500 PLN
    },
    FEES: {
      BASE_FEE: 100, // 1 PLN w groszach
      PERCENTAGE_FEE: 4.5, // 4.5%
    }
  };
  
  export const validateTipAmount = (amount: number): boolean => {
    return amount >= PAYMENT_CONFIG.TIPS.MIN_AMOUNT && 
           amount <= PAYMENT_CONFIG.TIPS.MAX_AMOUNT;
  };
  
  export const calculateApplicationFee = (amount: number): number => {
    // Konwertujemy kwotę na grosze
    const amountInCents = Math.round(amount * 100);
    
    // Obliczamy prowizję procentową (4.5%)
    const percentageFee = Math.round(amountInCents * (PAYMENT_CONFIG.FEES.PERCENTAGE_FEE / 100));
    
    // Zawsze doliczamy podstawową opłatę 1 PLN
    return PAYMENT_CONFIG.FEES.BASE_FEE + percentageFee;
  };