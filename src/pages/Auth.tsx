import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/AuthContext';
import { authApi } from '@/api/auth';
import { toast } from 'sonner';
import { Loader2, ArrowLeft } from 'lucide-react';

const Auth = () => {
  const [step, setStep] = useState<'phone' | 'otp' | 'name'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!/^\+?[1-9]\d{9,14}$/.test(phone)) {
      toast.error('Please enter a valid phone number');
      return;
    }

    setIsLoading(true);
    try {
      await authApi.sendOTP(phone);
      toast.success('OTP sent successfully!');
      setStep('otp');
    } catch (error: any) {
      toast.error(error.message || 'Failed to send OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();

    if (otp.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }

    setIsLoading(true);
    try {
      // Try to verify OTP first
      const response = await authApi.verifyOTP(phone, otp);
      
      // If user is new, they need to provide name
      if (!response.data.user.name || response.data.user.name === 'New User') {
        setIsNewUser(true);
        setStep('name');
        setIsLoading(false);
        return;
      }

      // Existing user - complete login
      await login(phone, otp);
      navigate('/');
    } catch (error: any) {
      // Check if error indicates new user
      if (error.message?.includes('name')) {
        setIsNewUser(true);
        setStep('name');
      } else {
        toast.error(error.message || 'Invalid OTP');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompleteName = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error('Please enter your name');
      return;
    }

    setIsLoading(true);
    try {
      await login(phone, otp, name);
      navigate('/');
    } catch (error: any) {
      toast.error(error.message || 'Failed to complete registration');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setIsLoading(true);
    try {
      await authApi.resendOTP(phone);
      toast.success('OTP resent successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to resend OTP');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center gradient-subtle p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1">
          <div className="flex items-center mb-4">
            {step !== 'phone' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setStep(step === 'otp' ? 'phone' : 'otp')}
                className="mr-2"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <div className="h-10 w-10 rounded-lg gradient-hero" />
            <span className="ml-2 text-xl font-bold">QuickCommerce</span>
          </div>
          <CardTitle className="text-2xl">
            {step === 'phone' && 'Welcome'}
            {step === 'otp' && 'Enter OTP'}
            {step === 'name' && 'Complete Your Profile'}
          </CardTitle>
          <CardDescription>
            {step === 'phone' && 'Enter your phone number to get started'}
            {step === 'otp' && `Enter the OTP sent to ${phone}`}
            {step === 'name' && 'Tell us your name to complete registration'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === 'phone' && (
            <form onSubmit={handleSendOTP} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+919876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Include country code (e.g., +91 for India)
                </p>
              </div>
              <Button type="submit" className="w-full btn-primary" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending OTP...
                  </>
                ) : (
                  'Send OTP'
                )}
              </Button>
            </form>
          )}

          {step === 'otp' && (
            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="otp">OTP</Label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="123456"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  maxLength={6}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  In development mode, check console for OTP
                </p>
              </div>
              <Button type="submit" className="w-full btn-primary" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  'Verify OTP'
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleResendOTP}
                disabled={isLoading}
              >
                Resend OTP
              </Button>
            </form>
          )}

          {step === 'name' && (
            <form onSubmit={handleCompleteName} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full btn-primary" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Completing...
                  </>
                ) : (
                  'Complete Registration'
                )}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
