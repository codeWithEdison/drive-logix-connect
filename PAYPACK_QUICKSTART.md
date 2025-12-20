# Paypack Payment - Quick Start Guide

## 🚀 Quick Implementation Summary

The Paypack mobile money payment integration has been successfully implemented in the Loveway Logistics frontend. This guide provides a quick overview of what was implemented and how to use it.

## ✅ What Was Implemented

### 1. Phone Number Utilities (`src/utils/phoneUtils.ts`)

- ✅ Phone number formatting for Rwanda (+250XXXXXXXXX)
- ✅ Phone number validation
- ✅ Operator detection (MTN/Airtel)
- ✅ Display formatting with spaces
- ✅ Validation error messages

### 2. Payment Hook (`src/hooks/usePaypackPayment.ts`)

- ✅ Payment initialization
- ✅ Automatic status polling (5-second intervals)
- ✅ State management (idle, pending, completed, failed)
- ✅ Error handling
- ✅ Timeout handling (5-minute max)

### 3. Payment Component (`src/components/payments/PaypackPayment.tsx`)

- ✅ User-friendly payment UI
- ✅ Phone number input with real-time validation
- ✅ Operator badge display (MTN/Airtel)
- ✅ Payment status indicators
- ✅ Loading states and progress tracking
- ✅ Instructions for users

### 4. API Integration (`src/lib/api/hooks/paymentHooks.ts`)

- ✅ `useInitializePaypackPayment()` - Initialize payment
- ✅ `usePaypackPaymentStatus()` - Check payment status
- ✅ TypeScript interfaces for type safety

### 5. Payment Flow Update (`src/components/payments/PaymentFlow.tsx`)

- ✅ Payment method selection UI
- ✅ Option to choose between Card (Flutterwave) or Mobile Money (Paypack)
- ✅ Seamless integration with existing payment flow

## 📱 User Experience Flow

1. User goes to invoice payment page
2. Selects "Mobile Money" payment method
3. Enters their MTN or Airtel phone number
4. System validates and formats the number
5. User clicks "Send Payment Request"
6. User receives USSD/push notification on their phone
7. User enters mobile money PIN to approve
8. System automatically detects payment completion
9. Success message displayed and invoice updated

## 🔧 Backend Requirements

The backend must implement these endpoints:

```
POST /api/payments/paypack/initialize
GET  /api/payments/paypack/status?ref={transaction_reference}
```

See the backend documentation: `backend/docs/PAYPACK_FRONTEND_QUICKSTART.md`

## 📝 Example Usage

### In a Component

```tsx
import { PaypackPayment } from "@/components/payments/PaypackPayment";

function InvoicePayment({ invoice }) {
  const handleSuccess = (paymentData) => {
    console.log("Payment successful!", paymentData);
    // Redirect to success page or refresh invoice
  };

  return (
    <PaypackPayment
      amount={invoice.total_amount}
      invoiceId={invoice.id}
      invoiceNumber={invoice.invoice_number}
      cargoNumber={invoice.cargo_number}
      onSuccess={handleSuccess}
      onCancel={() => console.log("Cancelled")}
    />
  );
}
```

### Using the Hook Directly

```tsx
import { usePaypackPayment } from "@/hooks/usePaypackPayment";

function CustomPayment() {
  const { status, error, initialize } = usePaypackPayment();

  return (
    <button onClick={() => initialize(invoiceId, amount, phone)}>
      Pay {amount} RWF
    </button>
  );
}
```

## 🎨 Features

### Phone Number Validation

- Accepts multiple formats (0788..., 788..., +250788..., 250788...)
- Auto-formats to +250XXXXXXXXX
- Real-time validation with error messages
- Operator detection and badge display

### Automatic Status Polling

- Starts automatically after payment initialization
- Polls every 5 seconds
- Maximum 60 attempts (5 minutes)
- Shows loading indicator
- Auto-stops on success or failure

### User-Friendly UI

