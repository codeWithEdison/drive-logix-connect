import React, { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    PenTool,
    RotateCcw,
    Download,
    CheckCircle,
    User,
    Calendar,
    Clock
} from 'lucide-react';

interface SignatureCaptureProps {
    onSave: (signature: string, customerName: string, notes: string) => void;
    onCancel: () => void;
    cargoId: string;
    customerName?: string;
}

export function SignatureCapture({
    onSave,
    onCancel,
    cargoId,
    customerName = ''
}: SignatureCaptureProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [hasSignature, setHasSignature] = useState(false);
    const [signatureData, setSignatureData] = useState<string>('');
    const [customerNameInput, setCustomerNameInput] = useState(customerName);
    const [notes, setNotes] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Set canvas size
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;

        // Set drawing styles
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        // Clear canvas
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }, []);

    const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
        setIsDrawing(true);
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const rect = canvas.getBoundingClientRect();
        let clientX, clientY;

        if ('touches' in e) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = e.clientX;
            clientY = e.clientY;
        }

        const x = clientX - rect.left;
        const y = clientY - rect.top;

        ctx.beginPath();
        ctx.moveTo(x, y);
    };

    const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
        if (!isDrawing) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const rect = canvas.getBoundingClientRect();
        let clientX, clientY;

        if ('touches' in e) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = e.clientX;
            clientY = e.clientY;
        }

        const x = clientX - rect.left;
        const y = clientY - rect.top;

        ctx.lineTo(x, y);
        ctx.stroke();
    };

    const stopDrawing = () => {
        setIsDrawing(false);
        setHasSignature(true);
    };

    const clearSignature = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        setHasSignature(false);
        setSignatureData('');
    };

    const saveSignature = async () => {
        if (!hasSignature) {
            alert('Please capture a signature first');
            return;
        }

        if (!customerNameInput.trim()) {
            alert('Please enter customer name');
            return;
        }

        const canvas = canvasRef.current;
        if (!canvas) return;

        setIsSaving(true);
        try {
            const signatureImage = canvas.toDataURL('image/png');
            setSignatureData(signatureImage);

            await onSave(signatureImage, customerNameInput.trim(), notes);
        } catch (error) {
            console.error('Error saving signature:', error);
            alert('Failed to save signature. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    const downloadSignature = () => {
        if (!signatureData) return;

        const link = document.createElement('a');
        link.download = `signature_${cargoId}_${Date.now()}.png`;
        link.href = signatureData;
        link.click();
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
                <div className="p-2 bg-blue-100 rounded-lg">
                    <PenTool className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                    <h3 className="font-semibold text-gray-900">Customer Signature</h3>
                    <p className="text-sm text-gray-600">Capture customer signature for delivery confirmation</p>
                    <p className="text-xs text-gray-500">Cargo ID: {cargoId}</p>
                </div>
            </div>

            {/* Customer Information */}
            <Card>
                <CardContent className="p-4">
                    <h4 className="font-medium text-gray-900 mb-3">Customer Information</h4>
                    <div className="space-y-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Customer Name *
                            </label>
                            <Input
                                value={customerNameInput}
                                onChange={(e) => setCustomerNameInput(e.target.value)}
                                placeholder="Enter customer name"
                                className="w-full"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Additional Notes
                            </label>
                            <Textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Any additional notes about the delivery..."
                                rows={2}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Signature Canvas */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-gray-900">Signature Pad</h4>
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={clearSignature}
                            disabled={!hasSignature}
                        >
                            <RotateCcw className="h-4 w-4 mr-1" />
                            Clear
                        </Button>
                    </div>

                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                        <canvas
                            ref={canvasRef}
                            className="w-full h-48 border border-gray-200 rounded cursor-crosshair touch-none"
                            onMouseDown={startDrawing}
                            onMouseMove={draw}
                            onMouseUp={stopDrawing}
                            onMouseLeave={stopDrawing}
                            onTouchStart={startDrawing}
                            onTouchMove={draw}
                            onTouchEnd={stopDrawing}
                        />
                        {!hasSignature && (
                            <div className="text-center text-gray-500 text-sm mt-2">
                                Draw signature above
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Signature Preview */}
            {hasSignature && (
                <Card>
                    <CardContent className="p-4">
                        <h4 className="font-medium text-gray-900 mb-3">Signature Preview</h4>
                        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                            <img
                                src={signatureData || ''}
                                alt="Signature Preview"
                                className="w-full h-32 object-contain"
                            />
                        </div>
                        <div className="flex gap-2 mt-3">
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={downloadSignature}
                                disabled={!signatureData}
                            >
                                <Download className="h-4 w-4 mr-1" />
                                Download
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Delivery Confirmation Info */}
            <Card>
                <CardContent className="p-4">
                    <h4 className="font-medium text-gray-900 mb-3">Delivery Confirmation</h4>
                    <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            <span>Customer: {customerNameInput || 'Not specified'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>Date: {new Date().toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            <span>Time: {new Date().toLocaleTimeString()}</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-3">
                <Button
                    onClick={saveSignature}
                    disabled={!hasSignature || !customerNameInput.trim() || isSaving}
                    className="flex-1"
                >
                    {isSaving ? (
                        <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Saving...
                        </>
                    ) : (
                        <>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Confirm Delivery
                        </>
                    )}
                </Button>
                <Button variant="outline" onClick={onCancel}>
                    Cancel
                </Button>
            </div>

            {/* Requirements Info */}
            <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <CheckCircle className="h-4 w-4 text-blue-600" />
                <p className="text-sm text-blue-800">
                    Customer signature is required for delivery confirmation
                </p>
            </div>
        </div>
    );
}
