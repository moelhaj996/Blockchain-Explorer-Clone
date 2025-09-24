import React from 'react';
import { useParams } from 'react-router-dom';

const TransactionDetailPage: React.FC = () => {
  const { hash } = useParams<{ hash: string }>();

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Transaction Details</h1>
      <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 text-center">
        <p className="text-gray-600">Transaction detail page for {hash?.substring(0, 16)}... - Coming soon!</p>
      </div>
    </div>
  );
};

export default TransactionDetailPage;