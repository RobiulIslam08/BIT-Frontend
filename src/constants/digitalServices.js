// ============================================
// BIT SOFTWARE — Digital Services Catalog (static)
// Must match backend: digitalService.catalog.ts
// ============================================

export const SAR_TO_USD_RATE = 3.75;

export const SUPPLY_COMPANY_SERVICE_KEY = 'supply_company_portal';

export const DIGITAL_SERVICES = {
  supply_company_portal: {
    key: 'supply_company_portal',
    name: 'Supply Company Portals',
    description:
      'Inventory, ordering, and logistics management web applications for supply companies.',
    landingPath: '/services/web-development/supply-company',
    packages: {
      trial: {
        priceSAR: 58,
        durationDays: 30,
        oncePerUser: true,
        label: '1-Month Trial',
      },
      monthly: {
        priceSAR: 200,
        durationDays: 30,
        label: 'Monthly',
      },
      yearly: {
        priceSAR: 1650,
        durationDays: 365,
        label: 'Yearly',
      },
    },
  },
};

export const sarToUsd = (sar) => Math.round((Number(sar) / SAR_TO_USD_RATE) * 100) / 100;

export const getSupplyPackages = () => DIGITAL_SERVICES.supply_company_portal.packages;
