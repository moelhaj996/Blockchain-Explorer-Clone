import React from 'react';
import { useParams } from 'react-router-dom';

const BlockDetailPage: React.FC = () => {
  const { identifier } = useParams<{ identifier: string }>();

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Block #{identifier}</h1>
      <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 text-center">
        <p className="text-gray-600">Block detail page for block {identifier} - Coming soon!</p>
      </div>
    </div>
  );
};

export default BlockDetailPage;