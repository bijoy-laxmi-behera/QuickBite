// vendor/components/Dashboard/OverviewStats.jsx
import React from 'react';
import { TrendingUp, ShoppingBag, DollarSign, Users, Clock } from 'lucide-react';
import StatsCard from '../common/StatsCard';

const OverviewStats = ({ data }) => {
  if (!data) return null;

  const stats = [
    {
      title: 'Total Revenue',
      value: `₹${data.totalRevenue?.toLocaleString() || 0}`,
      change: data.revenueChange || 0,
      icon: DollarSign,
      color: 'bg-green-500'
    },
    {
      title: 'Total Orders',
      value: data.totalOrders || 0,
      change: data.ordersChange || 0,
      icon: ShoppingBag,
      color: 'bg-blue-500'
    },
    {
      title: 'Live Orders',
      value: data.liveOrders || 0,
      icon: Clock,
      color: 'bg-orange-500'
    },
    {
      title: 'Avg. Prep Time',
      value: `${data.avgPrepTime || 0} min`,
      change: data.prepTimeChange || 0,
      icon: TrendingUp,
      color: 'bg-purple-500'
    },
    {
      title: 'Customer Rating',
      value: `${data.rating || 0} ★`,
      change: data.ratingChange || 0,
      icon: Users,
      color: 'bg-yellow-500'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      {stats.map((stat, index) => (
        <StatsCard key={index} {...stat} />
      ))}
    </div>
  );
};

export default OverviewStats;