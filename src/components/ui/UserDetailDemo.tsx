import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { UserDetailModal } from './UserDetailModal';
import { User, UserCheck, Shield, Crown } from 'lucide-react';

// Sample user data for different roles
const sampleUsers = {
    client: {
        id: 'CLI-001',
        name: 'Jean Baptiste Ndayisaba',
        email: 'jean.baptiste@example.rw',
        phone: '+250 788 123 456',
        role: 'client' as const,
        status: 'active' as const,
        region: 'Kigali',
        joinDate: '2024-01-15',
        lastActive: '2024-01-20 14:30',
        clientData: {
            totalOrders: 45,
            totalSpent: 2500000,
            preferredRoutes: ['Kigali → Butare', 'Kigali → Musanze', 'Kigali → Rubavu'],
            paymentMethod: 'Mobile Money (MTN)',
            address: 'KG 123 St, Kigali, Rwanda'
        }
    },

    driver: {
        id: 'DRV-001',
        name: 'Sarah Mukamana',
        email: 'sarah.mukamana@lovelycargo.rw',
        phone: '+250 789 456 789',
        role: 'driver' as const,
        status: 'active' as const,
        region: 'Butare',
        joinDate: '2023-08-10',
        lastActive: '2024-01-20 15:45',
        driverData: {
            assignedTruck: {
                id: 'TRK-001',
                model: 'Toyota Dyna',
                plateNumber: 'RAA 123A',
                capacity: '3.5 tons',
                status: 'active'
            },
            licenseNumber: 'DL-2023-001234',
            experience: '5 years',
            totalDeliveries: 156,
            rating: 4.8,
            earnings: 8500000,
            currentLocation: 'Kigali Central',
            availability: 'available' as const
        }
    },

    admin: {
        id: 'ADM-001',
        name: 'Emmanuel Gasana',
        email: 'emmanuel.gasana@lovelycargo.rw',
        phone: '+250 787 789 123',
        role: 'admin' as const,
        status: 'active' as const,
        region: 'Musanze',
        joinDate: '2023-06-20',
        lastActive: '2024-01-20 16:20',
        adminData: {
            permissions: ['user_management', 'cargo_approval', 'reports_view', 'driver_assignment'],
            managedRegions: ['Musanze', 'Rubavu', 'Karongi'],
            totalUsersManaged: 89,
            systemActions: 234,
            lastLogin: '2024-01-20 16:20',
            accessLevel: 'full' as const
        }
    },

    superAdmin: {
        id: 'SUP-001',
        name: 'Alice Uwimana',
        email: 'alice.uwimana@lovelycargo.rw',
        phone: '+250 786 321 654',
        role: 'super_admin' as const,
        status: 'active' as const,
        region: 'Kigali',
        joinDate: '2023-01-01',
        lastActive: '2024-01-20 17:00',
        superAdminData: {
            systemAccess: ['full_system_access', 'database_management', 'security_settings', 'backup_restore'],
            totalAdminsManaged: 12,
            systemHealth: 98.5,
            lastBackup: '2024-01-20 02:00',
            securityLevel: 'high' as const
        }
    }
};

export function UserDetailDemo() {
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleUserClick = (userType: keyof typeof sampleUsers) => {
        setSelectedUser(sampleUsers[userType]);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedUser(null);
    };

    return (
        <div className="space-y-6">
            <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">User Detail Modal Demo</h2>
                <p className="text-gray-600">Click on any user type to see the dynamic user detail modal</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Button
                    variant="outline"
                    className="h-32 flex flex-col items-center justify-center gap-3 p-4"
                    onClick={() => handleUserClick('client')}
                >
                    <User className="h-8 w-8 text-blue-600" />
                    <div className="text-center">
                        <p className="font-semibold">Client</p>
                        <p className="text-sm text-gray-500">View client details</p>
                    </div>
                </Button>

                <Button
                    variant="outline"
                    className="h-32 flex flex-col items-center justify-center gap-3 p-4"
                    onClick={() => handleUserClick('driver')}
                >
                    <UserCheck className="h-8 w-8 text-green-600" />
                    <div className="text-center">
                        <p className="font-semibold">Driver</p>
                        <p className="text-sm text-gray-500">View driver details</p>
                    </div>
                </Button>

                <Button
                    variant="outline"
                    className="h-32 flex flex-col items-center justify-center gap-3 p-4"
                    onClick={() => handleUserClick('admin')}
                >
                    <Shield className="h-8 w-8 text-orange-600" />
                    <div className="text-center">
                        <p className="font-semibold">Admin</p>
                        <p className="text-sm text-gray-500">View admin details</p>
                    </div>
                </Button>

                <Button
                    variant="outline"
                    className="h-32 flex flex-col items-center justify-center gap-3 p-4"
                    onClick={() => handleUserClick('superAdmin')}
                >
                    <Crown className="h-8 w-8 text-purple-600" />
                    <div className="text-center">
                        <p className="font-semibold">Super Admin</p>
                        <p className="text-sm text-gray-500">View super admin details</p>
                    </div>
                </Button>
            </div>

            {/* User Detail Modal */}
            {selectedUser && (
                <UserDetailModal
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    user={selectedUser}
                />
            )}

            {/* Usage Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">How to Use:</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Click on any user type button above to open the modal</li>
                    <li>• The modal shows different information based on user role</li>
                    <li>• Navigate between Overview, Details, and Activity tabs</li>
                    <li>• Each role has specific data: clients show orders, drivers show trucks, etc.</li>
                    <li>• The modal uses the ModernModel component for mobile-friendly design</li>
                </ul>
            </div>
        </div>
    );
}
