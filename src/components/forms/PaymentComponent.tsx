import React, { useState } from 'react';
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
    Shield,
    CheckCircle,
    Receipt
} from 'lucide-react';
import { toast } from 'sonner';

interface PaymentComponentProps {
    amount: number;
    cargoId: string;
    onPaymentComplete: (paymentData: any) => void;
    onCancel: () => void;
}

export function PaymentComponent({
    amount,
    cargoId,
    onPaymentComplete,
    onCancel
}: PaymentComponentProps) {
    const [paymentMethod, setPaymentMethod] = useState<'card' | 'mobile_money' | 'bank_transfer'>('card');
    const [isProcessing, setIsProcessing] = useState(false);
    const [isCompleted, setIsCompleted] = useState(false);
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
            setIsCompleted(true);
            setIsProcessing(false);

            // Call the completion callback
            onPaymentComplete({
                cargoId,
                amount,
                paymentMethod,
                transactionId: `TXN-${Date.now()}`,
                status: 'completed',
                timestamp: new Date().toISOString()
            });
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

    if (isCompleted) {
        return (
            <Card className="card-elevated">
                <CardContent className="pt-6">
                    <div className="text-center space-y-4">
                        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                            <CheckCircle className="h-8 w-8 text-green-600" />
                        </div>
                        <h3 className="text-xl font-semibold">Payment Successful!</h3>
                        <p className="text-muted-foreground">
                            Your payment of ${amount.toFixed(2)} has been processed successfully.
                        </p>
                        <div className="bg-muted rounded-lg p-4 space-y-2">
                            <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">Cargo ID</span>
                                <span className="font-medium">{cargoId}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">Amount Paid</span>
                                <span className="font-bold">${amount.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">Payment Method</span>
                                <span className="font-medium capitalize">{paymentMethod.replace('_', ' ')}</span>
                            </div>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Your cargo will be processed and you'll receive tracking information shortly.
                        </p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="card-elevated">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Complete Payment
                </CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Payment Summary */}
                    <div className="bg-muted rounded-lg p-4 space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Cargo ID</span>
                            <span className="font-medium">{cargoId}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Total Amount</span>
                            <span className="text-xl font-bold">${amount.toFixed(2)}</span>
                        </div>
                    </div>

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

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
                            Cancel
                        </Button>
                        <Button type="submit" className="flex-1" disabled={isProcessing}>
                            {isProcessing ? 'Processing Payment...' : `Pay $${amount.toFixed(2)}`}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