- Clear instructions
- Payment summary
- Status indicators with icons
- Progress tracking
- Error messages
- Operator badges (MTN/Airtel colors)

## 🛡️ Error Handling

The system handles various error scenarios:

- **Validation Errors**: Invalid phone format, missing fields
- **API Errors**: Network issues, backend errors
- **Timeout**: No response after 5 minutes
- **Payment Failures**: User cancels or insufficient funds

All errors are displayed with clear, actionable messages.

## 🔄 Integration Points

The Paypack integration is used in:

1. **Invoice Payment** (`src/components/payments/PaymentFlow.tsx`)

   - Primary payment flow for invoices
   - Shows payment method selection

2. **Payment Modals** (can be integrated)

   - `InvoicePaymentModal`
   - `PaymentConfirmationModal`

3. **Cargo Payment** (can be integrated)
   - Direct cargo payment flow

## 📊 Payment Status States

| State       | Description               | User Action Required      |
| ----------- | ------------------------- | ------------------------- |
| `idle`      | Ready to initiate payment | Enter phone and click pay |
| `pending`   | Payment request sent      | Approve on phone          |
| `completed` | Payment successful        | None - auto-handled       |
| `failed`    | Payment failed/timeout    | Retry or contact support  |

## 🧪 Testing

To test the integration:

1. Navigate to any invoice with unpaid balance
2. Click "Pay Now"
3. Select "Mobile Money" option
4. Enter a valid Rwandan phone number
5. Click "Send Payment Request"
6. Check your phone for payment prompt
7. Approve the payment
8. Wait for confirmation (automatic)

### Test Scenarios

- ✅ Valid phone number (MTN)
- ✅ Valid phone number (Airtel)
- ✅ Invalid phone format
- ✅ Empty phone field
- ✅ Successful payment
- ✅ Failed payment
- ✅ Cancelled payment
- ✅ Timeout scenario

## 🌐 Browser Support

Works on all modern browsers:

- Chrome, Firefox, Safari, Edge
- Mobile browsers (iOS/Android)
- PWA and Capacitor app

## 📚 Documentation

For detailed documentation, see:

- **Full Integration Guide**: `PAYPACK_INTEGRATION.md`
- **Backend Guide**: `backend/docs/PAYPACK_FRONTEND_QUICKSTART.md`
- **API Documentation**: Check backend API docs

## 🚦 Next Steps

1. **Test the integration** in development environment
2. **Configure backend** with Paypack API credentials
3. **Test with real phone numbers** in sandbox mode
4. **Deploy to production** after successful testing

## ⚡ Performance

- Lightweight implementation
- Minimal bundle size impact
- Efficient polling mechanism
- Automatic cleanup on unmount

## 🎉 Benefits

✅ **No Redirect**: Payment happens in-app  
✅ **Mobile-Friendly**: Optimized for mobile users  
✅ **Real-Time**: Automatic status updates  
✅ **User-Friendly**: Clear instructions and feedback  
✅ **Reliable**: Comprehensive error handling  
✅ **Type-Safe**: Full TypeScript support

## 💡 Tips

1. **Pre-fill phone numbers**: Pass `customerPhone` prop to pre-fill user's phone
2. **Handle success callback**: Always implement `onSuccess` to handle post-payment actions
3. **Show clear messages**: The component handles most UX, but you can add custom messages
4. **Monitor backend logs**: For debugging payment issues, check backend logs

## 🆘 Troubleshooting

**Payment not working?**

1. Check backend is running and accessible
2. Verify backend Paypack credentials are set
3. Check browser console for errors
4. Ensure phone number is in correct format

**Status not updating?**

1. Check network connectivity
2. Verify backend status endpoint is working
3. Look for console errors in browser

## 📞 Support

For issues:

- Frontend: Check browser console and this documentation
- Backend: Check backend logs and Paypack dashboard
- Payment: Contact Paypack support if money deducted but payment showing failed

---

**Created**: December 2024  
**Version**: 1.0.0  
**Status**: ✅ Ready for Testing
