import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../contexts/AuthContext';
import { Eye, EyeOff, Loader2, User, ShoppingBag } from 'lucide-react';

const registerSchema = z.object({
  role: z.enum(['seller', 'retailer'], { required_error: 'Please select a role' }),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  businessName: z.string().min(1, 'Business name is required'),
  businessType: z.string().optional(),
  address: z.string().min(1, 'Address is required'),
  pincode: z.string().regex(/^\d{6}$/, 'Pincode must be 6 digits'),
  phone: z.string().optional(),
  whatsapp: z.string().optional()
}).refine((data) => {
  if (data.role === 'seller' && !data.businessType) {
    return false;
  }
  return true;
}, {
  message: 'Business type is required for sellers',
  path: ['businessType']
});

const Register = () => {
  const [, setLocation] = useLocation();
  const { register: registerUser } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedRole, setSelectedRole] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(registerSchema)
  });

  const watchedRole = watch('role');

  const onSubmit = async (data) => {
    setIsLoading(true);
    setError('');

    const result = await registerUser(data);
    
    if (result.success) {
      setLocation('/');
    } else {
      setError(result.message);
    }
    
    setIsLoading(false);
  };

  const businessTypes = [
    'Manufacturing',
    'Trading',
    'Service Provider',
    'Distributor'
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold text-text-primary">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-text-secondary">
            Or{' '}
            <Link href="/login" className="font-medium text-primary-500 hover:text-primary-700">
              sign in to your existing account
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Role Selection */}
          <div>
            <label className="form-label">I want to register as:</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
              <label className={`card p-6 cursor-pointer transition-all ${
                selectedRole === 'seller' ? 'ring-2 ring-primary-500 bg-primary-50' : 'hover:shadow-md'
              }`}>
                <input
                  {...register('role')}
                  type="radio"
                  value="seller"
                  className="sr-only"
                  onChange={(e) => setSelectedRole(e.target.value)}
                />
                <div className="flex items-center space-x-3">
                  <User className="w-8 h-8 text-primary-500" />
                  <div>
                    <h3 className="font-semibold text-text-primary">Seller</h3>
                    <p className="text-sm text-text-secondary">List and sell your products</p>
                  </div>
                </div>
              </label>

              <label className={`card p-6 cursor-pointer transition-all ${
                selectedRole === 'retailer' ? 'ring-2 ring-primary-500 bg-primary-50' : 'hover:shadow-md'
              }`}>
                <input
                  {...register('role')}
                  type="radio"
                  value="retailer"
                  className="sr-only"
                  onChange={(e) => setSelectedRole(e.target.value)}
                />
                <div className="flex items-center space-x-3">
                  <ShoppingBag className="w-8 h-8 text-primary-500" />
                  <div>
                    <h3 className="font-semibold text-text-primary">Retailer</h3>
                    <p className="text-sm text-text-secondary">Buy products for your business</p>
                  </div>
                </div>
              </label>
            </div>
            {errors.role && (
              <p className="form-error">{errors.role.message}</p>
            )}
          </div>

          {/* Business Type for Sellers */}
          {watchedRole === 'seller' && (
            <div>
              <label htmlFor="businessType" className="form-label">
                Business Type
              </label>
              <select
                {...register('businessType')}
                className={`input-field ${errors.businessType ? 'border-red-500' : ''}`}
              >
                <option value="">Select business type</option>
                {businessTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              {errors.businessType && (
                <p className="form-error">{errors.businessType.message}</p>
              )}
            </div>
          )}

          {/* Business Name */}
          <div>
            <label htmlFor="businessName" className="form-label">
              Business Name
            </label>
            <input
              {...register('businessName')}
              type="text"
              className={`input-field ${errors.businessName ? 'border-red-500' : ''}`}
              placeholder="Enter your business name"
            />
            {errors.businessName && (
              <p className="form-error">{errors.businessName.message}</p>
            )}
          </div>

          {/* Contact Name */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="form-label">
                First Name
              </label>
              <input
                {...register('firstName')}
                type="text"
                className={`input-field ${errors.firstName ? 'border-red-500' : ''}`}
                placeholder="Enter your first name"
              />
              {errors.firstName && (
                <p className="form-error">{errors.firstName.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="lastName" className="form-label">
                Last Name
              </label>
              <input
                {...register('lastName')}
                type="text"
                className={`input-field ${errors.lastName ? 'border-red-500' : ''}`}
                placeholder="Enter your last name"
              />
              {errors.lastName && (
                <p className="form-error">{errors.lastName.message}</p>
              )}
            </div>
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="form-label">
              Email Address
            </label>
            <input
              {...register('email')}
              type="email"
              className={`input-field ${errors.email ? 'border-red-500' : ''}`}
              placeholder="Enter your email address"
            />
            {errors.email && (
              <p className="form-error">{errors.email.message}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <div className="relative">
              <input
                {...register('password')}
                type={showPassword ? 'text' : 'password'}
                className={`input-field pr-10 ${errors.password ? 'border-red-500' : ''}`}
                placeholder="Create a password"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="form-error">{errors.password.message}</p>
            )}
          </div>

          {/* Address */}
          <div>
            <label htmlFor="address" className="form-label">
              Business Address
            </label>
            <textarea
              {...register('address')}
              rows={3}
              className={`input-field ${errors.address ? 'border-red-500' : ''}`}
              placeholder="Enter your business address"
            />
            {errors.address && (
              <p className="form-error">{errors.address.message}</p>
            )}
          </div>

          {/* Pincode */}
          <div>
            <label htmlFor="pincode" className="form-label">
              Pincode
            </label>
            <input
              {...register('pincode')}
              type="text"
              maxLength={6}
              className={`input-field ${errors.pincode ? 'border-red-500' : ''}`}
              placeholder="Enter 6-digit pincode"
            />
            {errors.pincode && (
              <p className="form-error">{errors.pincode.message}</p>
            )}
          </div>

          {/* Contact Numbers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="phone" className="form-label">
                Phone Number (Optional)
              </label>
              <input
                {...register('phone')}
                type="tel"
                className="input-field"
                placeholder="Enter phone number"
              />
            </div>

            <div>
              <label htmlFor="whatsapp" className="form-label">
                WhatsApp Number (Optional)
              </label>
              <input
                {...register('whatsapp')}
                type="tel"
                className="input-field"
                placeholder="Enter WhatsApp number"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-primary-500 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                'Create Account'
              )}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-text-secondary">
              Already have an account?{' '}
              <Link href="/login" className="font-medium text-primary-500 hover:text-primary-700">
                Sign in here
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
