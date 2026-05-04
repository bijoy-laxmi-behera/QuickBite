const otpTemplate=(otp)=>{
  return `
  <div style="font-family:Arial;padding:20px;">
    <h2>🔐 OTP Verification</h2>
    <p>Your OTP is:</p>
    <h1 style="color:#ff512f;">${otp}</h1>
    <p>This OTP is valid for 10 minutes.</p>
  </div>
  `;
};
const orderTemplate=(name,orderId,amount)=>{
  return `
  <h2>🛒 Order Confirmed</h2>
  <p>Hello ${name}</p>
  <p>Your order <b>#${orderId}</b> has been placed successfully.</p>
  <p>Total Amount: ₹${amount}</p>
  `;
};
const deliveryTemplate=(name,orderId)=>{
  return `
  <h2>🚚 Order Delivered</h2>
  <p>Hello ${name},</p>
  <p>Your order <b>#${orderId}</b> has been delivered successfully.</p>
  `;
};
module.exports={
  otpTemplate,
  orderTemplate,
  deliveryTemplate,
};