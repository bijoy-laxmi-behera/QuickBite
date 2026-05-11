// delivery/pages/DeliveryProfile.jsx
import React, { useState, useEffect } from 'react';
import { User, Phone, Mail, Truck, CreditCard, MapPin, Edit2, Save, X, Camera, Loader, CheckCircle } from 'lucide-react';
import API from '../../services/axios';
import toast from 'react-hot-toast';

const DeliveryProfile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [uploading, setUploading] = useState(false);
  const [location, setLocation] = useState(null);

  useEffect(() => {
    fetchProfile();
    fetchLocation();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await API.get('/delivery/me');
      setUser(res.data);
      setFormData({
        name: res.data.name || '',
        email: res.data.email || '',
        phone: res.data.phone || '',
        vehicleType: res.data.vehicle?.type || '',
        vehicleNumber: res.data.vehicle?.number || '',
        vehicleModel: res.data.vehicle?.model || '',
        accountNumber: res.data.bank?.accountNumber || '',
        ifsc: res.data.bank?.ifsc || '',
        accountHolderName: res.data.bank?.accountHolderName || ''
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const fetchLocation = async () => {
    try {
      const res = await API.get('/delivery/me/location');
      setLocation(res.data?.location);
    } catch (error) {
      console.error('Error fetching location:', error);
    }
  };

  const updateLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation not supported');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          await API.patch('/delivery/me/location', {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          toast.success('Location updated');
          fetchLocation();
        } catch (error) {
          toast.error('Failed to update location');
        }
      },
      (error) => {
        toast.error('Unable to get location');
      }
    );
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.put('/delivery/me', formData);
      toast.success('Profile updated');
      setIsEditing(false);
      fetchProfile();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const formData = new FormData();
    formData.append('avatar', file);
    
    setUploading(true);
    try {
      const res = await API.put('/delivery/me/avatar', formData);
      setUser(prev => ({ ...prev, avatar: res.data.avatar }));
      toast.success('Avatar updated');
    } catch (error) {
      toast.error('Failed to update avatar');
    } finally {
      setUploading(false);
    }
  };

  if (loading && !user) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader size={48} className="animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">My Profile</h1>
        <div className="flex gap-2">
          <button
            onClick={updateLocation}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 flex items-center gap-2"
          >
            <MapPin size={16} />
            Update Location
          </button>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm hover:bg-orange-600 flex items-center gap-2"
          >
            {isEditing ? <X size={16} /> : <Edit2 size={16} />}
            {isEditing ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>
      </div>

      {/* Avatar Section */}
      <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
        <div className="flex items-center gap-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-gradient-to-r from-orange-400 to-orange-600 flex items-center justify-center overflow-hidden">
              {user?.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <User size={40} className="text-white" />
              )}
            </div>
            <label className="absolute bottom-0 right-0 p-1 bg-white rounded-full shadow-md cursor-pointer">
              <Camera size={16} className="text-gray-600" />
              <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
            </label>
            {uploading && (
              <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                <Loader size={20} className="animate-spin text-white" />
              </div>
            )}
          </div>
          <div>
            <h2 className="text-xl font-semibold">{user?.name}</h2>
            <p className="text-gray-500">{user?.email}</p>
            <div className={`mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${user?.isOnline ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
              <span className={`w-2 h-2 rounded-full ${user?.isOnline ? 'bg-green-500' : 'bg-gray-400'}`} />
              {user?.isOnline ? 'Online' : 'Offline'}
            </div>
          </div>
        </div>
      </div>

      {/* Profile Form */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <form onSubmit={handleUpdate}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Personal Info */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                <User size={18} /> Personal Information
              </h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  disabled={!isEditing}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-gray-50"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  disabled
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  disabled={!isEditing}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-gray-50"
                />
              </div>
            </div>

            {/* Vehicle Info */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                <Truck size={18} /> Vehicle Information
              </h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Type</label>
                <select
                  value={formData.vehicleType}
                  onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })}
                  disabled={!isEditing}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-gray-50"
                >
                  <option value="">Select Type</option>
                  <option value="bike">Bike</option>
                  <option value="scooter">Scooter</option>
                  <option value="car">Car</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Number</label>
                <input
                  type="text"
                  value={formData.vehicleNumber}
                  onChange={(e) => setFormData({ ...formData, vehicleNumber: e.target.value })}
                  disabled={!isEditing}
                  placeholder="e.g., MH 01 AB 1234"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-gray-50"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Model</label>
                <input
                  type="text"
                  value={formData.vehicleModel}
                  onChange={(e) => setFormData({ ...formData, vehicleModel: e.target.value })}
                  disabled={!isEditing}
                  placeholder="e.g., Honda Activa, Yamaha FZ"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-gray-50"
                />
              </div>
            </div>

            {/* Bank Info */}
            <div className="space-y-4 md:col-span-2">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                <CreditCard size={18} /> Bank Details
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Account Holder Name</label>
                  <input
                    type="text"
                    value={formData.accountHolderName}
                    onChange={(e) => setFormData({ ...formData, accountHolderName: e.target.value })}
                    disabled={!isEditing}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-gray-50"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
                  <input
                    type="text"
                    value={formData.accountNumber}
                    onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                    disabled={!isEditing}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-gray-50"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">IFSC Code</label>
                  <input
                    type="text"
                    value={formData.ifsc}
                    onChange={(e) => setFormData({ ...formData, ifsc: e.target.value })}
                    disabled={!isEditing}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-gray-50"
                  />
                </div>
              </div>
            </div>
          </div>

          {isEditing && (
            <div className="flex gap-3 mt-6 pt-6 border-t">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? <Loader size={16} className="animate-spin" /> : <Save size={16} />}
                Save Changes
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  fetchProfile();
                }}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          )}
        </form>
      </div>

      {/* Current Location */}
      {location && (
        <div className="bg-white rounded-xl shadow-sm border p-6 mt-6">
          <h3 className="font-semibold text-gray-800 flex items-center gap-2 mb-3">
            <MapPin size={18} /> Current Location
          </h3>
          <p className="text-sm text-gray-500">
            Lat: {location.coordinates?.[1] || 'Not set'}, 
            Lng: {location.coordinates?.[0] || 'Not set'}
          </p>
          <button
            onClick={updateLocation}
            className="mt-3 text-sm text-orange-500 hover:text-orange-600"
          >
            Update Current Location
          </button>
        </div>
      )}
    </div>
  );
};

export default DeliveryProfile;