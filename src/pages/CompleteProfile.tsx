import { FormEvent, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/AuthContext';

const getReturnPath = (state: unknown) => {
  const from = (state as { from?: { pathname?: string; search?: string; hash?: string } } | null)?.from;
  return from?.pathname && from.pathname !== '/complete-profile'
    ? `${from.pathname}${from.search ?? ''}${from.hash ?? ''}`
    : '/';
};

const CompleteProfile = () => {
  const { user, completeProfile } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [name, setName] = useState(user?.name ?? '');
  const [phone, setPhone] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user?.name) setName(user.name);
  }, [user?.name]);

  useEffect(() => {
    if (user?.isProfileComplete) {
      navigate(getReturnPath(location.state), { replace: true });
    }
  }, [location.state, navigate, user?.isProfileComplete]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedName = name.trim();
    const normalizedPhone = phone.replace(/\D/g, '');

    if (trimmedName.length < 2 || trimmedName.length > 60) {
      setErrorMessage('Full name must be between 2 and 60 characters.');
      return;
    }

    if (!/^[6-9]\d{9}$/.test(normalizedPhone)) {
      setErrorMessage('Enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9.');
      return;
    }

    setIsSaving(true);
    setErrorMessage('');
    try {
      await completeProfile(trimmedName, normalizedPhone);
      toast.success('Your profile is complete.');
      navigate(getReturnPath(location.state), { replace: true });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not save your profile. Please try again.';
      setErrorMessage(message);
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center gradient-subtle p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Complete your profile</CardTitle>
          <CardDescription>
            Add your name and mobile number to continue using your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="full-name">Full name</Label>
              <Input
                id="full-name"
                type="text"
                autoComplete="name"
                minLength={2}
                maxLength={60}
                value={name}
                onChange={(event) => {
                  setName(event.target.value);
                  setErrorMessage('');
                }}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mobile-number">Mobile number</Label>
              <Input
                id="mobile-number"
                type="tel"
                inputMode="numeric"
                autoComplete="tel-national"
                placeholder="10-digit Indian mobile number"
                maxLength={10}
                value={phone}
                onChange={(event) => {
                  setPhone(event.target.value.replace(/\D/g, '').slice(0, 10));
                  setErrorMessage('');
                }}
                aria-describedby={errorMessage ? 'profile-error' : undefined}
                required
              />
            </div>
            {errorMessage && (
              <p id="profile-error" className="text-sm text-destructive" role="alert">
                {errorMessage}
              </p>
            )}
            <Button type="submit" className="w-full btn-primary" disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving profile...
                </>
              ) : 'Save and continue'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CompleteProfile;
