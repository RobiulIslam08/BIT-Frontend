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
  'Khamis Mushait',
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
    required: true,
    hint: 'Commercial Registration certificate (PDF or image).',
  },
  {
    key: 'nationalAddressPdf',
    label: 'National Address PDF',
    ar: 'العنوان الوطني',
    required: true,
    hint: 'Download from SPL / Wasel (العنوان الوطني).',
  },
  {
    key: 'ibanCertificate',
    label: 'IBAN letter',
    ar: 'شهادة الآيبان',
    required: true,
    hint: 'Stamped IBAN certificate or official bank letter.',
  },
  {
    key: 'ownerIdCopy',
    label: 'National ID / Iqama',
    ar: 'الهوية / الإقامة',
    required: true,
    hint: 'Copy of the owner or authorized signatory ID.',
  },
  {
    key: 'vatCertificate',
    label: 'VAT certificate',
    ar: 'شهادة الضريبة',
    requiredIfVat: true,
    hint: 'Required only if the business is VAT registered.',
  },
];
