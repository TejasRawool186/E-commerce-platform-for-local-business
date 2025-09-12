// src/pages/Home.jsx
import React from "react";
import "./Home.css"; // create this file for styling

export default function Home() {
  return (
    <div>
      {/* Navbar */}
      <nav className="navbar">
        <div className="logo">LocalB2B</div>
        <ul className="nav-links">
          <li><a href="/">Home</a></li>
          <li><a href="/about">About Us</a></li>
          <li><a href="/contact">Contact Us</a></li>
        </ul>
        <button className="login-btn">Login</button>
      </nav>

      {/* Hero Section */}
      <header className="hero">
        <h1>Connect Local Businesses</h1>
        <p>The premier B2B marketplace for local sellers and retailers.</p>
        <div className="hero-buttons">
          <button className="start-btn">Start Selling</button>
          <input type="text" placeholder="Search products" className="search-box" />
        </div>
      </header>

      {/* Filter Section */}
      <section className="filter-section">
        <select>
          <option>All Categories</option>
          <option>Electronics</option>
          <option>Clothing</option>
          <option>Food</option>
        </select>
        <input type="text" placeholder="Postcode" />
        <input type="text" placeholder="Price Range" />
        <button className="filter-btn">Filter</button>
      </section>

      {/* Featured Products */}
      <section className="featured">
        <h2>Featured Products</h2>
        <div className="products-box">
          <p>No products found.</p>
        </div>
      </section>
    </div>
  );
}
