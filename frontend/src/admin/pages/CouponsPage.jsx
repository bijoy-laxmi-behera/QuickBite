import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Power, Calendar, DollarSign, Percent } from 'lucide-react';
import Loader from '../components/common/Loader';
import ConfirmModal from '../components/common/ConfirmModal';
import Toast from '../components/common/Toast';

const CouponsPage = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [formData, setFormData] = useState({
    code: '',
    discountType: 'percentage',
    discountValue: '',
    minOrderAmount: '',
    maxDiscount: '',
    usageLimit: '',
    expiresAt: '',
    isActive: true,
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
    fetchCoupons();
  }, []);

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

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
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
      const couponData = {
        ...formData,
        discountValue: Number(formData.discountValue),
        minOrderAmount: Number(formData.minOrderAmount),
        maxDiscount: formData.maxDiscount ? Number(formData.maxDiscount) : undefined,
        usageLimit: formData.usageLimit ? Number(formData.usageLimit) : undefined,
      };

      if (editingCoupon) {
        await fetchWithAuth(`/admin/coupons/${editingCoupon._id}`, {
          method: 'PUT',
          body: JSON.stringify(couponData),
        });
        showToast('Coupon updated successfully');
      } else {
        await fetchWithAuth('/admin/coupons', {
          method: 'POST',
          body: JSON.stringify(couponData),
        });
        showToast('Coupon created successfully');
      }
      setShowModal(false);
      setEditingCoupon(null);
      resetForm();
      fetchCoupons();
    } catch (error) {
      showToast('Failed to save coupon', 'error');
    }
  };

  const handleToggleStatus = async (coupon) => {
    try {
      await fetchWithAuth(`/admin/coupons/${coupon._id}/toggle`, { method: 'PATCH' });
      showToast(`Coupon ${coupon.isActive ? 'deactivated' : 'activated'} successfully`);
      fetchCoupons();
    } catch (error) {
      showToast('Failed to update status', 'error');
    }
  };

  const handleDeleteCoupon = async (coupon) => {
    try {
      await fetchWithAuth(`/admin/coupons/${coupon._id}`, { method: 'DELETE' });
      showToast('Coupon deleted successfully');
      fetchCoupons();
    } catch (error) {
      showToast('Failed to delete coupon', 'error');
    }
    setShowConfirmModal(false);
  };

  const resetForm = () => {
    setFormData({
      code: '',
      discountType: 'percentage',
      discountValue: '',
      minOrderAmount: '',
      maxDiscount: '',
      usageLimit: '',
      expiresAt: '',
      isActive: true,
    });
  };

  const handleEdit = (coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      minOrderAmount: coupon.minOrderAmount,
      maxDiscount: coupon.maxDiscount || '',
      usageLimit: coupon.usageLimit || '',
      expiresAt: coupon.expiresAt?.split('T')[0] || '',
      isActive: coupon.isActive,
    });
    setShowModal(true);
  };

  if (loading) return <Loader />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Coupons Management</h1>
          <p className="text-gray-500">Create and manage discount coupons</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setEditingCoupon(null);
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus size={18} /> Create Coupon
        </button>
      </div>

      {/* Coupons Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {coupons.map((coupon) => (
          <div key={coupon._id} className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-blue-600">{coupon.code}</span>
                  <span className={`px-2 py-1 text-xs rounded-full ${coupon.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {coupon.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  {coupon.discountType === 'flat' ? '₹' : ''}{coupon.discountValue}{coupon.discountType === 'percentage' ? '% OFF' : ' OFF'}
                </p>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => handleEdit(coupon)}
                  className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                >
                  <Edit size={18} />
                </button>
                <button
                  onClick={() => handleToggleStatus(coupon)}
                  className={`p-1 ${coupon.isActive ? 'text-red-600' : 'text-green-600'} hover:bg-gray-100 rounded`}
                >
                  <Power size={18} />
                </button>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              {coupon.minOrderAmount > 0 && (
                <div className="flex items-center gap-2 text-gray-600">
                  <DollarSign size={14} />
                  <span>Min Order: ₹{coupon.minOrderAmount}</span>
                </div>
              )}
              {coupon.maxDiscount > 0 && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Percent size={14} />
                  <span>Max Discount: ₹{coupon.maxDiscount}</span>
                </div>
              )}
              {coupon.usageLimit > 0 && (
                <div className="flex items-center gap-2 text-gray-600">
                  <span>Used: {coupon.usedCount || 0}/{coupon.usageLimit}</span>
                </div>
              )}
              {coupon.expiresAt && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar size={14} />
                  <span>Expires: {new Date(coupon.expiresAt).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          </div>
        ))}

        {coupons.length === 0 && (
          <div className="col-span-3 text-center py-12 bg-white rounded-lg">
            <p className="text-gray-500">No coupons created yet</p>
            <button
              onClick={() => setShowModal(true)}
              className="mt-2 text-blue-600 hover:underline"
            >
              Create your first coupon
            </button>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b sticky top-0 bg-white">
              <h2 className="text-xl font-bold">{editingCoupon ? 'Edit Coupon' : 'Create Coupon'}</h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Coupon Code *</label>
                <input
                  type="text"
                  name="code"
                  value={formData.code}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., SAVE20"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Discount Type</label>
                <select
                  name="discountType"
                  value={formData.discountType}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="flat">Flat Amount (₹)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Discount Value *</label>
                <input
                  type="number"
                  name="discountValue"
                  value={formData.discountValue}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder={formData.discountType === 'percentage' ? 'e.g., 20' : 'e.g., 100'}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Minimum Order Amount (₹)</label>
                <input
                  type="number"
                  name="minOrderAmount"
                  value={formData.minOrderAmount}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="e.g., 500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Maximum Discount (₹)</label>
                <input
                  type="number"
                  name="maxDiscount"
                  value={formData.maxDiscount}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="e.g., 200"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Usage Limit</label>
                <input
                  type="number"
                  name="usageLimit"
                  value={formData.usageLimit}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="Leave empty for unlimited"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Expiry Date</label>
                <input
                  type="date"
                  name="expiresAt"
                  value={formData.expiresAt}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                  className="w-4 h-4"
                />
                <label className="text-sm">Active</label>
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
                  {editingCoupon ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={confirmAction}
        title="Delete Coupon"
        message="Are you sure you want to delete this coupon? This action cannot be undone."
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

export default CouponsPage;