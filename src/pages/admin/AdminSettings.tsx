import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Modal, { ModalSize } from '@/components/modal/Modal';
import {
    AiOutlineSetting,
    AiOutlineDollar,
    AiOutlineTag,
    AiOutlineSave,
    AiOutlinePlus,
    AiOutlineEdit,
    AiOutlineDelete,
    AiOutlineCheck,
    AiOutlineClose
} from 'react-icons/ai';

// Mock data for settings - Rwanda-based
const mockRates = {
    baseRatePerKm: 2500, // RWF per km
    baseRatePerKg: 1200, // RWF per kg
    minimumCharge: 25000, // RWF
    fuelSurcharge: 0.15, // 15%
    insuranceRate: 0.05, // 5%
};

const mockSurcharges = [
    {
        id: '1',
        name: 'Urgent Delivery',
        type: 'percentage',
        value: 25,
        description: 'Express delivery within 24 hours',
        isActive: true
    },
    {
        id: '2',
        name: 'Night Delivery',
        type: 'fixed',
        value: 15000, // RWF
        description: 'Delivery between 8 PM - 6 AM',
        isActive: true
    },
    {
        id: '3',
        name: 'Weekend Delivery',
        type: 'percentage',
        value: 10,
        description: 'Delivery on weekends and holidays',
        isActive: false
    },
    {
        id: '4',
        name: 'Remote Area',
        type: 'fixed',
        value: 20000, // RWF
        description: 'Delivery to remote or hard-to-reach areas',
        isActive: true
    }
];

const mockPromoCodes = [
    {
        id: '1',
        code: 'WELCOME10',
        discount: 10,
        type: 'percentage',
        maxUses: 100,
        usedCount: 45,
        validFrom: '2024-01-01',
        validTo: '2024-12-31',
        isActive: true
    },
    {
        id: '2',
        code: 'FIRST50000',
        discount: 50000, // RWF
        type: 'fixed',
        maxUses: 50,
        usedCount: 12,
        validFrom: '2024-01-01',
        validTo: '2024-06-30',
        isActive: true
    }
];

interface SurchargeForm {
    name: string;
    type: 'percentage' | 'fixed';
    value: number;
    description: string;
    isActive: boolean;
}

interface PromoCodeForm {
    code: string;
    discount: number;
    type: 'percentage' | 'fixed';
    maxUses: number;
    validFrom: string;
    validTo: string;
    isActive: boolean;
}

