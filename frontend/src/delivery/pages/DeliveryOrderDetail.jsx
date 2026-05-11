// delivery/pages/DeliveryOrderDetail.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  MapPin, Phone, Clock, Package, DollarSign, 
  Navigation, CheckCircle, Loader, ArrowLeft,
  User, MessageCircle, AlertCircle, Truck,
  Store, QrCode, X, Target
} from 'lucide-react';
import API from '../../services/axios';
import toast from 'react-hot-toast';

const DeliveryOrderDetail = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  const [deliveryLocation, setDeliveryLocation] = useState(null);
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    fetchOrderDetails();
    startLocationTracking();
    
    return () => {
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [orderId]);

  const watchIdRef = useRef(null);

  const fetchOrderDetails = async () => {
    try {
      const res = await API.get(`/delivery/orders/${orderId}`);
      const orderData = res.data?.data || res.data;
      setOrder(orderData);
      
      const status = orderData?.deliveryStatus;
      if (status === 'pending') setCurrentStep(1);
      else if (status === 'accepted') setCurrentStep(2);
      else if (status === 'picked_up') setCurrentStep(3);
      else if (status === 'delivered') setCurrentStep(4);
    } catch (error) {
      console.error('Error fetching order:', error);
      toast.error('Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  const startLocationTracking = () => {
    if (!navigator.geolocation) return;
    
    watchIdRef.current = navigator.geolocation.watchPosition(
      async (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        setDeliveryLocation(location);
        
        if (order?.deliveryStatus === 'accepted' || order?.deliveryStatus === 'picked_up') {
          try {
            await API.patch(`/delivery/orders/${orderId}/location`, location);
          } catch (error) {
            console.error('Error updating location:', error);
          }
        }
      },
      (error) => console.error('Location error:', error),
      { enableHighAccuracy: true, maximumAge: 5000 }
    );
  };

  const markPickedUp = async () => {
    setUpdating(true);
    try {
      const response = await API.patch(`/delivery/orders/${orderId}/picked-up`);
      
      if (response.data?.success) {
        setOrder(prev => ({ ...prev, deliveryStatus: 'picked_up' }));
        setCurrentStep(3);
        toast.success('Order picked up! Head to customer. 🛵');
      } else {
        toast.error(response.data?.message || 'Failed to update status');
      }
    } catch (error) {
      console.error('Error marking picked up:', error);
      toast.error(error.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  // FIXED: Proper OTP verification with no auto-navigation
  const handleVerifyAndDeliver = async () => {
    if (!otp || otp.length !== 6) {
      toast.error('Please enter valid 6-digit OTP');
      return;
    }
    
    setVerifying(true);
    try {
      // Verify OTP
      await API.post(`/delivery/orders/${orderId}/otp-verify`, { otp });
      // Mark as delivered
      await API.patch(`/delivery/orders/${orderId}/delivered`);
      
      // Update local state
      setOrder(prev => ({ ...prev, deliveryStatus: 'delivered' }));
      setCurrentStep(4);
      setShowOtpModal(false);
      setOtp('');
      
      toast.success('Order delivered successfully! 🎉');
      
    } catch (error) {
      console.error('Error delivering:', error);
      toast.error(error.response?.data?.message || 'Invalid OTP. Please try again.');
    } finally {
      setVerifying(false);
    }
  };

  const openDirections = (lat, lng) => {
    if (lat && lng) {
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader size={32} className="animate-spin text-orange-500" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <AlertCircle size={48} className="mx-auto text-gray-400 mb-3" />
        <p className="text-gray-500">Order not found</p>
        <button onClick={() => navigate('/delivery/orders')} className="mt-4 text-orange-500">
          Back to Orders
        </button>
      </div>
    );
  }

  const isAccepted = order.deliveryStatus === 'accepted';
  const isPickedUp = order.deliveryStatus === 'picked_up';
  const isDelivered = order.deliveryStatus === 'delivered';

  const steps = [
    { step: 1, label: 'Accept', icon: CheckCircle, completed: currentStep > 1 },
    { step: 2, label: 'Pick Up', icon: Store, completed: currentStep > 2, active: currentStep === 2 },
    { step: 3, label: 'Deliver', icon: Truck, completed: currentStep > 3, active: currentStep === 3 },
    { step: 4, label: 'Complete', icon: CheckCircle, completed: currentStep === 4 }
  ];

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/delivery/orders')} className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-bold text-gray-800">Order #{order.orderId || order._id?.slice(-8)}</h1>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          isDelivered ? 'bg-green-100 text-green-700' :
          isPickedUp ? 'bg-purple-100 text-purple-700' :
          isAccepted ? 'bg-blue-100 text-blue-700' :
          'bg-yellow-100 text-yellow-700'
        }`}>
          {order.deliveryStatus?.replace('_', ' ').toUpperCase()}
        </span>
      </div>

      {/* Step Progress */}
      <div className="bg-white rounded-xl shadow-sm border p-4 mb-6">
        <div className="flex justify-between items-center">
          {steps.map((step, idx) => (
            <React.Fragment key={step.step}>
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  step.completed ? 'bg-green-500 text-white' :
                  step.active ? 'bg-orange-500 text-white' :
                  'bg-gray-200 text-gray-400'
                }`}>
                  {step.completed ? <CheckCircle size={20} /> : step.step}
                </div>
                <p className={`text-xs mt-2 ${step.completed || step.active ? 'text-orange-600 font-medium' : 'text-gray-400'}`}>
                  {step.label}
                </p>
              </div>
              {idx < steps.length - 1 && (
                <div className={`flex-1 h-0.5 mx-2 ${step.completed ? 'bg-green-500' : 'bg-gray-200'}`} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* OTP Info Card - Only show for active orders */}
      {(isAccepted || isPickedUp) && !isDelivered && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-2">
            <QrCode size={20} className="text-blue-600" />
            <span className="font-semibold text-blue-800">Delivery OTP Required</span>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            🔐 Ask the customer for the 6-digit OTP sent to their email.
          </p>
        </div>
      )}

      {/* Action Section - Only for active orders */}
      {!isDelivered && (
        <div className="bg-gradient-to-r from-orange-50 to-white rounded-xl shadow-sm border p-6 mb-6">
          {isAccepted && (
            <button
              onClick={markPickedUp}
              disabled={updating}
              className="w-full py-3 bg-purple-500 text-white rounded-xl font-semibold hover:bg-purple-600 disabled:opacity-50 flex items-center justify-center gap-2 transition"
            >
              {updating ? <Loader size={18} className="animate-spin" /> : <Store size={18} />}
              Mark as Picked Up
            </button>
          )}
          
          {isPickedUp && (
            <button
              onClick={() => setShowOtpModal(true)}
              className="w-full py-3 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-600 transition flex items-center justify-center gap-2"
            >
              <QrCode size={18} />
              Deliver with OTP
            </button>
          )}
          
          {/* Directions Button */}
          {isAccepted && order.vendor?.location && (
            <button
              onClick={() => openDirections(order.vendor.location.lat, order.vendor.location.lng)}
              className="w-full mt-3 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition flex items-center justify-center gap-2"
            >
              <Navigation size={16} />
              Get Directions to Restaurant
            </button>
          )}
          
          {isPickedUp && order.customerLocation && (
            <button
              onClick={() => openDirections(order.customerLocation.lat, order.customerLocation.lng)}
              className="w-full mt-3 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition flex items-center justify-center gap-2"
            >
              <Navigation size={16} />
              Get Directions to Customer
            </button>
          )}
        </div>
      )}

      {/* Order Details - Show always */}
      <div className="space-y-4">
        {/* Restaurant Info */}
        <div className="bg-white rounded-xl shadow-sm border p-4">
          <h3 className="font-semibold flex items-center gap-2 mb-3">
            <Store size={18} className="text-orange-500" />
            Restaurant Details
          </h3>
          <p className="font-medium">{order.vendor?.name || 'Restaurant'}</p>
          <p className="text-sm text-gray-500">{order.vendor?.address?.street}, {order.vendor?.address?.city}</p>
        </div>

        {/* Customer Info */}
        <div className="bg-white rounded-xl shadow-sm border p-4">
          <h3 className="font-semibold flex items-center gap-2 mb-3">
            <User size={18} className="text-orange-500" />
            Customer Details
          </h3>
          <p className="font-medium">{order.user?.name || 'Customer'}</p>
          <div className="flex items-center gap-3 mt-1">
            <a href={`tel:${order.user?.phone || order.address?.phone}`} className="text-sm text-orange-500">
              Call Customer
            </a>
            <button className="text-sm text-blue-500 flex items-center gap-1">
              <MessageCircle size={14} /> Message
            </button>
          </div>
        </div>

        {/* Delivery Address */}
        <div className="bg-white rounded-xl shadow-sm border p-4">
          <h3 className="font-semibold flex items-center gap-2 mb-3">
            <MapPin size={18} className="text-orange-500" />
            Delivery Address
          </h3>
          <p className="text-gray-600">{order.address?.street}, {order.address?.city}</p>
          <p className="text-sm text-gray-400 mt-1">Pincode: {order.address?.pincode}</p>
        </div>

        {/* Order Items */}
        <div className="bg-white rounded-xl shadow-sm border p-4">
          <h3 className="font-semibold flex items-center gap-2 mb-3">
            <Package size={18} className="text-orange-500" />
            Order Items
          </h3>
          <div className="space-y-2">
            {order.items?.map((item, idx) => (
              <div key={idx} className="flex justify-between text-sm">
                <span>{item.quantity}x {item.menuItem?.name || item.name}</span>
                <span className="font-medium">₹{(item.price || item.menuItem?.price) * item.quantity}</span>
              </div>
            ))}
            <div className="border-t pt-2 mt-2 flex justify-between font-semibold">
              <span>Total</span>
              <span className="text-orange-600">₹{order.totalAmount}</span>
            </div>
            <div className="flex justify-between text-sm text-green-600">
              <span>Your Earnings</span>
              <span>+ ₹{order.deliveryFee || 40}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Completed View - Show when delivered */}
      {isDelivered && (
        <div className="bg-green-50 rounded-xl p-6 text-center border border-green-200 mt-6">
          <CheckCircle size={48} className="text-green-500 mx-auto mb-3" />
          <h3 className="text-xl font-semibold text-green-700">Order Delivered!</h3>
          <p className="text-green-600 mt-1">You earned ₹{order.deliveryFee || 40} for this delivery</p>
          <button
            onClick={() => navigate('/delivery/orders')}
            className="mt-4 px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
          >
            Back to Orders
          </button>
        </div>
      )}

      {/* OTP Modal */}
      {showOtpModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="text-center mb-4">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <QrCode size={28} className="text-orange-500" />
              </div>
              <h3 className="text-xl font-semibold">Enter Delivery OTP</h3>
              <p className="text-gray-500 text-sm mt-1">
                Ask the customer for the 6-digit OTP sent to their email
              </p>
            </div>
            
            <input
              type="text"
              maxLength="6"
              placeholder="000000"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              className="w-full px-4 py-3 text-center text-2xl tracking-widest border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
              autoFocus
            />
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowOtpModal(false);
                  setOtp('');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleVerifyAndDeliver}
                disabled={verifying}
                className="flex-1 bg-orange-500 text-white py-2 rounded-xl hover:bg-orange-600 disabled:opacity-50 flex items-center justify-center gap-2 transition"
              >
                {verifying ? <Loader size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                {verifying ? 'Verifying...' : 'Verify & Deliver'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliveryOrderDetail;