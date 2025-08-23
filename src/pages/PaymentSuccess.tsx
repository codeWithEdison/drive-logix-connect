import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    CheckCircle,
    Download,
    Receipt,
    Home,
    ArrowRight
} from 'lucide-react';

export default function PaymentSuccess() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <Card className="card-elevated">
                    <CardContent className="pt-6">
                        <div className="text-center space-y-6">
                            {/* Success Icon */}
                            <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                                <CheckCircle className="h-10 w-10 text-green-600" />
                            </div>

                            {/* Success Message */}
                            <div className="space-y-2">
                                <h1 className="text-2xl font-bold text-foreground">Payment Successful!</h1>
                                <p className="text-muted-foreground">
                                    Your payment has been processed successfully. You will receive a confirmation email shortly.
                                </p>
                            </div>

                            {/* Payment Details */}
                            <div className="bg-muted rounded-lg p-4 space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">Transaction ID</span>
                                    <span className="font-medium">TXN-2024-001</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">Amount Paid</span>
                                    <span className="font-bold text-lg">$308.00</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">Payment Method</span>
                                    <span className="font-medium">Mobile Money</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">Date</span>
                                    <span className="font-medium">{new Date().toLocaleDateString()}</span>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="space-y-3">
                                <Button className="w-full" onClick={() => navigate('/invoices')}>
                                    <Receipt className="h-4 w-4 mr-2" />
                                    View Invoice
                                </Button>

                                <Button variant="outline" className="w-full">
                                    <Download className="h-4 w-4 mr-2" />
                                    Download Receipt
                                </Button>

                                <Button
                                    variant="ghost"
                                    className="w-full"
                                    onClick={() => navigate('/')}
                                >
                                    <Home className="h-4 w-4 mr-2" />
                                    Back to Dashboard
                                </Button>
                            </div>

                            {/* Additional Info */}
                            <div className="text-xs text-muted-foreground space-y-1">
                                <p>A confirmation email has been sent to your registered email address.</p>
                                <p>Your cargo delivery will proceed as scheduled.</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
