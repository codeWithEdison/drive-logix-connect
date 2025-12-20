# Paypack Mobile Money Integration

This document describes the Paypack mobile money payment integration implemented in the Loveway Logistics frontend.

## Overview

Paypack is a mobile money payment gateway that allows customers to pay directly from their MTN Mobile Money or Airtel Money accounts without leaving the application. The payment happens through a USSD push notification sent to the customer's phone.

## Features

✅ **Mobile Money Support**: MTN Mobile Money and Airtel Money  
✅ **Phone Number Validation**: Automatic formatting and validation for Rwandan phone numbers  
✅ **Real-time Status Updates**: Automatic polling to check payment status  
✅ **User-Friendly UI**: Clear instructions and status indicators  
✅ **Operator Detection**: Automatically detects MTN or Airtel based on phone number  
✅ **Error Handling**: Comprehensive error messages and validation  

## Architecture

### Files Created

1. **`src/utils/phoneUtils.ts`**
   - Phone number formatting utilities
   - Rwandan phone number validation
   - Operator detection (MTN/Airtel)

2. **`src/hooks/usePaypackPayment.ts`**
   - Custom hook for payment management
   - Handles payment initialization
   - Automatic status polling (every 5 seconds for up to 5 minutes)
   - State management for payment flow

3. **`src/components/payments/PaypackPayment.tsx`**
   - Payment UI component
   - Phone number input with validation
   - Payment status display
   - Progress indicators

4. **`src/lib/api/hooks/paymentHooks.ts`** (updated)
   - Added `useInitializePaypackPayment()` hook
   - Added `usePaypackPaymentStatus()` hook
   - TypeScript interfaces for Paypack API responses

5. **`src/components/payments/PaymentFlow.tsx`** (updated)
   - Payment method selection UI
   - Integration of both Flutterwave and Paypack options

## Usage

### For Developers

#### Using the Paypack Payment Component

```tsx
import { PaypackPayment } from "@/components/payments/PaypackPayment";

function MyPaymentPage() {
  const handleSuccess = (paymentData) => {
    console.log("Payment successful:", paymentData);
    // Handle successful payment
  };

  const handleCancel = () => {
    console.log("Payment cancelled");
    // Handle cancellation
  };

  return (
    <PaypackPayment
      amount={50000}
      invoiceId="invoice-uuid"
      invoiceNumber="LI12345"
      cargoNumber="LC67890"
      customerPhone="+250788123456" // Optional pre-fill
      onSuccess={handleSuccess}
      onCancel={handleCancel}
    />
  );
}
```

#### Using the Payment Hook Directly

```tsx
import { usePaypackPayment } from "@/hooks/usePaypackPayment";

function MyComponent() {
  const { status, error, initialize, transactionRef } = usePaypackPayment();

  const handlePay = async () => {
    await initialize(
      "invoice-uuid",
      50000,
      "+250788123456"
    );
  };

  return (
    <div>
      <button onClick={handlePay}>Pay Now</button>
      {status === "pending" && <p>Processing payment...</p>}
      {status === "completed" && <p>Payment successful!</p>}
      {status === "failed" && <p>Error: {error}</p>}
    </div>
  );
}
```

### Phone Number Utilities

```tsx
import {
  formatRwandanPhone,
  isValidRwandanPhone,
  getPhoneValidationError,
  getRwandanOperator,
  displayRwandanPhone,
} from "@/utils/phoneUtils";

// Format phone number
const formatted = formatRwandanPhone("0788123456");
// Result: "+250788123456"

// Validate phone number
const isValid = isValidRwandanPhone("+250788123456");
// Result: true

// Get validation error
const error = getPhoneValidationError("123");
// Result: "Phone number is too short"

// Detect operator
const operator = getRwandanOperator("+250788123456");
// Result: "MTN" or "Airtel"

// Display formatted
const display = displayRwandanPhone("+250788123456");
// Result: "+250 788 123 456"
```

## API Endpoints

The frontend communicates with the following backend endpoints:

### 1. Initialize Payment

**Endpoint**: `POST /api/payments/paypack/initialize`

**Request Body**:
```json
{
  "invoice_id": "uuid",
  "amount": 50000,
  "customer_phone": "+250788123456"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Payment initialized successfully",
  "data": {
    "transaction_reference": "TXN-123456789",
    "status": "pending",
    "amount": 50000,
    "phone": "+250788123456"
  }
}
```

### 2. Check Payment Status

**Endpoint**: `GET /api/payments/paypack/status?ref={transaction_reference}`

**Response**:
```json
{
  "success": true,
  "message": "Payment status retrieved",
  "data": {
    "transaction_reference": "TXN-123456789",
    "status": "completed",
    "amount": 50000,
    "phone": "+250788123456",
    "invoice_update": {
      "invoice_number": "LI12345",
      "status": "paid",
      "is_fully_paid": true,
      "total_paid": 50000,
      "remaining_amount": 0
    }
  }
}
```