export default function AdminSettings() {
    const [rates, setRates] = useState(mockRates);
    const [surcharges, setSurcharges] = useState(mockSurcharges);
    const [promoCodes, setPromoCodes] = useState(mockPromoCodes);
    
    // Modal states
    const [showSurchargeModal, setShowSurchargeModal] = useState(false);
    const [showPromoModal, setShowPromoModal] = useState(false);
    const [editingSurcharge, setEditingSurcharge] = useState<string | null>(null);
    const [editingPromo, setEditingPromo] = useState<string | null>(null);
    
    // Form states
    const [surchargeForm, setSurchargeForm] = useState<SurchargeForm>({
        name: '',
        type: 'percentage',
        value: 0,
        description: '',
        isActive: true
    });
    
    const [promoForm, setPromoForm] = useState<PromoCodeForm>({
        code: '',
        discount: 0,
        type: 'percentage',
        maxUses: 100,
        validFrom: '',
        validTo: '',
        isActive: true
    });

    const handleRateChange = (field: string, value: number) => {
        setRates(prev => ({ ...prev, [field]: value }));
    };

    const handleSurchargeToggle = (id: string) => {
        setSurcharges(prev =>
            prev.map(surcharge =>
                surcharge.id === id
                    ? { ...surcharge, isActive: !surcharge.isActive }
                    : surcharge
            )
        );
    };

    const handlePromoToggle = (id: string) => {
        setPromoCodes(prev =>
            prev.map(promo =>
                promo.id === id
                    ? { ...promo, isActive: !promo.isActive }
                    : promo
            )
        );
    };

    const handleSaveRates = () => {
        console.log('Saving rates:', rates);
        // TODO: Implement API call to save rates
    };

    const handleSaveSurcharges = () => {
        console.log('Saving surcharges:', surcharges);
        // TODO: Implement API call to save surcharges
    };

    const handleSavePromoCodes = () => {
        console.log('Saving promo codes:', promoCodes);
        // TODO: Implement API call to save promo codes
    };

    // Surcharge modal handlers
    const openSurchargeModal = (surcharge?: any) => {
        if (surcharge) {
            setEditingSurcharge(surcharge.id);
            setSurchargeForm({
                name: surcharge.name,
                type: surcharge.type,
                value: surcharge.value,
                description: surcharge.description,
                isActive: surcharge.isActive
            });
        } else {
            setEditingSurcharge(null);
            setSurchargeForm({
                name: '',
                type: 'percentage',
                value: 0,
                description: '',
                isActive: true
            });
        }
        setShowSurchargeModal(true);
    };

    const handleSurchargeSubmit = () => {
        if (editingSurcharge) {
            setSurcharges(prev =>
                prev.map(surcharge =>
                    surcharge.id === editingSurcharge
                        ? { ...surcharge, ...surchargeForm }
                        : surcharge
                )
            );
        } else {
            const newSurcharge = {
                id: Date.now().toString(),
                ...surchargeForm
            };
            setSurcharges(prev => [...prev, newSurcharge]);
        }
        setShowSurchargeModal(false);
    };

    const handleDeleteSurcharge = (id: string) => {
        setSurcharges(prev => prev.filter(surcharge => surcharge.id !== id));
    };

    // Promo code modal handlers
    const openPromoModal = (promo?: any) => {
        if (promo) {
            setEditingPromo(promo.id);
            setPromoForm({
                code: promo.code,
                discount: promo.discount,
                type: promo.type,
                maxUses: promo.maxUses,
                validFrom: promo.validFrom,
                validTo: promo.validTo,
                isActive: promo.isActive
            });
        } else {
            setEditingPromo(null);
            setPromoForm({
                code: '',
                discount: 0,
                type: 'percentage',
                maxUses: 100,
                validFrom: '',
                validTo: '',
                isActive: true
            });
        }
        setShowPromoModal(true);
    };

    const handlePromoSubmit = () => {
        if (editingPromo) {
            setPromoCodes(prev =>
                prev.map(promo =>
                    promo.id === editingPromo
                        ? { ...promo, ...promoForm }
                        : promo
                )
            );
        } else {
            const newPromo = {
                id: Date.now().toString(),
                usedCount: 0,
                ...promoForm
            };
            setPromoCodes(prev => [...prev, newPromo]);
        }
        setShowPromoModal(false);
    };

    const handleDeletePromo = (id: string) => {
        setPromoCodes(prev => prev.filter(promo => promo.id !== id));
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('rw-RW', {
            style: 'currency',
            currency: 'RWF',
            minimumFractionDigits: 0
        }).format(amount);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">System Settings</h1>
                    <p className="text-muted-foreground">Manage rates, surcharges, and promotional codes</p>
                </div>
                <Button onClick={handleSaveRates} className="bg-gradient-primary hover:bg-primary-hover">
                    <AiOutlineSave className="w-4 h-4 mr-2" />
                    Save All Changes
                </Button>
            </div>

            <Tabs defaultValue="rates" className="space-y-6">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="rates">Rates & Pricing</TabsTrigger>
                    <TabsTrigger value="surcharges">Surcharges</TabsTrigger>
                    <TabsTrigger value="promocodes">Promo Codes</TabsTrigger>
                </TabsList>

                {/* Rates & Pricing Tab */}
                <TabsContent value="rates" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <AiOutlineDollar className="h-5 w-5" />
                                Base Rates Configuration
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="ratePerKm">Rate per Kilometer (RWF)</Label>
                                    <Input
                                        id="ratePerKm"
                                        type="number"
                                        step="100"
                                        value={rates.baseRatePerKm}
                                        onChange={(e) => handleRateChange('baseRatePerKm', parseFloat(e.target.value))}
                                        placeholder="2500"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="ratePerKg">Rate per Kilogram (RWF)</Label>
                                    <Input
                                        id="ratePerKg"
                                        type="number"
                                        step="100"
                                        value={rates.baseRatePerKg}
                                        onChange={(e) => handleRateChange('baseRatePerKg', parseFloat(e.target.value))}
                                        placeholder="1200"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="minimumCharge">Minimum Charge (RWF)</Label>
                                    <Input
                                        id="minimumCharge"
                                        type="number"
                                        step="1000"
                                        value={rates.minimumCharge}
                                        onChange={(e) => handleRateChange('minimumCharge', parseFloat(e.target.value))}
                                        placeholder="25000"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="fuelSurcharge">Fuel Surcharge (%)</Label>
                                    <Input
                                        id="fuelSurcharge"
                                        type="number"
                                        step="0.01"
                                        value={rates.fuelSurcharge * 100}
                                        onChange={(e) => handleRateChange('fuelSurcharge', parseFloat(e.target.value) / 100)}
                                        placeholder="15"
                                    />
                                </div>
                            </div>
                            <Button onClick={handleSaveRates} className="w-full">
                                <AiOutlineSave className="w-4 h-4 mr-2" />
                                Save Rate Changes
                            </Button>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Surcharges Tab */}
                <TabsContent value="surcharges" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2">
                                    <AiOutlineTag className="h-5 w-5" />
                                    Delivery Surcharges
                                </CardTitle>
                                <Button onClick={() => openSurchargeModal()}>
                                    <AiOutlinePlus className="w-4 h-4 mr-2" />
                                    Add Surcharge
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Value</TableHead>
                                        <TableHead>Description</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {surcharges.map((surcharge) => (
                                        <TableRow key={surcharge.id}>
                                            <TableCell className="font-medium">{surcharge.name}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="capitalize">
                                                    {surcharge.type}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {surcharge.type === 'percentage' 
                                                    ? `${surcharge.value}%` 
                                                    : formatCurrency(surcharge.value)
                                                }
                                            </TableCell>
                                            <TableCell>{surcharge.description}</TableCell>
                                            <TableCell>
                                                <Switch
                                                    checked={surcharge.isActive}
                                                    onCheckedChange={() => handleSurchargeToggle(surcharge.id)}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex gap-2">
                                                    <Button 
                                                        variant="outline" 
                                                        size="sm"
                                                        onClick={() => openSurchargeModal(surcharge)}
                                                    >
                                                        <AiOutlineEdit className="h-4 w-4" />
                                                    </Button>
                                                    <Button 
                                                        variant="outline" 
                                                        size="sm"
                                                        onClick={() => handleDeleteSurcharge(surcharge.id)}
                                                    >
                                                        <AiOutlineDelete className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Promo Codes Tab */}
                <TabsContent value="promocodes" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2">
                                    <AiOutlineTag className="h-5 w-5" />
                                    Promotional Codes
                                </CardTitle>
                                <Button onClick={() => openPromoModal()}>
                                    <AiOutlinePlus className="w-4 h-4 mr-2" />
                                    Add Promo Code
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Code</TableHead>
                                        <TableHead>Discount</TableHead>
                                        <TableHead>Usage</TableHead>
                                        <TableHead>Valid Period</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {promoCodes.map((promo) => (
                                        <TableRow key={promo.id}>
                                            <TableCell className="font-medium">{promo.code}</TableCell>
                                            <TableCell>
                                                {promo.type === 'percentage' 
                                                    ? `${promo.discount}%` 
                                                    : formatCurrency(promo.discount)
                                                }
                                            </TableCell>
                                            <TableCell>
                                                {promo.usedCount} / {promo.maxUses}
                                            </TableCell>
                                            <TableCell>
                                                {promo.validFrom} - {promo.validTo}
                                            </TableCell>
                                            <TableCell>
                                                <Switch
                                                    checked={promo.isActive}
                                                    onCheckedChange={() => handlePromoToggle(promo.id)}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex gap-2">
                                                    <Button 
                                                        variant="outline" 
                                                        size="sm"
                                                        onClick={() => openPromoModal(promo)}
                                                    >
                                                        <AiOutlineEdit className="h-4 w-4" />
                                                    </Button>
                                                    <Button 
                                                        variant="outline" 
                                                        size="sm"
                                                        onClick={() => handleDeletePromo(promo.id)}
                                                    >
                                                        <AiOutlineDelete className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Surcharge Modal */}
            <Modal
                isOpen={showSurchargeModal}
                onClose={() => setShowSurchargeModal(false)}
                title={editingSurcharge ? "Edit Surcharge" : "Add New Surcharge"}
                widthSizeClass={ModalSize.medium}
            >
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="surchargeName">Surcharge Name</Label>
                        <Input
                            id="surchargeName"
                            value={surchargeForm.name}
                            onChange={(e) => setSurchargeForm(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="e.g., Urgent Delivery"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="surchargeType">Type</Label>
                        <Select
                            value={surchargeForm.type}
                            onValueChange={(value: 'percentage' | 'fixed') => 
                                setSurchargeForm(prev => ({ ...prev, type: value }))
                            }
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="percentage">Percentage (%)</SelectItem>
                                <SelectItem value="fixed">Fixed Amount (RWF)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="surchargeValue">
                            Value {surchargeForm.type === 'percentage' ? '(%)' : '(RWF)'}
                        </Label>
                        <Input
                            id="surchargeValue"
                            type="number"
                            step={surchargeForm.type === 'percentage' ? '0.01' : '1000'}
                            value={surchargeForm.value}
                            onChange={(e) => setSurchargeForm(prev => ({ ...prev, value: parseFloat(e.target.value) }))}
                            placeholder={surchargeForm.type === 'percentage' ? '25' : '15000'}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="surchargeDescription">Description</Label>
                        <Textarea
                            id="surchargeDescription"
                            value={surchargeForm.description}
                            onChange={(e) => setSurchargeForm(prev => ({ ...prev, description: e.target.value }))}
                            placeholder="Describe when this surcharge applies..."
                            rows={3}
                        />
                    </div>

                    <div className="flex items-center space-x-2">
                        <Switch
                            id="surchargeActive"
                            checked={surchargeForm.isActive}
                            onCheckedChange={(checked) => setSurchargeForm(prev => ({ ...prev, isActive: checked }))}
                        />
                        <Label htmlFor="surchargeActive">Active</Label>
                    </div>

                    <div className="flex gap-2 pt-4">
                        <Button onClick={handleSurchargeSubmit} className="flex-1">
                            <AiOutlineCheck className="w-4 h-4 mr-2" />
                            {editingSurcharge ? 'Update' : 'Create'}
                        </Button>
                        <Button 
                            variant="outline" 
                            onClick={() => setShowSurchargeModal(false)}
                            className="flex-1"
                        >
                            <AiOutlineClose className="w-4 h-4 mr-2" />
                            Cancel
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Promo Code Modal */}
            <Modal
                isOpen={showPromoModal}
                onClose={() => setShowPromoModal(false)}
                title={editingPromo ? "Edit Promo Code" : "Add New Promo Code"}
                widthSizeClass={ModalSize.medium}
            >
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="promoCode">Promo Code</Label>
                        <Input
                            id="promoCode"
                            value={promoForm.code}
                            onChange={(e) => setPromoForm(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                            placeholder="e.g., WELCOME10"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="promoType">Discount Type</Label>
                        <Select
                            value={promoForm.type}
                            onValueChange={(value: 'percentage' | 'fixed') => 
                                setPromoForm(prev => ({ ...prev, type: value }))
                            }
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="percentage">Percentage (%)</SelectItem>
                                <SelectItem value="fixed">Fixed Amount (RWF)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="promoDiscount">
                            Discount {promoForm.type === 'percentage' ? '(%)' : '(RWF)'}
                        </Label>
                        <Input
                            id="promoDiscount"
                            type="number"
                            step={promoForm.type === 'percentage' ? '0.01' : '1000'}
                            value={promoForm.discount}
                            onChange={(e) => setPromoForm(prev => ({ ...prev, discount: parseFloat(e.target.value) }))}
                            placeholder={promoForm.type === 'percentage' ? '10' : '50000'}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="promoMaxUses">Maximum Uses</Label>
                        <Input
                            id="promoMaxUses"
                            type="number"
                            value={promoForm.maxUses}
                            onChange={(e) => setPromoForm(prev => ({ ...prev, maxUses: parseInt(e.target.value) }))}
                            placeholder="100"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="promoValidFrom">Valid From</Label>
                            <Input
                                id="promoValidFrom"
                                type="date"
                                value={promoForm.validFrom}
                                onChange={(e) => setPromoForm(prev => ({ ...prev, validFrom: e.target.value }))}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="promoValidTo">Valid To</Label>
                            <Input
                                id="promoValidTo"
                                type="date"
                                value={promoForm.validTo}
                                onChange={(e) => setPromoForm(prev => ({ ...prev, validTo: e.target.value }))}
                            />
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        <Switch
                            id="promoActive"
                            checked={promoForm.isActive}
                            onCheckedChange={(checked) => setPromoForm(prev => ({ ...prev, isActive: checked }))}
                        />
                        <Label htmlFor="promoActive">Active</Label>
                    </div>

                    <div className="flex gap-2 pt-4">
                        <Button onClick={handlePromoSubmit} className="flex-1">
                            <AiOutlineCheck className="w-4 h-4 mr-2" />
                            {editingPromo ? 'Update' : 'Create'}
                        </Button>
                        <Button 
                            variant="outline" 
                            onClick={() => setShowPromoModal(false)}
                            className="flex-1"
                        >
                            <AiOutlineClose className="w-4 h-4 mr-2" />
                            Cancel
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
