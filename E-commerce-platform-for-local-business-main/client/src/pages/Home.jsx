import React from 'react';
import { Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { 
  Search, 
  TrendingUp, 
  Users, 
  Package, 
  ArrowRight,
  Star,
  MapPin
} from 'lucide-react';

const Home = () => {
  const { data: featuredProducts, isLoading } = useQuery({
    queryKey: ['featured-products'],
    queryFn: async () => {
      const response = await fetch('/api/products/featured');
      if (!response.ok) throw new Error('Failed to fetch products');
      return response.json();
    }
  });


  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-500 to-primary-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Connect with Local B2B Suppliers
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              Discover quality products from local businesses in your area
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Link href="/register" className="btn-primary bg-white text-primary-500 hover:bg-gray-100 px-8 py-3 text-lg">
                Start Selling
              </Link>
              <Link href="/products" className="btn-secondary border-white text-primary-500 hover:bg-white hover:text-primary-500 px-8 py-3 text-lg">
                Browse Products
              </Link>
            </div>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search for products..."
                  className="w-full pl-12 pr-4 py-4 rounded-lg text-gray-900 text-lg focus:outline-none focus:ring-2 focus:ring-white"
                />
                <button className="absolute right-2 top-1/2 transform -translate-y-1/2 btn-primary px-6 py-2">
                  Search
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      

      {/* slider  */}
      <section className=" bg-background py-3">
        <div id="carouselExample" className="carousel slide">
          <div className="carousel-inner">
            <div className="carousel-item active">
              <img src=".\image\slider3.png" className="d-block w-100" alt="slider first image" />
            </div>
            <div className="carousel-item">
              <img src=".\image\slider1.png" className="d-block w-100" alt="slider second image" />
            </div>
            <div className="carousel-item">
              <img src=".\image\slider2.png" className="d-block w-100" alt="slider third image" />
            </div>
          </div>
          <button className="carousel-control-prev" type="button" data-bs-target="#carouselExample" data-bs-slide="prev">
            <span className="carousel-control-prev-icon" aria-hidden="true" />
            <span className="visually-hidden">Previous</span>
          </button>
          <button className="carousel-control-next" type="button" data-bs-target="#carouselExample" data-bs-slide="next">
            <span className="carousel-control-next-icon" aria-hidden="true" />
            <span className="visually-hidden">Next</span>
          </button>
        </div>




      </section>

      {/* Featured Products */}
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-text-primary mb-4">
              Featured Products
            </h2>
            <p className="text-text-secondary text-lg">
              Discover trending products from local suppliers
            </p>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, index) => (
                <div key={index} className="card p-6 animate-pulse">
                  <div className="w-full h-48 bg-gray-200 rounded-lg mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts?.products?.slice(0, 8).map((product) => (
                <div key={product._id} className="card p-6 hover:shadow-lg transition-shadow">
                  <div className="w-full h-48 bg-gray-100 rounded-lg mb-4 flex items-center justify-center">
                    {product.images && product.images.length > 0 ? (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <Package className="w-16 h-16 text-gray-400" />
                    )}
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
                    <span>{product.sellerId?.businessName}</span>
                    <span className="flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      {product.sellerId?.pincode}
                    </span>
                  </div>
                  
                  <Link 
                    href={`/products/${product._id}`}
                    className="btn-primary w-full text-center"
                  >
                    View Details
                  </Link>
                </div>
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Link href="/products" className="btn-primary inline-flex items-center">
              View All Products
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary-500 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Start Your B2B Journey?
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Join thousands of businesses already using LocalB2B
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register" className="btn-primary bg-white text-primary-500 hover:bg-gray-100 px-8 py-3 text-lg">
              Register as Seller
            </Link>
            <Link href="/register" className="btn-secondary border-white text-primary-500 hover:bg-white hover:text-primary-500 px-8 py-3 text-lg">
              Register as Retailer
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
