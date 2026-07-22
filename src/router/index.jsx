// ============================================
// BIT SOFTWARE — MAIN ROUTER
// ============================================
/* eslint-disable react-refresh/only-export-components */

import { lazy, Suspense } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { MainLayout } from '@/layouts/MainLayout';
import { AuthLayout } from '@/layouts/AuthLayout';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { PageLoader } from '@/components/common/LoadingSpinner';
import {
  AdminRoute,
  GuestRoute,
  ProtectedRoute,
} from '@/components/common/ProtectedRoute/ProtectedRoute';

// ─── LAZY PAGE IMPORTS ───
const Home = lazy(() => import('@/pages/Home'));
const About = lazy(() => import('@/pages/About'));
const Services = lazy(() => import('@/pages/Services'));
const ITServices = lazy(() => import('@/pages/Services/ITServices'));
const WebDevelopment = lazy(() => import('@/pages/Services/WebDevelopment'));
const ERPSoftware = lazy(() => import('@/pages/Services/ERPSoftware'));
const MobileApps = lazy(() => import('@/pages/Services/MobileApps'));
const SocialMedia = lazy(() => import('@/pages/Services/SocialMedia'));
const LogoDesign = lazy(() => import('@/pages/Services/LogoDesign'));
const GraphicsDesign = lazy(() => import('@/pages/Services/GraphicsDesign'));
const ITManagement = lazy(() => import('@/pages/Services/ITManagement'));
const OnlineMarketing = lazy(() => import('@/pages/Services/OnlineMarketing'));
const GoogleMyBusiness = lazy(() => import('@/pages/Services/GoogleMyBusiness'));
const DomainHosting = lazy(() => import('@/pages/Services/DomainHosting'));
const DomainCheckout = lazy(() => import('@/pages/DomainCheckout'));
const HostingCheckout = lazy(() => import('@/pages/HostingCheckout'));
const MyAccount = lazy(() => import('@/pages/MyAccount'));
const DomainDetails = lazy(() => import('@/pages/DomainDetails'));
const HostingDetails = lazy(() => import('@/pages/HostingDetails'));
const TermsAndConditions = lazy(() => import('@/pages/TermsAndConditions'));
const Portfolio = lazy(() => import('@/pages/Portfolio'));
const Blog = lazy(() => import('@/pages/Blog'));
const Contact = lazy(() => import('@/pages/Contact'));
const Login = lazy(() => import('@/pages/Auth/Login'));
const Register = lazy(() => import('@/pages/Auth/Register'));
const ForgotPassword = lazy(() => import('@/pages/Auth/ForgotPassword'));
const DashboardHome = lazy(() => import('@/pages/Dashboard'));
const DashboardServices = lazy(() => import('@/pages/Dashboard/Services'));
const DashboardOffers = lazy(() => import('@/pages/Dashboard/Offers'));
const DashboardLeads = lazy(() => import('@/pages/Dashboard/Leads'));
const DashboardOrders = lazy(() => import('@/pages/Dashboard/Orders'));
const AdminDomainOrders = lazy(() => import('@/pages/Dashboard/DomainOrders'));
const AdminDomains = lazy(() => import('@/pages/Dashboard/Domains'));
const AdminDomainPricing = lazy(() => import('@/pages/Dashboard/DomainPricing'));
const AdminHostings = lazy(() => import('@/pages/Dashboard/Hostings'));
const AdminHostingOrders = lazy(() => import('@/pages/Dashboard/HostingOrders'));
const AdminHostingPlans = lazy(() => import('@/pages/Dashboard/HostingPlans'));
const DashboardUsers = lazy(() => import('@/pages/Dashboard/Users'));
const DashboardAnalytics = lazy(() => import('@/pages/Dashboard/Analytics'));
const DashboardSettings = lazy(() => import('@/pages/Dashboard/Settings'));
const NotFound = lazy(() => import('@/pages/NotFound'));

