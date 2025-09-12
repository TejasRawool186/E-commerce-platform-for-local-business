import React, { useState } from 'react';
import './Register.css'; // Import the CSS file

const Register = () => {
  // State to manage which user type is selected
  const [userType, setUserType] = useState('retailer');

  // A single state object to hold all form data
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    businessName: '', // For retailer
    businessNameSeller: '', // For seller
    businessType: '',
    email: '',
    password: '',
    address: '',
    pincode: '',
    phoneNumber: '',
    whatsappNumber: '',
  });

  // Handler for all input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Handler for radio button changes
  const handleUserTypeChange = (e) => {
    setUserType(e.target.value);
  };

  // Handler for form submission
  const handleSubmit = (e) => {
    e.preventDefault(); // Prevent default form submission

    // Create a data object with relevant fields based on userType
    const commonData = {
      userType,
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      email: formData.email.trim(),
      password: formData.password, // Passwords are not trimmed
      address: formData.address.trim(),
      pincode: formData.pincode.trim(),
      phoneNumber: formData.phoneNumber.trim(),
    };

    let submissionData;

    if (userType === 'seller') {
      submissionData = {
        ...commonData,
        businessName: formData.businessNameSeller.trim(),
        businessType: formData.businessType,
        whatsappNumber: formData.whatsappNumber.trim(),
      };
    } else {
      submissionData = {
        ...commonData,
        businessName: formData.businessName.trim(),
      };
    }
    
    // Demo alert
    alert('Form submitted successfully!\n\n' + JSON.stringify(submissionData, null, 2));
    
    // In a real application, you would send this data to a server:
    // fetch('/api/register', { method: 'POST', body: JSON.stringify(submissionData) })
    //   .then(response => response.json())
    //   .then(data => console.log('Success:', data))
    //   .catch(error => console.error('Error:', error));
  };

  return (
    <>
      <nav>
        <a href="#" className="logo">LocalB2B</a>
        <ul>
          <li><a href="#">Home</a></li>
          <li><a href="#">About Us</a></li>
          <li><a href="#">Contact Us</a></li>
        </ul>
        <a href="#" className="login-btn">Login</a>
      </nav>

      <div className="container">
        <h2>Create Account</h2>
        <form onSubmit={handleSubmit} noValidate>
          <div className="radio-group">
            <label>
              <input
                type="radio"
                name="userType"
                value="retailer"
                checked={userType === 'retailer'}
                onChange={handleUserTypeChange}
              /> Retailer
            </label>
            <label>
              <input
                type="radio"
                name="userType"
                value="seller"
                checked={userType === 'seller'}
                onChange={handleUserTypeChange}
              /> Seller
            </label>
          </div>

          <div className="field-row">
            <div>
              <label htmlFor="firstName">First Name *</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                placeholder="First name"
                value={formData.firstName}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <label htmlFor="lastName">Last Name *</label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                placeholder="Last name"
                value={formData.lastName}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          {/* Conditional Fields for Retailer */}
          {userType === 'retailer' && (
            <div>
              <label htmlFor="businessName">Business Name <span className="optional">(Optional)</span></label>
              <input
                type="text"
                id="businessName"
                name="businessName"
                placeholder="Enter business name"
                value={formData.businessName}
                onChange={handleInputChange}
              />
            </div>
          )}

          {/* Conditional Fields for Seller */}
          {userType === 'seller' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <label htmlFor="businessNameSeller">Business Name *</label>
                <input
                  type="text"
                  id="businessNameSeller"
                  name="businessNameSeller"
                  placeholder="Enter business name"
                  value={formData.businessNameSeller}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <label htmlFor="businessType">Business Type *</label>
                <select
                  id="businessType"
                  name="businessType"
                  value={formData.businessType}
                  onChange={handleInputChange}
                  required
                >
                  <option value="" disabled>Select business type</option>
                  <option value="manufacturer">Manufacturer</option>
                  <option value="wholesaler">Wholesaler</option>
                  <option value="distributor">Distributor</option>
                  <option value="serviceProvider">Service Provider</option>
                </select>
              </div>
            </div>
          )}

          <label htmlFor="email">Email *</label>
          <input
            type="email"
            id="email"
            name="email"
            placeholder="Enter email address"
            value={formData.email}
            onChange={handleInputChange}
            required
          />

          <label htmlFor="password">Password *</label>
          <input
            type="password"
            id="password"
            name="password"
            placeholder="Create password"
            value={formData.password}
            onChange={handleInputChange}
            required
            minLength="6" // Example of adding more specific validation
          />

          <label htmlFor="address">Address *</label>
          <input
            type="text"
            id="address"
            name="address"
            placeholder="Enter complete address"
            value={formData.address}
            onChange={handleInputChange}
            required
          />

          <div className="field-row">
            <div>
              <label htmlFor="pincode">Pincode *</label>
              <input
                type="text"
                id="pincode"
                name="pincode"
                placeholder="Enter pincode"
                maxLength="10"
                value={formData.pincode}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <label htmlFor="phoneNumber">Phone Number</label>
              <input
                type="tel"
                id="phoneNumber"
                name="phoneNumber"
                placeholder="Enter phone number"
                value={formData.phoneNumber}
                onChange={handleInputChange}
              />
            </div>
          </div>
          
          {/* Conditional WhatsApp Field for Seller */}
          {userType === 'seller' && (
            <div>
              <label htmlFor="whatsappNumber">WhatsApp Number</label>
              <input
                type="tel"
                id="whatsappNumber"
                name="whatsappNumber"
                placeholder="Enter WhatsApp number"
                value={formData.whatsappNumber}
                onChange={handleInputChange}
              />
            </div>
          )}
          
          <button type="submit">
            Register as {userType === 'retailer' ? 'Retailer' : 'Seller'}
          </button>

          <div className="login-link">
            Already have an account? <a href="#">Login here</a>
          </div>
        </form>
      </div>
    </>
  );
};

export default Register;