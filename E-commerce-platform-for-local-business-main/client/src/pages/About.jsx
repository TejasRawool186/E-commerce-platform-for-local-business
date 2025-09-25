import React from 'react';
import { Link } from 'wouter';
import './about.css';


const AboutUs = () => {
    return(
        <div className="contact-container-ab">
              <div className="contact-content-ab">
                <h1>Know Us More</h1>
                <div className="contact-links">
                  <strong>About Our B2B E-commerce Platform</strong><br />
                  <p>Welcome to LocalB2B, the premier e-commerce platform designed to bridge the gap between local manufacturers and retailers. Our mission is to empower small and medium-sized businesses by providing a seamless, efficient, and reliable digital marketplace. We believe that local businesses are the backbone of our economy, and by connecting them directly, we can foster growth, reduce costs, and build a stronger community.</p><br />
                  <strong>Our Mission</strong><br />
                  <p>Our goal is simple: to make wholesale and B2B transactions as easy as B2C shopping. We've built a user-friendly platform where retailers can discover high-quality products from local manufacturers and place bulk orders with just a few clicks. For manufacturers, we offer a powerful tool to expand their reach, manage inventory, and grow their customer base without the high overhead of traditional distribution channels.</p><br />
                  <strong>What We Offer</strong><br />
                  <p>For Retailers: Access a curated catalog of locally-sourced products, enjoy transparent pricing, and simplify your procurement process. Our platform helps you find unique items that stand out in your market while supporting your local economy.</p><br />
                  <p>For Manufacturers: Showcase your products to a wide network of retailers. Our tools help you manage orders, track sales, and gain valuable insights into market demand, all in one place.</p>
                </div>
              </div>
            </div>
    )
}
export default AboutUs;