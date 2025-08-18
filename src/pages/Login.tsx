import React, { useState } from 'react';
import { useAuth, UserRole } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Truck, User, Shield, Crown, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

export default function Login() {
  const { login, loginWithDemo, getDefaultRoute } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const success = await login(email, password);
    if (success) {
      toast.success('Login successful!');
      // Get the user role and navigate to the appropriate portal
      const mockUsers = [
        { email: 'client@demo.com', role: 'client' as UserRole },
        { email: 'driver@demo.com', role: 'driver' as UserRole },
        { email: 'admin@demo.com', role: 'admin' as UserRole },
        { email: 'superadmin@demo.com', role: 'super_admin' as UserRole }
      ];
      const user = mockUsers.find(u => u.email === email);
      if (user) {
        const defaultRoute = getDefaultRoute(user.role);
        navigate(defaultRoute);
      }
    } else {
      toast.error('Invalid credentials. Use demo123 as password.');
    }
    setIsLoading(false);
  };

  const handleDemoLogin = (role: UserRole) => {
    loginWithDemo(role);
    toast.success(`Logged in as ${role.replace('_', ' ')} demo account`);
    const defaultRoute = getDefaultRoute(role);
    navigate(defaultRoute);
  };

  const demoAccounts = [
    {
      role: 'client' as UserRole,
      title: 'Client Portal',
      description: 'Access cargo management and tracking',
      icon: User,
      color: 'bg-primary',
      email: 'client@demo.com'
    },
    {
      role: 'driver' as UserRole,
      title: 'Driver Portal',
      description: 'Manage deliveries and truck status',
      icon: Truck,
      color: 'bg-logistics-green',
      email: 'driver@demo.com'
    },
    {
      role: 'admin' as UserRole,
      title: 'Admin Portal',
      description: 'Fleet and user management',
      icon: Shield,
      color: 'bg-logistics-blue',
      email: 'admin@demo.com'
    },
    {
      role: 'super_admin' as UserRole,
      title: 'Super Admin Portal',
      description: 'System-wide administration',
      icon: Crown,
      color: 'bg-logistics-purple',
      email: 'superadmin@demo.com'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <img
              src="/lovewaylogistic.png"
              alt="Loveway Logistics"
              className="w-16 h-16 object-contain"
            />
          </div>
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-foreground">Loveway Logistics</h1>
            <p className="text-lg text-muted-foreground">Professional Logistics Management Platform</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Regular Login */}
          <Card className="card-elevated">
            <CardHeader>
              <CardTitle>Sign In</CardTitle>
              <CardDescription>Enter your credentials to access your account</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Signing in...' : 'Sign In'}
                </Button>
              </form>

              <div className="mt-4 text-center text-sm text-muted-foreground">
                <p>Demo credentials: any email with password "demo123"</p>
              </div>
            </CardContent>
          </Card>

          {/* Demo Accounts */}
          <Card className="card-elevated">
            <CardHeader>
              <CardTitle>Demo Accounts</CardTitle>
              <CardDescription>Quick access to different user portals</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {demoAccounts.map((account) => {
                const Icon = account.icon;
                return (
                  <div key={account.role} className="space-y-2">
                    <Button
                      onClick={() => handleDemoLogin(account.role)}
                      className={`w-full justify-start gap-3 h-auto p-4 ${account.color} hover:opacity-90 text-white`}
                      variant="default"
                    >
                      <Icon className="h-5 w-5" />
                      <div className="text-left">
                        <div className="font-semibold">{account.title}</div>
                        <div className="text-xs opacity-90">{account.description}</div>
                      </div>
                    </Button>
                    <p className="text-xs text-muted-foreground text-center">
                      {account.email}
                    </p>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground">
          <p>© 2024 Loveway Logistics. Professional logistics management made simple.</p>
        </div>
      </div>
    </div>
  );
}