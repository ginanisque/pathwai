import { MobilityProfile } from '../types';

export interface MissingProfileField {
  key: string;
  label: string;
}

export interface ProfileCompleteness {
  percentage: number;
  isFilled: boolean;
  missingFields: MissingProfileField[];
}

export function checkProfileCompleteness(profile: Partial<MobilityProfile> | undefined | null): ProfileCompleteness {
  if (!profile) {
    return {
      percentage: 0,
      isFilled: false,
      missingFields: [
        { key: 'fullName', label: 'Full Name' },
        { key: 'nationality', label: 'Nationality / Passport Citizenship' },
        { key: 'currentCountry', label: 'Current Residence Country' },
        { key: 'destinationCountries', label: 'Target Destination Country' },
        { key: 'visaType', label: 'Target Visa Category / Program' },
        { key: 'budget', label: 'Liquid Savings / Capital Budget' },
        { key: 'passportExpiration', label: 'Passport Expiration Date' }
      ]
    };
  }

  const fields = [
    { key: 'fullName', label: 'Full Name', val: !!profile.fullName?.trim() },
    { key: 'nationality', label: 'Nationality / Passport Citizenship', val: !!profile.nationality?.trim() },
    { key: 'currentCountry', label: 'Current Residence Country', val: !!profile.currentCountry?.trim() },
    { key: 'destinationCountries', label: 'Target Destination Country', val: !!(profile.destinationCountries && profile.destinationCountries.length > 0 && profile.destinationCountries[0]?.trim()) },
    { key: 'visaType', label: 'Target Visa Category / Program', val: !!(profile.visaType?.trim() || profile.purposeOfTravel) },
    { key: 'budget', label: 'Liquid Savings / Capital Budget', val: typeof profile.budget === 'number' && profile.budget > 0 },
    { key: 'passportExpiration', label: 'Passport Expiration Date', val: !!profile.passportExpiration?.trim() }
  ];

  const completed = fields.filter(f => f.val).length;
  const percentage = Math.round((completed / fields.length) * 100);
  const missingFields = fields.filter(f => !f.val).map(f => ({ key: f.key, label: f.label }));

  // Profile is considered adequately filled if essential criteria exist (nationality + destination + budget) and score is at least 60%
  const hasEssentials = !!(profile.nationality?.trim() && profile.destinationCountries?.[0]?.trim() && (profile.budget || 0) > 0);
  const isFilled = percentage >= 60 && hasEssentials;

  return {
    percentage,
    isFilled,
    missingFields
  };
}
