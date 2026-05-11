import React, { useState, useEffect } from 'react';
import {
  Truck, User, Phone, Mail, MapPin, Star, Plus, Edit, Trash2,
  Power, Eye, Search, MoreVertical, CheckCircle, XCircle,
  Clock, Navigation, Award, TrendingUp
} from 'lucide-react';
import Loader from '../components/common/Loader';
import StatusBadge from '../components/common/StatusBadge';
import ConfirmModal from '../components/common/ConfirmModal';
import Toast from '../components/common/Toast';

const AgentsPage = () => {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showActions, setShowActions] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [editingAgent, setEditingAgent] = useState(null);
  const [agentDeliveries, setAgentDeliveries] = useState([]);
  const [loadingDeliveries, setLoadingDeliveries] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    vehicleType: 'bike',
    vehicleNumber: '',
    address: '',
    isOnline: true,
  });

  const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

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
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    setLoading(true);
    try {
      const data = await fetchWithAuth('/admin/agents');
      setAgents(data.agents || []);
    } catch (error) {
      console.error('Error fetching agents:', error);
      showToast('Failed to fetch agents', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchAgentDeliveries = async (agentId) => {
    setLoadingDeliveries(true);
    try {
      const data = await fetchWithAuth(`/admin/agents/${agentId}/deliveries`);
      setAgentDeliveries(data.orders || []);
    } catch (error) {
      console.error('Error fetching deliveries:', error);
      showToast('Failed to fetch delivery history', 'error');
    } finally {
      setLoadingDeliveries(false);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingAgent) {
        const { password, ...updateData } = formData;
        await fetchWithAuth(`/admin/agents/${editingAgent._id}`, {
          method: 'PUT',
          body: JSON.stringify(updateData),
        });
        showToast('Agent updated successfully');
      } else {
        if (!formData.password) {
          showToast('Password is required', 'error');
          return;
        }
        await fetchWithAuth('/admin/agents', {
          method: 'POST',
          body: JSON.stringify(formData),
        });
        showToast('Agent created successfully');
      }
      setShowModal(false);
      setEditingAgent(null);
      resetForm();
      fetchAgents();
    } catch (error) {
      showToast('Failed to save agent', 'error');
    }
  };

  const handleToggleStatus = async (agent) => {
    try {
      await fetchWithAuth(`/admin/agents/${agent._id}/status`, { method: 'PATCH' });
      showToast(`Agent ${agent.isOnline ? 'taken offline' : 'brought online'} successfully`);
      fetchAgents();
    } catch (error) {
      showToast('Failed to update status', 'error');
    }
    setShowActions(null);
  };

  const handleDeleteAgent = async (agent) => {
    try {
      await fetchWithAuth(`/admin/agents/${agent._id}`, { method: 'DELETE' });
      showToast('Agent deleted successfully');
      fetchAgents();
    } catch (error) {
      showToast('Failed to delete agent', 'error');
    }
    setShowConfirmModal(false);
    setShowActions(null);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      password: '',
      vehicleType: 'bike',
      vehicleNumber: '',
      address: '',
      isOnline: true,
    });
  };

  const handleEdit = (agent) => {
    setEditingAgent(agent);
    setFormData({
      name: agent.name || '',
      email: agent.email || '',
      phone: agent.phone || '',
      password: '',
      vehicleType: agent.vehicleType || 'bike',
      vehicleNumber: agent.vehicleNumber || '',
      address: agent.address || '',
      isOnline: agent.isOnline !== false,
    });
    setShowModal(true);
  };

  const handleViewDetails = async (agent) => {
    setSelectedAgent(agent);
    await fetchAgentDeliveries(agent._id);
    setShowDetailModal(true);
    setShowActions(null);
  };

  const filteredAgents = agents.filter(agent =>
    agent.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    agent.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    agent.phone?.includes(searchTerm)
  );

  const onlineAgents = agents.filter(a => a.isOnline).length;
  const offlineAgents = agents.filter(a => !a.isOnline).length;
  const totalDeliveries = agents.reduce((sum, a) => sum + (a.totalDeliveries || 0), 0);

  if (loading) return <Loader />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Delivery Agents</h1>
          <p className="text-gray-500">Manage your delivery workforce</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setEditingAgent(null);
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus size={18} /> Add Agent
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Truck size={20} className="text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Agents</p>
              <p className="text-2xl font-bold">{agents.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle size={20} className="text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Online Now</p>
              <p className="text-2xl font-bold text-green-600">{onlineAgents}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <XCircle size={20} className="text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Offline</p>
              <p className="text-2xl font-bold text-red-600">{offlineAgents}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Award size={20} className="text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Deliveries</p>
              <p className="text-2xl font-bold">{totalDeliveries}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Search agents by name, email or phone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Agents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAgents.map((agent) => (
          <div key={agent._id} className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition-shadow">
            <div className="p-4 border-b bg-gradient-to-r from-gray-50 to-white">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-lg">
                    {agent.name?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold">{agent.name}</h3>
                    <div className="flex items-center gap-2 text-sm">
                      <StatusBadge status={agent.isOnline ? 'online' : 'offline'} />
                      {agent.rating && (
                        <div className="flex items-center gap-1">
                          <Star size={12} className="text-yellow-500 fill-yellow-500" />
                          <span className="text-xs">{agent.rating}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="relative">
                  <button
                    onClick={() => setShowActions(showActions === agent._id ? null : agent._id)}
                    className="p-1 rounded-lg hover:bg-gray-100"
                  >
                    <MoreVertical size={18} />
                  </button>
                  {showActions === agent._id && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border z-10">
                      <button
                        onClick={() => handleEdit(agent)}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-50"
                      >
                        <Edit size={16} /> Edit Agent
                      </button>
                      <button
                        onClick={() => handleViewDetails(agent)}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-50"
                      >
                        <Eye size={16} /> View Details
                      </button>
                      <button
                        onClick={() => handleToggleStatus(agent)}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-50"
                      >
                        <Power size={16} /> {agent.isOnline ? 'Go Offline' : 'Go Online'}
                      </button>
                      <hr />
                      <button
                        onClick={() => {
                          setSelectedAgent(agent);
                          setConfirmAction(() => () => handleDeleteAgent(agent));
                          setShowConfirmModal(true);
                          setShowActions(null);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-gray-50"
                      >
                        <Trash2 size={16} /> Delete Agent
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="p-4 space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Phone size={14} className="text-gray-400" />
                <span>{agent.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Mail size={14} className="text-gray-400" />
                <span className="truncate">{agent.email}</span>
              </div>
              {agent.vehicleType && (
                <div className="flex items-center gap-2 text-sm">
                  <Truck size={14} className="text-gray-400" />
                  <span className="capitalize">{agent.vehicleType}</span>
                  {agent.vehicleNumber && <span className="text-gray-400">• {agent.vehicleNumber}</span>}
                </div>
              )}
              {agent.totalDeliveries !== undefined && (
                <div className="flex items-center gap-2 text-sm pt-2 border-t mt-2">
                  <Navigation size={14} className="text-gray-400" />
                  <span>{agent.totalDeliveries} deliveries completed</span>
                  {agent.currentOrder && (
                    <span className="ml-auto text-xs text-blue-600 flex items-center gap-1">
                      <Clock size={12} /> On Delivery
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}

        {filteredAgents.length === 0 && (
          <div className="col-span-3 text-center py-12 bg-white rounded-lg">
            <Truck size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">No delivery agents found</p>
            <button
              onClick={() => setShowModal(true)}
              className="mt-2 text-blue-600 hover:underline"
            >
              Add your first agent
            </button>
          </div>
        )}
      </div>

      {/* Create/Edit Agent Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b sticky top-0 bg-white">
              <h2 className="text-xl font-bold">{editingAgent ? 'Edit Agent' : 'Add New Agent'}</h2>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Full Name *</label>
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
                <label className="block text-sm font-medium mb-1">Email *</label>
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
                <label className="block text-sm font-medium mb-1">Phone *</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {!editingAgent && (
                <div>
                  <label className="block text-sm font-medium mb-1">Password *</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required={!editingAgent}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-1">Vehicle Type</label>
                <select
                  name="vehicleType"
                  value={formData.vehicleType}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="bike">Bike</option>
                  <option value="scooter">Scooter</option>
                  <option value="car">Car</option>
                  <option value="bicycle">Bicycle</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Vehicle Number</label>
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
                <label className="block text-sm font-medium mb-1">Address</label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  rows={2}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="isOnline"
                  checked={formData.isOnline}
                  onChange={handleInputChange}
                  className="w-4 h-4"
                />
                <label className="text-sm">Available for deliveries (Online)</label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editingAgent ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Agent Detail Modal with Delivery History */}
      {showDetailModal && selectedAgent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b sticky top-0 bg-white flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold">Agent Details</h2>
                <p className="text-sm text-gray-500">Delivery history and performance</p>
              </div>
              <button onClick={() => setShowDetailModal(false)} className="p-1 hover:bg-gray-100 rounded">
                ✕
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Agent Info */}
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-2xl">
                  {selectedAgent.name?.[0]?.toUpperCase()}
                </div>
                <div>
                  <h3 className="text-lg font-bold">{selectedAgent.name}</h3>
                  <div className="flex items-center gap-2 text-sm">
                    <Mail size={14} /> {selectedAgent.email}
                    <span className="text-gray-300">|</span>
                    <Phone size={14} /> {selectedAgent.phone}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <StatusBadge status={selectedAgent.isOnline ? 'online' : 'offline'} />
                    {selectedAgent.rating && (
                      <div className="flex items-center gap-1">
                        <Star size={14} className="text-yellow-500 fill-yellow-500" />
                        <span>{selectedAgent.rating} / 5</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">{selectedAgent.totalDeliveries || 0}</p>
                  <p className="text-xs text-gray-500">Total Deliveries</p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">{selectedAgent.onTimeDeliveries || 0}</p>
                  <p className="text-xs text-gray-500">On-Time</p>
                </div>
                <div className="p-3 bg-yellow-50 rounded-lg">
                  <p className="text-2xl font-bold text-yellow-600">{selectedAgent.earning || 0}</p>
                  <p className="text-xs text-gray-500">Total Earnings</p>
                </div>
              </div>

              {/* Vehicle Info */}
              {selectedAgent.vehicleType && (
                <div className="p-3 border rounded-lg">
                  <p className="text-sm font-medium mb-1">Vehicle Information</p>
                  <div className="flex gap-4 text-sm">
                    <span className="capitalize">Type: {selectedAgent.vehicleType}</span>
                    {selectedAgent.vehicleNumber && <span>Number: {selectedAgent.vehicleNumber}</span>}
                  </div>
                </div>
              )}

              {/* Delivery History */}
              <div>
                <h3 className="font-semibold mb-3">Recent Deliveries</h3>
                {loadingDeliveries ? (
                  <Loader />
                ) : agentDeliveries.length === 0 ? (
                  <p className="text-center text-gray-500 py-4">No delivery history found</p>
                ) : (
                  <div className="space-y-2">
                    {agentDeliveries.slice(0, 10).map((order) => (
                      <div key={order._id} className="flex justify-between items-center p-3 border rounded-lg">
                        <div>
                          <p className="text-sm font-medium">Order #{order._id?.slice(-8)}</p>
                          <p className="text-xs text-gray-500">{order.user?.name}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">₹{order.totalAmount}</p>
                          <p className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={confirmAction}
        title="Delete Agent"
        message={`Are you sure you want to delete ${selectedAgent?.name}? This action cannot be undone.`}
      />

      {/* Toast */}
      {toast.show && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast({ show: false })} 
        />
      )}
    </div>
  );
};

export default AgentsPage;