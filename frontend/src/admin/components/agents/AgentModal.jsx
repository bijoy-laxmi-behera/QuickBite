import React, { useState, useEffect } from 'react';
import { X, Truck, User, Mail, Phone, MapPin, Car, Key, AlertCircle } from 'lucide-react';

const AgentModal = ({ isOpen, onClose, agent, onSave, onDelete, onToggleStatus }) => {
  const [isEditing, setIsEditing] = useState(!agent);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    address: '',
    vehicleType: 'bike',
    vehicleNumber: '',
    licenseNumber: '',
    isOnline: true,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (agent) {
      setFormData({
        name: agent.name || '',
        email: agent.email || '',
        phone: agent.phone || '',
        password: '',
        address: agent.address || '',
        vehicleType: agent.vehicleType || 'bike',
        vehicleNumber: agent.vehicleNumber || '',
        licenseNumber: agent.licenseNumber || '',
        isOnline: agent.isOnline !== false,
      });
    }
  }, [agent]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.phone) {
      alert('Please fill in all required fields');
      return;
    }
    if (!agent && !formData.password) {
      alert('Password is required for new agents');
      return;
    }
    
    setLoading(true);
    try {
      const submitData = { ...formData };
      if (!formData.password) delete submitData.password;
      await onSave(agent?._id, submitData);
      setIsEditing(false);
      onClose();
    } catch (error) {
      console.error('Error saving agent:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm(`Delete agent "${agent?.name}"?`)) {
      setLoading(true);
      try {
        await onDelete(agent._id);
        onClose();
      } catch (error) {
        console.error('Error deleting agent:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleToggleStatus = async () => {
    setLoading(true);
    try {
      await onToggleStatus(agent._id);
      setFormData(prev => ({ ...prev, isOnline: !prev.isOnline }));
    } catch (error) {
      console.error('Error toggling status:', error);
    } finally {
      setLoading(false);
    }
  };

  const vehicleOptions = [
    { value: 'bike', label: 'Bike', icon: '🏍️' },
    { value: 'scooter', label: 'Scooter', icon: '🛵' },
    { value: 'car', label: 'Car', icon: '🚗' },
    { value: 'bicycle', label: 'Bicycle', icon: '🚲' },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <div>
            <div className="flex items-center gap-2">
              <Truck size={20} className="text-blue-600" />
              <h2 className="text-xl font-bold">
                {agent ? (isEditing ? 'Edit Agent' : 'Agent Details') : 'Add New Agent'}
              </h2>
            </div>
            <p className="text-sm text-gray-500">
              {agent ? 'Manage delivery agent information' : 'Create a new delivery agent profile'}
            </p>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* View Mode */}
          {!isEditing && agent && (
            <div className="space-y-6">
              {/* Agent Header */}
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto">
                  {agent.name?.[0]?.toUpperCase()}
                </div>
                <h3 className="text-lg font-bold mt-2">{agent.name}</h3>
                <div className="flex justify-center gap-2 mt-1">
                  <span className={`px-2 py-1 text-xs rounded-full ${agent.isOnline ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {agent.isOnline ? 'Online' : 'Offline'}
                  </span>
                </div>
              </div>

              {/* Contact Info */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Mail size={16} className="text-gray-400" />
                  <span>{agent.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone size={16} className="text-gray-400" />
                  <span>{agent.phone}</span>
                </div>
                {agent.address && (
                  <div className="flex items-start gap-2 text-sm">
                    <MapPin size={16} className="text-gray-400 mt-0.5" />
                    <span>{agent.address}</span>
                  </div>
                )}
              </div>

              {/* Vehicle Info */}
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500 mb-2">Vehicle Information</p>
                <div className="space-y-1 text-sm">
                  <div>Type: {agent.vehicleType} {vehicleOptions.find(v => v.value === agent.vehicleType)?.icon}</div>
                  {agent.vehicleNumber && <div>Number: {agent.vehicleNumber}</div>}
                  {agent.licenseNumber && <div>License: {agent.licenseNumber}</div>}
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="bg-blue-50 rounded-lg p-2">
                  <p className="text-2xl font-bold text-blue-600">{agent.totalDeliveries || 0}</p>
                  <p className="text-xs text-gray-500">Deliveries</p>
                </div>
                <div className="bg-green-50 rounded-lg p-2">
                  <p className="text-2xl font-bold text-green-600">{agent.rating || '4.5'}</p>
                  <p className="text-xs text-gray-500">Rating</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t">
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Edit Agent
                </button>
                <button
                  onClick={handleToggleStatus}
                  className={`flex-1 px-4 py-2 rounded-lg text-white ${
                    agent.isOnline ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-green-600 hover:bg-green-700'
                  }`}
                >
                  {agent.isOnline ? 'Go Offline' : 'Go Online'}
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Delete Agent
                </button>
              </div>
            </div>
          )}

          {/* Edit/Create Form */}
          {isEditing && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {!agent && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password *
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required={!agent}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vehicle Type
                </label>
                <select
                  name="vehicleType"
                  value={formData.vehicleType}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {vehicleOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.icon} {opt.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vehicle Number
                </label>
                <input
                  type="text"
                  name="vehicleNumber"
                  value={formData.vehicleNumber}
                  onChange={handleInputChange}
                  placeholder="e.g., KA01AB1234"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Driving License Number
                </label>
                <input
                  type="text"
                  name="licenseNumber"
                  value={formData.licenseNumber}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  rows={2}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-700">Online Status</p>
                  <p className="text-xs text-gray-500">Available to accept deliveries</p>
                </div>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, isOnline: !prev.isOnline }))}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    formData.isOnline ? 'bg-green-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      formData.isOnline ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Form Actions */}
              <div className="flex gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => {
                    if (agent) {
                      setIsEditing(false);
                    } else {
                      onClose();
                    }
                  }}
                  className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Saving...' : (agent ? 'Save Changes' : 'Create Agent')}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default AgentModal;