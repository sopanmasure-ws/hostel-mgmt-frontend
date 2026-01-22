import React from 'react';
import { COLLEGE_INFO } from '../utils/data';
import Layout from '../components/Layout';
import '../styles/about.css';

// About page content constants
const ABOUT_CONTENT = {
  MISSION:
    'To provide a seamless and transparent hostel booking experience for college students. We aim to connect students with suitable hostels that meet their needs and preferences, making the accommodation process hassle-free and efficient.',
  OFFERINGS: [
    'Easy online hostel registration and browsing',
    'Transparent application process',
    'Real-time status tracking',
    'Safe and secure platform',
    'Responsive customer support',
  ],
  REASONS: [
    {
      title: 'User-Friendly',
      description: 'Intuitive interface designed for students',
    },
    {
      title: 'Transparent',
      description: 'Clear information about all hostels and requirements',
    },
    {
      title: 'Efficient',
      description: 'Quick processing and real-time updates',
    },
    {
      title: 'Secure',
      description: 'Your information is protected at all times',
    },
  ],
};

const About = () => {
  return (
    <Layout>
      <div className="about-container">
        <div className="about-header">
          <h1>About Us</h1>
          <p>Learn more about our Hostel Management System</p>
        </div>

        <div className="about-content">
          {/* Mission Section */}
          <section className="about-section">
            <h2>Our Mission</h2>
            <p>{ABOUT_CONTENT.MISSION}</p>
          </section>

          {/* Services Section */}
          <section className="about-section">
            <h2>What We Offer</h2>
            <ul>
              {ABOUT_CONTENT.OFFERINGS.map((offering, index) => (
                <li key={index}>{offering}</li>
              ))}
            </ul>
          </section>

          {/* Why Choose Us Section */}
          <section className="about-section">
            <h2>Why Choose Us?</h2>
            <div className="reasons-grid">
              {ABOUT_CONTENT.REASONS.map((reason, index) => (
                <div key={index} className="reason-card">
                  <h3>{reason.title}</h3>
                  <p>{reason.description}</p>
                </div>
              ))}
            </div>
          </section>

          {/* College Information Section */}
          <section className="about-section">
            <h2>College Information</h2>
            <div className="college-info">
              <div className="info-item">
                <strong>College Name:</strong>
                <p>{COLLEGE_INFO?.name}</p>
              </div>
              <div className="info-item">
                <strong>Location:</strong>
                <p>{COLLEGE_INFO?.location}</p>
              </div>
              <div className="info-item">
                <strong>Affiliation:</strong>
                <p>{COLLEGE_INFO?.affiliation}</p>
              </div>
              <div className="info-item">
                <strong>Established:</strong>
                <p>{COLLEGE_INFO?.established}</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </Layout>
  );
};

export default About;
