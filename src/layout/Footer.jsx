import React from 'react';
import { COLLEGE_INFO } from '../util/data';

const Footer = () => {
  return (
    <footer className="bg-primary text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="text-center">
          <p className="text-sm">&copy; {COLLEGE_INFO.copyright} {COLLEGE_INFO.name}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
