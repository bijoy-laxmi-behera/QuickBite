// vendor/components/Profile/OperatingHours.jsx
import React, { useState, useEffect } from 'react';
import API from '../../../services/axios';
import { Clock, Plus, Trash2, Save, X, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

const OperatingHours = ({ profile, onUpdate }) => {
  const [weeklySchedule, setWeeklySchedule] = useState({});
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showHolidayForm, setShowHolidayForm] = useState(false);
  const [newHoliday, setNewHoliday] = useState({ date: '', reason: '' });

  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  useEffect(() => {
    fetchOperatingHours();
    fetchHolidays();
  }, []);

  const fetchOperatingHours = async () => {
    try {
      const response = await API.get('/vendor/profile/hours');
      console.log('Hours API Response:', response.data);
      
      const hoursData = response.data?.data?.weeklySchedule || 
                        response.data?.weeklySchedule || 
                        response.data?.data || 
                        {};
      setWeeklySchedule(hoursData);
    } catch (error) {
      console.error('Error fetching hours:', error);
    }
  };

  // Separate function to fetch holidays
  const fetchHolidays = async () => {
    try {
      setRefreshing(true);
      // Try to get holidays from the vendor profile
      const response = await API.get('/vendor/profile');
      console.log('Profile API Response for holidays:', response.data);
      
      // Try different possible locations for holidays
      let holidaysData = [];
      
      if (response.data?.data?.holidays) {
        holidaysData = response.data.data.holidays;
      } else if (response.data?.holidays) {
        holidaysData = response.data.holidays;
      } else if (response.data?.restaurantInfo?.holidays) {
        holidaysData = response.data.restaurantInfo.holidays;
      } else if (profile?.holidays) {
        holidaysData = profile.holidays;
      }
      
      console.log('Extracted holidays:', holidaysData);
      setHolidays(Array.isArray(holidaysData) ? holidaysData : []);
    } catch (error) {
      console.error('Error fetching holidays:', error);
      setHolidays([]);
    } finally {
      setRefreshing(false);
    }
  };

  const handleDayChange = (day, field, value) => {
    setWeeklySchedule(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        isOpen: field === 'isOpen' ? value : (prev[day]?.isOpen !== false),
        [field]: value
      }
    }));
  };

  const addTimeSlot = (day) => {
    const currentSlots = weeklySchedule[day]?.slots || [];
    setWeeklySchedule(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        isOpen: prev[day]?.isOpen !== false,
        slots: [...currentSlots, { open: '09:00', close: '21:00' }]
      }
    }));
  };

  const removeTimeSlot = (day, index) => {
    const currentSlots = [...(weeklySchedule[day]?.slots || [])];
    currentSlots.splice(index, 1);
    setWeeklySchedule(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        slots: currentSlots
      }
    }));
  };

  const updateTimeSlot = (day, index, field, value) => {
    const currentSlots = [...(weeklySchedule[day]?.slots || [])];
    currentSlots[index] = { ...currentSlots[index], [field]: value };
    setWeeklySchedule(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        slots: currentSlots
      }
    }));
  };

  const handleSaveSchedule = async () => {
    setLoading(true);
    const loadingToast = toast.loading('Saving schedule...');
    
    try {
      const formattedSchedule = {};
      days.forEach(day => {
        const dayData = weeklySchedule[day];
        if (dayData) {
          formattedSchedule[day] = {
            isOpen: dayData.isOpen !== false,
            open: dayData.open || '09:00',
            close: dayData.close || '21:00',
            slots: dayData.slots || []
          };
        } else {
          formattedSchedule[day] = {
            isOpen: true,
            open: '09:00',
            close: '21:00',
            slots: []
          };
        }
      });
      
      await API.put('/vendor/profile/hours', { operatingHours: formattedSchedule });
      toast.success('Operating hours updated successfully!', { id: loadingToast });
      onUpdate();
    } catch (error) {
      console.error('Error saving hours:', error);
      toast.error(error.response?.data?.message || 'Failed to save operating hours', { id: loadingToast });
    } finally {
      setLoading(false);
    }
  };

  const handleAddHoliday = async () => {
    if (!newHoliday.date) {
      toast.error('Please select a date');
      return;
    }
    
    setLoading(true);
    const loadingToast = toast.loading('Adding holiday...');
    
    try {
      const response = await API.post('/vendor/profile/holidays', {
        date: newHoliday.date,
        reason: newHoliday.reason || 'Holiday'
      });
      
      console.log('Add holiday response:', response.data);
      toast.success('Holiday added successfully!', { id: loadingToast });
      
      // Refresh holidays list
      await fetchHolidays();
      
      setNewHoliday({ date: '', reason: '' });
      setShowHolidayForm(false);
      onUpdate();
      
    } catch (error) {
      console.error('Error adding holiday:', error);
      toast.error(error.response?.data?.message || 'Failed to add holiday', { id: loadingToast });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteHoliday = async (holidayId) => {
    if (!confirm('Remove this holiday?')) return;
    
    const loadingToast = toast.loading('Removing holiday...');
    
    try {
      await API.delete(`/vendor/profile/holidays/${holidayId}`);
      toast.success('Holiday removed successfully!', { id: loadingToast });
      
      // Refresh holidays list
      await fetchHolidays();
      onUpdate();
      
    } catch (error) {
      console.error('Error deleting holiday:', error);
      toast.error('Failed to remove holiday', { id: loadingToast });
    }
  };

  const handleRefresh = () => {
    fetchHolidays();
    toast.success('Refreshed holidays list');
  };

  return (
    <div className="space-y-8">
      {/* Weekly Schedule */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Weekly Schedule</h3>
        <div className="space-y-4">
          {days.map((day) => {
            const dayData = weeklySchedule[day] || { isOpen: true, open: '09:00', close: '21:00', slots: [] };
            const displayDay = day.charAt(0).toUpperCase() + day.slice(1);
            
            return (
              <div key={day} className="border rounded-lg p-4 bg-gray-50">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <Clock size={18} className="text-orange-500" />
                    <h4 className="font-medium text-gray-800">{displayDay}</h4>
                  </div>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={dayData.isOpen === false}
                      onChange={(e) => handleDayChange(day, 'isOpen', !e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm text-gray-600">Closed</span>
                  </label>
                </div>

                {dayData.isOpen !== false && (
                  <div className="space-y-3">
                    {dayData.slots && dayData.slots.length > 0 ? (
                      dayData.slots.map((slot, idx) => (
                        <div key={idx} className="flex items-center space-x-3">
                          <input
                            type="time"
                            value={slot.open}
                            onChange={(e) => updateTimeSlot(day, idx, 'open', e.target.value)}
                            className="px-3 py-1.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                          />
                          <span className="text-gray-500">to</span>
                          <input
                            type="time"
                            value={slot.close}
                            onChange={(e) => updateTimeSlot(day, idx, 'close', e.target.value)}
                            className="px-3 py-1.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                          />
                          {idx === dayData.slots.length - 1 && (
                            <button
                              type="button"
                              onClick={() => addTimeSlot(day)}
                              className="text-orange-500 hover:text-orange-600"
                            >
                              <Plus size={18} />
                            </button>
                          )}
                          {dayData.slots.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeTimeSlot(day, idx)}
                              className="text-red-500 hover:text-red-600"
                            >
                              <X size={18} />
                            </button>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="flex items-center space-x-3">
                        <input
                          type="time"
                          value={dayData.open || '09:00'}
                          onChange={(e) => setWeeklySchedule(prev => ({
                            ...prev,
                            [day]: { ...prev[day], open: e.target.value }
                          }))}
                          className="px-3 py-1.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                        <span className="text-gray-500">to</span>
                        <input
                          type="time"
                          value={dayData.close || '21:00'}
                          onChange={(e) => setWeeklySchedule(prev => ({
                            ...prev,
                            [day]: { ...prev[day], close: e.target.value }
                          }))}
                          className="px-3 py-1.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                        <button
                          type="button"
                          onClick={() => addTimeSlot(day)}
                          className="text-orange-500 hover:text-orange-600"
                        >
                          <Plus size={18} />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <div className="mt-4 flex justify-end">
          <button
            onClick={handleSaveSchedule}
            disabled={loading}
            className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition flex items-center space-x-2 disabled:opacity-50"
          >
            <Save size={18} />
            <span>{loading ? 'Saving...' : 'Save Schedule'}</span>
          </button>
        </div>
      </div>

      {/* Holidays */}
      <div className="border-t pt-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Holidays / Special Closures</h3>
          <div className="flex space-x-2">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="text-gray-500 hover:text-gray-700 text-sm flex items-center space-x-1"
            >
              <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
              <span>Refresh</span>
            </button>
            <button
              onClick={() => setShowHolidayForm(true)}
              className="text-orange-500 hover:text-orange-600 text-sm flex items-center space-x-1"
            >
              <Plus size={16} />
              <span>Add Holiday</span>
            </button>
          </div>
        </div>

        {!holidays || holidays.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <p className="text-gray-500">No holidays scheduled</p>
            <p className="text-sm text-gray-400 mt-1">Click "Add Holiday" to add a closure day</p>
          </div>
        ) : (
          <div className="space-y-2">
            {holidays.map((holiday, index) => (
              <div key={holiday._id || index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">
                    {holiday.date ? new Date(holiday.date).toLocaleDateString('en-IN') : 'Date not set'}
                  </p>
                  {holiday.reason && <p className="text-sm text-gray-500">{holiday.reason}</p>}
                </div>
                <button
                  onClick={() => handleDeleteHoliday(holiday._id)}
                  className="text-red-500 hover:text-red-600 p-1"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Add Holiday Modal */}
        {showHolidayForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl max-w-sm w-full p-5">
              <h3 className="text-lg font-semibold mb-4">Add Holiday</h3>
              <div className="space-y-3">
                <input
                  type="date"
                  value={newHoliday.date}
                  onChange={(e) => setNewHoliday({ ...newHoliday, date: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <input
                  type="text"
                  placeholder="Reason (optional)"
                  value={newHoliday.reason}
                  onChange={(e) => setNewHoliday({ ...newHoliday, reason: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div className="flex space-x-3 mt-5">
                <button
                  onClick={() => setShowHolidayForm(false)}
                  className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddHoliday}
                  disabled={loading}
                  className="flex-1 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 disabled:opacity-50"
                >
                  {loading ? 'Adding...' : 'Add'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OperatingHours;