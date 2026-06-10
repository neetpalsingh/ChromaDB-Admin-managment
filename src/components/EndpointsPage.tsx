import React from 'react';
import SwaggerUIComponent from './SwaggerUIComponent';

const EndpointsPage: React.FC = () => {

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">API Reference</h1>
        <p className="text-gray-600">Interactive API documentation for your connected Chroma instance</p>
      </div>

      <SwaggerUIComponent className="min-h-screen" />
    </div>
  );
};

export default EndpointsPage;
