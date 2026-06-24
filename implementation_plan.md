# PayPal Integration — Full Stack (Frontend + Backend)

## Overview

GMB (Google My Business) order form-এর Step 5 তে PayPal payment button ইতিমধ্যে frontend-এ আছে (`@paypal/react-paypal-js` ব্যবহার করে)। কিন্তু:
- Frontend-এ `VITE_PAYPAL_CLIENT_ID` env variable সেট নেই → PayPal button কাজ করে না
- Backend-এ GMB orders-এর কোনো module নেই → order save হয় না
- `handleSubmit` এ এখনো `await new Promise(resolve => setTimeout(resolve, 1500))` dummy mock আছে

এই plan-এ **Frontend** ও **Backend** উভয়েই সম্পূর্ণ PayPal integration করা হবে।

---

## Open Questions

> [!IMPORTANT]
> **PayPal Credentials**: আপনার PayPal Sandbox/Live Client ID এবং Client Secret দরকার হবে।
> - PayPal Developer Console: https://developer.paypal.com/developer/applications
> - Sandbox account দিয়ে test করা হবে (PAYPAL_MODE=sandbox)
> - আপনাকে `.env` file-এ credentials manually add করতে হবে (security কারণে আমি hardcode করব না)

---

## Proposed Changes

### Backend — GMB Order Module

#### [NEW] `src/app/modules/GmbOrder/gmbOrder.interface.ts`
GMB order-এর TypeScript interface — businessName, email, serviceType, paymentMethod, paypalOrderId, etc.

#### [NEW] `src/app/modules/GmbOrder/gmbOrder.model.ts`
Mongoose Schema — paypal_backend_integration.md doc অনুযায়ী। paypalOrderId unique sparse index দিয়ে।

#### [NEW] `src/app/utils/paypal.ts`
PayPal OAuth token + order verification helper — `getPayPalOrderDetails()` function। existing JS example-কে TypeScript-এ convert করা।

#### [NEW] `src/app/modules/GmbOrder/gmbOrder.service.ts`
Business logic:
- PayPal order verify করা (amount + status COMPLETED check)
- Duplicate transaction check
- Manual payment → pending_verification
- Order save to MongoDB

#### [NEW] `src/app/modules/GmbOrder/gmbOrder.controller.ts`
Express controller — catchAsync + sendResponse pattern use করবে (auth.controller.ts-এর মতো)।

#### [NEW] `src/app/modules/GmbOrder/gmbOrder.routes.ts`
Routes:
- `POST /gmb-orders` — order submit (with multipart/form-data for screenshot)
- `POST /gmb-orders/validate-coupon` — coupon validation
- `GET /gmb-orders/:id` — order status
- `GET /gmb-orders` — admin: all orders
- `PATCH /gmb-orders/:id` — admin: update status

#### [MODIFY] `src/app/routes/index.ts`
GmbOrderRoutes যোগ করা: `path: '/gmb-orders'`

#### [MODIFY] `.env`
নতুন PayPal env variables যোগ করা:
```
PAYPAL_CLIENT_ID=your_client_id
PAYPAL_CLIENT_SECRET=your_client_secret
PAYPAL_MODE=sandbox
```

#### [MODIFY] `src/app.ts`
`multer` middleware setup করা (multipart/form-data file upload support)।

---

### Frontend — Connect to Backend

#### [MODIFY] `.env`
```
VITE_PAYPAL_CLIENT_ID=your_sandbox_client_id
```

#### [MODIFY] `src/pages/Services/GoogleMyBusiness/index.jsx`
`handleSubmit` function-এ:
- mock `setTimeout` সরানো
- `submitGMBOrder(orderPayload)` API call করা
- Error handling যোগ করা

#### [MODIFY] `src/pages/Services/GoogleMyBusiness/Step5Payment.jsx`
- `onApprove` callback-এ PayPal details ঠিকঠাক backend-এ পাঠানো নিশ্চিত করা
- `paypalTransactionId` (details.id) payload-এ include করা

---

## Security Flow

```
Customer → PayPal Button → PayPal Captures Payment
       → Frontend sends { paypalOrderId, ...formData } to Backend
       → Backend fetches order from PayPal API directly
       → Backend verifies: status=COMPLETED AND amount >= expected
       → Backend saves order to MongoDB as 'paid'
       → Frontend shows success screen
```

---

## Verification Plan

### Backend Test
```bash
# Start backend
npm run start:dev

# Test order endpoint
curl -X POST http://localhost:5000/api/v1/gmb-orders \
  -H "Content-Type: application/json" \
  -d '{"businessName":"Test","email":"test@test.com","paymentMethod":"manual",...}'
```

### Frontend Test
1. `npm run dev` দিয়ে frontend চালু করা
2. GMB form step 5-এ যাওয়া
3. PayPal payment method select করা → PayPal Sandbox button দেখাবে
4. PayPal sandbox test account দিয়ে payment করা
5. Success screen দেখা
6. MongoDB-তে order saved কিনা check করা

### Dependencies to Install
**Backend:**
```bash
npm install multer @types/multer axios
```
**Frontend:** (already installed `@paypal/react-paypal-js`)

