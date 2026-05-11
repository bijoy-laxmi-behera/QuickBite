// delivery/components/BadgeCard.jsx
import React, { useState } from 'react';
import { Award, Crown, Medal, Star, Zap, Trophy, Sparkles, Target, Rocket, HeartHandshake, Lock } from 'lucide-react';

// Helper function to get icon based on badge name (moved outside component)
const getBadgeIcon = (badgeName, size = 22) => {
  const name = badgeName?.toLowerCase() || '';
  
  if (name.includes('rookie')) return <Zap size={size} />;
  if (name.includes('pro')) return <Award size={size} />;
  if (name.includes('elite')) return <Crown size={size} />;
  if (name.includes('gold')) return <Trophy size={size} />;
  if (name.includes('silver')) return <Medal size={size} />;
  if (name.includes('bronze')) return <Target size={size} />;
  if (name.includes('speed')) return <Rocket size={size} />;
  if (name.includes('star')) return <Star size={size} />;
  if (name.includes('perfect')) return <HeartHandshake size={size} />;
  
  return <Sparkles size={size} />;
};

// Helper function to get badge colors
const getBadgeColors = (badgeName) => {
  const name = badgeName?.toLowerCase() || '';
  
  if (name.includes('elite')) {
    return {
      bg: 'bg-gradient-to-br from-yellow-400 to-yellow-600',
      text: 'text-yellow-600',
      border: 'border-yellow-300',
      glow: 'shadow-yellow-200',
      light: 'bg-yellow-100'
    };
  }
  if (name.includes('gold')) {
    return {
      bg: 'bg-gradient-to-br from-amber-400 to-amber-600',
      text: 'text-amber-600',
      border: 'border-amber-300',
      glow: 'shadow-amber-200',
      light: 'bg-amber-100'
    };
  }
  if (name.includes('pro')) {
    return {
      bg: 'bg-gradient-to-br from-purple-400 to-purple-600',
      text: 'text-purple-600',
      border: 'border-purple-300',
      glow: 'shadow-purple-200',
      light: 'bg-purple-100'
    };
  }
  if (name.includes('rookie')) {
    return {
      bg: 'bg-gradient-to-br from-blue-400 to-blue-600',
      text: 'text-blue-600',
      border: 'border-blue-300',
      glow: 'shadow-blue-200',
      light: 'bg-blue-100'
    };
  }
  if (name.includes('silver')) {
    return {
      bg: 'bg-gradient-to-br from-gray-400 to-gray-600',
      text: 'text-gray-600',
      border: 'border-gray-300',
      glow: 'shadow-gray-200',
      light: 'bg-gray-100'
    };
  }
  if (name.includes('speed')) {
    return {
      bg: 'bg-gradient-to-br from-red-400 to-red-600',
      text: 'text-red-600',
      border: 'border-red-300',
      glow: 'shadow-red-200',
      light: 'bg-red-100'
    };
  }
  
  return {
    bg: 'bg-gradient-to-br from-orange-400 to-orange-600',
    text: 'text-orange-600',
    border: 'border-orange-300',
    glow: 'shadow-orange-200',
    light: 'bg-orange-100'
  };
};

// Helper function to get requirement text
const getRequirementText = (badge) => {
  if (badge.requirement) return badge.requirement;
  
  const name = badge.name?.toLowerCase() || '';
  
  if (name.includes('rookie')) return 'Complete 10 deliveries';
  if (name.includes('pro')) return 'Complete 50 deliveries';
  if (name.includes('elite')) return 'Complete 100 deliveries';
  if (name.includes('gold')) return 'Maintain 4.8+ rating';
  if (name.includes('speed')) return 'Deliver 20 orders in under 25 mins';
  if (name.includes('perfect')) return '100% on-time delivery for 30 days';
  
  return 'Complete special achievements';
};

