import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import { searchApi } from '../../services/api';
import { SearchSuggestion } from '../../types';

const SearchBar: React.FC = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (query.length >= 2) {
      if (suggestionTimeoutRef.current) {
        clearTimeout(suggestionTimeoutRef.current);
      }

      suggestionTimeoutRef.current = setTimeout(() => {
        loadSuggestions(query);
      }, 300);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }

    return () => {
      if (suggestionTimeoutRef.current) {
        clearTimeout(suggestionTimeoutRef.current);
      }
    };
  }, [query]);

  const loadSuggestions = async (searchQuery: string) => {
    try {
      const response = await searchApi.getSuggestions(searchQuery);
      setSuggestions(response.data);
      setShowSuggestions(true);
    } catch (error) {
      console.error('Error loading suggestions:', error);
    }
  };

  const handleSearch = async (searchQuery?: string) => {
    const queryToSearch = searchQuery || query;
    if (!queryToSearch.trim()) return;

    setLoading(true);
    setShowSuggestions(false);

    try {
      navigate(`/search?q=${encodeURIComponent(queryToSearch.trim())}`);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    setQuery(suggestion.value);
    setShowSuggestions(false);

    // Navigate based on suggestion type
    switch (suggestion.type) {
      case 'block':
        navigate(`/block/${suggestion.value}`);
        break;
      case 'transaction':
        navigate(`/tx/${suggestion.value}`);
        break;
      case 'address':
        navigate(`/address/${suggestion.value}`);
        break;
      default:
        handleSearch(suggestion.value);
    }
  };

  const clearSearch = () => {
    setQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'block':
        return '📦';
      case 'transaction':
        return '⚡';
      case 'address':
        return '👤';
      default:
        return '🔍';
    }
  };

  return (
    <div className="relative">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          onFocus={() => {
            if (suggestions.length > 0) {
              setShowSuggestions(true);
            }
          }}
          className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Search by address, transaction hash, or block number..."
        />

        {query && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <button
              onClick={clearSearch}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => handleSuggestionClick(suggestion)}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 focus:outline-none focus:bg-gray-50"
            >
              <div className="flex items-center space-x-3">
                <span className="text-xl">{getSuggestionIcon(suggestion.type)}</span>
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">
                    {suggestion.display}
                  </div>
                  <div className="text-xs text-gray-500">
                    {suggestion.subtitle}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 bg-white bg-opacity-50 flex items-center justify-center rounded-lg">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        </div>
      )}
    </div>
  );
};

export default SearchBar;