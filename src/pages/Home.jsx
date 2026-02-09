import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { tokenService } from '../lib/services/tokenService';
import Layout from '../layout/Layout';
import { ROUTES, LABELS, FEATURES } from '../config';

const Home = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    if (tokenService.isStudentTokenValid()) {
      navigate(ROUTES.DASHBOARD);
    } else if (tokenService.isAdminTokenValid()) {
      navigate(ROUTES.ADMIN_DASHBOARD);
    }
  }, [navigate]);

  return (
    <Layout>
      <div className="w-full">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-primary via-secondary to-tertiary text-white py-20 px-4">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">{LABELS.HOME_TITLE}</h1>
            <p className="text-lg md:text-xl text-blue-50 max-w-2xl mx-auto">{LABELS.HOME_SUBTITLE}</p>

            {isAuthenticated ? (
              <button 
                className="inline-block px-8 py-4 bg-white text-primary font-semibold rounded-lg hover:bg-gray-100 transition-colors duration-150 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5" 
                onClick={() => navigate(ROUTES.DASHBOARD)}
              >
                {LABELS.GO_TO_DASHBOARD}
              </button>
            ) : (
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <button 
                  className="px-8 py-4 bg-white text-primary font-semibold rounded-lg hover:bg-gray-100 transition-colors duration-150 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5" 
                  onClick={() => navigate(ROUTES.SIGNIN)}
                >
                  {LABELS.SIGN_IN}
                </button>
                <button 
                  className="px-8 py-4 bg-transparent border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-primary transition-all duration-150 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5" 
                  onClick={() => navigate(ROUTES.REGISTER)}
                >
                  {LABELS.REGISTER}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Features Section */}
        <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">Our Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {FEATURES.map((feature, index) => (
              <div 
                key={index} 
                className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100"
              >
                <div className="text-5xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Home;