// Size classes
const sizeClasses = {
  sm: {
    container: 'p-3',
    icon: 'w-12 h-12',
    title: 'text-sm',
    description: 'text-xs'
  },
  md: {
    container: 'p-4',
    icon: 'w-16 h-16',
    title: 'text-base',
    description: 'text-xs'
  },
  lg: {
    container: 'p-5',
    icon: 'w-20 h-20',
    title: 'text-lg',
    description: 'text-sm'
  }
};

const BadgeCard = ({ badge, earned = true, earnedDate, size = 'md', onClick }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  
  if (!badge) return null;
  
  const colors = getBadgeColors(badge.name);
  const currentSize = sizeClasses[size];
  const iconSize = size === 'sm' ? 16 : size === 'lg' ? 28 : 22;
  const Icon = getBadgeIcon(badge.name, iconSize);
  const isEarned = earned && (badge.earned !== false);
  const progress = badge.progress || (isEarned ? 100 : 0);
  const requirementText = getRequirementText(badge);

  // Earned Badge Card
  if (isEarned) {
    return (
      <div 
        onClick={onClick}
        className={`relative ${colors.light} rounded-xl border ${colors.border} ${currentSize.container} text-center cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg ${colors.glow}`}
      >
        {/* Animated shine effect */}
        <div className="absolute inset-0 overflow-hidden rounded-xl">
          <div className="absolute inset-0 -translate-x-full animate-shine bg-gradient-to-r from-transparent via-white/30 to-transparent" />
        </div>
        
        {/* Badge Icon */}
        <div className={`${colors.bg} ${currentSize.icon} rounded-full flex items-center justify-center mx-auto mb-2 shadow-lg`}>
          <div className="text-white">
            {Icon}
          </div>
        </div>
        
        {/* Badge Name */}
        <h3 className={`font-bold ${colors.text} ${currentSize.title}`}>
          {badge.name}
        </h3>
        
        {/* Earned Date */}
        {earnedDate && (
          <p className={`${currentSize.description} text-gray-500 mt-1`}>
            Earned on {new Date(earnedDate).toLocaleDateString()}
          </p>
        )}
        
        {/* Description */}
        {badge.description && (
          <p className={`${currentSize.description} text-gray-500 mt-1`}>
            {badge.description}
          </p>
        )}
        
        {/* Checkmark for earned */}
        <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shadow-md">
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      </div>
    );
  }

  // Locked Badge Card
  return (
    <div 
      onClick={onClick}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      className={`relative bg-gray-50 rounded-xl border border-gray-200 ${currentSize.container} text-center cursor-pointer transition-all duration-300 hover:shadow-md opacity-70`}
    >
      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded-lg px-3 py-1.5 whitespace-nowrap z-10">
          {requirementText}
          <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-800 rotate-45"></div>
        </div>
      )}
      
      {/* Badge Icon (grayscale) */}
      <div className={`bg-gray-300 ${currentSize.icon} rounded-full flex items-center justify-center mx-auto mb-2`}>
        <div className="text-gray-500">
          {Icon}
        </div>
      </div>
      
      {/* Badge Name */}
      <h3 className={`font-semibold text-gray-500 ${currentSize.title}`}>
        {badge.name}
      </h3>
      
      {/* Lock Icon */}
      <div className="flex justify-center mt-1">
        <Lock size={16} className="text-gray-400" />
      </div>
      
      {/* Progress Bar */}
      {progress > 0 && progress < 100 && (
        <div className="mt-3">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-orange-500 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

// Badge Collection Component
export const BadgeCollection = ({ badges, title = "My Badges", earnedCount, totalCount, onBadgeClick }) => {
  const earned = earnedCount || badges?.filter(b => b.earned !== false).length || 0;
  const total = totalCount || badges?.length || 0;
  
  if (!badges || badges.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="px-4 py-3 border-b bg-gradient-to-r from-orange-50 to-white">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Award size={20} className="text-orange-500" />
              <h2 className="font-semibold text-gray-800">{title}</h2>
            </div>
            <div className="text-sm">
              <span className="font-bold text-orange-600">0</span>
              <span className="text-gray-400">/{total || 0}</span>
            </div>
          </div>
        </div>
        <div className="p-8 text-center">
          <Award size={48} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500">No badges earned yet</p>
          <p className="text-sm text-gray-400 mt-1">Complete deliveries to earn badges</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
      <div className="px-4 py-3 border-b bg-gradient-to-r from-orange-50 to-white">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Award size={20} className="text-orange-500" />
            <h2 className="font-semibold text-gray-800">{title}</h2>
          </div>
          <div className="text-sm">
            <span className="font-bold text-orange-600">{earned}</span>
            <span className="text-gray-400">/{total}</span>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="mt-2">
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-orange-500 to-orange-600 rounded-full transition-all duration-500"
              style={{ width: `${(earned / total) * 100}%` }}
            />
          </div>
        </div>
      </div>
      
      <div className="p-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {badges.map((badge, index) => (
            <BadgeCard
              key={badge._id || badge.name || index}
              badge={badge}
              earned={badge.earned !== false}
              earnedDate={badge.earnedDate}
              size="sm"
              onClick={() => onBadgeClick?.(badge)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

// Badge Detail Modal Component
export const BadgeDetailModal = ({ badge, onClose }) => {
  if (!badge) return null;
  
  const colors = getBadgeColors(badge.name);
  const Icon = getBadgeIcon(badge.name, 32);
  const isEarned = badge.earned !== false;
  
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden animate-scale-in" onClick={(e) => e.stopPropagation()}>
        {/* Header with badge icon */}
        <div className={`${colors.light} p-6 text-center`}>
          <div className={`${colors.bg} w-24 h-24 rounded-full flex items-center justify-center mx-auto shadow-lg`}>
            <div className="text-white">
              {Icon}
            </div>
          </div>
          <h2 className={`text-xl font-bold ${colors.text} mt-3`}>{badge.name}</h2>
          {isEarned && badge.earnedDate && (
            <p className="text-sm text-gray-500 mt-1">
              Earned on {new Date(badge.earnedDate).toLocaleDateString()}
            </p>
          )}
        </div>
        
        {/* Body */}
        <div className="p-6">
          <div className="space-y-4">
            {/* Description */}
            {badge.description && (
              <div>
                <h3 className="font-semibold text-gray-800 mb-1">Description</h3>
                <p className="text-gray-600 text-sm">{badge.description}</p>
              </div>
            )}
            
            {/* Requirement */}
            <div>
              <h3 className="font-semibold text-gray-800 mb-1">How to Earn</h3>
              <p className="text-gray-600 text-sm">
                {badge.requirement || getRequirementText(badge)}
              </p>
            </div>
            
            {/* Reward */}
            {badge.reward && (
              <div>
                <h3 className="font-semibold text-gray-800 mb-1">Reward</h3>
                <p className="text-green-600 text-sm font-medium">{badge.reward}</p>
              </div>
            )}
            
            {/* Progress */}
            {!isEarned && badge.progress && (
              <div>
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Progress</span>
                  <span>{Math.round(badge.progress)}%</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-orange-500 rounded-full transition-all"
                    style={{ width: `${badge.progress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
          
          {/* Close Button */}
          <button
            onClick={onClose}
            className="w-full mt-6 py-2 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// Add CSS animations (only once)
const styles = `
  @keyframes shine {
    from {
      transform: translateX(-100%);
    }
    to {
      transform: translateX(100%);
    }
  }
  
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  @keyframes scaleIn {
    from {
      opacity: 0;
      transform: scale(0.95);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }
  
  .animate-shine {
    animation: shine 3s infinite;
  }
  
  .animate-fade-in {
    animation: fadeIn 0.2s ease-out;
  }
  
  .animate-scale-in {
    animation: scaleIn 0.2s ease-out;
  }
`;

// Inject styles if not already present
if (typeof document !== 'undefined' && !document.querySelector('#badge-card-styles')) {
  const styleSheet = document.createElement('style');
  styleSheet.id = 'badge-card-styles';
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}

export default BadgeCard;