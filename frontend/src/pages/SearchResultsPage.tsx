import React from 'react';
import { useSearchParams } from 'react-router-dom';

const SearchResultsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Search Results</h1>
      <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 text-center">
        <p className="text-gray-600">Search results for "{query}" - Coming soon!</p>
      </div>
    </div>
  );
};

export default SearchResultsPage;