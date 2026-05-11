// delivery/DeliveryLayout.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  DollarSign, 
  User, 
  Bell, 
  Headphones, 
  LogOut,
  Menu, 
  X, 
  Truck, 
  TrendingUp, 
  AlertCircle, 
  Loader,
  ChevronRight,
  Settings,
  HelpCircle,
  Star,
  Wifi,
  WifiOff,
  Wallet
} from 'lucide-react';
import toast from 'react-hot-toast';
import API from '../services/axios';
import { getSocket } from '../services/axios';

// Pages
import DeliveryDashboard from './pages/DeliveryDashboard';
import DeliveryOrders from './pages/DeliveryOrders';
import DeliveryEarnings from './pages/DeliveryEarnings';
import DeliveryProfile from './pages/DeliveryProfile';
import DeliveryPerformance from './pages/DeliveryPerformance';
import DeliverySupport from './pages/DeliverySupport';
import DeliveryNotifications from './pages/DeliveryNotifications';
import DeliveryOrderDetail from './pages/DeliveryOrderDetail';
import DeliveryWallet from './pages/DeliveryWallet';

const DeliveryLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [socketConnected, setSocketConnected] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const socketRef = useRef(null);

  useEffect(() => {
    checkAuthAndFetchData();
    setupSocket();
    
    // Handle window resize for responsive sidebar
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };
    
    window.addEventListener('resize', handleResize);
    handleResize();
    
    return () => {
      window.removeEventListener('resize', handleResize);
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  const setupSocket = () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    
    const socket = getSocket();
    if (socket) {
      socketRef.current = socket;
      socket.on('connect', () => {
        setSocketConnected(true);
        console.log('Socket connected');
      });
      socket.on('disconnect', () => {
        setSocketConnected(false);
        console.log('Socket disconnected');
      });
      socket.on('newNotification', (notification) => {
        setNotifications(prev => [notification, ...prev]);
        setUnreadCount(prev => prev + 1);
        toast.custom((t) => (
          <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}>
            <div className="flex-1 w-0 p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 pt-0.5">
                  <Bell size={18} className="text-orange-500" />
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                  <p className="text-sm text-gray-500">{notification.message}</p>
                </div>
              </div>
            </div>
            <div className="flex border-l border-gray-200">
              <button
                onClick={() => toast.dismiss(t.id)}
                className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-orange-600 hover:text-orange-500"
              >
                Close
              </button>
            </div>
          </div>
        ), { duration: 4000 });
      });
      socket.on('orderStatusUpdate', (data) => {
        toast.success(`Order #${data.orderId} status: ${data.status}`);
        // Refresh orders if on orders page
        if (location.pathname.includes('/delivery/orders')) {
          window.dispatchEvent(new CustomEvent('refreshOrders'));
        }
      });
      setSocketConnected(socket.connected);
    }
  };

  const checkAuthAndFetchData = async () => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    
    console.log('Token exists:', !!token);
    console.log('Stored role:', role);
    
    if (!token) {
      console.log('No token found, redirecting to login');
      toast.error('Please login to continue');
      navigate('/login');
      return;
    }
    
    // Check if user has delivery role
    if (role !== 'delivery' && role !== 'admin') {
      console.log('User is not a delivery partner, role:', role);
      setAuthError(true);
      toast.error('You are not authorized to access delivery dashboard');
      setTimeout(() => {
        navigate('/');
      }, 2000);
      setLoading(false);
      return;
    }
    
    // Fetch user profile
    try {
      const profileRes = await API.get('/delivery/me').catch(() => null);
      if (profileRes?.data) {
        const userData = profileRes.data?.data || profileRes.data;
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
      } else {
        const userStr = localStorage.getItem('user');
        if (userStr) {
          setUser(JSON.parse(userStr));
        }
      }
    } catch (error) {
      console.error('Error getting user info:', error);
    }
    
    // Check online status
    try {
      const statusRes = await API.get('/delivery/me/status');
      setIsOnline(statusRes.data?.isOnline !== false);
    } catch (error) {
      console.error('Error fetching status:', error);
    }
    
    await fetchNotifications();
    setLoading(false);
  };

  const fetchNotifications = async () => {
    try {
      const res = await API.get('/delivery/notifications');
      const data = res.data?.notifications || res.data || [];
      setNotifications(Array.isArray(data) ? data : []);
      setUnreadCount(Array.isArray(data) ? data.filter(n => !n.isRead).length : 0);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setNotifications([]);
      setUnreadCount(0);
    }
  };

  const toggleOnlineStatus = async () => {
    try {
      await API.patch('/delivery/me/status');
      const newStatus = !isOnline;
      setIsOnline(newStatus);
      toast.success(newStatus ? 'You are now online' : 'You are now offline');
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleLogout = async () => {
    try {
      await API.post('/auth/logout').catch(() => {});
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      localStorage.removeItem('user');
      toast.success('Logged out successfully');
      navigate('/login');
    }
  };

  const navItems = [
    { path: '/delivery', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/delivery/orders', icon: Package, label: 'Orders' },
    { path: '/delivery/earnings', icon: DollarSign, label: 'Earnings' },
    { path: '/delivery/performance', icon: TrendingUp, label: 'Performance' },
    { path: '/delivery/profile', icon: User, label: 'Profile' },
    { path: '/delivery/notifications', icon: Bell, label: 'Notifications', badge: unreadCount },
    { path: '/delivery/support', icon: Headphones, label: 'Support' },
    { path: '/delivery/wallet', icon: Wallet, label: 'Wallet' },
  ];

  const isActive = (path) => {
    if (path === '/delivery' && location.pathname === '/delivery') return true;
    if (path !== '/delivery' && location.pathname.startsWith(path)) return true;
    return false;
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <Loader size={48} className="animate-spin text-orange-500 mx-auto" />
          <p className="text-gray-500 mt-3">Loading delivery dashboard...</p>
        </div>
      </div>
    );
  }

  if (authError) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle size={40} className="text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Access Denied</h2>
          <p className="text-gray-500 mb-4">
            You don't have permission to access the delivery dashboard. 
            Please login with a delivery partner account.
          </p>
          <button
            onClick={() => {
              localStorage.removeItem('token');
              localStorage.removeItem('role');
              localStorage.removeItem('user');
              navigate('/login');
            }}
            className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={closeMobileMenu} />
      )}

      {/* Sidebar */}
      <div className={`
        fixed md:relative z-50 h-full bg-gray-900 text-white transition-all duration-300 flex flex-col
        ${isSidebarOpen ? 'w-64' : 'w-20'}
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-4 border-b border-gray-800 flex items-center justify-between">
          <div className={`flex items-center gap-2 ${!isSidebarOpen && 'justify-center w-full'}`}>
            <Truck size={24} className="text-orange-500" />
            {isSidebarOpen && <span className="font-bold text-lg">QuickBite</span>}
          </div>
          <button 
            onClick={() => {
              setIsSidebarOpen(!isSidebarOpen);
              if (window.innerWidth < 768) {
                setIsMobileMenuOpen(false);
              }
            }} 
            className="text-gray-400 hover:text-white transition"
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {user && isSidebarOpen && (
          <div className="p-4 border-b border-gray-800">
            <div className="flex items-center gap-3">
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full object-cover" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center">
                  <User size={18} />
                </div>
              )}
              <div className="flex-1">
                <p className="font-medium truncate">{user.name || 'Delivery Partner'}</p>
                <p className="text-xs text-gray-400">Delivery Partner</p>
              </div>
            </div>
            
            {/* Online Status Toggle */}
            <button
              onClick={toggleOnlineStatus}
              className={`mt-3 w-full flex items-center justify-center gap-2 text-xs py-1.5 rounded-lg transition ${
                isOnline ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-300'
              }`}
            >
              {isOnline ? <Wifi size={12} /> : <WifiOff size={12} />}
              {isOnline ? 'Online' : 'Offline'}
            </button>
          </div>
        )}

        {/* Mobile Status Bar */}
        {!isSidebarOpen && user && (
          <div className="p-2 border-b border-gray-800 text-center">
            <div className={`w-2 h-2 rounded-full mx-auto ${isOnline ? 'bg-green-500' : 'bg-gray-500'}`} />
          </div>
        )}

        <nav className="flex-1 py-4 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => {
                  if (window.innerWidth < 768) {
                    setIsSidebarOpen(false);
                    setIsMobileMenuOpen(false);
                  }
                }}
                className={`flex items-center gap-3 px-4 py-3 mx-2 rounded-lg transition ${
                  active ? 'bg-orange-500 text-white' : 'text-gray-300 hover:bg-gray-800'
                }`}
              >
                <Icon size={20} />
                {isSidebarOpen && (
                  <>
                    <span className="flex-1">{item.label}</span>
                    {item.badge > 0 && (
                      <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                        {item.badge > 99 ? '99+' : item.badge}
                      </span>
                    )}
                  </>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-800 space-y-2">
          {/* Connection Status */}
          {isSidebarOpen && (
            <div className={`flex items-center justify-between text-xs px-4 py-2 rounded-lg ${socketConnected ? 'bg-green-900/30 text-green-400' : 'bg-gray-800 text-gray-400'}`}>
              <span>Live Connection</span>
              <div className={`w-2 h-2 rounded-full ${socketConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`} />
            </div>
          )}
          
          {/* Logout Button */}
          <button 
            onClick={handleLogout} 
            className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-gray-300 hover:bg-gray-800 transition"
          >
            <LogOut size={20} />
            {isSidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </div>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-white shadow-sm z-30 px-4 py-3 flex items-center justify-between">
        <button onClick={() => setIsMobileMenuOpen(true)} className="p-2">
          <Menu size={24} />
        </button>
        <div className="flex items-center gap-2">
          <Truck size={20} className="text-orange-500" />
          <span className="font-semibold">QuickBite Delivery</span>
        </div>
        <div className="relative">
          <Bell size={20} className="text-gray-600" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto md:mt-0 mt-14">
        <Routes>
          <Route path="/" element={<DeliveryDashboard />} />
          <Route path="/orders" element={<DeliveryOrders />} />
          <Route path="/earnings" element={<DeliveryEarnings />} />
          <Route path="/profile" element={<DeliveryProfile />} />
          <Route path="/performance" element={<DeliveryPerformance />} />
          <Route path="/support" element={<DeliverySupport />} />
          <Route path="/notifications" element={<DeliveryNotifications />} />
          <Route path="/orders/:orderId" element={<DeliveryOrderDetail />} />
          <Route path="/wallet" element={<DeliveryWallet />} />
        </Routes>
      </div>
    </div>
  );
};

export default DeliveryLayout;