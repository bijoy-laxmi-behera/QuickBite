import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Users, Store, ShoppingBag, Truck, Ticket, 
  CreditCard, BarChart3, Settings, UserCircle, PackageSearch,
  Menu, X, Bell, LogOut
} from 'lucide-react';

// Import all components
import OverviewStats from './components/dashboard/OverviewStats';
import RevenueChart from './components/dashboard/RevenueChart';
import OrdersByStatus from './components/dashboard/OrdersByStatus';
import PeakHoursChart from './components/dashboard/PeakHoursChart';
import UserTable from './components/users/UserTable';
import UserModal from './components/users/UserModal';
import RestaurantTable from './components/restaurants/RestaurantTable';
import RestaurantModal from './components/restaurants/RestaurantModal';
import OrderTable from './components/orders/OrderTable';
import OrderDetailModal from './components/orders/OrderDetailModal';
import LiveOrdersList from './components/orders/LiveOrdersList';
import AgentTable from './components/agents/AgentTable';
import AgentModal from './components/agents/AgentModal';
import CouponTable from './components/coupons/CouponTable';
import CouponModal from './components/coupons/CouponModal';
import PaymentSummary from './components/payments/PaymentSummary';
import PaymentTable from './components/payments/PaymentTable';
import GeneralSettings from './components/settings/GeneralSettings';
import Toast from './components/common/Toast';
import ConfirmModal from './components/common/ConfirmModal';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const AdminLayout = () => {
  // UI State
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showUserModal, setShowUserModal] = useState(false);
  const [showRestaurantModal, setShowRestaurantModal] = useState(false);
  const [showAgentModal, setShowAgentModal] = useState(false);
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  
  // Data State
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [orders, setOrders] = useState([]);
  const [agents, setAgents] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [payments, setPayments] = useState([]);
  const [overview, setOverview] = useState(null);
  const [revenueData, setRevenueData] = useState([]);
  const [orderStats, setOrderStats] = useState([]);
  const [peakHours, setPeakHours] = useState([]);
  const [topRestaurants, setTopRestaurants] = useState([]);
  const [paymentSummary, setPaymentSummary] = useState(null);
  
  // Pagination State
  const [userPage, setUserPage] = useState(1);
  const [restaurantPage, setRestaurantPage] = useState(1);
  const [orderPage, setOrderPage] = useState(1);
  const [agentPage, setAgentPage] = useState(1);
  const [couponPage, setCouponPage] = useState(1);
  const [paymentPage, setPaymentPage] = useState(1);
  
  // Filter State
  const [orderStatusFilter, setOrderStatusFilter] = useState('');
  
  // Auto-refresh for live orders
  const [autoRefresh, setAutoRefresh] = useState(true);
  
  // Admin info
  const [admin, setAdmin] = useState(null);

  // Fetch with auth helper
  const fetchWithAuth = async (endpoint, options = {}) => {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/login';
      throw new Error('No token found');
    }
    
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
      localStorage.removeItem('user');
      window.location.href = '/login';
      throw new Error('Unauthorized');
    }
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API call failed: ${response.status}`);
    }
    
    return response.json();
  };

  // Dashboard Data Fetching
  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [overviewRes, revenueRes, orderStatsRes, peakHoursRes, topRestaurantsRes] = await Promise.all([
        fetchWithAuth('/admin/analytics/overview'),
        fetchWithAuth('/admin/analytics/revenue'),
        fetchWithAuth('/admin/analytics/orders'),
        fetchWithAuth('/admin/analytics/peak-hours'),
        fetchWithAuth('/admin/analytics/restaurants'),
      ]);
      setOverview(overviewRes);
      setRevenueData(revenueRes || []);
      setOrderStats(orderStatsRes || []);
      setPeakHours(peakHoursRes || []);
      setTopRestaurants(topRestaurantsRes || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      showToast('Failed to fetch dashboard data', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Users CRUD
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await fetchWithAuth(`/admin/users?page=${userPage}&limit=10`);
      setUsers(data.users || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      showToast('Failed to fetch users', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveUser = async (id, userData) => {
    try {
      if (id) {
        await fetchWithAuth(`/admin/users/${id}`, { method: 'PUT', body: JSON.stringify(userData) });
        showToast('User updated successfully');
      } else {
        await fetchWithAuth('/admin/register', { method: 'POST', body: JSON.stringify(userData) });
        showToast('User created successfully');
      }
      fetchUsers();
    } catch (error) {
      showToast('Failed to save user', 'error');
      throw error;
    }
  };

  const handleBlockUser = async (id) => {
    try {
      await fetchWithAuth(`/admin/users/${id}/block`, { method: 'PUT' });
      showToast('User blocked successfully');
      fetchUsers();
    } catch (error) {
      showToast('Failed to block user', 'error');
    }
  };

  const handleUnblockUser = async (id) => {
    try {
      await fetchWithAuth(`/admin/users/${id}/unblock`, { method: 'PUT' });
      showToast('User unblocked successfully');
      fetchUsers();
    } catch (error) {
      showToast('Failed to unblock user', 'error');
    }
  };

  const handleDeleteUser = async (id) => {
    try {
      await fetchWithAuth(`/admin/users/${id}`, { method: 'DELETE' });
      showToast('User deleted successfully');
      fetchUsers();
    } catch (error) {
      showToast('Failed to delete user', 'error');
    }
  };

  // Restaurants CRUD
  const fetchRestaurants = async () => {
    setLoading(true);
    try {
      const data = await fetchWithAuth('/admin/restaurants');
      setRestaurants(data || []);
    } catch (error) {
      console.error('Error fetching restaurants:', error);
      showToast('Failed to fetch restaurants', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveRestaurant = async (id, restaurantData) => {
    try {
      if (id) {
        await fetchWithAuth(`/admin/restaurants/${id}`, { method: 'PUT', body: JSON.stringify(restaurantData) });
        showToast('Restaurant updated successfully');
      } else {
        await fetchWithAuth('/admin/restaurants', { method: 'POST', body: JSON.stringify(restaurantData) });
        showToast('Restaurant created successfully');
      }
      fetchRestaurants();
    } catch (error) {
      showToast('Failed to save restaurant', 'error');
      throw error;
    }
  };

  const handleToggleRestaurantStatus = async (id) => {
    try {
      await fetchWithAuth(`/admin/restaurants/${id}/status`, { method: 'PATCH' });
      showToast('Restaurant status updated');
      fetchRestaurants();
    } catch (error) {
      showToast('Failed to update status', 'error');
    }
  };

  const handleDeleteRestaurant = async (id) => {
    try {
      await fetchWithAuth(`/admin/restaurants/${id}`, { method: 'DELETE' });
      showToast('Restaurant deleted successfully');
      fetchRestaurants();
    } catch (error) {
      showToast('Failed to delete restaurant', 'error');
    }
  };

  // Orders CRUD
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (orderStatusFilter) params.append('status', orderStatusFilter);
      const data = await fetchWithAuth(`/admin/orders?${params.toString()}`);
      setOrders(data.orders || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      showToast('Failed to fetch orders', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchLiveOrders = async () => {
    setLoading(true);
    try {
      const data = await fetchWithAuth('/admin/orders/live');
      setOrders(data.orders || []);
    } catch (error) {
      console.error('Error fetching live orders:', error);
      showToast('Failed to fetch live orders', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateOrderStatus = async (id, status) => {
    try {
      await fetchWithAuth(`/admin/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });
      showToast(`Order status updated to ${status}`);
      if (activeTab === 'live-orders') {
        fetchLiveOrders();
      } else {
        fetchOrders();
      }
    } catch (error) {
      showToast('Failed to update status', 'error');
    }
  };

  // Agents CRUD
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

  const handleSaveAgent = async (id, agentData) => {
    try {
      if (id) {
        await fetchWithAuth(`/admin/agents/${id}`, { method: 'PUT', body: JSON.stringify(agentData) });
        showToast('Agent updated successfully');
      } else {
        await fetchWithAuth('/admin/agents', { method: 'POST', body: JSON.stringify(agentData) });
        showToast('Agent created successfully');
      }
      fetchAgents();
    } catch (error) {
      showToast('Failed to save agent', 'error');
      throw error;
    }
  };

  const handleToggleAgentStatus = async (id) => {
    try {
      await fetchWithAuth(`/admin/agents/${id}/status`, { method: 'PATCH' });
      showToast('Agent status updated');
      fetchAgents();
    } catch (error) {
      showToast('Failed to update status', 'error');
    }
  };

  const handleDeleteAgent = async (id) => {
    try {
      await fetchWithAuth(`/admin/agents/${id}`, { method: 'DELETE' });
      showToast('Agent deleted successfully');
      fetchAgents();
    } catch (error) {
      showToast('Failed to delete agent', 'error');
    }
  };

  // Coupons CRUD
  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const data = await fetchWithAuth('/admin/coupons');
      setCoupons(data.coupons || []);
    } catch (error) {
      console.error('Error fetching coupons:', error);
      showToast('Failed to fetch coupons', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCoupon = async (id, couponData) => {
    try {
      if (id) {
        await fetchWithAuth(`/admin/coupons/${id}`, { method: 'PUT', body: JSON.stringify(couponData) });
        showToast('Coupon updated successfully');
      } else {
        await fetchWithAuth('/admin/coupons', { method: 'POST', body: JSON.stringify(couponData) });
        showToast('Coupon created successfully');
      }
      fetchCoupons();
    } catch (error) {
      showToast('Failed to save coupon', 'error');
      throw error;
    }
  };

  const handleToggleCouponStatus = async (id) => {
    try {
      await fetchWithAuth(`/admin/coupons/${id}/toggle`, { method: 'PATCH' });
      showToast('Coupon status updated');
      fetchCoupons();
    } catch (error) {
      showToast('Failed to update status', 'error');
    }
  };

  const handleDeleteCoupon = async (id) => {
    try {
      await fetchWithAuth(`/admin/coupons/${id}`, { method: 'DELETE' });
      showToast('Coupon deleted successfully');
      fetchCoupons();
    } catch (error) {
      showToast('Failed to delete coupon', 'error');
    }
  };

  // Payments
  const fetchPayments = async () => {
    setLoading(true);
    try {
      const data = await fetchWithAuth('/admin/payments');
      setPayments(data.payments || []);
    } catch (error) {
      console.error('Error fetching payments:', error);
      showToast('Failed to fetch payments', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchPaymentSummary = async () => {
    try {
      const data = await fetchWithAuth('/admin/payments/summary');
      setPaymentSummary(data);
    } catch (error) {
      console.error('Error fetching payment summary:', error);
    }
  };

  const handleRefundPayment = async (id) => {
    try {
      await fetchWithAuth(`/admin/payments/${id}/refund`, { method: 'POST' });
      showToast('Refund processed successfully');
      fetchPayments();
      fetchPaymentSummary();
    } catch (error) {
      showToast('Failed to process refund', 'error');
    }
  };

  // Analytics
  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const [overviewRes, revenueRes, orderStatsRes, peakHoursRes, topRestaurantsRes] = await Promise.all([
        fetchWithAuth('/admin/analytics/overview'),
        fetchWithAuth('/admin/analytics/revenue'),
        fetchWithAuth('/admin/analytics/orders'),
        fetchWithAuth('/admin/analytics/peak-hours'),
        fetchWithAuth('/admin/analytics/restaurants'),
      ]);
      setOverview(overviewRes);
      setRevenueData(revenueRes || []);
      setOrderStats(orderStatsRes || []);
      setPeakHours(peakHoursRes || []);
      setTopRestaurants(topRestaurantsRes || []);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      showToast('Failed to fetch analytics', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Settings
  const fetchSettings = async () => {
    setLoading(true);
    try {
      await fetchWithAuth('/admin/settings');
      // Settings are handled by GeneralSettings component itself
    } catch (error) {
      console.error('Error fetching settings:', error);
      showToast('Failed to fetch settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Profile
  const fetchProfile = async () => {
    setLoading(true);
    try {
      const data = await fetchWithAuth('/admin/me');
      setAdmin(data.admin || data);
    } catch (error) {
      console.error('Error fetching profile:', error);
      showToast('Failed to fetch profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Helper Functions
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  // Auto-refresh for live orders
  useEffect(() => {
    if (activeTab === 'live-orders' && autoRefresh) {
      const interval = setInterval(fetchLiveOrders, 10000);
      return () => clearInterval(interval);
    }
  }, [activeTab, autoRefresh]);

  // Initial data loading based on active tab
  useEffect(() => {
    const loadData = async () => {
      switch (activeTab) {
        case 'dashboard':
          await fetchDashboardData();
          break;
        case 'users':
          await fetchUsers();
          break;
        case 'restaurants':
          await fetchRestaurants();
          break;
        case 'orders':
          await fetchOrders();
          break;
        case 'live-orders':
          await fetchLiveOrders();
          break;
        case 'agents':
          await fetchAgents();
          break;
        case 'coupons':
          await fetchCoupons();
          break;
        case 'payments':
          await fetchPayments();
          await fetchPaymentSummary();
          break;
        case 'analytics':
          await fetchAnalytics();
          break;
        case 'settings':
          await fetchSettings();
          break;
        case 'profile':
          await fetchProfile();
          break;
      }
    };
    
    loadData();
  }, [activeTab, userPage, restaurantPage, orderPage, agentPage, couponPage, paymentPage, orderStatusFilter]);

  // Menu items configuration
  const menuItems = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { id: 'users', name: 'Users', icon: Users },
    { id: 'restaurants', name: 'Restaurants', icon: Store },
    { id: 'orders', name: 'Orders', icon: ShoppingBag },
    { id: 'live-orders', name: 'Live Orders', icon: PackageSearch },
    { id: 'agents', name: 'Delivery Agents', icon: Truck },
    { id: 'coupons', name: 'Coupons', icon: Ticket },
    { id: 'payments', name: 'Payments', icon: CreditCard },
    { id: 'analytics', name: 'Analytics', icon: BarChart3 },
    { id: 'settings', name: 'Settings', icon: Settings },
    { id: 'profile', name: 'Profile', icon: UserCircle },
  ];

  // Loading component
  const LoadingSpinner = () => (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-500">Loading...</p>
      </div>
    </div>
  );

  // Render content based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
              <p className="text-gray-500">Welcome to your admin dashboard</p>
            </div>
            <OverviewStats data={overview} loading={loading} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <RevenueChart data={revenueData} loading={loading} />
              <OrdersByStatus 
                data={orderStats} 
                loading={loading} 
                onStatusClick={(status) => {
                  setOrderStatusFilter(status);
                  setActiveTab('orders');
                }}
              />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <PeakHoursChart data={peakHours} loading={loading} />
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4">Top Restaurants</h3>
                {loading ? (
                  <div className="animate-pulse space-y-2">
                    {[1,2,3,4,5].map(i => <div key={i} className="h-8 bg-gray-200 rounded"></div>)}
                  </div>
                ) : (
                  topRestaurants.slice(0, 5).map((rest, idx) => (
                    <div key={idx} className="flex justify-between items-center py-2 border-b last:border-0">
                      <span>{idx + 1}. {rest.restaurant?.name || 'Restaurant'}</span>
                      <span className="font-bold">₹{rest.revenue?.toLocaleString()}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        );
        
      case 'users':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Users Management</h1>
                <p className="text-gray-500">Manage all registered users</p>
              </div>
              <button
                onClick={() => {
                  setSelectedItem(null);
                  setShowUserModal(true);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Add User
              </button>
            </div>
            <UserTable
              users={users}
              loading={loading}
              onViewUser={(user) => {
                setSelectedItem(user);
                setShowUserModal(true);
              }}
              onEditUser={(user) => {
                setSelectedItem(user);
                setShowUserModal(true);
              }}
              onBlockUser={handleBlockUser}
              onUnblockUser={handleUnblockUser}
              onDeleteUser={handleDeleteUser}
              totalUsers={users.length}
              page={userPage}
              onPageChange={setUserPage}
            />
            <UserModal
              isOpen={showUserModal}
              onClose={() => {
                setShowUserModal(false);
                setSelectedItem(null);
              }}
              user={selectedItem}
              onSave={handleSaveUser}
              onBlock={handleBlockUser}
              onUnblock={handleUnblockUser}
              onDelete={handleDeleteUser}
            />
          </div>
        );
        
      case 'restaurants':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Restaurants Management</h1>
                <p className="text-gray-500">Manage all partner restaurants</p>
              </div>
              <button
                onClick={() => {
                  setSelectedItem(null);
                  setShowRestaurantModal(true);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Add Restaurant
              </button>
            </div>
            <RestaurantTable
              restaurants={restaurants}
              loading={loading}
              onViewRestaurant={(restaurant) => {
                setSelectedItem(restaurant);
                setShowRestaurantModal(true);
              }}
              onEditRestaurant={(restaurant) => {
                setSelectedItem(restaurant);
                setShowRestaurantModal(true);
              }}
              onToggleStatus={handleToggleRestaurantStatus}
              onDeleteRestaurant={handleDeleteRestaurant}
              onViewMenu={() => {}}
              onViewOrders={() => {}}
              totalRestaurants={restaurants.length}
              page={restaurantPage}
              onPageChange={setRestaurantPage}
            />
            <RestaurantModal
              isOpen={showRestaurantModal}
              onClose={() => {
                setShowRestaurantModal(false);
                setSelectedItem(null);
              }}
              restaurant={selectedItem}
              onSave={handleSaveRestaurant}
              onDelete={handleDeleteRestaurant}
              onToggleStatus={handleToggleRestaurantStatus}
            />
          </div>
        );
        
      case 'orders':
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Orders Management</h1>
              <p className="text-gray-500">View and manage all customer orders</p>
            </div>
            <div className="flex gap-4">
              <select
                value={orderStatusFilter}
                onChange={(e) => setOrderStatusFilter(e.target.value)}
                className="px-4 py-2 border rounded-lg"
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="accepted">Accepted</option>
                <option value="preparing">Preparing</option>
                <option value="out_for_delivery">Out for Delivery</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <button
                onClick={() => setOrderStatusFilter('')}
                className="px-4 py-2 text-gray-600 border rounded-lg hover:bg-gray-50"
              >
                Clear Filter
              </button>
            </div>
            <OrderTable
              orders={orders}
              loading={loading}
              onViewOrder={(order) => {
                setSelectedItem(order);
                setShowOrderModal(true);
              }}
              onUpdateStatus={handleUpdateOrderStatus}
              totalOrders={orders.length}
              page={orderPage}
              onPageChange={setOrderPage}
            />
            <OrderDetailModal
              isOpen={showOrderModal}
              onClose={() => {
                setShowOrderModal(false);
                setSelectedItem(null);
              }}
              order={selectedItem}
              onUpdateStatus={handleUpdateOrderStatus}
            />
          </div>
        );
        
      case 'live-orders':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Live Orders</h1>
                <p className="text-gray-500">Real-time order tracking</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setAutoRefresh(!autoRefresh)}
                  className={`px-4 py-2 rounded-lg border ${autoRefresh ? 'bg-green-50 text-green-600' : 'bg-gray-50'}`}
                >
                  Auto-refresh {autoRefresh ? 'ON' : 'OFF'}
                </button>
                <button
                  onClick={fetchLiveOrders}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Refresh Now
                </button>
              </div>
            </div>
            {loading ? (
              <LoadingSpinner />
            ) : (
              <LiveOrdersList
                orders={orders}
                onViewOrder={(order) => {
                  setSelectedItem(order);
                  setShowOrderModal(true);
                }}
                onUpdateStatus={handleUpdateOrderStatus}
                autoRefresh={autoRefresh}
                onToggleAutoRefresh={() => setAutoRefresh(!autoRefresh)}
              />
            )}
            <OrderDetailModal
              isOpen={showOrderModal}
              onClose={() => {
                setShowOrderModal(false);
                setSelectedItem(null);
              }}
              order={selectedItem}
              onUpdateStatus={handleUpdateOrderStatus}
            />
          </div>
        );
        
      case 'agents':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Delivery Agents</h1>
                <p className="text-gray-500">Manage your delivery workforce</p>
              </div>
              <button
                onClick={() => {
                  setSelectedItem(null);
                  setShowAgentModal(true);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Add Agent
              </button>
            </div>
            <AgentTable
              agents={agents}
              loading={loading}
              onViewAgent={(agent) => {
                setSelectedItem(agent);
                setShowAgentModal(true);
              }}
              onEditAgent={(agent) => {
                setSelectedItem(agent);
                setShowAgentModal(true);
              }}
              onToggleStatus={handleToggleAgentStatus}
              onDeleteAgent={handleDeleteAgent}
              totalAgents={agents.length}
              page={agentPage}
              onPageChange={setAgentPage}
            />
            <AgentModal
              isOpen={showAgentModal}
              onClose={() => {
                setShowAgentModal(false);
                setSelectedItem(null);
              }}
              agent={selectedItem}
              onSave={handleSaveAgent}
              onDelete={handleDeleteAgent}
              onToggleStatus={handleToggleAgentStatus}
            />
          </div>
        );
        
      case 'coupons':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Coupons Management</h1>
                <p className="text-gray-500">Create and manage discount coupons</p>
              </div>
              <button
                onClick={() => {
                  setSelectedItem(null);
                  setShowCouponModal(true);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Create Coupon
              </button>
            </div>
            <CouponTable
              coupons={coupons}
              loading={loading}
              onViewCoupon={(coupon) => {
                setSelectedItem(coupon);
                setShowCouponModal(true);
              }}
              onEditCoupon={(coupon) => {
                setSelectedItem(coupon);
                setShowCouponModal(true);
              }}
              onToggleStatus={handleToggleCouponStatus}
              onDeleteCoupon={handleDeleteCoupon}
              totalCoupons={coupons.length}
              page={couponPage}
              onPageChange={setCouponPage}
            />
            <CouponModal
              isOpen={showCouponModal}
              onClose={() => {
                setShowCouponModal(false);
                setSelectedItem(null);
              }}
              coupon={selectedItem}
              onSave={handleSaveCoupon}
              onDelete={handleDeleteCoupon}
              onToggleStatus={handleToggleCouponStatus}
            />
          </div>
        );
        
      case 'payments':
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Payments Management</h1>
              <p className="text-gray-500">Track and manage all financial transactions</p>
            </div>
            <PaymentSummary
              summary={paymentSummary}
              onRefresh={() => {
                fetchPayments();
                fetchPaymentSummary();
              }}
              onExport={() => {}}
              loading={loading}
            />
            <PaymentTable
              payments={payments}
              loading={loading}
              onViewPayment={(payment) => {
                setSelectedItem(payment);
              }}
              onRefund={handleRefundPayment}
              totalPayments={payments.length}
              page={paymentPage}
              onPageChange={setPaymentPage}
            />
          </div>
        );
        
      case 'analytics':
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Analytics Dashboard</h1>
              <p className="text-gray-500">Comprehensive insights and performance metrics</p>
            </div>
            <OverviewStats data={overview} loading={loading} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <RevenueChart data={revenueData} loading={loading} />
              <OrdersByStatus data={orderStats} loading={loading} />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <PeakHoursChart data={peakHours} loading={loading} />
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4">Top Restaurants</h3>
                {loading ? (
                  <div className="animate-pulse space-y-2">
                    {[1,2,3,4,5].map(i => <div key={i} className="h-8 bg-gray-200 rounded"></div>)}
                  </div>
                ) : (
                  topRestaurants.slice(0, 5).map((rest, idx) => (
                    <div key={idx} className="flex justify-between items-center py-2 border-b last:border-0">
                      <span>{idx + 1}. {rest.restaurant?.name || 'Restaurant'}</span>
                      <span className="font-bold">₹{rest.revenue?.toLocaleString()}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        );
        
      case 'settings':
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">System Settings</h1>
              <p className="text-gray-500">Configure your platform settings</p>
            </div>
            <GeneralSettings />
          </div>
        );
        
      case 'profile':
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Admin Profile</h1>
              <p className="text-gray-500">Manage your account settings</p>
            </div>
            {loading ? (
              <LoadingSpinner />
            ) : (
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center gap-6 mb-6">
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                    {admin?.name?.[0]?.toUpperCase() || 'A'}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">{admin?.name || 'Admin'}</h2>
                    <p className="text-gray-500">{admin?.email}</p>
                    <p className="text-sm text-gray-400 mt-1">Role: Administrator</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500">Full Name</p>
                    <p className="font-medium">{admin?.name || 'Not set'}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="font-medium">{admin?.email || 'Not set'}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500">Phone</p>
                    <p className="font-medium">{admin?.phone || 'Not set'}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500">Member Since</p>
                    <p className="font-medium">{admin?.createdAt ? new Date(admin.createdAt).toLocaleDateString() : 'Not set'}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
        
      default:
        return (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <p className="text-gray-500">Coming soon...</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-gray-900 text-white transition-all duration-300 flex flex-col`}>
        <div className="p-4 border-b border-gray-800 flex items-center justify-between">
          <h1 className={`font-bold text-xl ${!sidebarOpen && 'hidden'}`}>
            Admin Panel
          </h1>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1 rounded-lg hover:bg-gray-800"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
        
        <nav className="flex-1 py-4 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 mx-2 rounded-lg transition-colors ${
                  activeTab === item.id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800'
                }`}
              >
                <Icon size={20} />
                <span className={`${!sidebarOpen && 'hidden'} text-sm`}>{item.name}</span>
              </button>
            );
          })}
        </nav>
        
        <div className="p-4 border-t border-gray-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-gray-300 hover:bg-gray-800 transition-colors"
          >
            <LogOut size={20} />
            <span className={`${!sidebarOpen && 'hidden'} text-sm`}>Logout</span>
          </button>
        </div>
      </aside>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-500">System Online</span>
            </div>
            
            <div className="flex items-center gap-4">
              <button className="p-2 rounded-lg hover:bg-gray-100 relative">
                <Bell size={20} />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                  {admin?.name?.[0]?.toUpperCase() || 'A'}
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-medium">{admin?.name || 'Admin'}</p>
                  <p className="text-xs text-gray-500">Administrator</p>
                </div>
              </div>
            </div>
          </div>
        </header>
        
        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {renderContent()}
        </main>
      </div>
      
      {/* Toast Notifications */}
      {toast.show && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast({ show: false })} 
        />
      )}
      
      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={confirmAction}
        title="Confirm Action"
        message="Are you sure you want to proceed?"
      />
    </div>
  );
};

export default AdminLayout;