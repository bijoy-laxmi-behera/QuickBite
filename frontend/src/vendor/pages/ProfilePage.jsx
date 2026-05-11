// vendor/pages/ProfilePage.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Store, Clock, MapPin, Phone, Mail, CreditCard, Truck } from 'lucide-react';
import VendorProfile from '../components/Profile/VendorProfile';
import BankDetails from '../components/Profile/BankDetails';
import OperatingHours from '../components/Profile/OperatingHours';
import DeliverySettings from '../components/Profile/DeliverySettings';
import Loader from '../components/common/Loader';

const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/vendor/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfile(response.data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Restaurant Profile', icon: Store },
    { id: 'hours', label: 'Operating Hours', icon: Clock },
    { id: 'delivery', label: 'Delivery Settings', icon: Truck },
    { id: 'bank', label: 'Bank Details', icon: CreditCard }
  ];

  if (loading) return <Loader />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Restaurant Settings</h1>
        <p className="text-gray-500 mt-1">Manage your restaurant profile and settings</p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="flex border-b overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-6 py-3 transition ${
                activeTab === tab.id
                  ? 'border-b-2 border-orange-500 text-orange-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <tab.icon size={18} />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="p-6">
          {activeTab === 'profile' && (
            <VendorProfile profile={profile} onUpdate={fetchProfile} />
          )}
          {activeTab === 'hours' && (
            <OperatingHours profile={profile} onUpdate={fetchProfile} />
          )}
          {activeTab === 'delivery' && (
            <DeliverySettings profile={profile} onUpdate={fetchProfile} />
          )}
          {activeTab === 'bank' && (
            <BankDetails profile={profile} onUpdate={fetchProfile} />
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;