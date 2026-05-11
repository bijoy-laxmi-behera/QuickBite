// services/helpers.js
export const triggerCartUpdate = () => {
  window.dispatchEvent(new CustomEvent('cartUpdated'));
};