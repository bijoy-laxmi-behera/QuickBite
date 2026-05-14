// ─── PATCH for CustomerLayout.jsx ────────────────────────────────────────────
// Replace the order-tracking Route with this (already uses :orderId param via useParams in OrderTracking):

// BEFORE:
// <Route 
//   path="order-tracking/:orderId" 
//   element={<OrderTracking setPage={setPage} />} 
// />

// AFTER (no change needed - OrderTracking now uses useParams internally):
// <Route 
//   path="order-tracking/:orderId" 
//   element={<OrderTracking />} 
// />

// ─── PATCH for setPage "tracking" navigation ──────────────────────────────────
// In CustomerLayout.jsx setPage function, change tracking navigation:

// BEFORE:
// tracking: "/customer/order-tracking",

// AFTER:
// (tracking is now handled directly via navigate in Orders.jsx using the orderId)
// Keep existing route, but for setPage("tracking") fallback:
// tracking: `/customer/order-tracking/${localStorage.getItem("trackingOrderId") || ""}`,

// ─── CSS to add (index.css or App.css) for confetti + bounce animations ───────
// Add these keyframes:
/*
@keyframes confetti {
  0%   { transform: translateY(0) rotate(0deg); opacity: 1; }
  100% { transform: translateY(-200px) rotate(720deg); opacity: 0; }
}
.animate-confetti {
  animation: confetti 1.5s ease-out forwards;
}
@keyframes bounce-once {
  0%, 100% { transform: translateX(-50%) translateY(0); }
  50%       { transform: translateX(-50%) translateY(-8px); }
}
.animate-bounce-once {
  animation: bounce-once 0.5s ease-in-out 2;
}
*/
