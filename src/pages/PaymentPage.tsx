import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import {
    CreditCard,
    Smartphone,
    Building,
    Wallet,
    CheckCircle,
    ArrowLeft,
    Receipt,
    Shield,
    Lock
} from 'lucide-react';
import { toast } from 'sonner';

// Mock invoice data based on database schema
const mockInvoice = {
    id: "INV-2024-001",
    cargoId: "#3565432",
    subtotal: 280.00,
    taxAmount: 28.00,
    discountAmount: 0.00,
    totalAmount: 308.00,
    currency: "USD",
    dueDate: "2024-02-15",
    status: "sent",
    cargoDetails: {
        type: "Electronics",
        weight: "25 kg",
        from: "4140 Parker Rd, Allentown, NM",
        to: "3517 W. Gray St. Utica, PA",
        driver: "Albert Flores"
    }
};

export default function PaymentPage() {
    const navigate = useNavigate();
    const { invoiceId } = useParams();
    const [paymentMethod, setPaymentMethod] = useState<'card' | 'mobile_money' | 'bank_transfer'>('card');
    const [isProcessing, setIsProcessing] = useState(false);
    const [formData, setFormData] = useState({
        cardNumber: '',
        cardHolder: '',
        expiryDate: '',
        cvv: '',
        mobileNumber: '',
        mobileProvider: 'mtn',
        bankAccount: '',
        bankName: '',
        savePaymentMethod: false
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsProcessing(true);

        // Mock payment processing
        setTimeout(() => {
            toast.success('Payment processed successfully!');
            navigate('/payment-success');
            setIsProcessing(false);
        }, 3000);
    };

    const renderCardPayment = () => (
        <div className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="cardNumber">Card Number</Label>
                <Input
                    id="cardNumber"
                    placeholder="1234 5678 9012 3456"
                    value={formData.cardNumber}
                    onChange={(e) => setFormData({ ...formData, cardNumber: e.target.value })}
                    maxLength={19}
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="cardHolder">Card Holder Name</Label>
                    <Input
                        id="cardHolder"
                        placeholder="John Doe"
                        value={formData.cardHolder}
                        onChange={(e) => setFormData({ ...formData, cardHolder: e.target.value })}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="expiryDate">Expiry Date</Label>
                    <Input
                        id="expiryDate"
                        placeholder="MM/YY"
                        value={formData.expiryDate}
                        onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                        maxLength={5}
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="cvv">CVV</Label>
                <Input
                    id="cvv"
                    placeholder="123"
                    value={formData.cvv}
                    onChange={(e) => setFormData({ ...formData, cvv: e.target.value })}
                    maxLength={4}
                />
            </div>
        </div>
    );

    const renderMobileMoneyPayment = () => (
        <div className="space-y-4">
            <div className="space-y-2">
                <Label>Mobile Money Provider</Label>
                <Select value={formData.mobileProvider} onValueChange={(value) => setFormData({ ...formData, mobileProvider: value })}>
                    <SelectTrigger>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="mtn">MTN Mobile Money</SelectItem>
                        <SelectItem value="airtel">Airtel Money</SelectItem>
                        <SelectItem value="mpesa">M-Pesa</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-2">
                <Label htmlFor="mobileNumber">Mobile Number</Label>
                <Input
                    id="mobileNumber"
                    placeholder="+250789123456"
                    value={formData.mobileNumber}
                    onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
                />
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-800">
                    You will receive a payment prompt on your phone. Please enter your PIN to complete the transaction.
                </p>
            </div>
        </div>
    );

    const renderBankTransferPayment = () => (
        <div className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="bankName">Bank Name</Label>
                <Select value={formData.bankName} onValueChange={(value) => setFormData({ ...formData, bankName: value })}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select your bank" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="bpr">Bank of Kigali</SelectItem>
                        <SelectItem value="equity">Equity Bank</SelectItem>
                        <SelectItem value="gtbank">GT Bank</SelectItem>
                        <SelectItem value="cogebank">Cogebank</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-2">
                <Label htmlFor="bankAccount">Account Number</Label>
                <Input
                    id="bankAccount"
                    placeholder="Enter your account number"
                    value={formData.bankAccount}
                    onChange={(e) => setFormData({ ...formData, bankAccount: e.target.value })}
                />
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg">
                <p className="text-sm text-yellow-800">
                    Please transfer the amount to our account. You will receive a confirmation once the payment is verified.
                </p>
            </div>
        </div>
    );

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" onClick={() => navigate(-1)}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                </Button>
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Payment</h1>
                    <p className="text-muted-foreground">Complete your payment for cargo delivery</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Payment Form */}
                <Card className="card-elevated">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CreditCard className="h-5 w-5" />
                            Payment Method
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Payment Method Selection */}
                            <div className="space-y-4">
                                <Label>Select Payment Method</Label>
                                <div className="grid grid-cols-1 gap-3">
                                    <Button
                                        type="button"
                                        variant={paymentMethod === 'card' ? 'default' : 'outline'}
                                        className="justify-start h-auto p-4"
                                        onClick={() => setPaymentMethod('card')}
                                    >
                                        <CreditCard className="h-5 w-5 mr-3" />
                                        <div className="text-left">
                                            <div className="font-semibold">Credit/Debit Card</div>
                                            <div className="text-sm opacity-70">Visa, Mastercard, American Express</div>
                                        </div>
                                    </Button>

                                    <Button
                                        type="button"
                                        variant={paymentMethod === 'mobile_money' ? 'default' : 'outline'}
                                        className="justify-start h-auto p-4"
                                        onClick={() => setPaymentMethod('mobile_money')}
                                    >
                                        <Smartphone className="h-5 w-5 mr-3" />
                                        <div className="text-left">
                                            <div className="font-semibold">Mobile Money</div>
                                            <div className="text-sm opacity-70">MTN, Airtel, M-Pesa</div>
                                        </div>
                                    </Button>

                                    <Button
                                        type="button"
                                        variant={paymentMethod === 'bank_transfer' ? 'default' : 'outline'}
                                        className="justify-start h-auto p-4"
                                        onClick={() => setPaymentMethod('bank_transfer')}
                                    >
                                        <Building className="h-5 w-5 mr-3" />
                                        <div className="text-left">
                                            <div className="font-semibold">Bank Transfer</div>
                                            <div className="text-sm opacity-70">Direct bank transfer</div>
                                        </div>
                                    </Button>
                                </div>
                            </div>

                            {/* Payment Form Fields */}
                            {paymentMethod === 'card' && renderCardPayment()}
                            {paymentMethod === 'mobile_money' && renderMobileMoneyPayment()}
                            {paymentMethod === 'bank_transfer' && renderBankTransferPayment()}

                            {/* Save Payment Method */}
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="savePaymentMethod"
                                    checked={formData.savePaymentMethod}
                                    onCheckedChange={(checked) => setFormData({ ...formData, savePaymentMethod: checked as boolean })}
                                />
                                <Label htmlFor="savePaymentMethod" className="text-sm">
                                    Save payment method for future use
                                </Label>
                            </div>

                            {/* Security Notice */}
                            <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg">
                                <Shield className="h-5 w-5 text-green-600 mt-0.5" />
                                <div className="text-sm text-green-800">
                                    <p className="font-medium">Secure Payment</p>
                                    <p>Your payment information is encrypted and secure. We never store your card details.</p>
                                </div>
                            </div>

                            <Button type="submit" className="w-full" disabled={isProcessing}>
                                {isProcessing ? 'Processing Payment...' : `Pay $${mockInvoice.totalAmount.toFixed(2)}`}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Invoice Summary */}
                <div className="space-y-6">
                    <Card className="card-elevated">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Receipt className="h-5 w-5" />
                                Invoice Summary
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Invoice Number</span>
                                <span className="font-medium">{mockInvoice.id}</span>
                            </div>

                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Cargo ID</span>
                                <span className="font-medium">{mockInvoice.cargoId}</span>
                            </div>

                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Due Date</span>
                                <span className="font-medium">{mockInvoice.dueDate}</span>
                            </div>

                            <div className="border-t pt-4 space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">Subtotal</span>
                                    <span>${mockInvoice.subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">Tax</span>
                                    <span>${mockInvoice.taxAmount.toFixed(2)}</span>
                                </div>
                                {mockInvoice.discountAmount > 0 && (
                                    <div className="flex justify-between text-green-600">
                                        <span className="text-sm">Discount</span>
                                        <span>-${mockInvoice.discountAmount.toFixed(2)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between font-semibold text-lg border-t pt-2">
                                    <span>Total</span>
                                    <span>${mockInvoice.totalAmount.toFixed(2)}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Cargo Details */}
                    <Card className="card-elevated">
                        <CardHeader>
                            <CardTitle>Cargo Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">Type</span>
                                <span className="font-medium">{mockInvoice.cargoDetails.type}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">Weight</span>
                                <span className="font-medium">{mockInvoice.cargoDetails.weight}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">Driver</span>
                                <span className="font-medium">{mockInvoice.cargoDetails.driver}</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
