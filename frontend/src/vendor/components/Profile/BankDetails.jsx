// vendor/components/Profile/BankDetails.jsx
import React, { useState } from 'react';
import API from '../../../services/axios'; // Use configured axios
import { CreditCard, Building, User, Save, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const BankDetails = ({ profile, onUpdate }) => {
  const [formData, setFormData] = useState({
    accountHolderName: profile?.bankDetails?.accountHolderName || '',
    accountNumber: profile?.bankDetails?.accountNumber || '',
    confirmAccountNumber: profile?.bankDetails?.accountNumber || '',
    ifscCode: profile?.bankDetails?.ifscCode || '',
    bankName: profile?.bankDetails?.bankName || '',
    upiId: profile?.bankDetails?.upiId || '',
    panNumber: profile?.bankDetails?.panNumber || ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!formData.accountHolderName) newErrors.accountHolderName = 'Required';
    if (!formData.accountNumber) newErrors.accountNumber = 'Required';
    if (formData.accountNumber !== formData.confirmAccountNumber) {
      newErrors.confirmAccountNumber = 'Account numbers do not match';
    }
    if (!formData.ifscCode) newErrors.ifscCode = 'Required';
    if (formData.ifscCode && !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(formData.ifscCode.toUpperCase())) {
      newErrors.ifscCode = 'Invalid IFSC code';
    }
    if (!formData.bankName) newErrors.bankName = 'Required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) delete errors[name];
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    
    setLoading(true);
    const loadingToast = toast.loading('Updating bank details...');
    
    try {
      const { confirmAccountNumber, ...bankData } = formData;
      await API.patch('/vendor/profile/bank', { bankDetails: bankData });
      toast.success('Bank details updated successfully!', { id: loadingToast });
      onUpdate();
    } catch (error) {
      console.error('Error updating bank details:', error);
      toast.error(error.response?.data?.message || 'Failed to update bank details', { id: loadingToast });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded mb-6">
        <div className="flex items-start">
          <AlertCircle size={18} className="text-green-500 mt-0.5" />
          <div className="ml-3">
            <p className="text-sm text-green-800">
              Your earnings will be transferred to this account. Please ensure all details are correct.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Account Holder Name *
          </label>
          <div className="relative">
            <User size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              name="accountHolderName"
              value={formData.accountHolderName}
              onChange={handleChange}
              className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                errors.accountHolderName ? 'border-red-500' : ''
              }`}
            />
          </div>
          {errors.accountHolderName && <p className="text-red-500 text-xs mt-1">{errors.accountHolderName}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Account Number *
          </label>
          <div className="relative">
            <CreditCard size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              name="accountNumber"
              value={formData.accountNumber}
              onChange={handleChange}
              className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                errors.accountNumber ? 'border-red-500' : ''
              }`}
            />
          </div>
          {errors.accountNumber && <p className="text-red-500 text-xs mt-1">{errors.accountNumber}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Confirm Account Number *
          </label>
          <div className="relative">
            <CreditCard size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              name="confirmAccountNumber"
              value={formData.confirmAccountNumber}
              onChange={handleChange}
              className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                errors.confirmAccountNumber ? 'border-red-500' : ''
              }`}
            />
          </div>
          {errors.confirmAccountNumber && <p className="text-red-500 text-xs mt-1">{errors.confirmAccountNumber}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            IFSC Code *
          </label>
          <input
            type="text"
            name="ifscCode"
            value={formData.ifscCode}
            onChange={handleChange}
            placeholder="SBIN0001234"
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 uppercase ${
              errors.ifscCode ? 'border-red-500' : ''
            }`}
          />
          {errors.ifscCode && <p className="text-red-500 text-xs mt-1">{errors.ifscCode}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Bank Name *
          </label>
          <div className="relative">
            <Building size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              name="bankName"
              value={formData.bankName}
              onChange={handleChange}
              className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                errors.bankName ? 'border-red-500' : ''
              }`}
            />
          </div>
          {errors.bankName && <p className="text-red-500 text-xs mt-1">{errors.bankName}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            UPI ID (Optional)
          </label>
          <input
            type="text"
            name="upiId"
            value={formData.upiId}
            onChange={handleChange}
            placeholder="restaurant@bank"
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            PAN Number (Optional)
          </label>
          <input
            type="text"
            name="panNumber"
            value={formData.panNumber}
            onChange={handleChange}
            placeholder="ABCDE1234F"
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 uppercase"
          />
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t">
        <button
          type="submit"
          disabled={loading}
          className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition flex items-center space-x-2"
        >
          <Save size={18} />
          <span>{loading ? 'Saving...' : 'Save Bank Details'}</span>
        </button>
      </div>
    </form>
  );
};

export default BankDetails;