import React from 'react';
import { COLLEGE_INFO } from '../utils/data';
import Layout from '../components/Layout';
import '../styles/about.css';

const About = () => {
  return (
    <Layout>
      <div className="about-container">
        <div className="about-header">
          <h1>About Us</h1>
          <p>Learn more about our Hostel Management System</p>
        </div>

        <div className="about-content">
          <section className="about-section">
            <h2>Our Mission</h2>
            <p>
              To provide a seamless and transparent hostel booking experience for college students.
              We aim to connect students with suitable hostels that meet their needs and preferences,
              making the accommodation process hassle-free and efficient.
            </p>
          </section>

          <section className="about-section">
            <h2>What We Offer</h2>
            <ul>
              <li>Easy online hostel registration and browsing</li>
              <li>Transparent application process</li>
              <li>Real-time status tracking</li>
              <li>Safe and secure platform</li>
              <li>Responsive customer support</li>
            </ul>
          </section>

          <section className="about-section">
            <h2>Why Choose Us?</h2>
            <div className="reasons-grid">
              <div className="reason-card">
                <h3>User-Friendly</h3>
                <p>Intuitive interface designed for students</p>
              </div>
              <div className="reason-card">
                <h3>Transparent</h3>
                <p>Clear information about all hostels and requirements</p>
              </div>
              <div className="reason-card">
                <h3>Efficient</h3>
                <p>Quick processing and real-time updates</p>
              </div>
              <div className="reason-card">
                <h3>Secure</h3>
                <p>Your information is protected at all times</p>
              </div>
            </div>
          </section>

          <section className="about-section">
            <h2>College Information</h2>
            <div className="college-info">
              <div className="info-item">
                <strong>College Name:</strong>
                <p>{COLLEGE_INFO.name}</p>
              </div>
              <div className="info-item">
                <strong>Location:</strong>
                <p>{COLLEGE_INFO.location}</p>
              </div>
              <div className="info-item">
                <strong>Affiliation:</strong>
                <p>{COLLEGE_INFO.affiliation}</p>
              </div>
              <div className="info-item">
                <strong>Established:</strong>
                <p>{COLLEGE_INFO.established}</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </Layout>
  );
};

export default About;
