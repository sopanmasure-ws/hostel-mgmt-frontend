import React from 'react';
import { COLLEGE_INFO } from '../util/data';
import '../styles/footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <p>&copy; {COLLEGE_INFO.copyright} {COLLEGE_INFO.name}. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
