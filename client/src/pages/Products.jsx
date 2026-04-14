import React, { useState } from 'react';
import { Link } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { 
  Search, 
  Filter, 
  Package,
  Loader2,
  ChevronLeft,
  ChevronRight,
  ShoppingCart,
  Plus
} from 'lucide-react';
import api, { getImageUrl } from '../utils/api';
import toast from 'react-hot-toast';

const Products = () => {
  const { user } = useAuth();
  const { addToCart, isInCart } = useCart();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('');
  const [priceRange, setPriceRange] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const categories = [
    'electronics',
    'machinery', 
    'furniture',
    'food',
    'textiles',
    'chemicals',
    'other'
  ];

  const priceRanges = [
    { label: 'All Prices', value: '' },
    { label: '₹0 - ₹1,000', value: '0-1000' },
    { label: '₹1,000 - ₹5,000', value: '1000-5000' },
    { label: '₹5,000 - ₹10,000', value: '5000-10000' },
    { label: '₹10,000+', value: '10000-999999' }
  ];

  const buildQueryParams = () => {
    const params = new URLSearchParams();
    params.append('page', currentPage.toString());
    params.append('limit', '12');
    
    if (searchTerm) params.append('search', searchTerm);
    if (category) params.append('category', category);
    if (priceRange) {
      const [min, max] = priceRange.split('-');
      params.append('minPrice', min);
      params.append('maxPrice', max);
    }
    
    return params.toString();
  };

  const { data, isLoading, error } = useQuery({
    queryKey: ['products', searchTerm, category, priceRange, currentPage],
    queryFn: async () => {
      const queryString = buildQueryParams();
      const response = await fetch(`/api/products?${queryString}`);
      if (!response.ok) throw new Error('Failed to fetch products');
      return response.json();
    }
  });

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  const handleFilterChange = () => {
    setCurrentPage(1);
  };


  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddToCart = (product) => {
    if (!user) {
      // Redirect to login if not authenticated
      window.location.href = '/login';
      return;
    }

    if (user.role !== 'retailer') {
      toast.error('Only retailers can add items to cart');
      return;
    }

    // Add product with minimum order quantity
    addToCart(product, product.moq);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary mb-4">
            Browse Products
          </h1>
          <p className="text-text-secondary">
            Discover quality products from local B2B suppliers
          </p>
        </div>

        {/* Search and Filters */}
        <div className="card p-6 mb-8">
          <form onSubmit={handleSearch} className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search for products..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="form-label">Category</label>
                <select
                  value={category}
                  onChange={(e) => {
                    setCategory(e.target.value);
                    handleFilterChange();
                  }}
                  className="input-field"
                >
                  <option value="">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="form-label">Price Range</label>
                <select
                  value={priceRange}
                  onChange={(e) => {
                    setPriceRange(e.target.value);
                    handleFilterChange();
                  }}
                  className="input-field"
                >
                  {priceRanges.map((range) => (
                    <option key={range.value} value={range.value}>
                      {range.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  className="btn-primary w-full flex items-center justify-center"
                >
                  <Search className="w-4 h-4 mr-2" />
                  Search
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Results */}
        <div className="mb-8">
          {data?.pagination && (
            <div className="flex items-center justify-between mb-6">
              <p className="text-text-secondary">
                Showing {((currentPage - 1) * 12) + 1} to {Math.min(currentPage * 12, data.pagination.totalProducts)} of {data.pagination.totalProducts} products
              </p>
            </div>
          )}

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(12)].map((_, index) => (
                <div key={index} className="card p-6 animate-pulse">
                  <div className="w-full h-48 bg-gray-200 rounded-lg mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-text-primary mb-2">
                Error loading products
              </h3>
              <p className="text-text-secondary">
                Please try again later
              </p>
            </div>
          ) : !data?.products?.length ? (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-text-primary mb-2">
                No products found
              </h3>
              <p className="text-text-secondary">
                Try adjusting your search criteria
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {data.products.map((product) => (
                  <div key={product.id || product._id} className="card p-6 hover:shadow-lg transition-shadow">
                    <div className="w-full h-48 bg-gray-100 rounded-lg mb-4 flex items-center justify-center">
                      {product.images && product.images.length > 0 ? (
                        <img
                          src={getImageUrl(product.images[0])}
                          alt={product.name}
                          className="w-full h-full object-cover rounded-lg"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : (
                        <Package className="w-16 h-16 text-gray-400" />
                      )}
                      <div className="w-full h-full items-center justify-center" style={{display: 'none'}}>
                        <Package className="w-16 h-16 text-gray-400" />
                      </div>
                    </div>
                    
                    <h3 className="font-semibold text-text-primary mb-2 line-clamp-2">
                      {product.name}
                    </h3>
                    
                    <p className="text-text-secondary text-sm mb-4 line-clamp-2">
                      {product.description}
                    </p>
                    
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-2xl font-bold text-primary-500">
                        ₹{product.price}
                      </span>
                      <span className="text-sm text-text-secondary">
                        MOQ: {product.moq} {product.unit}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-text-secondary mb-4">
                      <span className="truncate">{product.seller?.businessName || product.sellerId?.businessName}</span>
                      <span className="truncate">
                        {product.seller?.address}
                      </span>
                    </div>
                    
                    <div className="space-y-2">
                      {user && user.role === 'retailer' && (
                        <button
                          onClick={() => handleAddToCart(product)}
                          disabled={isInCart(product.id || product._id)}
                          className={`w-full flex items-center justify-center px-4 py-2 rounded-lg font-medium transition-colors ${
                            isInCart(product.id || product._id)
                              ? 'bg-green-100 text-green-700 cursor-not-allowed'
                              : 'bg-primary-500 text-white hover:bg-primary-600'
                          }`}
                        >
                          <ShoppingCart className="w-4 h-4 mr-2" />
                          {isInCart(product.id || product._id) ? 'In Cart' : 'Add to Cart'}
                        </button>
                      )}
                      
                      <Link 
                        href={`/products/${product.id || product._id}`}
                        className="w-full flex items-center justify-center px-4 py-2 rounded-lg font-medium bg-white hover:bg-gray-50 text-text-primary border border-gray-300 transition-colors duration-200"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {data.pagination && data.pagination.totalPages > 1 && (
                <div className="flex items-center justify-center space-x-2 mt-12">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={!data.pagination.hasPrev}
                    className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  
                  {[...Array(data.pagination.totalPages)].map((_, index) => {
                    const page = index + 1;
                    const isCurrentPage = page === currentPage;
                    const isNearCurrentPage = Math.abs(page - currentPage) <= 2;
                    const isFirstPage = page === 1;
                    const isLastPage = page === data.pagination.totalPages;
                    
                    if (!isNearCurrentPage && !isFirstPage && !isLastPage) {
                      if (page === 2 || page === data.pagination.totalPages - 1) {
                        return <span key={page} className="px-2">...</span>;
                      }
                      return null;
                    }
                    
                    return (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-4 py-2 rounded-lg border ${
                          isCurrentPage
                            ? 'bg-primary-500 text-white border-primary-500'
                            : 'border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={!data.pagination.hasNext}
                    className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Products;
