import React, { useState, useEffect } from 'react';
import {
  Globe, DollarSign, Clock, Bell, Shield, Mail, Phone,
  MapPin, Save, RefreshCw, AlertCircle, CheckCircle,
  Building, Users, ShoppingBag, Truck
} from 'lucide-react';
import Toast from '../common/Toast';

// Use Vite's import.meta.env instead of process.env
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const GeneralSettings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    // General Settings
    platformName: 'Food Delivery',
    platformLogo: '',
    supportEmail: '',
    supportPhone: '',
    supportAddress: '',
    timezone: 'Asia/Kolkata',
    currency: 'INR',
    language: 'en',
    
    // Business Settings
    maintenanceMode: false,
    allowNewRegistrations: true,
    requireEmailVerification: true,
    requirePhoneVerification: false,
    
    // Order Settings
    autoAcceptOrders: false,
    orderTimeoutMinutes: 15,
    maxOrderDistance: 10,
    estimatedDeliveryTime: 30,
    
    // Notification Settings
    enableEmailNotifications: true,
    enableSMSNotifications: true,
    enablePushNotifications: true,
    adminOrderAlerts: true,
    
    // Security Settings
    sessionTimeout: 60,
    maxLoginAttempts: 5,
    require2FA: false,
  });
  
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const fetchWithAuth = async (endpoint, options = {}) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    if (response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
      throw new Error('Unauthorized');
    }
    if (!response.ok) throw new Error('API call failed');
    return response.json();
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const data = await fetchWithAuth('/admin/settings');
      setSettings(prev => ({ ...prev, ...data }));
    } catch (error) {
      console.error('Error fetching settings:', error);
      showToast('Failed to fetch settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleNumberChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: parseInt(value) || 0,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await fetchWithAuth('/admin/settings', {
        method: 'PUT',
        body: JSON.stringify(settings),
      });
      showToast('Settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      showToast('Failed to save settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-500">Loading settings...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* General Settings Section */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b bg-gray-50">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Globe size={20} className="text-blue-600" />
            General Settings
          </h3>
          <p className="text-sm text-gray-500">Basic platform configuration</p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Platform Name
              </label>
              <input
                type="text"
                name="platformName"
                value={settings.platformName}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Timezone
              </label>
              <select
                name="timezone"
                value={settings.timezone}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="Asia/Kolkata">IST (Asia/Kolkata)</option>
                <option value="America/New_York">EST (America/New_York)</option>
                <option value="Europe/London">GMT (Europe/London)</option>
                <option value="Asia/Dubai">GST (Asia/Dubai)</option>
                <option value="Asia/Singapore">SGT (Asia/Singapore)</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Currency
              </label>
              <select
                name="currency"
                value={settings.currency}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="INR">Indian Rupee (₹)</option>
                <option value="USD">US Dollar ($)</option>
                <option value="EUR">Euro (€)</option>
                <option value="GBP">British Pound (£)</option>
                <option value="AED">Dirham (AED)</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Default Language
              </label>
              <select
                name="language"
                value={settings.language}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="en">English</option>
                <option value="hi">Hindi</option>
                <option value="bn">Bengali</option>
                <option value="te">Telugu</option>
                <option value="mr">Marathi</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Information Section */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b bg-gray-50">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Mail size={20} className="text-blue-600" />
            Contact Information
          </h3>
          <p className="text-sm text-gray-500">Support and contact details</p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Support Email
              </label>
              <input
                type="email"
                name="supportEmail"
                value={settings.supportEmail}
                onChange={handleInputChange}
                placeholder="support@example.com"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Support Phone
              </label>
              <input
                type="tel"
                name="supportPhone"
                value={settings.supportPhone}
                onChange={handleInputChange}
                placeholder="+91 1234567890"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Support Address
              </label>
              <textarea
                name="supportAddress"
                value={settings.supportAddress}
                onChange={handleInputChange}
                rows={2}
                placeholder="Company address for official correspondence"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Business Settings Section */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b bg-gray-50">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Building size={20} className="text-blue-600" />
            Business Settings
          </h3>
          <p className="text-sm text-gray-500">Platform operational settings</p>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-700">Maintenance Mode</p>
              <p className="text-sm text-gray-500">Put the platform under maintenance</p>
            </div>
            <button
              type="button"
              onClick={() => setSettings(prev => ({ ...prev, maintenanceMode: !prev.maintenanceMode }))}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.maintenanceMode ? 'bg-red-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.maintenanceMode ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-700">Allow New Registrations</p>
              <p className="text-sm text-gray-500">Allow new users to register on the platform</p>
            </div>
            <button
              type="button"
              onClick={() => setSettings(prev => ({ ...prev, allowNewRegistrations: !prev.allowNewRegistrations }))}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.allowNewRegistrations ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.allowNewRegistrations ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-700">Require Email Verification</p>
              <p className="text-sm text-gray-500">Users must verify email before ordering</p>
            </div>
            <button
              type="button"
              onClick={() => setSettings(prev => ({ ...prev, requireEmailVerification: !prev.requireEmailVerification }))}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.requireEmailVerification ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.requireEmailVerification ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Order Settings Section */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b bg-gray-50">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <ShoppingBag size={20} className="text-blue-600" />
            Order Settings
          </h3>
          <p className="text-sm text-gray-500">Order processing configuration</p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Order Timeout (minutes)
              </label>
              <input
                type="number"
                name="orderTimeoutMinutes"
                value={settings.orderTimeoutMinutes}
                onChange={handleNumberChange}
                min="5"
                max="60"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">Auto-cancel pending orders after this time</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Maximum Delivery Distance (km)
              </label>
              <input
                type="number"
                name="maxOrderDistance"
                value={settings.maxOrderDistance}
                onChange={handleNumberChange}
                min="1"
                max="50"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estimated Delivery Time (minutes)
              </label>
              <input
                type="number"
                name="estimatedDeliveryTime"
                value={settings.estimatedDeliveryTime}
                onChange={handleNumberChange}
                min="15"
                max="120"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-700">Auto Accept Orders</p>
                <p className="text-sm text-gray-500">Automatically accept new orders</p>
              </div>
              <button
                type="button"
                onClick={() => setSettings(prev => ({ ...prev, autoAcceptOrders: !prev.autoAcceptOrders }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.autoAcceptOrders ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.autoAcceptOrders ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Notification Settings Section */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b bg-gray-50">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Bell size={20} className="text-blue-600" />
            Notification Settings
          </h3>
          <p className="text-sm text-gray-500">Configure notification channels</p>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-700">Email Notifications</p>
              <p className="text-sm text-gray-500">Send order updates via email</p>
            </div>
            <button
              type="button"
              onClick={() => setSettings(prev => ({ ...prev, enableEmailNotifications: !prev.enableEmailNotifications }))}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.enableEmailNotifications ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.enableEmailNotifications ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-700">SMS Notifications</p>
              <p className="text-sm text-gray-500">Send order updates via SMS</p>
            </div>
            <button
              type="button"
              onClick={() => setSettings(prev => ({ ...prev, enableSMSNotifications: !prev.enableSMSNotifications }))}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.enableSMSNotifications ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.enableSMSNotifications ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-700">Push Notifications</p>
              <p className="text-sm text-gray-500">Send real-time push notifications</p>
            </div>
            <button
              type="button"
              onClick={() => setSettings(prev => ({ ...prev, enablePushNotifications: !prev.enablePushNotifications }))}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.enablePushNotifications ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.enablePushNotifications ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-700">Admin Order Alerts</p>
              <p className="text-sm text-gray-500">Notify admins about new orders</p>
            </div>
            <button
              type="button"
              onClick={() => setSettings(prev => ({ ...prev, adminOrderAlerts: !prev.adminOrderAlerts }))}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.adminOrderAlerts ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.adminOrderAlerts ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Security Settings Section */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b bg-gray-50">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Shield size={20} className="text-blue-600" />
            Security Settings
          </h3>
          <p className="text-sm text-gray-500">Platform security configuration</p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Session Timeout (minutes)
              </label>
              <input
                type="number"
                name="sessionTimeout"
                value={settings.sessionTimeout}
                onChange={handleNumberChange}
                min="15"
                max="480"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Login Attempts
              </label>
              <input
                type="number"
                name="maxLoginAttempts"
                value={settings.maxLoginAttempts}
                onChange={handleNumberChange}
                min="3"
                max="10"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg md:col-span-2">
              <div>
                <p className="font-medium text-gray-700">Two-Factor Authentication (2FA)</p>
                <p className="text-sm text-gray-500">Require 2FA for admin accounts</p>
              </div>
              <button
                type="button"
                onClick={() => setSettings(prev => ({ ...prev, require2FA: !prev.require2FA }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.require2FA ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.require2FA ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={fetchSettings}
          className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50"
        >
          <RefreshCw size={18} /> Reset
        </button>
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              Saving...
            </>
          ) : (
            <>
              <Save size={18} />
              Save All Settings
            </>
          )}
        </button>
      </div>

      {/* Maintenance Mode Warning */}
      {settings.maintenanceMode && (
        <div className="flex items-start gap-2 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <AlertCircle size={20} className="text-yellow-600 mt-0.5" />
          <div>
            <p className="font-medium text-yellow-800">Maintenance Mode is Active</p>
            <p className="text-sm text-yellow-700">
              The platform is currently in maintenance mode. Users will see a maintenance page and cannot place orders.
            </p>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast.show && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast({ show: false })} 
        />
      )}
    </form>
  );
};

export default GeneralSettings;