export interface CurrencyOption {
  code: string;
  symbol: string;
  name: string;
  flag: string;
  proPriceAmount: string;
  proPriceFormatted: string;
  freePriceFormatted: string;
  notes: string;
}

export const CURRENCY_OPTIONS: CurrencyOption[] = [
  {
    code: 'USD',
    symbol: '$',
    name: 'US Dollar (USD)',
    flag: '🇺🇸',
    proPriceAmount: '3.00',
    proPriceFormatted: '$3.00',
    freePriceFormatted: 'Free',
    notes: 'Standard rate for US Dollar payments.',
  },
  {
    code: 'EUR',
    symbol: '€',
    name: 'Euro (EUR)',
    flag: '🇪🇺',
    proPriceAmount: '11.00',
    proPriceFormatted: '€11.00',
    freePriceFormatted: 'Free',
    notes: 'Standard rate for Euro payments.',
  },
  {
    code: 'GBP',
    symbol: '£',
    name: 'British Pound (GBP)',
    flag: '🇬🇧',
    proPriceAmount: '9.50',
    proPriceFormatted: '£9.50',
    freePriceFormatted: 'Free',
    notes: 'Standard rate for British Pound payments.',
  },
  {
    code: 'NGN',
    symbol: '₦',
    name: 'Nigerian Naira (NGN)',
    flag: '🇳🇬',
    proPriceAmount: '3,500',
    proPriceFormatted: '₦3,500',
    freePriceFormatted: 'Free',
    notes: 'Standard rate for Nigerian Naira payments.',
  },
  {
    code: 'GHS',
    symbol: 'GH₵',
    name: 'Ghanaian Cedi (GHS)',
    flag: '🇬🇭',
    proPriceAmount: '35',
    proPriceFormatted: 'GH₵ 35',
    freePriceFormatted: 'Free',
    notes: 'Standard rate for Ghanaian Cedi payments.',
  },
  {
    code: 'KES',
    symbol: 'KSh',
    name: 'Kenyan Shilling (KES)',
    flag: '🇰🇪',
    proPriceAmount: '350',
    proPriceFormatted: 'KSh 350',
    freePriceFormatted: 'Free',
    notes: 'Standard rate for Kenyan Shilling payments.',
  },
  {
    code: 'ZAR',
    symbol: 'R',
    name: 'South African Rand (ZAR)',
    flag: '🇿🇦',
    proPriceAmount: '49',
    proPriceFormatted: 'R 49',
    freePriceFormatted: 'Free',
    notes: 'Standard rate for South African Rand payments.',
  },
  {
    code: 'XOF',
    symbol: 'FCFA',
    name: 'CFA Franc (XOF/XAF)',
    flag: '🇸🇳',
    proPriceAmount: '1,500',
    proPriceFormatted: '1,500 FCFA',
    freePriceFormatted: 'Free',
    notes: 'Standard rate for CFA Franc payments.',
  },
  {
    code: 'EGP',
    symbol: 'E£',
    name: 'Egyptian Pound (EGP)',
    flag: '🇪🇬',
    proPriceAmount: '120',
    proPriceFormatted: 'E£ 120',
    freePriceFormatted: 'Free',
    notes: 'Standard rate for Egyptian Pound payments.',
  },
  {
    code: 'ETB',
    symbol: 'Br',
    name: 'Ethiopian Birr (ETB)',
    flag: '🇪🇹',
    proPriceAmount: '250',
    proPriceFormatted: 'Br 250',
    freePriceFormatted: 'Free',
    notes: 'Standard rate for Ethiopian Birr payments.',
  },
  {
    code: 'RWF',
    symbol: 'FRw',
    name: 'Rwandan Franc (RWF)',
    flag: '🇷🇼',
    proPriceAmount: '3,200',
    proPriceFormatted: 'FRw 3,200',
    freePriceFormatted: 'Free',
    notes: 'Standard rate for Rwandan Franc payments.',
  },
  {
    code: 'UGX',
    symbol: 'USh',
    name: 'Ugandan Shilling (UGX)',
    flag: '🇺🇬',
    proPriceAmount: '9,500',
    proPriceFormatted: 'USh 9,500',
    freePriceFormatted: 'Free',
    notes: 'Standard rate for Ugandan Shilling payments.',
  },
];

export const DEFAULT_CURRENCY_CODE = 'USD';

export function getCurrencyByCode(code: string): CurrencyOption {
  const found = CURRENCY_OPTIONS.find((c) => c.code === code);
  if (found) return found;
  return CURRENCY_OPTIONS.find((c) => c.code === 'USD') || CURRENCY_OPTIONS[0];
}