## Payment Flow

1. **User selects "Mobile Money" payment method**
   - Payment method selection screen appears

2. **User enters phone number**
   - Automatic formatting as user types
   - Real-time validation
   - Operator detection (MTN/Airtel)

3. **User clicks "Send Payment Request"**
   - Phone number validated
   - Request sent to backend
   - Transaction reference received

4. **Backend sends payment request to Paypack**
   - Paypack sends USSD/push notification to customer's phone

5. **Frontend polls for status**
   - Polls every 5 seconds
   - Maximum 60 attempts (5 minutes)
   - Shows loading indicator

6. **Customer approves payment on phone**
   - Enters mobile money PIN
   - Confirms payment

7. **Payment completes**
   - Frontend receives "completed" status
   - Success message displayed
   - Invoice automatically updated
   - `onSuccess` callback triggered

## Phone Number Format

### Accepted Input Formats

All of these formats are automatically converted to `+250XXXXXXXXX`:

- `0788123456` → `+250788123456`
- `788123456` → `+250788123456`
- `250788123456` → `+250788123456`
- `+250788123456` → `+250788123456`

### Validation Rules

- Must be exactly 13 characters in format `+250XXXXXXXXX`
- First 3 digits after country code indicate operator:
  - `078`, `079` = MTN Mobile Money
  - `072`, `073` = Airtel Money

## Status Polling

The payment status is automatically polled after initialization:

- **Interval**: 5 seconds
- **Max Attempts**: 60 (5 minutes total)
- **Statuses**:
  - `pending` - Payment awaiting approval
  - `completed` - Payment successful
  - `failed` - Payment failed or rejected

If the maximum polling attempts are reached without a final status, the payment is marked as failed with a timeout error.

## Error Handling

### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| `Phone number is required` | Empty phone field | Enter phone number |
| `Phone number is too short` | Incomplete phone number | Complete the phone number |
| `Invalid Rwandan phone number` | Wrong format | Use format +250XXXXXXXXX |
| `Payment initialization error` | Backend/API error | Check backend logs |
| `Payment verification timeout` | No response after 5 minutes | Contact support if money deducted |

### Error Display

Errors are displayed in two ways:
1. Inline validation errors (red text below input)
2. Toast notifications for API errors

## Environment Variables

No frontend environment variables are required for Paypack integration. All sensitive credentials (API keys, secret keys) are stored and managed on the backend.

## Backend Requirements

The backend must implement these endpoints:

1. `POST /api/payments/paypack/initialize`
2. `GET /api/payments/paypack/status`

For backend implementation details, see:
- `backend/docs/PAYPACK_FRONTEND_QUICKSTART.md`

## Testing

### Test Phone Numbers

For testing in sandbox mode, use Paypack's test phone numbers (provided by Paypack documentation).

### Manual Testing Checklist

- [ ] Phone number formatting works correctly
- [ ] Validation shows appropriate error messages
- [ ] Operator detection displays correct badge (MTN/Airtel)
- [ ] Payment request initializes successfully
- [ ] Polling starts after initialization
- [ ] Status updates correctly show in UI
- [ ] Success callback triggers on completion
- [ ] Cancel functionality works
- [ ] Error messages display correctly
- [ ] Timeout handling works (after 5 minutes)

## Browser Compatibility

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## Mobile App Support

The Paypack integration works seamlessly in:
- Web browsers
- Progressive Web App (PWA)
- Capacitor Android app

## Troubleshooting

### Payment not initializing

1. Check backend logs for API errors
2. Verify backend Paypack credentials
3. Ensure phone number is in correct format
4. Check network connectivity

### Status not updating

1. Check browser console for polling errors
2. Verify backend status endpoint is working
3. Check if backend is receiving webhooks from Paypack

### Phone number validation not working

1. Ensure phone number format is correct (+250XXXXXXXXX)
2. Check that phoneUtils.ts functions are imported correctly

## Future Enhancements

Potential improvements for future versions:

- [ ] Webhook support for instant status updates (no polling needed)
- [ ] Support for other mobile money operators
- [ ] Payment retry mechanism
- [ ] Save frequently used phone numbers
- [ ] QR code payment option
- [ ] Payment history integration

## Support

For issues or questions:
- Backend API: Check backend documentation
- Frontend bugs: Contact development team
- Payment issues: Contact Paypack support

## References

- Paypack Official Documentation: https://developer.paypack.rw
- Backend Integration Guide: `backend/docs/PAYPACK_FRONTEND_QUICKSTART.md`
- React Query Documentation: https://tanstack.com/query

