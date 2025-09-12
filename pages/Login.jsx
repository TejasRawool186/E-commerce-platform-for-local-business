// src/pages/Login.jsx
import React, { useState } from "react";
import "./Auth.css";

export default function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Example: Replace with API call
    if (formData.email === "test@test.com" && formData.password === "1234") {
      setMessage("Login successful 🎉");
    } else {
      setMessage("Invalid credentials ❌");
    }
  };

  return (
    <div className="auth-container">
      <h2>Login</h2>
      {message && <p className="msg">{message}</p>}
      <form onSubmit={handleSubmit} className="auth-form">
        <input
          name="email"
          type="email"
          placeholder="Email"
          onChange={handleChange}
          required
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          onChange={handleChange}
          required
        />
        <button type="submit">Login</button>
      </form>
      <p className="auth-switch">
        Don’t have an account? <a href="/register">Register</a>
      </p>
    </div>
  );
}
