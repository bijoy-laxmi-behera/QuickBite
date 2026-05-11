// delivery/components/EarningsChart.jsx
import React, { useEffect, useRef, useState } from 'react';
import { TrendingUp, TrendingDown, Calendar, DollarSign } from 'lucide-react';

const EarningsChart = ({ data, title, type = 'line', height = 250, showStats = true }) => {
  const canvasRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(600);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [averageEarnings, setAverageEarnings] = useState(0);
  const [percentageChange, setPercentageChange] = useState(0);
  const containerRef = useRef(null);

  // Calculate statistics
  useEffect(() => {
    if (data && data.length > 0) {
      const total = data.reduce((sum, d) => sum + (d.total || d.amount || 0), 0);
      const avg = total / data.length;
      setTotalEarnings(total);
      setAverageEarnings(avg);
      
      // Calculate percentage change (compare last week vs previous week)
      if (data.length >= 2) {
        const currentWeek = data.slice(-Math.min(7, data.length)).reduce((sum, d) => sum + (d.total || d.amount || 0), 0);
        const previousWeek = data.slice(-Math.min(14, data.length), -Math.min(7, data.length)).reduce((sum, d) => sum + (d.total || d.amount || 0), 0);
        if (previousWeek > 0) {
          setPercentageChange(((currentWeek - previousWeek) / previousWeek) * 100);
        }
      }
    }
  }, [data]);

  // Monitor container width for responsive canvas
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.clientWidth);
      }
    };
    
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  // Draw chart when data or container width changes
  useEffect(() => {
    if (data && data.length > 0) {
      drawChart();
    }
  }, [data, containerWidth]);

  const drawChart = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const width = containerWidth;
    const height = 300;
    
    // Set canvas dimensions
    canvas.width = width;
    canvas.height = height;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    if (data.length === 0) return;
    
    const values = data.map(d => d.total || d.amount || 0);
    const maxValue = Math.max(...values, 100);
    const minValue = Math.min(...values, 0);
    const padding = { top: 20, right: 20, bottom: 40, left: 45 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;
    const stepX = chartWidth / (data.length - 1);
    
    // Draw background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);
    
    // Draw grid lines and Y-axis labels
    ctx.beginPath();
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    ctx.fillStyle = '#9ca3af';
    ctx.font = '11px sans-serif';
    
    for (let i = 0; i <= 4; i++) {
      const y = padding.top + (chartHeight / 4) * i;
      const value = maxValue - (maxValue / 4) * i;
      
      ctx.moveTo(padding.left, y);
      ctx.lineTo(width - padding.right, y);
      ctx.stroke();
      
      ctx.fillText(`₹${Math.round(value)}`, 5, y + 3);
    }
    
    // Draw X-axis labels
    ctx.fillStyle = '#6b7280';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    
    data.forEach((point, index) => {
      const x = padding.left + index * stepX;
      let label = '';
      
      if (point._id) {
        if (point._id.day) label = `${point._id.day}`;
        else if (point._id.month) {
          const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
          label = monthNames[point._id.month - 1];
          if (point._id.year) label += ` ${point._id.year}`;
        }
        else label = `${point._id}`;
      } else if (point.date) {
        label = new Date(point.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      } else if (point.label) {
        label = point.label;
      } else {
        label = `${index + 1}`;
      }
      
      ctx.fillText(label, x, height - padding.bottom + 15);
    });
    
    // Draw the line or bars based on type
    if (type === 'line') {
      // Draw line
      ctx.beginPath();
      ctx.strokeStyle = '#f97316';
      ctx.lineWidth = 3;
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      
      data.forEach((point, index) => {
        const x = padding.left + index * stepX;
        const value = point.total || point.amount || 0;
        const y = padding.top + chartHeight - ((value - minValue) / (maxValue - minValue)) * chartHeight;
        
        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      ctx.stroke();
      
      // Draw gradient under line
      const gradient = ctx.createLinearGradient(0, padding.top, 0, height - padding.bottom);
      gradient.addColorStop(0, 'rgba(249, 115, 22, 0.2)');
      gradient.addColorStop(1, 'rgba(249, 115, 22, 0.02)');
      
      ctx.beginPath();
      data.forEach((point, index) => {
        const x = padding.left + index * stepX;
        const value = point.total || point.amount || 0;
        const y = padding.top + chartHeight - ((value - minValue) / (maxValue - minValue)) * chartHeight;
        
        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      ctx.lineTo(padding.left + (data.length - 1) * stepX, height - padding.bottom);
      ctx.lineTo(padding.left, height - padding.bottom);
      ctx.fillStyle = gradient;
      ctx.fill();
      
      // Draw points
      data.forEach((point, index) => {
        const x = padding.left + index * stepX;
        const value = point.total || point.amount || 0;
        const y = padding.top + chartHeight - ((value - minValue) / (maxValue - minValue)) * chartHeight;
        
        ctx.beginPath();
        ctx.fillStyle = '#f97316';
        ctx.arc(x, y, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'white';
        ctx.arc(x, y, 2, 0, Math.PI * 2);
        ctx.fill();
      });
    } else if (type === 'bar') {
      // Draw bars
      const barWidth = stepX * 0.6;
      
      data.forEach((point, index) => {
        const x = padding.left + index * stepX - barWidth / 2;
        const value = point.total || point.amount || 0;
        const barHeight = (value / maxValue) * chartHeight;
        const y = padding.top + chartHeight - barHeight;
        
        // Bar with gradient
        const gradient = ctx.createLinearGradient(x, y, x, y + barHeight);
        gradient.addColorStop(0, '#f97316');
        gradient.addColorStop(1, '#ea580c');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(x, y, barWidth, barHeight);
        
        // Add value on top of bar
        if (value > 0) {
          ctx.fillStyle = '#374151';
          ctx.font = '10px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(`₹${value}`, x + barWidth / 2, y - 3);
        }
      });
    }
    
    // Draw Y-axis label
    ctx.save();
    ctx.translate(15, height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillStyle = '#6b7280';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Amount (₹)', 0, 0);
    ctx.restore();
  };

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp size={18} className="text-orange-500" />
          <h3 className="font-semibold text-gray-800">{title || 'Earnings Overview'}</h3>
        </div>
        <div className="h-64 flex items-center justify-center text-gray-400">
          <div className="text-center">
            <DollarSign size={40} className="mx-auto text-gray-300 mb-2" />
            <p>No earnings data available</p>
            <p className="text-sm">Complete deliveries to see earnings</p>
          </div>
        </div>
      </div>
    );
  }

  const total = totalEarnings;
  const avg = averageEarnings;
  const change = percentageChange;
  const isPositive = change >= 0;

  return (
    <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
      {/* Header with stats */}
      <div className="p-4 border-b bg-gradient-to-r from-orange-50 to-white">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <TrendingUp size={20} className="text-orange-500" />
            <h3 className="font-semibold text-gray-800">{title || 'Earnings Overview'}</h3>
          </div>
          
          {showStats && (
            <div className="flex items-center gap-4 text-sm">
              <div className="text-center">
                <p className="text-gray-400 text-xs">Total Earnings</p>
                <p className="font-bold text-gray-800">₹{total.toLocaleString()}</p>
              </div>
              <div className="w-px h-8 bg-gray-200" />
              <div className="text-center">
                <p className="text-gray-400 text-xs">Average</p>
                <p className="font-semibold text-gray-700">₹{avg.toFixed(0)}</p>
              </div>
              {change !== 0 && (
                <>
                  <div className="w-px h-8 bg-gray-200" />
                  <div className="text-center">
                    <p className="text-gray-400 text-xs">vs Last Week</p>
                    <p className={`font-semibold flex items-center gap-1 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                      {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                      {Math.abs(change).toFixed(1)}%
                    </p>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Chart */}
      <div className="p-4" ref={containerRef}>
        <canvas
          ref={canvasRef}
          style={{ width: '100%', height: `${height}px` }}
        />
      </div>
      
      {/* Footer with period info */}
      <div className="px-4 py-2 border-t bg-gray-50 flex justify-between items-center text-xs text-gray-400">
        <div className="flex items-center gap-1">
          <Calendar size={12} />
          <span>
            {data.length} {data.length === 1 ? 'record' : 'records'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-0.5 bg-orange-500 rounded"></span>
          <span>Earnings trend</span>
        </div>
      </div>
    </div>
  );
};

// Bar Chart Component
export const BarChart = ({ data, title, height = 250 }) => {
  return (
    <EarningsChart 
      data={data} 
      title={title} 
      type="bar" 
      height={height} 
      showStats={true}
    />
  );
};

// Line Chart Component
export const LineChart = ({ data, title, height = 250 }) => {
  return (
    <EarningsChart 
      data={data} 
      title={title} 
      type="line" 
      height={height} 
      showStats={true}
    />
  );
};

// Simple Stat Card Component
export const StatCard = ({ title, value, change, icon: Icon, color = 'orange' }) => {
  const colors = {
    orange: 'bg-orange-100 text-orange-600',
    green: 'bg-green-100 text-green-600',
    blue: 'bg-blue-100 text-blue-600',
    purple: 'bg-purple-100 text-purple-600',
    red: 'bg-red-100 text-red-600'
  };
  
  return (
    <div className="bg-white rounded-xl shadow-sm border p-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-gray-500 text-sm">{title}</p>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${colors[color]}`}>
          {Icon && <Icon size={16} />}
        </div>
      </div>
      <p className="text-2xl font-bold text-gray-800">₹{value?.toLocaleString() || 0}</p>
      {change !== undefined && (
        <div className={`flex items-center gap-1 mt-1 text-xs ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {change >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          <span>{Math.abs(change)}% from last period</span>
        </div>
      )}
    </div>
  );
};

export default EarningsChart;