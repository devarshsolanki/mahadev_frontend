import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi } from '@/api/auth';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { User, Mail, Phone, MapPin, Plus, Edit, Trash2, Loader2 } from 'lucide-react';

const Profile = () => {
  const queryClient = useQueryClient();
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [addressForm, setAddressForm] = useState({
    label: '',
    fullAddress: '',
    landmark: '',
    city: '',
    state: '',
    pincode: '',
    isDefault: false,
  });

  const { data: user, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: authApi.getProfile,
  });

  const updateProfileMutation = useMutation({
    mutationFn: (data: any) => authApi.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast.success('Profile updated successfully');
      setIsEditingProfile(false);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update profile');
    },
  });

  const addAddressMutation = useMutation({
    mutationFn: (addresses: any[]) => authApi.updateProfile({ addresses }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast.success('Address added successfully');
      setIsAddingAddress(false);
      resetAddressForm();
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to add address');
    },
  });

  const deleteAddressMutation = useMutation({
    mutationFn: (addresses: any[]) => authApi.updateProfile({ addresses }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast.success('Address deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete address');
    },
  });

  const resetAddressForm = () => {
    setAddressForm({
      label: '',
      fullAddress: '',
      landmark: '',
      city: '',
      state: '',
      pincode: '',
      isDefault: false,
    });
  };

  const handleUpdateProfile = () => {
    updateProfileMutation.mutate({ name, email });
  };

  const handleAddAddress = () => {
    if (!addressForm.label || !addressForm.fullAddress || !addressForm.city || !addressForm.state || !addressForm.pincode) {
      toast.error('Please fill all required fields');
      return;
    }

    const addresses = user?.data?.addresses || [];
    addAddressMutation.mutate([...addresses, addressForm]);
  };

  const handleDeleteAddress = (index: number) => {
    if (window.confirm('Are you sure you want to delete this address?')) {
      const addresses = [...(user?.data?.addresses || [])];
      addresses.splice(index, 1);
      deleteAddressMutation.mutate(addresses);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  const userData = user?.data;
  const addresses = userData?.addresses || [];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Profile</h1>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Profile Info */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <User className="h-5 w-5" />
                Personal Information
              </h2>
              <Dialog open={isEditingProfile} onOpenChange={setIsEditingProfile}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" onClick={() => {
                    setName(userData?.name || '');
                    setEmail(userData?.email || '');
                  }}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Edit Profile</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                    <Button
                      className="w-full"
                      onClick={handleUpdateProfile}
                      disabled={updateProfileMutation.isPending}
                    >
                      {updateProfileMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        'Save Changes'
                      )}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium">{userData?.name}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">{userData?.phone}</p>
                </div>
              </div>

              {userData?.email && (
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{userData.email}</p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3">
                <Badge variant={userData?.isActive ? 'default' : 'destructive'}>
                  {userData?.isActive ? 'Active' : 'Inactive'}
                </Badge>
                <Badge variant="outline">{userData?.role}</Badge>
              </div>
            </div>
          </Card>

          {/* Addresses */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Saved Addresses
              </h2>
              <Dialog open={isAddingAddress} onOpenChange={setIsAddingAddress}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Address
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Address</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="label">Label *</Label>
                      <Input
                        id="label"
                        placeholder="Home, Office, etc."
                        value={addressForm.label}
                        onChange={(e) => setAddressForm({ ...addressForm, label: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="fullAddress">Full Address *</Label>
                      <Input
                        id="fullAddress"
                        value={addressForm.fullAddress}
                        onChange={(e) => setAddressForm({ ...addressForm, fullAddress: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="landmark">Landmark</Label>
                      <Input
                        id="landmark"
                        value={addressForm.landmark}
                        onChange={(e) => setAddressForm({ ...addressForm, landmark: e.target.value })}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="city">City *</Label>
                        <Input
                          id="city"
                          value={addressForm.city}
                          onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="state">State *</Label>
                        <Input
                          id="state"
                          value={addressForm.state}
                          onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="pincode">Pincode *</Label>
                      <Input
                        id="pincode"
                        value={addressForm.pincode}
                        onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value })}
                      />
                    </div>
                    <Button
                      className="w-full"
                      onClick={handleAddAddress}
                      disabled={addAddressMutation.isPending}
                    >
                      {addAddressMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Adding...
                        </>
                      ) : (
                        'Add Address'
                      )}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {addresses.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No addresses saved yet</p>
            ) : (
              <div className="space-y-4">
                {addresses.map((address: any, index: number) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="secondary">{address.label}</Badge>
                          {address.isDefault && <Badge>Default</Badge>}
                        </div>
                        <p className="text-sm">
                          {address.fullAddress}
                          {address.landmark && `, Near ${address.landmark}`}
                        </p>
                        <p className="text-sm">
                          {address.city}, {address.state} - {address.pincode}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteAddress(index)}
                        disabled={deleteAddressMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Quick Stats */}
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Account Stats</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Member Since</span>
                <span className="font-medium">{new Date(userData?.createdAt || '').toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Addresses</span>
                <span className="font-medium">{addresses.length}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;
