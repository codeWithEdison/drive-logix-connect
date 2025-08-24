import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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

// Mock data for settings
const mockRates = {
    baseRatePerKm: 2.50,
    baseRatePerKg: 1.20,
    minimumCharge: 25.00,
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
        value: 15,
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
        value: 20,
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
        code: 'FIRST50',
        discount: 50,
        type: 'fixed',
        maxUses: 50,
        usedCount: 12,
        validFrom: '2024-01-01',
        validTo: '2024-06-30',
        isActive: true
    }
];

export default function AdminSettings() {
    const [rates, setRates] = useState(mockRates);
    const [surcharges, setSurcharges] = useState(mockSurcharges);
    const [promoCodes, setPromoCodes] = useState(mockPromoCodes);
    const [editingSurcharge, setEditingSurcharge] = useState<string | null>(null);
    const [editingPromo, setEditingPromo] = useState<string | null>(null);

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
                                    <Label htmlFor="ratePerKm">Rate per Kilometer ($)</Label>
                                    <Input
                                        id="ratePerKm"
                                        type="number"
                                        step="0.01"
                                        value={rates.baseRatePerKm}
                                        onChange={(e) => handleRateChange('baseRatePerKm', parseFloat(e.target.value))}
                                        placeholder="2.50"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="ratePerKg">Rate per Kilogram ($)</Label>
                                    <Input
                                        id="ratePerKg"
                                        type="number"
                                        step="0.01"
                                        value={rates.baseRatePerKg}
                                        onChange={(e) => handleRateChange('baseRatePerKg', parseFloat(e.target.value))}
                                        placeholder="1.20"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="minimumCharge">Minimum Charge ($)</Label>
                                    <Input
                                        id="minimumCharge"
                                        type="number"
                                        step="0.01"
                                        value={rates.minimumCharge}
                                        onChange={(e) => handleRateChange('minimumCharge', parseFloat(e.target.value))}
                                        placeholder="25.00"
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
                                <Button>
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
                                                {surcharge.type === 'percentage' ? `${surcharge.value}%` : `$${surcharge.value}`}
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
                                                    <Button variant="outline" size="sm">
                                                        <AiOutlineEdit className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="outline" size="sm">
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
                                <Button>
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
                                                {promo.type === 'percentage' ? `${promo.discount}%` : `$${promo.discount}`}
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
                                                    <Button variant="outline" size="sm">
                                                        <AiOutlineEdit className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="outline" size="sm">
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
        </div>
    );
}
