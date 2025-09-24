import React from 'react';
import { Activity, Github, Twitter } from 'lucide-react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and description */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Activity className="h-6 w-6 text-white" />
              </div>
              <span className="font-bold text-xl text-gray-900">
                BlockExplorer
              </span>
            </div>
            <p className="text-gray-600 text-sm max-w-md">
              A comprehensive blockchain explorer for Ethereum network. Track blocks,
              transactions, and addresses with real-time updates and detailed analytics.
            </p>
            <div className="flex space-x-4 mt-6">
              <a
                href="#"
                className="text-gray-400 hover:text-gray-500"
                aria-label="GitHub"
              >
                <Github className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-gray-500"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
              Explore
            </h3>
            <ul className="space-y-2">
              <li>
                <a href="/" className="text-sm text-gray-600 hover:text-blue-600">
                  Latest Blocks
                </a>
              </li>
              <li>
                <a href="/transactions" className="text-sm text-gray-600 hover:text-blue-600">
                  Latest Transactions
                </a>
              </li>
              <li>
                <a href="/blocks" className="text-sm text-gray-600 hover:text-blue-600">
                  All Blocks
                </a>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
              Resources
            </h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-sm text-gray-600 hover:text-blue-600">
                  API Documentation
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-600 hover:text-blue-600">
                  Developer Guide
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-600 hover:text-blue-600">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-600 hover:text-blue-600">
                  Privacy Policy
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-600">
              © {currentYear} BlockExplorer. Built with ❤️ for the blockchain community.
            </p>
            <div className="mt-4 md:mt-0 text-sm text-gray-500">
              Powered by Ethereum
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;