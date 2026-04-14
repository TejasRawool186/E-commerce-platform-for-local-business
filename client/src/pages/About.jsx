import React from 'react';
import { Link } from 'wouter';

const About = () => {
    return(
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-white rounded-lg shadow-md p-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">Know Us More</h1>
                    
                    <div className="space-y-8">
                        <div>
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">About Our B2B E-commerce Platform</h2>
                            <p className="text-gray-700 leading-relaxed">
                                Welcome to LocalB2B, the premier e-commerce platform designed to bridge the gap between local manufacturers and retailers. Our mission is to empower small and medium-sized businesses by providing a seamless, efficient, and reliable digital marketplace. We believe that local businesses are the backbone of our economy, and by connecting them directly, we can foster growth, reduce costs, and build a stronger community.
                            </p>
                        </div>
                        
                        <div>
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Our Mission</h2>
                            <p className="text-gray-700 leading-relaxed">
                                Our goal is simple: to make wholesale and B2B transactions as easy as B2C shopping. We've built a user-friendly platform where retailers can discover high-quality products from local manufacturers and place bulk orders with just a few clicks. For manufacturers, we offer a powerful tool to expand their reach, manage inventory, and grow their customer base without the high overhead of traditional distribution channels.
                            </p>
                        </div>
                        
                        <div>
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">What We Offer</h2>
                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">For Retailers:</h3>
                                    <p className="text-gray-700 leading-relaxed">
                                        Access a curated catalog of locally-sourced products, enjoy transparent pricing, and simplify your procurement process. Our platform helps you find unique items that stand out in your market while supporting your local economy.
                                    </p>
                                </div>
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">For Manufacturers:</h3>
                                    <p className="text-gray-700 leading-relaxed">
                                        Showcase your products to a wide network of retailers. Our tools help you manage orders, track sales, and gain valuable insights into market demand, all in one place.
                                    </p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="text-center pt-8">
                            <Link 
                                href="/products" 
                                className="bg-primary-500 hover:bg-primary-600 text-white font-medium py-3 px-8 rounded-lg transition-colors duration-200 inline-block"
                            >
                                Explore Products
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
export default About;