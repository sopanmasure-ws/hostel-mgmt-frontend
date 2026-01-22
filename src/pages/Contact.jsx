import React, { useState } from 'react';
import { COLLEGE_INFO } from '../utils/data';
import { DELAYS } from '../constants';
import Layout from '../components/Layout';
import '../styles/contact.css';

const INITIAL_FORM_STATE = {
  name: '',
  email: '',
  subject: '',
  message: '',
};

const Contact = () => {
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setFormData(INITIAL_FORM_STATE);
    setTimeout(() => setSubmitted(false), DELAYS.MEDIUM);
  };

  return (
    <Layout>
      <div className="contact-container">
        <div className="contact-header">
          <h1>Contact Us</h1>
          <p>We'd love to hear from you. Get in touch with us.</p>
        </div>

        <div className="contact-content">
          <div className="contact-form-section">
            {submitted && (
              <div className="success-message">
                Thank you for your message! We'll get back to you soon.
              </div>
            )}
            <form onSubmit={handleSubmit} className="contact-form">
              {/* Name Field */}
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your name"
                  required
                  className="form-input"
                />
              </div>

              {/* Email Field */}
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Your email"
                  required
                  className="form-input"
                />
              </div>

              {/* Subject Field */}
              <div className="form-group">
                <label>Subject</label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="Message subject"
                  required
                  className="form-input"
                />
              </div>

              {/* Message Field */}
              <div className="form-group">
                <label>Message</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Your message"
                  rows="5"
                  required
                  className="form-input"
                />
              </div>

              {/* Submit Button */}
              <button type="submit" className="btn btn-primary">
                Send Message
              </button>
            </form>
          </div>

          {/* College Information */}
          <div className="contact-info-section">
            <h2>Get In Touch</h2>
            <div className="college-contact-info">
              <div className="info-item">
                <h3>📍 Address</h3>
                <p>{COLLEGE_INFO?.address || 'College Address'}</p>
              </div>
              <div className="info-item">
                <h3>📞 Phone</h3>
                <p>{COLLEGE_INFO?.phone || 'College Phone'}</p>
              </div>
              <div className="info-item">
                <h3>✉️ Email</h3>
                <p>{COLLEGE_INFO?.email || 'College Email'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Contact;
