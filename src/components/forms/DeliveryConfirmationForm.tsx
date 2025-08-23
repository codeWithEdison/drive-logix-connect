import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    CheckCircle,
    Smartphone,
    PenTool,
    Camera,
    QrCode,
    User,
    Package,
    Clock
} from 'lucide-react';
import { toast } from 'sonner';

interface DeliveryConfirmationFormProps {
    cargoId: string;
    driverName: string;
    cargoType: string;
    onConfirm: (confirmationData: any) => void;
    onCancel: () => void;
}

export function DeliveryConfirmationForm({
    cargoId,
    driverName,
    cargoType,
    onConfirm,
    onCancel
}: DeliveryConfirmationFormProps) {
    const [step, setStep] = useState(1);
    const [confirmationMethod, setConfirmationMethod] = useState<'otp' | 'signature' | 'photo' | 'qr'>('otp');
    const [formData, setFormData] = useState({
        recipientName: '',
        recipientPhone: '',
        otpCode: '',
        signature: '',
        photo: null as File | null,
        notes: '',
        rating: 5,
        review: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleOTPSubmit = () => {
        if (formData.otpCode.length !== 6) {
            toast.error('Please enter a valid 6-digit OTP code');
            return;
        }

        // Mock OTP verification
        if (formData.otpCode === '123456') {
            toast.success('OTP verified successfully!');
            setStep(3); // Move to rating step
        } else {
            toast.error('Invalid OTP code. Please try again.');
        }
    };

    const handleSignatureSubmit = () => {
        if (!formData.signature.trim()) {
            toast.error('Please provide your signature');
            return;
        }
        setStep(3);
    };

    const handlePhotoSubmit = () => {
        if (!formData.photo) {
            toast.error('Please take a photo for confirmation');
            return;
        }
        setStep(3);
    };

    const handleFinalSubmit = async () => {
        setIsSubmitting(true);

        // Mock submission
        setTimeout(() => {
            onConfirm({
                cargoId,
                confirmationMethod,
                recipientName: formData.recipientName,
                rating: formData.rating,
                review: formData.review,
                notes: formData.notes,
                confirmedAt: new Date().toISOString()
            });
            setIsSubmitting(false);
        }, 2000);
    };

    const renderStep1 = () => (
        <div className="space-y-6">
            <div className="text-center space-y-2">
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                    <Package className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold">Confirm Delivery</h3>
                <p className="text-muted-foreground">
                    Cargo {cargoId} has arrived. Please confirm receipt.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="recipientName">Recipient Name *</Label>
                    <Input
                        id="recipientName"
                        placeholder="Enter your full name"
                        value={formData.recipientName}
                        onChange={(e) => setFormData({ ...formData, recipientName: e.target.value })}
                        required
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="recipientPhone">Phone Number</Label>
                    <Input
                        id="recipientPhone"
                        placeholder="+250789123456"
                        value={formData.recipientPhone}
                        onChange={(e) => setFormData({ ...formData, recipientPhone: e.target.value })}
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label>Confirmation Method</Label>
                <Select value={confirmationMethod} onValueChange={(value: any) => setConfirmationMethod(value)}>
                    <SelectTrigger>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="otp">
                            <div className="flex items-center gap-2">
                                <Smartphone className="h-4 w-4" />
                                OTP Verification
                            </div>
                        </SelectItem>
                        <SelectItem value="signature">
                            <div className="flex items-center gap-2">
                                <PenTool className="h-4 w-4" />
                                Digital Signature
                            </div>
                        </SelectItem>
                        <SelectItem value="photo">
                            <div className="flex items-center gap-2">
                                <Camera className="h-4 w-4" />
                                Photo Confirmation
                            </div>
                        </SelectItem>
                        <SelectItem value="qr">
                            <div className="flex items-center gap-2">
                                <QrCode className="h-4 w-4" />
                                QR Code Scan
                            </div>
                        </SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="flex gap-3">
                <Button variant="outline" onClick={onCancel} className="flex-1">
                    Cancel
                </Button>
                <Button onClick={() => setStep(2)} className="flex-1" disabled={!formData.recipientName}>
                    Continue
                </Button>
            </div>
        </div>
    );

    const renderStep2 = () => (
        <div className="space-y-6">
            <div className="text-center space-y-2">
                <h3 className="text-lg font-semibold">Verify Delivery</h3>
                <p className="text-muted-foreground">
                    Please complete the verification process
                </p>
            </div>

            {confirmationMethod === 'otp' && (
                <div className="space-y-4">
                    <div className="text-center space-y-2">
                        <Smartphone className="h-8 w-8 mx-auto text-primary" />
                        <p className="text-sm text-muted-foreground">
                            Enter the 6-digit OTP sent to your phone
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="otpCode">OTP Code</Label>
                        <Input
                            id="otpCode"
                            placeholder="123456"
                            value={formData.otpCode}
                            onChange={(e) => setFormData({ ...formData, otpCode: e.target.value })}
                            maxLength={6}
                            className="text-center text-lg font-mono"
                        />
                    </div>

                    <div className="flex gap-3">
                        <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                            Back
                        </Button>
                        <Button onClick={handleOTPSubmit} className="flex-1" disabled={formData.otpCode.length !== 6}>
                            Verify OTP
                        </Button>
                    </div>
                </div>
            )}

            {confirmationMethod === 'signature' && (
                <div className="space-y-4">
                    <div className="text-center space-y-2">
                        <PenTool className="h-8 w-8 mx-auto text-primary" />
                        <p className="text-sm text-muted-foreground">
                            Please provide your digital signature
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="signature">Digital Signature</Label>
                        <Textarea
                            id="signature"
                            placeholder="Type your full name as signature"
                            value={formData.signature}
                            onChange={(e) => setFormData({ ...formData, signature: e.target.value })}
                            rows={3}
                        />
                    </div>

                    <div className="flex gap-3">
                        <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                            Back
                        </Button>
                        <Button onClick={handleSignatureSubmit} className="flex-1" disabled={!formData.signature.trim()}>
                            Confirm Signature
                        </Button>
                    </div>
                </div>
            )}

            {confirmationMethod === 'photo' && (
                <div className="space-y-4">
                    <div className="text-center space-y-2">
                        <Camera className="h-8 w-8 mx-auto text-primary" />
                        <p className="text-sm text-muted-foreground">
                            Take a photo of the delivered cargo
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="photo">Upload Photo</Label>
                        <Input
                            id="photo"
                            type="file"
                            accept="image/*"
                            capture="environment"
                            onChange={(e) => setFormData({ ...formData, photo: e.target.files?.[0] || null })}
                        />
                    </div>

                    <div className="flex gap-3">
                        <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                            Back
                        </Button>
                        <Button onClick={handlePhotoSubmit} className="flex-1" disabled={!formData.photo}>
                            Confirm Photo
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );

    const renderStep3 = () => (
        <div className="space-y-6">
            <div className="text-center space-y-2">
                <CheckCircle className="h-8 w-8 mx-auto text-green-600" />
                <h3 className="text-lg font-semibold">Rate Your Experience</h3>
                <p className="text-muted-foreground">
                    Help us improve by rating your delivery experience
                </p>
            </div>

            <div className="space-y-4">
                <div className="space-y-2">
                    <Label>Rate Driver & Service</Label>
                    <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <Button
                                key={star}
                                variant="ghost"
                                size="sm"
                                onClick={() => setFormData({ ...formData, rating: star })}
                                className={`h-8 w-8 p-0 ${formData.rating >= star ? 'text-yellow-500' : 'text-gray-300'}`}
                            >
                                ★
                            </Button>
                        ))}
                    </div>
                    <p className="text-sm text-muted-foreground">
                        {formData.rating} out of 5 stars
                    </p>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="review">Review (Optional)</Label>
                    <Textarea
                        id="review"
                        placeholder="Share your experience with this delivery..."
                        value={formData.review}
                        onChange={(e) => setFormData({ ...formData, review: e.target.value })}
                        rows={3}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="notes">Additional Notes</Label>
                    <Textarea
                        id="notes"
                        placeholder="Any additional comments or special instructions..."
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        rows={2}
                    />
                </div>
            </div>

            <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                    Back
                </Button>
                <Button onClick={handleFinalSubmit} className="flex-1" disabled={isSubmitting}>
                    {isSubmitting ? 'Confirming...' : 'Confirm Delivery'}
                </Button>
            </div>
        </div>
    );

    return (
        <Card className="max-w-md mx-auto">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Delivery Confirmation
                </CardTitle>
            </CardHeader>
            <CardContent>
                {step === 1 && renderStep1()}
                {step === 2 && renderStep2()}
                {step === 3 && renderStep3()}
            </CardContent>
        </Card>
    );
}