function SuspenseWrap({ children }) {
  return <Suspense fallback={<PageLoader />}>{children}</Suspense>;
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { index: true, element: <SuspenseWrap><Home /></SuspenseWrap> },
      { path: 'about', element: <SuspenseWrap><About /></SuspenseWrap> },
      { path: 'services', element: <SuspenseWrap><Services /></SuspenseWrap> },
      { path: 'services/it-services', element: <SuspenseWrap><ITServices /></SuspenseWrap> },
      { path: 'services/web-development', element: <SuspenseWrap><WebDevelopment /></SuspenseWrap> },
      { path: 'services/erp-software', element: <SuspenseWrap><ERPSoftware /></SuspenseWrap> },
      { path: 'services/mobile-apps', element: <SuspenseWrap><MobileApps /></SuspenseWrap> },
      { path: 'services/social-media', element: <SuspenseWrap><SocialMedia /></SuspenseWrap> },
      { path: 'services/logo-design', element: <SuspenseWrap><LogoDesign /></SuspenseWrap> },
      { path: 'services/graphics-design', element: <SuspenseWrap><GraphicsDesign /></SuspenseWrap> },
      { path: 'services/it-management', element: <SuspenseWrap><ITManagement /></SuspenseWrap> },
      { path: 'services/online-marketing', element: <SuspenseWrap><OnlineMarketing /></SuspenseWrap> },
      { path: 'services/google-my-business', element: <SuspenseWrap><GoogleMyBusiness /></SuspenseWrap> },
      { path: 'services/domain-hosting', element: <SuspenseWrap><DomainHosting /></SuspenseWrap> },
      { path: 'terms-and-conditions', element: <SuspenseWrap><TermsAndConditions /></SuspenseWrap> },
      { path: 'portfolio', element: <SuspenseWrap><Portfolio /></SuspenseWrap> },
      { path: 'blog', element: <SuspenseWrap><Blog /></SuspenseWrap> },
      { path: 'contact', element: <SuspenseWrap><Contact /></SuspenseWrap> },
      {
        element: <ProtectedRoute />,
        children: [
          { path: 'domain-checkout', element: <SuspenseWrap><DomainCheckout /></SuspenseWrap> },
          { path: 'hosting-checkout', element: <SuspenseWrap><HostingCheckout /></SuspenseWrap> },
          { path: 'my-account', element: <SuspenseWrap><MyAccount /></SuspenseWrap> },
          { path: 'my-account/domains/:id', element: <SuspenseWrap><DomainDetails /></SuspenseWrap> },
          { path: 'my-account/hosting/:id', element: <SuspenseWrap><HostingDetails /></SuspenseWrap> },
        ],
      },
      { path: '*', element: <SuspenseWrap><NotFound /></SuspenseWrap> },
    ],
  },
  {
    // Auth routes — logged in থাকলে dashboard-এ redirect করবে
    path: '/auth',
    element: <GuestRoute />,
    children: [
      {
        element: <AuthLayout />,
        children: [
          { path: 'login', element: <SuspenseWrap><Login /></SuspenseWrap> },
          { path: 'register', element: <SuspenseWrap><Register /></SuspenseWrap> },
          { path: 'forgot-password', element: <SuspenseWrap><ForgotPassword /></SuspenseWrap> },
        ],
      },
    ],
  },
  {
    // Dashboard — JWT authentication required (admin only)
    path: '/dashboard',
    element: <AdminRoute />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          { index: true, element: <SuspenseWrap><DashboardHome /></SuspenseWrap> },
          { path: 'services', element: <SuspenseWrap><DashboardServices /></SuspenseWrap> },
          { path: 'offers', element: <SuspenseWrap><DashboardOffers /></SuspenseWrap> },
          { path: 'leads', element: <SuspenseWrap><DashboardLeads /></SuspenseWrap> },
          { path: 'orders', element: <SuspenseWrap><DashboardOrders /></SuspenseWrap> },
          { path: 'domain-orders', element: <SuspenseWrap><AdminDomainOrders /></SuspenseWrap> },
          { path: 'domains', element: <SuspenseWrap><AdminDomains /></SuspenseWrap> },
          { path: 'domain-pricing', element: <SuspenseWrap><AdminDomainPricing /></SuspenseWrap> },
          { path: 'hosting-orders', element: <SuspenseWrap><AdminHostingOrders /></SuspenseWrap> },
          { path: 'hostings', element: <SuspenseWrap><AdminHostings /></SuspenseWrap> },
          { path: 'hosting-plans', element: <SuspenseWrap><AdminHostingPlans /></SuspenseWrap> },
          { path: 'users', element: <SuspenseWrap><DashboardUsers /></SuspenseWrap> },
          { path: 'analytics', element: <SuspenseWrap><DashboardAnalytics /></SuspenseWrap> },
          { path: 'settings', element: <SuspenseWrap><DashboardSettings /></SuspenseWrap> },
        ],
      },
    ],
  },
]);
