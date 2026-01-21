import React, { useState } from 'react';
import { COLLEGE_INFO } from '../utils/data';
import Layout from '../components/Layout';
import '../styles/contact.css';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setFormData({
      name: '',
      email: '',
      subject: '',
      message: '',
    });
    setTimeout(() => {
      setSubmitted(false);
    }, 3000);
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

              <div className="form-group">
                <label>Message</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Your message"
                  rows="6"
                  required
                  className="form-input"
                />
              </div>

              <button type="submit" className="btn btn-primary">
                Send Message
              </button>
            </form>
          </div>

          <div className="contact-info-section">
            <h2>Get in Touch</h2>
            <div className="contact-info">
              <div className="info-item">
                <h3>📍 Address</h3>
                <p>{COLLEGE_INFO.address}</p>
              </div>
              <div className="info-item">
                <h3>📧 Email</h3>
                <p>
                  <a href={`mailto:${COLLEGE_INFO.email}`}>{COLLEGE_INFO.email}</a>
                </p>
              </div>
              <div className="info-item">
                <h3>📞 Phone</h3>
                <p>
                  <a href={`tel:${COLLEGE_INFO.phone}`}>{COLLEGE_INFO.phone}</a>
                </p>
              </div>
              <div className="info-item">
                <h3>⏰ Working Hours</h3>
                <p>Monday - Friday: {COLLEGE_INFO.workingHours.weekday}<br />Saturday: {COLLEGE_INFO.workingHours.saturday}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Contact;
