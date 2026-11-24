import { FormEvent, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/AuthContext';

type AuthStep = 'email' | 'otp';

const Auth = () => {
  const [step, setStep] = useState<AuthStep>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [resendSeconds, setResendSeconds] = useState(0);
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const {
    sendOtp,
    verifyOtp,
    resendOtp,
    googleLogin,
  } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  const getReturnPath = () => {
    const from = (location.state as { from?: { pathname?: string; search?: string; hash?: string } } | null)?.from;
    return from?.pathname && from.pathname !== '/complete-profile'
      ? `${from.pathname}${from.search ?? ''}${from.hash ?? ''}`
      : '/';
  };

  useEffect(() => {
    if (resendSeconds <= 0) return undefined;
    const timer = window.setTimeout(() => setResendSeconds(seconds => seconds - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [resendSeconds]);

  const showError = (error: unknown, fallback: string) => {
    const message = error instanceof Error ? error.message : fallback;
    setErrorMessage(message);
    toast.error(message);
  };

  const handleSendOtp = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setErrorMessage('Enter a valid email address.');
      return;
    }

    setIsSending(true);
    setErrorMessage('');
    try {
      await sendOtp(normalizedEmail);
      setEmail(normalizedEmail);
      setOtp('');
      setStep('otp');
      setResendSeconds(60);
    } catch (error) {
      showError(error, 'Could not send the verification code. Try again.');
    } finally {
      setIsSending(false);
    }
  };

  const handleVerifyOtp = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!/^\d{6}$/.test(otp)) {
      setErrorMessage('Enter the 6-digit code sent to your email.');
      return;
    }

    setIsVerifying(true);
    setErrorMessage('');
    try {
      const response = await verifyOtp(email, otp);
      toast.success(response.isNewUser ? 'Email verified. Welcome!' : 'Signed in successfully.');
      navigate(response.user.isProfileComplete ? getReturnPath() : '/complete-profile', {
        replace: true,
        state: { from: location.state?.from },
      });
    } catch (error) {
      showError(error, 'Could not verify the code. Check it and try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendOtp = async () => {
    setIsResending(true);
    setErrorMessage('');
    try {
      await resendOtp(email);
      setOtp('');
      setResendSeconds(60);
      toast.success('A new code has been sent to your email.');
    } catch (error) {
      showError(error, 'Could not resend the code. Try again.');
    } finally {
      setIsResending(false);
    }
  };

  const handleGoogleSuccess = async (idToken: string) => {
    setIsGoogleLoading(true);
    setErrorMessage('');
    try {
      const response = await googleLogin(idToken);
      toast.success(response.isNewUser ? 'Google account connected. Welcome!' : 'Signed in with Google.');
      navigate(response.user.isProfileComplete ? getReturnPath() : '/complete-profile', {
        replace: true,
        state: { from: location.state?.from },
      });
    } catch (error) {
      showError(error, 'Google sign-in failed. Please try again.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const changeEmail = () => {
    setStep('email');
    setOtp('');
    setResendSeconds(0);
    setErrorMessage('');
  };

  const googleButton = googleClientId ? (
    <GoogleLogin
      onSuccess={(credentialResponse) => {
        if (!credentialResponse.credential) {
          setErrorMessage('Google did not return an ID token. Please try again.');
          return;
        }
        void handleGoogleSuccess(credentialResponse.credential);
      }}
      onError={() => setErrorMessage('Google sign-in could not be started. Please try again.')}
      text="continue_with"
      shape="rectangular"
      width="360"
    />
  ) : (
    <Button type="button" variant="outline" className="w-full" disabled>
      Continue with Google (not configured)
    </Button>
  );

  return (
    <div className="min-h-screen flex items-center justify-center gradient-subtle p-4">
      <Card className="w-full max-w-md shadow-lg bg-[#08ff0836]">
        <CardHeader className="space-y-1">
          <div className="flex items-center mb-4">
            {step === 'otp' && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={changeEmail}
                className="mr-2"
                aria-label="Change email"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <div className="flex items-center space-x-2">
              <img src="/favicon.ico" alt="Mahadev Shop" className="h-12 w-15 rounded-lg" />
              <span className="md:text-xl font-bold">Mahadev Shop</span>
            </div>
          </div>
          <CardTitle className="text-2xl">
            {step === 'email' ? 'Welcome back' : 'Check your email'}
          </CardTitle>
          <CardDescription>
            {step === 'email'
              ? 'Sign in or create an account with your email address.'
              : `Enter the 6-digit code sent to ${email}.`}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {errorMessage && (
            <p className="text-sm text-destructive" role="alert">
              {errorMessage}
            </p>
          )}

          {step === 'email' ? (
            <>
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email address</Label>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(event) => {
                      setEmail(event.target.value);
                      setErrorMessage('');
                    }}
                    required
                  />
                </div>
                <Button type="submit" className="w-full btn-primary" disabled={isSending || isGoogleLoading}>
                  {isSending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending code...
                    </>
                  ) : 'Send code'}
                </Button>
              </form>

              <div className="flex items-center gap-3" aria-hidden="true">
                <div className="h-px flex-1 bg-border" />
                <span className="text-xs uppercase text-muted-foreground">or</span>
                <div className="h-px flex-1 bg-border" />
              </div>

              <div className={isGoogleLoading ? 'pointer-events-none opacity-60' : ''}>
                {googleClientId ? (
                  googleButton
                ) : googleButton}
              </div>
              {isGoogleLoading && (
                <p className="text-sm text-center text-muted-foreground">
                  <Loader2 className="inline mr-2 h-4 w-4 animate-spin" />
                  Signing in with Google...
                </p>
              )}
            </>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="otp">6-digit code</Label>
                <Input
                  id="otp"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  placeholder="123456"
                  value={otp}
                  onChange={(event) => {
                    setOtp(event.target.value.replace(/\D/g, '').slice(0, 6));
                    setErrorMessage('');
                  }}
                  maxLength={6}
                  required
                />
              </div>
              <Button type="submit" className="w-full btn-primary" disabled={isVerifying || isResending}>
                {isVerifying ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : 'Verify and continue'}
              </Button>
              <div className="flex items-center justify-between text-sm">
                <Button type="button" variant="link" className="px-0" onClick={changeEmail}>
                  Change email
                </Button>
                <Button
                  type="button"
                  variant="link"
                  className="px-0"
                  onClick={handleResendOtp}
                  disabled={resendSeconds > 0 || isResending || isVerifying}
                >
                  {isResending
                    ? 'Sending...'
                    : resendSeconds > 0
                      ? `Resend code in ${resendSeconds}s`
                      : 'Resend code'}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
