// ============================================
// BIT SOFTWARE — Tabby Business Account catalog
// ============================================

export const TABBY_PRICE_SAR = 500;
export const TABBY_SLA_WORKING_DAYS = 3;

export const TABBY_BUSINESS_SERVICE = {
  key: 'tabby_business_account',
  name: 'Tabby Business Account Setup',
  priceSAR: TABBY_PRICE_SAR,
  landingPath: '/services/tabby-business',
  slaWorkingDays: TABBY_SLA_WORKING_DAYS,
};

export const TABBY_SAUDI_CITIES = [
  'Riyadh',
  'Jeddah',
  'Makkah',
  'Madinah',
  'Dammam',
  'Khobar',
  'Dhahran',
  'Al Ahsa',
  'Taif',
  'Abha',

  'Tabuk',
  'Buraydah',
  'Hail',
  'Najran',
  'Jazan',
  'Yanbu',
  'Jubail',
  'Unaizah',
  'Al Kharj',
  'Other',
];

export const TABBY_ACTIVITIES = [
  'E-commerce / Online store',
  'Retail / Fashion',
  'Electronics & mobiles',
  'Grocery / Supermarket',
  'Restaurant / Cafe / Food delivery',
  'Beauty / Salon / Cosmetics',
  'Furniture / Home & living',
  'Automotive / Spare parts',
  'Health / Pharmacy / Clinics',
  'Education / Training',
  'Travel / Tourism',
  'Services (home, maintenance, logistics)',
  'Other',
];

export const TABBY_DOC_FIELDS = [
  {
    key: 'crCopy',
    label: 'CR copy',
    ar: 'السجل التجاري',
    hint: 'Commercial Registration certificate (PDF or photo). Optional now — you can add it later.',
  },
  {
    key: 'nationalAddressPdf',
    label: 'National Address',
    ar: 'العنوان الوطني',
    hint: 'Wasel / SPL National Address (PDF or photo). Optional now — you can add it later.',
  },
  {
    key: 'ibanCertificate',
    label: 'IBAN letter',
    ar: 'شهادة الآيبان',
    hint: 'IBAN certificate or bank letter (PDF or photo). Optional now — you can add it later.',
  },
  {
    key: 'ownerIdCopy',
    label: 'National ID / Iqama',
    ar: 'الهوية / الإقامة',
    hint: 'Owner ID copy (PDF or photo). Optional now — you can add it later.',
  },
  {
    key: 'vatCertificate',
    label: 'VAT certificate',
    ar: 'شهادة الضريبة',
    hint: 'VAT certificate if you have one (PDF or photo). Optional.',
  },
];
