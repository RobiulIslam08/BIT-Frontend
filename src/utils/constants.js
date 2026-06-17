// ============================================
// BIT SOFTWARE — APP-WIDE CONSTANTS
// ============================================

// Animation presets for Motion
export const ANIMATION = {
  // Durations (seconds)
  FAST: 0.2,
  BASE: 0.4,
  SLOW: 0.6,
  VERY_SLOW: 0.8,

  // Easing curves
  EASE_OUT: [0.0, 0.0, 0.2, 1],
  EASE_IN_OUT: [0.4, 0.0, 0.2, 1],
  SPRING: { type: 'spring', stiffness: 300, damping: 30 },
  SMOOTH_SPRING: { type: 'spring', stiffness: 200, damping: 25 },

  // Common variants
  FADE_UP: {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.0, 0.0, 0.2, 1] } },
  },
  FADE_IN: {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.4 } },
  },
  SCALE_IN: {
    hidden: { opacity: 0, scale: 0.92 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: [0.0, 0.0, 0.2, 1] } },
  },
  SLIDE_RIGHT: {
    hidden: { opacity: 0, x: -40 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.5 } },
  },
  STAGGER: {
    visible: { transition: { staggerChildren: 0.08 } },
  },
};

// Company information
export const COMPANY = {
  name: 'BIT Software & IT Solution',
  nameShort: 'BIT Software',
  tagline: 'World-class IT solutions from Saudi Arabia',
  phone: '+966 50 000 0000',
  email: 'info@bitsoftware.sa',
  whatsapp: 'https://wa.me/966500000000',
  address: 'Riyadh, Saudi Arabia',
  website: 'https://bitsoftware.sa',
};

// Social media links
export const SOCIALS = {
  facebook: 'https://facebook.com/bitsoftware',
  instagram: 'https://instagram.com/bitsoftware',
  linkedin: 'https://linkedin.com/company/bitsoftware',
  twitter: 'https://twitter.com/bitsoftware',
  youtube: 'https://youtube.com/bitsoftware',
};

// Navigation items
export const NAV_ITEMS = [
  { label: 'Home', path: '/', key: 'home' },
  {
    label: 'Services',
    path: '/services',
    key: 'services',
    children: [
      { label: 'IT Services', path: '/services/it-services' },
      { label: 'Web Development', path: '/services/web-development' },
      { label: 'ERP Software', path: '/services/erp-software' },
      { label: 'Mobile Apps', path: '/services/mobile-apps' },
      { label: 'Social Media', path: '/services/social-media' },
      { label: 'Logo Design', path: '/services/logo-design' },
      { label: 'Graphics Design', path: '/services/graphics-design' },
      { label: 'IT Management', path: '/services/it-management' },
      { label: 'Online Marketing', path: '/services/online-marketing' },
      { label: 'Google My Business', path: '/services/google-my-business' },
      { label: 'Domain & Hosting', path: '/services/domain-hosting' },
    ],
  },
  { label: 'About', path: '/about', key: 'about' },
  { label: 'Portfolio', path: '/portfolio', key: 'portfolio' },
  { label: 'Blog', path: '/blog', key: 'blog' },
  { label: 'Contact', path: '/contact', key: 'contact' },
];

// Stats
export const STATS = [
  { value: 250, suffix: '+', label: 'Projects Delivered' },
  { value: 120, suffix: '+', label: 'Happy Clients' },
  { value: 15, suffix: '+', label: 'Team Members' },
  { value: 5, suffix: '+', label: 'Years Experience' },
];

// Services overview
export const SERVICES = [
  {
    id: 'web-development',
    title: 'Web Development',
    description: 'Custom websites, e-commerce, and web applications built for performance.',
    icon: 'Globe',
    path: '/services/web-development',
  },
  {
    id: 'erp-software',
    title: 'ERP & POS Software',
    description: 'Streamline your operations with ZATCA-compliant ERP solutions.',
    icon: 'Database',
    path: '/services/erp-software',
  },
  {
    id: 'mobile-apps',
    title: 'Mobile Apps',
    description: 'Android & iOS apps built for the Saudi market with RTL support.',
    icon: 'Smartphone',
    path: '/services/mobile-apps',
  },
  {
    id: 'social-media',
    title: 'Social Media Management',
    description: 'Engage your audience across Facebook, Instagram, WhatsApp & Snapchat.',
    icon: 'Share2',
    path: '/services/social-media',
  },
  {
    id: 'logo-design',
    title: 'Logo Design',
    description: 'Memorable brand identities that stand out in the Saudi market.',
    icon: 'Palette',
    path: '/services/logo-design',
  },
  {
    id: 'graphics-design',
    title: 'Graphics Design',
    description: 'Stunning visual designs for print, digital, and social media.',
    icon: 'PenTool',
    path: '/services/graphics-design',
  },
  {
    id: 'it-management',
    title: 'IT Management',
    description: 'End-to-end IT infrastructure management and support.',
    icon: 'Server',
    path: '/services/it-management',
  },
  {
    id: 'online-marketing',
    title: 'Online Marketing',
    description: 'SEO, SEM, and digital marketing strategies that deliver results.',
    icon: 'TrendingUp',
    path: '/services/online-marketing',
  },
  {
    id: 'google-my-business',
    title: 'Google My Business',
    description: 'Get found on Google Maps and local search in Saudi Arabia.',
    icon: 'MapPin',
    path: '/services/google-my-business',
  },
  {
    id: 'domain-hosting',
    title: 'Domain & Hosting',
    description: 'Reliable hosting plans and domain registration at the best prices.',
    icon: 'HardDrive',
    path: '/services/domain-hosting',
  },
];
