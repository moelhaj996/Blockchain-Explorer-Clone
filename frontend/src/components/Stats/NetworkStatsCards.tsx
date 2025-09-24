import React from 'react';
import { Activity, Clock, Users, Zap } from 'lucide-react';
import { NetworkStats } from '../../types';

interface NetworkStatsCardsProps {
  stats: NetworkStats;
}

const NetworkStatsCards: React.FC<NetworkStatsCardsProps> = ({ stats }) => {
  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toLocaleString();
  };

  const statsData = [
    {
      title: 'Latest Block',
      value: formatNumber(stats.latestBlock),
      icon: Activity,
      iconColor: 'text-blue-600',
      bgColor: 'bg-blue-100',
      change: '+1',
      changeColor: 'text-green-600'
    },
    {
      title: 'Average Block Time',
      value: `${stats.averageBlockTime}s`,
      icon: Clock,
      iconColor: 'text-green-600',
      bgColor: 'bg-green-100',
      change: null,
      changeColor: ''
    },
    {
      title: 'Daily Transactions',
      value: formatNumber(stats.dailyTransactions),
      icon: Zap,
      iconColor: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
      change: null,
      changeColor: ''
    },
    {
      title: 'Total Blocks',
      value: formatNumber(stats.totalBlocks),
      icon: Users,
      iconColor: 'text-purple-600',
      bgColor: 'bg-purple-100',
      change: null,
      changeColor: ''
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {statsData.map((stat, index) => (
        <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-2">
                {stat.title}
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {stat.value}
              </p>
              {stat.change && (
                <p className={`text-xs ${stat.changeColor} mt-1`}>
                  {stat.change} from last block
                </p>
              )}
            </div>
            <div className={`p-3 rounded-full ${stat.bgColor}`}>
              <stat.icon className={`h-6 w-6 ${stat.iconColor}`} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default NetworkStatsCards;