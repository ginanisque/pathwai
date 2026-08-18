export interface VisaOption {
  id: string;
  name: string;
  category: string;
  processingTime: string;
  description: string;
}

export interface RouteVisaAssessment {
  requiresVisa: boolean;
  visaExemptionReason?: string;
  primaryDestination: string;
  options: VisaOption[];
}

export const getVisaOptionsForRoute = (
  nationality: string = '',
  currentCountry: string = '',
  destinationCountries: string[] = [],
  purposeOfTravel: string = 'relocation'
): RouteVisaAssessment => {
  const normNationality = nationality.toLowerCase().trim();
  const normCurrent = currentCountry.toLowerCase().trim();
  const primaryDest = destinationCountries.length > 0 ? destinationCountries[0].trim() : '';
  const normDest = primaryDest.toLowerCase();
  const normPurpose = (purposeOfTravel || 'relocation').toLowerCase().trim();

  if (!normDest) {
    const allGen = [
      { id: 'gen_relocation', name: 'Passive Income & Long-Term Residence Visa', category: 'Residence Visa', processingTime: '60-90 Days', description: 'For retirees, remote workers, and individuals with proven passive income.' },
      { id: 'gen_skilled', name: 'Skilled Work & Employment Permit', category: 'Work Permit', processingTime: '4-8 Weeks', description: 'Requires job offer from licensed host employer.' },
      { id: 'gen_nomad', name: 'Digital Nomad / Remote Worker Visa', category: 'Remote Work', processingTime: '4-6 Weeks', description: 'Requires proof of remote income or foreign employment.' },
      { id: 'gen_student', name: 'Student & Higher Education Visa', category: 'Education', processingTime: '3-6 Weeks', description: 'Requires admission to accredited university.' },
      { id: 'gen_business', name: 'Business Founder & Entrepreneur Permit', category: 'Business', processingTime: '6-10 Weeks', description: 'For starting a business or investing in local entity.' },
      { id: 'gen_family', name: 'Family Reunification Residence Visa', category: 'Family', processingTime: '4-8 Weeks', description: 'For joining family members residing in host country.' },
      { id: 'gen_humanitarian', name: 'Humanitarian & Temporary Protection Permit', category: 'Relief', processingTime: '2-4 Weeks', description: 'Emergency relief entry and temporary protection status.' },
      { id: 'gen_tourist', name: 'Short-Stay Tourist / Business Visitor Visa', category: 'Short Visit', processingTime: '2-4 Weeks', description: 'Short visits up to 90 days. Local employment strictly prohibited.' }
    ];

    let filtered = allGen;
    if (normPurpose.includes('education') || normPurpose.includes('study')) {
      filtered = [allGen[3], allGen[1], allGen[2], allGen[7]];
    } else if (normPurpose.includes('work') || normPurpose.includes('employment')) {
      filtered = [allGen[1], allGen[2], allGen[0], allGen[4]];
    } else if (normPurpose.includes('nomad') || normPurpose.includes('remote')) {
      filtered = [allGen[2], allGen[0], allGen[1], allGen[4]];
    } else if (normPurpose.includes('business') || normPurpose.includes('corporate')) {
      filtered = [allGen[4], allGen[0], allGen[1], allGen[2]];
    } else if (normPurpose.includes('family')) {
      filtered = [allGen[5], allGen[0], allGen[7]];
    } else if (normPurpose.includes('humanitarian') || normPurpose.includes('relief')) {
      filtered = [allGen[6], allGen[3], allGen[7]];
    } else {
      filtered = [allGen[0], allGen[2], allGen[1], allGen[3]];
    }

    return {
      requiresVisa: true,
      primaryDestination: 'Target Destination',
      options: filtered
    };
  }

  // 1. ECOWAS Check (West African States)
  const ecowasCountries = ['nigeria', 'ghana', 'senegal', 'benin', 'ivory coast', 'côte d\'ivoire', 'togo', 'liberia', 'sierra leone', 'gambia', 'guinea', 'cape verde', 'mali', 'niger', 'burkina faso'];
  const isNatEcowas = ecowasCountries.some(c => normNationality.includes(c));
  const isDestEcowas = ecowasCountries.some(c => normDest.includes(c));

  if (isNatEcowas && isDestEcowas) {
    return {
      requiresVisa: false,
      visaExemptionReason: 'ECOWAS Protocol on Free Movement of Persons (Article 3) — 90-day visa-free entry across member states.',
      primaryDestination: primaryDest,
      options: [
        { id: 'ecowas_free', name: 'ECOWAS 90-Day Visa-Free Entry (Article 3)', category: 'Free Movement', processingTime: 'Immediate', description: 'Requires valid International Passport or ECOWAS Travel Certificate.' },
        { id: 'ecowas_card', name: 'ECOWAS Residence Card / Registration', category: 'Long-Term Stay', processingTime: '1-2 Weeks', description: 'Required for stay exceeding 90 days in host ECOWAS state.' }
      ]
    };
  }

  // 2. EU / EEA Freedom of Movement Check
  const euCountries = ['portugal', 'spain', 'france', 'germany', 'italy', 'netherlands', 'belgium', 'austria', 'ireland', 'poland', 'sweden', 'denmark', 'finland', 'greece', 'czechia', 'hungary', 'romania', 'croatia'];
  const isNatEU = euCountries.some(c => normNationality.includes(c));
  const isDestEU = euCountries.some(c => normDest.includes(c));

  if (isNatEU && isDestEU) {
    return {
      requiresVisa: false,
      visaExemptionReason: 'EU Freedom of Movement (Directive 2004/38/EC) — Right to live and work without a consular visa.',
      primaryDestination: primaryDest,
      options: [
        { id: 'eu_cert', name: 'EU Citizen Certificate of Registration (CRUE)', category: 'Freedom of Movement', processingTime: 'Same Day', description: 'Registration required after 90 days of continuous residence.' }
      ]
    };
  }

  // 3. Specific Destination Visa Libraries
  let options: VisaOption[] = [];

  if (normDest.includes('portugal') || normDest.includes('portuguese')) {
    options = [
      { id: 'pt_d7', name: 'Portugal D7 Passive Income & Pensioner Visa', category: 'Residence Visa', processingTime: '60-90 Days', description: 'For remote workers, retirees, and individuals with min. €820/mo proven passive income.' },
      { id: 'pt_d8', name: 'Portugal D8 Digital Nomad Visa (Remote Work)', category: 'Residence / Temp Visa', processingTime: '45-60 Days', description: 'Requires remote work contract/freelance income of min. €3,280/mo (4x min wage).' },
      { id: 'pt_d2', name: 'Portugal D2 Entrepreneur & Independent Worker Visa', category: 'Business / Freelance', processingTime: '60-90 Days', description: 'For business founders, startup creators, or independent service providers.' },
      { id: 'pt_d3', name: 'Portugal D3 Highly Qualified Activity (Tech / Executive)', category: 'Tech & Research', processingTime: '30-60 Days', description: 'Fast-track for qualified specialists, software engineers, and researchers.' },
      { id: 'pt_job_seeker', name: 'Portugal Job Seeker Visa (120 Days)', category: 'Work Search', processingTime: '30-45 Days', description: 'Allows 120 days (extendable by 60 days) to find employment in Portugal.' },
      { id: 'pt_d4', name: 'Portugal D4 / D5 Higher Education Student Visa', category: 'Education', processingTime: '30-60 Days', description: 'Enrolled in accredited Portuguese university or research institute.' },
      { id: 'pt_schengen_c', name: 'Portugal Schengen C Short-Stay (Tourist / Business)', category: 'Short-Stay (90 days)', processingTime: '15-30 Days', description: 'Up to 90 days stay within a 180-day period. No right to work locally.' }
    ];
  } else if (normDest.includes('uk') || normDest.includes('united kingdom') || normDest.includes('britain') || normDest.includes('england')) {
    options = [
      { id: 'uk_skilled_worker', name: 'UK Skilled Worker Visa (Points-Based)', category: 'Work Visa', processingTime: '3-8 Weeks', description: 'Requires job offer from licensed UK sponsor with minimum salary threshold.' },
      { id: 'uk_student', name: 'UK Student Visa (CAS Points-Based)', category: 'Education', processingTime: '3 Weeks', description: 'Requires Confirmation of Acceptance for Studies (CAS) from licensed sponsor.' },
      { id: 'uk_graduate', name: 'UK Graduate Route (Post-Study Work)', category: 'Post-Grad Work', processingTime: '8 Weeks', description: '2-year (or 3-year for PhD) unsponsored work permission for UK university graduates.' },
      { id: 'uk_global_talent', name: 'UK Global Talent Visa (Tech / Research / Arts)', category: 'Unsponsored Talent', processingTime: '4-8 Weeks', description: 'Requires endorsement from Tech Nation, Royal Society, or British Academy.' },
      { id: 'uk_health_care', name: 'UK Health and Care Worker Visa', category: 'Healthcare', processingTime: '3 Weeks', description: 'Fast-track, reduced application fee visa for qualified healthcare professionals.' },
      { id: 'uk_visitor', name: 'UK Standard Visitor Visa (Short-Term)', category: 'Visitor', processingTime: '3 Weeks', description: 'Up to 6 months stay for leisure, business meetings, or short courses.' }
    ];
  } else if (normDest.includes('canada')) {
    options = [
      { id: 'ca_express_entry', name: 'Canada Express Entry (Federal Skilled Worker / PNP)', category: 'Permanent Residence', processingTime: '6 Months', description: 'Points-based Permanent Residence stream for skilled foreign professionals.' },
      { id: 'ca_study_permit', name: 'Canada Study Permit & PGWP Pathway', category: 'Education', processingTime: '4-12 Weeks', description: 'Requires acceptance letter from Designated Learning Institution (DLI).' },
      { id: 'ca_ict', name: 'Canada Intra-Company Transferee (ICT) Work Permit', category: 'Executive Transfer', processingTime: '4-8 Weeks', description: 'LMIA-exempt work permit transferring key employees to Canadian entity.' },
      { id: 'ca_start_up', name: 'Canada Start-Up Visa (SUV)', category: 'Entrepreneurship', processingTime: '12-16 Months', description: 'Requires support commitment from designated Canadian angel/venture fund.' },
      { id: 'ca_trv', name: 'Canada Visitor Visa (Temporary Resident Visa - TRV)', category: 'Visitor', processingTime: '2-6 Weeks', description: 'Up to 6 months per visit for tourism, family visits, or business meetings.' }
    ];
  } else if (normDest.includes('united states') || normDest.includes('usa') || normDest.includes('us')) {
    options = [
      { id: 'us_f1', name: 'US F-1 Academic Student Visa', category: 'Education', processingTime: '2-6 Weeks', description: 'Requires Form I-20 issued by SEVIS-approved institution.' },
      { id: 'us_h1b', name: 'US H-1B Specialty Occupation Visa', category: 'Specialized Work', processingTime: '3-6 Months', description: 'Requires Bachelor degree minimum + employer sponsorship lottery.' },
      { id: 'us_eb2_niw', name: 'US EB-2 National Interest Waiver (NIW)', category: 'Permanent Residence', processingTime: '6-12 Months', description: 'Self-petition PR pathway for individuals with advanced degrees/exceptional merit.' },
      { id: 'us_o1', name: 'US O-1 Extraordinary Ability Visa', category: 'Talent & Achievement', processingTime: '2-4 Weeks', description: 'For individuals with extraordinary achievement in tech, science, or business.' },
      { id: 'us_b1_b2', name: 'US B1/B2 Visitor & Business Visa', category: 'Short Visit', processingTime: '2-12 Weeks', description: 'For business meetings, conferences, or tourism.' }
    ];
  } else if (normDest.includes('germany') || normDest.includes('german')) {
    options = [
      { id: 'de_chancenkarte', name: 'Germany Opportunity Card (Chancenkarte)', category: 'Points Job Seeker', processingTime: '4-8 Weeks', description: 'Points-based 1-year job seeker visa to look for qualified employment in Germany.' },
      { id: 'de_blue_card', name: 'Germany EU Blue Card', category: 'Highly Skilled Work', processingTime: '4-6 Weeks', description: 'Fast-track residence permit for university graduates with employment contract.' },
      { id: 'de_freelance', name: 'Germany Freelance / Self-Employment Permit (Freiberufler)', category: 'Freelance', processingTime: '8-12 Weeks', description: 'For self-employed professionals with German client interest.' },
      { id: 'de_student', name: 'Germany Student Visa (Studium)', category: 'Education', processingTime: '4-8 Weeks', description: 'Requires university admission + blocked bank account (€11,208/yr).' }
    ];
  } else if (normDest.includes('uae') || normDest.includes('dubai') || normDest.includes('emirates')) {
    options = [
      { id: 'uae_golden', name: 'UAE 10-Year Golden Visa (Tech / Executive / Investor)', category: 'Long-Term Residence', processingTime: '1-2 Weeks', description: 'Self-sponsored 10-year residence permit for coders, scientists, executives, investors.' },
      { id: 'uae_green', name: 'UAE 5-Year Green Visa (Freelancer / Self-Employed)', category: 'Freelance', processingTime: '1-2 Weeks', description: '5-year self-sponsored visa for skilled freelancers and independent business owners.' },
      { id: 'uae_remote', name: 'UAE 1-Year Remote Work Visa (Virtual Working)', category: 'Digital Nomad', processingTime: '5 Days', description: 'Live in Dubai while working remotely for overseas employer (min. $3,500/mo income).' }
    ];
  } else if (normDest.includes('france') || normDest.includes('french')) {
    options = [
      { id: 'fr_talent', name: 'France Passeport Talent (Tech / Executive / Founder)', category: 'Multi-Year Residence', processingTime: '4-8 Weeks', description: '4-year residence permit for high-skilled tech workers, founders, and executives.' },
      { id: 'fr_visitor', name: 'France Long-Stay Visitor Visa (VLS-TS)', category: 'Passive Income', processingTime: '4-6 Weeks', description: 'Requires proof of autonomous passive income. Local employment not permitted.' },
      { id: 'fr_student', name: 'France Student Visa (VLS-TS Étudiant)', category: 'Education', processingTime: '3-6 Weeks', description: 'Requires Campus France registration and university enrollment.' }
    ];
  } else if (normDest.includes('spain') || normDest.includes('spanish')) {
    options = [
      { id: 'es_nomad', name: 'Spain Digital Nomad Visa (Ley de Startups)', category: 'Remote Work', processingTime: '4-8 Weeks', description: 'Allows remote workers to reside in Spain with reduced tax rates (24%).' },
      { id: 'es_nlv', name: 'Spain Non-Lucrative Visa (NLV)', category: 'Passive Income', processingTime: '6-10 Weeks', description: 'For individuals with min. €28,800/yr savings/passive income. No local work.' },
      { id: 'es_student', name: 'Spain Student Residence Authorization', category: 'Education', processingTime: '4-6 Weeks', description: 'Allows up to 30 hrs/week part-time employment alongside studies.' }
    ];
  } else {
    // Default tailored options using target destination name
    options = [
      { id: 'gen_relocation', name: `${primaryDest} Passive Income & Long-Term Residence Visa`, category: 'Residence Visa', processingTime: '60-90 Days', description: `Requires proof of passive income or financial independence for residence in ${primaryDest}.` },
      { id: 'gen_skilled', name: `${primaryDest} Skilled Work & Employment Visa`, category: 'Work Permit', processingTime: '4-8 Weeks', description: `Requires job offer from licensed employer in ${primaryDest}.` },
      { id: 'gen_nomad', name: `${primaryDest} Digital Nomad & Remote Work Visa`, category: 'Remote Work', processingTime: '4-6 Weeks', description: `Allows living in ${primaryDest} while working for foreign clients.` },
      { id: 'gen_student', name: `${primaryDest} Higher Education Student Visa`, category: 'Education', processingTime: '3-6 Weeks', description: `Requires admission letter from accredited institution in ${primaryDest}.` },
      { id: 'gen_job_seeker', name: `${primaryDest} Job Seeker / Work Exploration Visa`, category: 'Job Search', processingTime: '4-6 Weeks', description: `Temporary entry to search for employment or establish business in ${primaryDest}.` },
      { id: 'gen_business', name: `${primaryDest} Business & Investor Permit`, category: 'Business', processingTime: '8-12 Weeks', description: `For starting a business or investing in ${primaryDest}.` },
      { id: 'gen_family', name: `${primaryDest} Family Reunification Visa`, category: 'Family', processingTime: '4-8 Weeks', description: `Residence permit for dependent relatives or spouse in ${primaryDest}.` },
      { id: 'gen_humanitarian', name: `${primaryDest} Humanitarian Protection & Relief Permit`, category: 'Relief', processingTime: '2-4 Weeks', description: `Special entry visa and protection status for emergency relief.` },
      { id: 'gen_tourist', name: `${primaryDest} Short-Stay Tourist / Visitor Visa`, category: 'Short Visit', processingTime: '2-4 Weeks', description: 'Short visits up to 90 days. Local employment strictly prohibited.' }
    ];
  }

  // Filter and prioritize options based on purposeOfTravel
  const isVisit = normPurpose.includes('visit') || normPurpose.includes('tourist') || normPurpose.includes('short_stay') || normPurpose.includes('tourism');
  const isEdu = normPurpose.includes('education') || normPurpose.includes('study');
  const isWork = normPurpose.includes('work') || normPurpose.includes('employment');
  const isNomad = normPurpose.includes('digital_nomad') || normPurpose.includes('remote');
  const isReloc = normPurpose.includes('relocation') || normPurpose.includes('permanent') || normPurpose.includes('residency');
  const isBiz = normPurpose.includes('business') || normPurpose.includes('corporate');
  const isFam = normPurpose.includes('family');
  const isHum = normPurpose.includes('humanitarian') || normPurpose.includes('relief');

  const matchesPurpose = (opt: VisaOption) => {
    const text = `${opt.name} ${opt.category} ${opt.description}`.toLowerCase();
    if (isVisit) return text.includes('visit') || text.includes('tourist') || text.includes('short-stay') || text.includes('schengen c') || text.includes('trv') || text.includes('b1') || text.includes('b2') || text.includes('visitor');
    if (isEdu) return text.includes('education') || text.includes('student') || text.includes('study') || text.includes('graduate') || text.includes('d4') || text.includes('d5') || text.includes('f1');
    if (isWork) return text.includes('work') || text.includes('employment') || text.includes('skilled') || text.includes('h1b') || text.includes('blue card') || text.includes('chancenkarte') || text.includes('d3') || text.includes('ict') || text.includes('job seeker');
    if (isNomad) return text.includes('nomad') || text.includes('remote') || text.includes('freelance') || text.includes('d8') || text.includes('green visa') || text.includes('freiberufler');
    if (isReloc) return text.includes('passive') || text.includes('residence') || text.includes('permanent') || text.includes('d7') || text.includes('express entry') || text.includes('nlv') || text.includes('golden') || text.includes('settlement');
    if (isBiz) return text.includes('business') || text.includes('entrepreneur') || text.includes('d2') || text.includes('start-up') || text.includes('startup') || text.includes('investor');
    if (isFam) return text.includes('family') || text.includes('spouse') || text.includes('dependant') || text.includes('reunification');
    if (isHum) return text.includes('humanitarian') || text.includes('relief') || text.includes('protection') || text.includes('asylum');
    return true;
  };

  const primaryMatches = options.filter(matchesPurpose);
  const secondaryOthers = options.filter(opt => !primaryMatches.includes(opt));

  // If no specific options match this country, inject a clear purpose-tailored option
  if (primaryMatches.length === 0) {
    if (isVisit) {
      primaryMatches.push({ id: `custom_visit_${primaryDest}`, name: `${primaryDest || 'Target'} Short-Stay Visitor / Tourist Visa`, category: 'Short Visit', processingTime: '2-4 Weeks', description: `Short-stay visa for tourism, family visits, or short business trips to ${primaryDest || 'the host country'}.` });
    } else if (isEdu) {
      primaryMatches.push({ id: `custom_edu_${primaryDest}`, name: `${primaryDest} Student & Higher Education Visa`, category: 'Education', processingTime: '4-6 Weeks', description: `Official study visa pathway for accredited universities in ${primaryDest}.` });
    } else if (isWork) {
      primaryMatches.push({ id: `custom_work_${primaryDest}`, name: `${primaryDest} Skilled Employment Work Permit`, category: 'Work Permit', processingTime: '4-8 Weeks', description: `Requires sponsored job contract with an authorized employer in ${primaryDest}.` });
    } else if (isNomad) {
      primaryMatches.push({ id: `custom_nomad_${primaryDest}`, name: `${primaryDest} Digital Nomad & Remote Worker Visa`, category: 'Remote Work', processingTime: '3-6 Weeks', description: `For self-employed professionals and remote workers residing in ${primaryDest}.` });
    } else if (isReloc) {
      primaryMatches.push({ id: `custom_reloc_${primaryDest}`, name: `${primaryDest} Long-Term Residency & Settlement Visa`, category: 'Residence Visa', processingTime: '60-90 Days', description: `Permanent or long-term residence pathway for ${primaryDest}.` });
    } else if (isBiz) {
      primaryMatches.push({ id: `custom_biz_${primaryDest}`, name: `${primaryDest} Business Founder & Investor Visa`, category: 'Business', processingTime: '6-10 Weeks', description: `For establishing a business entity or corporate branch in ${primaryDest}.` });
    } else if (isFam) {
      primaryMatches.push({ id: `custom_fam_${primaryDest}`, name: `${primaryDest} Family Reunification Permit`, category: 'Family', processingTime: '4-8 Weeks', description: `For joiners and family members of residents in ${primaryDest}.` });
    } else if (isHum) {
      primaryMatches.push({ id: `custom_hum_${primaryDest}`, name: `${primaryDest} Humanitarian Protection & Relief Status`, category: 'Relief', processingTime: '2-4 Weeks', description: `Emergency relief entry and status for eligible applicants in ${primaryDest}.` });
    }
  }

  // Combine primary matching options first, then remaining options
  const finalOptions = [...primaryMatches, ...secondaryOthers];

  return {
    requiresVisa: true,
    primaryDestination: primaryDest,
    options: finalOptions
  };
};

