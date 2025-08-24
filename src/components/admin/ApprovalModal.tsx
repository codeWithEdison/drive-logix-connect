import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
    AiOutlineCheck,
    AiOutlineClose,
    AiOutlineUser,
    AiOutlineCar,
    AiOutlineFileText,
    AiOutlineMail,
    AiOutlinePhone
} from 'react-icons/ai';

interface ApprovalItem {
    id: string;
    type: 'driver' | 'client' | 'truck';
    name?: string;
    model?: string;
    email?: string;
    phone?: string;
    licensePlate?: string;
    capacity?: string;
    documents: string[];
    submitted: string;
}

interface ApprovalModalProps {
    isOpen: boolean;
    onClose: () => void;
    item: ApprovalItem | null;
    onApprove: (id: string, type: string, reason?: string) => void;
    onReject: (id: string, type: string, reason: string) => void;
}

export function ApprovalModal({ isOpen, onClose, item, onApprove, onReject }: ApprovalModalProps) {
    const [rejectionReason, setRejectionReason] = useState('');
    const [isRejecting, setIsRejecting] = useState(false);

    const handleApprove = () => {
        if (item) {
            onApprove(item.id, item.type);
            onClose();
        }
    };

    const handleReject = () => {
        if (item && rejectionReason.trim()) {
            onReject(item.id, item.type, rejectionReason);
            setRejectionReason('');
            setIsRejecting(false);
            onClose();
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'driver':
            case 'client':
                return <AiOutlineUser className="h-5 w-5" />;
            case 'truck':
                return <AiOutlineCar className="h-5 w-5" />;
            default:
                return <AiOutlineFileText className="h-5 w-5" />;
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'driver':
                return 'bg-blue-100 text-blue-800';
            case 'client':
                return 'bg-green-100 text-green-800';
            case 'truck':
                return 'bg-orange-100 text-orange-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    if (!item) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        {getTypeIcon(item.type)}
                        Review {item.type.charAt(0).toUpperCase() + item.type.slice(1)} Application
                    </DialogTitle>
                    <DialogDescription>
                        Review the details and documents before approving or rejecting this application.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Application Details */}
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <Badge className={getTypeColor(item.type)}>
                                        {item.type.toUpperCase()}
                                    </Badge>
                                    <span className="text-sm text-muted-foreground">
                                        Submitted {item.submitted}
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-sm font-medium">Name/Model</Label>
                                    <p className="text-lg font-semibold">
                                        {item.type === 'truck' ? item.model : item.name}
                                    </p>
                                </div>

                                {item.type === 'truck' && (
                                    <>
                                        <div>
                                            <Label className="text-sm font-medium">License Plate</Label>
                                            <p className="text-lg">{item.licensePlate}</p>
                                        </div>
                                        <div>
                                            <Label className="text-sm font-medium">Capacity</Label>
                                            <p className="text-lg">{item.capacity}</p>
                                        </div>
                                    </>
                                )}

                                {item.type !== 'truck' && (
                                    <>
                                        <div>
                                            <Label className="text-sm font-medium">Email</Label>
                                            <div className="flex items-center gap-2">
                                                <AiOutlineMail className="h-4 w-4 text-muted-foreground" />
                                                <p className="text-lg">{item.email}</p>
                                            </div>
                                        </div>
                                        <div>
                                            <Label className="text-sm font-medium">Phone</Label>
                                            <div className="flex items-center gap-2">
                                                <AiOutlinePhone className="h-4 w-4 text-muted-foreground" />
                                                <p className="text-lg">{item.phone}</p>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Documents */}
                    <div>
                        <Label className="text-sm font-medium">Submitted Documents</Label>
                        <div className="mt-2 flex flex-wrap gap-2">
                            {item.documents.map((doc, index) => (
                                <Badge key={index} variant="outline" className="flex items-center gap-1">
                                    <AiOutlineFileText className="h-3 w-3" />
                                    {doc}
                                </Badge>
                            ))}
                        </div>
                    </div>

                    {/* Rejection Reason */}
                    {isRejecting && (
                        <div className="space-y-2">
                            <Label htmlFor="rejection-reason">Reason for Rejection</Label>
                            <Textarea
                                id="rejection-reason"
                                placeholder="Please provide a reason for rejecting this application..."
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                rows={3}
                            />
                        </div>
                    )}
                </div>

                <DialogFooter className="flex gap-2">
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>

                    {isRejecting ? (
                        <>
                            <Button variant="outline" onClick={() => setIsRejecting(false)}>
                                <AiOutlineClose className="h-4 w-4 mr-2" />
                                Cancel Rejection
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={handleReject}
                                disabled={!rejectionReason.trim()}
                            >
                                <AiOutlineClose className="h-4 w-4 mr-2" />
                                Confirm Rejection
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button
                                variant="destructive"
                                onClick={() => setIsRejecting(true)}
                            >
                                <AiOutlineClose className="h-4 w-4 mr-2" />
                                Reject
                            </Button>
                            <Button onClick={handleApprove}>
                                <AiOutlineCheck className="h-4 w-4 mr-2" />
                                Approve
                            </Button>
                        </>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
