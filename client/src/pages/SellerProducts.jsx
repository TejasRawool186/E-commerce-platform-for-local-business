import React, { useState } from 'react';
import { Link } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Plus, 
  Package, 
  Edit, 
  Trash2, 
  Eye,
  ToggleLeft,
  ToggleRight,
  Loader2,
  Search,
  Filter
} from 'lucide-react';

const SellerProducts = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const { data: productsData, isLoading: productsLoading } = useQuery({
    queryKey: ['seller-products', searchTerm, selectedCategory, currentPage],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (selectedCategory) params.append('category', selectedCategory);
      params.append('page', currentPage);
      params.append('limit', '12');
      
      const response = await fetch(`/api/seller/products?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch products');
      return response.json();
    }
  });

  const deleteProductMutation = useMutation({
    mutationFn: async (productId) => {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/seller/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['seller-products']);
      alert('Product deleted successfully');
    },
    onError: (error) => {
      alert(`Failed to delete product: ${error.message}`);
    }
  });

  const toggleProductStatusMutation = useMutation({
    mutationFn: async (productId) => {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/seller/products/${productId}/toggle`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['seller-products']);
    },
    onError: (error) => {
      alert(`Failed to update product: ${error.message}`);
    }
  });

  const handleDeleteProduct = (productId, productName) => {
    if (confirm(`Are you sure you want to delete "${productName}"? This action cannot be undone.`)) {
      deleteProductMutation.mutate(productId);
    }
  };

  const handleToggleStatus = (productId) => {
    toggleProductStatusMutation.mutate(productId);
  };

  const categories = [
    'electronics',
    'machinery', 
    'furniture',
    'food',
    'textiles',
    'chemicals',
    'other'
  ];

  if (productsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-text-primary">My Products</h1>
            <p className="text-text-secondary">Manage your product catalog</p>
          </div>
          <Link href="/seller/products/new" className="btn-primary flex items-center">
            <Plus className="w-4 h-4 mr-2" />
            Add New Product
          </Link>
        </div>

        {/* Search and Filter */}
        <div className="card p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search products..."
                className="input-field pl-10"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="input-field"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
            <div className="text-sm text-text-secondary flex items-center">
              Total: {productsData?.pagination?.totalProducts || 0} products
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {!productsData?.products?.length ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-text-primary mb-2">No products found</h3>
            <p className="text-text-secondary mb-6">
              {searchTerm || selectedCategory 
                ? 'Try adjusting your search or filter criteria'
                : 'Start by adding your first product to your catalog'
              }
            </p>
            {!searchTerm && !selectedCategory && (
              <Link href="/seller/products/new" className="btn-primary">
                Add Your First Product
              </Link>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              {productsData.products.map((product) => (
                <div key={product._id} className="card p-4">
                  <div className="aspect-square bg-gray-100 rounded-lg mb-4 flex items-center justify-center">
                    {product.images && product.images.length > 0 ? (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <Package className="w-12 h-12 text-gray-400" />
                    )}
                  </div>
                  
                  <div className="mb-4">
                    <h3 className="font-medium text-text-primary mb-2 line-clamp-2">
                      {product.name}
                    </h3>
                    
                    <p className="text-2xl font-bold text-primary-500 mb-2">
                      ₹{product.price}
                    </p>
                    
                    <p className="text-sm text-text-secondary mb-2">
                      MOQ: {product.moq} {product.unit}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        product.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {product.isActive ? 'Active' : 'Inactive'}
                      </span>
                      
                      <span className="text-xs text-text-secondary">
                        {product.category}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Link
                      href={`/products/${product._id}`}
                      className="flex-1 btn-secondary text-center text-sm"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Link>
                    <button
                      onClick={() => handleToggleStatus(product._id)}
                      className={`p-2 rounded ${
                        product.isActive 
                          ? 'text-red-500 hover:bg-red-50' 
                          : 'text-green-500 hover:bg-green-50'
                      }`}
                      title={product.isActive ? 'Deactivate' : 'Activate'}
                    >
                      {product.isActive ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(product._id, product.name)}
                      className="p-2 rounded text-red-500 hover:bg-red-50"
                      title="Delete Product"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {productsData.pagination.totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={!productsData.pagination.hasPrev}
                  className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                
                <span className="text-text-secondary">
                  Page {productsData.pagination.currentPage} of {productsData.pagination.totalPages}
                </span>
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(productsData.pagination.totalPages, prev + 1))}
                  disabled={!productsData.pagination.hasNext}
                  className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SellerProducts;


