// vendor/components/Analytics/PayoutHistory.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Wallet, CheckCircle, Clock, AlertCircle } from 'lucide-react';

const PayoutHistory = () => {
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPayouts();
  }, []);

  const fetchPayouts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/vendor/payout-history', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPayouts(response.data);
    } catch (error) {
      console.error('Error fetching payouts:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'completed':
        return <CheckCircle size={16} className="text-green-500" />;
      case 'pending':
        return <Clock size={16} className="text-yellow-500" />;
      default:
        return <AlertCircle size={16} className="text-gray-500" />;
    }
  };

  if (loading) {
    return <div className="h-64 flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="p-5 border-b">
        <h3 className="text-lg font-semibold text-gray-800">Recent Payouts</h3>
      </div>
      <div className="divide-y">
        {payouts.length === 0 ? (
          <div className="p-12 text-center">
            <Wallet className="mx-auto h-12 w-12 text-gray-300" />
            <p className="text-gray-500 mt-2">No payouts yet</p>
          </div>
        ) : (
          payouts.slice(0, 5).map((payout) => (
            <div key={payout._id} className="p-4 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-800">₹{payout.amount.toLocaleString()}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(payout.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(payout.status)}
                  <span className="text-sm capitalize">{payout.status}</span>
                </div>
              </div>
              {payout.period && (
                <p className="text-xs text-gray-400 mt-2">
                  Period: {new Date(payout.period.start).toLocaleDateString()} - {new Date(payout.period.end).toLocaleDateString()}
                </p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default PayoutHistory;