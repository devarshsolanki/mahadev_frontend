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
import toE164 from '@/utils/phone';

const Auth = () => {
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [tempAuthData, setTempAuthData] = useState<any>(null);

  const { login, completeRegistration } = useAuth();
  const navigate = useNavigate();

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullPhone = toE164(phone, '91');
    if (!/^\+?[1-9]\d{9,14}$/.test(fullPhone)) {
      toast.error('Please enter a valid phone number');
      return;
    }

    setIsLoading(true);
    try {
      await authApi.sendOTP(fullPhone);
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
      const fullPhone = toE164(phone, '91');
      const data = await login(fullPhone, otp, authMode === 'signup' ? name : undefined);
      if (data.isNewUser) {
        if (authMode === 'login') {
          toast.error("Account not found. Please create an account.");
          setStep('phone');
          setAuthMode('signup');
          return;
        }
        navigate('/');
      } else {
        if (authMode === 'signup') {
          toast.error("Account already exists. Please log in.");
          setStep('phone');
          setAuthMode('login');
          return;
        }
        navigate('/');
      }
    } catch (error: any) {
      // Error is already handled in login function
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setIsLoading(true);
    try {
      const fullPhone = toE164(phone, '91');
      await authApi.resendOTP(fullPhone);
      toast.success('OTP resent successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to resend OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setStep('phone');
    setPhone('');
    setOtp('');
    setName('');
  }

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
            <span className="ml-2 text-xl font-bold">Mahadev shop</span>
          </div>
          <CardTitle className="text-2xl">
            {step === 'phone' && (authMode === 'login' ? 'Login' : 'Create Account')}
            {step === 'otp' && 'Enter OTP'}
          </CardTitle>
          <CardDescription>
            {step === 'phone' && (authMode === 'login' ? 'Enter your phone number to login' : 'Enter your details to create an account')}
            {step === 'otp' && `Enter the OTP sent to +91${phone}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === 'phone' && (
            <form onSubmit={handleSendOTP} className="space-y-4">
              {authMode === 'signup' && (
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
              )}
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="flex items-center">
                  <span className="p-2 border border-r-0 rounded-l-md bg-gray-100">+91</span>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="9876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    required
                    className="rounded-l-none"
                  />
                </div>
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
              <p className="text-sm text-center">
                {authMode === 'login' ? "Don't have an account?" : "Already have an account?"}{' '}
                <Button
                  variant="link"
                  onClick={() => {
                    setAuthMode(authMode === 'login' ? 'signup' : 'login');
                    resetForm();
                  }}
                >
                  {authMode === 'login' ? 'Sign up' : 'Login'}
                </Button>
              </p>
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
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
