import React from 'react';
import { Phone, Mail, Linkedin, Github, Twitter, MessageCircle, Instagram, Facebook } from 'lucide-react';
import { Link } from 'wouter';

const Contact = () => {
  const contactCards = [
    {
      title: "Call Us",
      icon: Phone,
      description: "Speak directly with our team",
      action: "tel:+91-9405XXXXXX",
      color: "bg-green-50 hover:bg-green-100 text-green-600",
      iconColor: "text-green-600"
    },
    {
      title: "WhatsApp",
      icon: MessageCircle,
      description: "Chat with us on WhatsApp",
      action: "https://wa.me/919405XXXXXX",
      color: "bg-green-50 hover:bg-green-100 text-green-600",
      iconColor: "text-green-600"
    },
    {
      title: "Email Us",
      icon: Mail,
      description: "Send us an email",
      action: "mailto:support@localb2b.com",
      color: "bg-blue-50 hover:bg-blue-100 text-blue-600",
      iconColor: "text-blue-600"
    },
    {
      title: "LinkedIn",
      icon: Linkedin,
      description: "Connect with us professionally",
      action: "https://www.linkedin.com/in/samar-shetye-86295432b",
      color: "bg-blue-50 hover:bg-blue-100 text-blue-700",
      iconColor: "text-blue-700"
    },
    {
      title: "GitHub",
      icon: Github,
      description: "Check out our projects",
      action: "https://github.com/Samar-365",
      color: "bg-gray-50 hover:bg-gray-100 text-gray-700",
      iconColor: "text-gray-700"
    },
    {
      title: "Twitter",
      icon: Twitter,
      description: "Follow us for updates",
      action: "https://x.com/samarshetye",
      color: "bg-blue-50 hover:bg-blue-100 text-blue-400",
      iconColor: "text-blue-400"
    },
    {
      title: "Facebook",
      icon: Facebook,
      description: "Like our Facebook page",
      action: "https://facebook.com/localb2b",
      color: "bg-blue-50 hover:bg-blue-100 text-blue-800",
      iconColor: "text-blue-800"
    },
    {
      title: "Instagram",
      icon: Instagram,
      description: "Follow our Instagram",
      action: "https://instagram.com/localb2b",
      color: "bg-pink-50 hover:bg-pink-100 text-pink-600",
      iconColor: "text-pink-600"
    }
  ];

  const handleCardClick = (action) => {
    if (action.startsWith('http')) {
      window.open(action, '_blank', 'noopener,noreferrer');
    } else {
      window.location.href = action;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Get In Touch</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Connect with us through your preferred platform. We're here to help and answer any questions you may have.
          </p>
        </div>
        
        {/* Contact Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {contactCards.map((card, index) => {
            const IconComponent = card.icon;
            return (
              <div
                key={index}
                onClick={() => handleCardClick(card.action)}
                className={`${card.color} p-6 rounded-xl shadow-sm border border-gray-200 cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-105`}
              >
                <div className="text-center">
                  <div className="flex justify-center mb-4">
                    <div className="p-3 bg-white rounded-full shadow-sm">
                      <IconComponent className={`w-8 h-8 ${card.iconColor}`} />
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {card.title}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {card.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Additional Information */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Business Hours</h3>
              <p className="text-gray-600">Monday - Friday</p>
              <p className="text-gray-600">9:00 AM - 6:00 PM IST</p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Location</h3>
              <p className="text-gray-600">Mumbai, Maharashtra</p>
              <p className="text-gray-600">India</p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Support</h3>
              <p className="text-gray-600">24/7 Online Support</p>
              <p className="text-gray-600">Quick Response Time</p>
            </div>
          </div>
          
          <div className="text-center mt-8 pt-8 border-t border-gray-200">
            <p className="text-gray-600 mb-4">
              Ready to start your B2B journey with us?
            </p>
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
  );
};

export default Contact;