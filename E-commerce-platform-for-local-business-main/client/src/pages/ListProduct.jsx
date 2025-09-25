import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Upload, 
  X, 
  Loader2, 
  ArrowLeft,
  Package
} from 'lucide-react';

const productSchema = z.object({
  name: z.string().min(1, 'Product name is required').max(200, 'Name too long'),
  description: z.string().min(1, 'Description is required').max(2000, 'Description too long'),
  category: z.string().min(1, 'Category is required'),
  price: z.number().min(0, 'Price must be positive'),
  moq: z.number().min(1, 'MOQ must be at least 1'),
  unit: z.string().min(1, 'Unit is required'),
  brand: z.string().optional(),
  leadTime: z.number().min(0, 'Lead time cannot be negative').optional()
});

const ListProduct = () => {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch
  } = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: {
      unit: 'pieces'
    }
  });

  const categories = [
    'Electronics',
    'Machinery',
    'Furniture',
    'Food',
    'Textiles',
    'Chemicals',
    'Other'
  ];

  const units = [
    'pieces',
    'kg',
    'meters',
    'liters',
    'boxes',
    'tons',
    'dozens'
  ];

  const createProductMutation = useMutation({
    mutationFn: async (productData) => {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...productData,
          images: images
        })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['seller-products']);
      alert('Product listed successfully!');
      setLocation('/seller');
    },
    onError: (error) => {
      alert(`Failed to list product: ${error.message}`);
    }
  });

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length + images.length > 5) {
      alert('Maximum 5 images allowed');
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('images', file);
      });

      const response = await fetch('/api/upload/images', {
        method: 'POST',
        headers: {},
        body: formData
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      setImages(prev => [...prev, ...data.imageUrls]);
    } catch (error) {
      alert('Failed to upload images');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const onSubmit = (data) => {
    if (images.length === 0) {
      alert('Please upload at least one image');
      return;
    }

    createProductMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center mb-8">
          <button
            onClick={() => setLocation('/seller')}
            className="flex items-center text-text-secondary hover:text-text-primary mr-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </button>
          <div>
            <h1 className="text-3xl font-bold text-text-primary">List New Product</h1>
            <p className="text-text-secondary">Add a new product to your catalog</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Image Upload Section */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-text-primary mb-4">Product Images</h3>
            
            <div className="space-y-4">
              {/* Upload Area */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary-500 transition-colors">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                  disabled={uploading || images.length >= 5}
                />
                <label
                  htmlFor="image-upload"
                  className={`cursor-pointer ${uploading || images.length >= 5 ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-text-secondary mb-2">
                    {uploading ? 'Uploading...' : 'Click to upload images'}
                  </p>
                  <p className="text-sm text-text-secondary">
                    PNG, JPG, GIF up to 10MB each (max 5 images)
                  </p>
                </label>
              </div>

              {/* Image Preview Grid */}
              {images.length > 0 && (
                <div className="grid grid-cols-5 gap-4">
                  {images.map((image, index) => (
                    <div key={index} className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
                      <img
                        src={image}
                        alt={`Product ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Product Details */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-text-primary mb-6">Product Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Product Name */}
              <div className="md:col-span-2">
                <label className="form-label">Product Name *</label>
                <input
                  {...register('name')}
                  type="text"
                  className={`input-field ${errors.name ? 'border-red-500' : ''}`}
                  placeholder="Enter product name"
                />
                {errors.name && (
                  <p className="form-error">{errors.name.message}</p>
                )}
              </div>

              {/* Category */}
              <div>
                <label className="form-label">Category *</label>
                <select
                  {...register('category')}
                  className={`input-field ${errors.category ? 'border-red-500' : ''}`}
                >
                  <option value="">Select category</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <p className="form-error">{errors.category.message}</p>
                )}
              </div>

              {/* Brand */}
              <div>
                <label className="form-label">Brand (Optional)</label>
                <input
                  {...register('brand')}
                  type="text"
                  className="input-field"
                  placeholder="Enter brand name"
                />
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label className="form-label">Description *</label>
                <textarea
                  {...register('description')}
                  rows={4}
                  className={`input-field ${errors.description ? 'border-red-500' : ''}`}
                  placeholder="Describe your product in detail"
                />
                {errors.description && (
                  <p className="form-error">{errors.description.message}</p>
                )}
              </div>

              {/* Price */}
              <div>
                <label className="form-label">Price per Unit (₹) *</label>
                <input
                  {...register('price', { valueAsNumber: true })}
                  type="number"
                  step="0.01"
                  min="0"
                  className={`input-field ${errors.price ? 'border-red-500' : ''}`}
                  placeholder="0.00"
                />
                {errors.price && (
                  <p className="form-error">{errors.price.message}</p>
                )}
              </div>

              {/* MOQ */}
              <div>
                <label className="form-label">Minimum Order Quantity *</label>
                <input
                  {...register('moq', { valueAsNumber: true })}
                  type="number"
                  min="1"
                  className={`input-field ${errors.moq ? 'border-red-500' : ''}`}
                  placeholder="1"
                />
                {errors.moq && (
                  <p className="form-error">{errors.moq.message}</p>
                )}
              </div>

              {/* Unit */}
              <div>
                <label className="form-label">Unit *</label>
                <select
                  {...register('unit')}
                  className={`input-field ${errors.unit ? 'border-red-500' : ''}`}
                >
                  {units.map((unit) => (
                    <option key={unit} value={unit}>
                      {unit}
                    </option>
                  ))}
                </select>
                {errors.unit && (
                  <p className="form-error">{errors.unit.message}</p>
                )}
              </div>

              {/* Lead Time */}
              <div>
                <label className="form-label">Lead Time (Days) (Optional)</label>
                <input
                  {...register('leadTime', { valueAsNumber: true })}
                  type="number"
                  min="0"
                  className="input-field"
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => setLocation('/seller')}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createProductMutation.isPending}
              className="btn-primary flex items-center"
            >
              {createProductMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Package className="w-4 h-4 mr-2" />
              )}
              List Product
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ListProduct;
