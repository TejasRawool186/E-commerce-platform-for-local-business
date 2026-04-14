import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../utils/api';
import { toast } from 'react-hot-toast';
import { Loader2, UserCircle2 } from 'lucide-react';

const EditProfile = () => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    businessName: '',
    address: '',
    pincode: '',
    phone: ''
  });

  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ['me'],
    queryFn: () => api.getMe(),
  });

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        businessName: user.businessName || '',
        address: user.address || '',
        pincode: user.pincode || '',
        phone: user.phoneNumber || ''
      });
    }
  }, [user]);

  const mutation = useMutation({
    mutationFn: (updatedData) => api.updateMe(updatedData),
    onSuccess: () => {
      toast.success('Profile updated successfully!');
      queryClient.invalidateQueries(['me']);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update profile.');
    }
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Submitting form data:', formData);
    mutation.mutate(formData);
  };

  if (userLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      {/* Left Side Image */}
      <div className="hidden lg:flex items-center justify-center bg-gray-100 p-8">
        <img
          src="/image/profile-edit.png" // Replace with an appropriate illustration
          alt="Edit Profile Illustration"
          className="object-contain w-full h-full max-w-md"
        />
      </div>

      {/* Right Side Form */}
      <div className="flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-lg w-full space-y-8">
          {/* Profile Header */}
          <div className="flex items-center space-x-4">
            <UserCircle2 className="w-16 h-16 text-gray-300" />
            <div>
              <h1 className="text-3xl font-bold text-text-primary">Edit Profile</h1>
              <p className="text-text-secondary mt-1">Keep your information up-to-date.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            {/* Personal Information Section */}
            <fieldset className="space-y-4">
              <legend className="text-lg font-semibold text-text-primary">Personal Information</legend>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="firstName" className="form-label">First Name</label>
                  <input type="text" name="firstName" id="firstName" value={formData.firstName} onChange={handleChange} required className="input-field" />
                </div>
                <div>
                  <label htmlFor="lastName" className="form-label">Last Name</label>
                  <input type="text" name="lastName" id="lastName" value={formData.lastName} onChange={handleChange} required className="input-field" />
                </div>
              </div>
            </fieldset>

            {/* Business Details Section */}
            <fieldset className="space-y-4">
              <legend className="text-lg font-semibold text-text-primary">Business Details</legend>
              <div className="space-y-4">
                <div>
                  <label htmlFor="businessName" className="form-label">Business Name</label>
                  <input type="text" name="businessName" id="businessName" value={formData.businessName} onChange={handleChange} className="input-field" />
                </div>
                <div>
                  <label htmlFor="phone" className="form-label">Phone Number</label>
                  <input type="tel" name="phone" id="phone" value={formData.phone} onChange={handleChange} required placeholder="e.g., 9876543210" className="input-field" />
                </div>
                <div>
                  <label htmlFor="address" className="form-label">Full Address</label>
                  <input type="text" name="address" id="address" value={formData.address} onChange={handleChange} required className="input-field" />
                </div>
                <div>
                  <label htmlFor="pincode" className="form-label">Pincode</label>
                  <input type="text" name="pincode" id="pincode" value={formData.pincode} onChange={handleChange} required className="input-field" />
                </div>
              </div>
            </fieldset>

            {/* Form Actions */}
            <div className="pt-5">
              <button type="submit" className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-primary-500 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed" disabled={mutation.isLoading}>
                {mutation.isLoading ? (
                  <span className="flex items-center">
                    <Loader2 className="w-5 h-5 animate-spin mr-2" /> Saving...
                  </span>
                ) : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;

