import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // Mock password reset request
        setTimeout(() => {
            toast.success('Password reset link sent to your email!');
            setIsSubmitted(true);
            setIsLoading(false);
        }, 2000);
    };

    if (isSubmitted) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 flex items-center justify-center p-4">
                <div className="w-full max-w-md">
                    <div className="text-center space-y-4 mb-8">
                        <div className="flex justify-center">
                            <img
                                src="/lovewaylogistic.png"
                                alt="Loveway Logistics"
                                className="w-16 h-16 object-contain"
                            />
                        </div>
                    </div>

                    <Card className="card-elevated">
                        <CardContent className="pt-6">
                            <div className="text-center space-y-4">
                                <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                    <CheckCircle className="h-6 w-6 text-green-600" />
                                </div>
                                <h2 className="text-xl font-semibold">Check Your Email</h2>
                                <p className="text-muted-foreground">
                                    We've sent a password reset link to <strong>{email}</strong>
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    Click the link in the email to reset your password. The link will expire in 1 hour.
                                </p>
                                <div className="pt-4">
                                    <Link to="/login">
                                        <Button variant="outline" className="w-full">
                                            <ArrowLeft className="h-4 w-4 mr-2" />
                                            Back to Login
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Header */}
                <div className="text-center space-y-4 mb-8">
                    <div className="flex justify-center">
                        <img
                            src="/lovewaylogistic.png"
                            alt="Loveway Logistics"
                            className="w-16 h-16 object-contain"
                        />
                    </div>
                    <div className="space-y-2">
                        <h1 className="text-3xl font-bold text-foreground">Forgot Password?</h1>
                        <p className="text-muted-foreground">Enter your email to reset your password</p>
                    </div>
                </div>

                <Card className="card-elevated">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Mail className="h-5 w-5" />
                            Reset Password
                        </CardTitle>
                        <CardDescription>
                            We'll send you a link to reset your password
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email Address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="Enter your email address"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>

                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading ? 'Sending...' : 'Send Reset Link'}
                            </Button>
                        </form>

                        <div className="mt-6 text-center text-sm text-muted-foreground">
                            Remember your password?{' '}
                            <Link to="/login" className="text-primary hover:underline font-medium">
                                Sign in here
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
