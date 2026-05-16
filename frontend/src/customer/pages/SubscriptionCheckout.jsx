// src/customer/pages/SubscriptionCheckout.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../services/axios";
import {
  FaStar, FaClock, FaCheck, FaLeaf, FaDrumstickBite,
  FaMapMarkerAlt, FaSpinner, FaChevronRight, FaArrowLeft,
} from "react-icons/fa";
import { MdRestaurant } from "react-icons/md";

const PLAN_PRICES = { weekly: 699, monthly: 2499 };
const LUNCH_SLOTS  = ["11:30 AM – 12:30 PM","12:00 PM – 1:00 PM","12:30 PM – 1:30 PM","1:00 PM – 2:00 PM"];
const DINNER_SLOTS = ["6:30 PM – 7:30 PM","7:00 PM – 8:00 PM","7:30 PM – 8:30 PM","8:00 PM – 9:00 PM"];

const STEPS = ["Choose Kitchen","Your Details","Payment"];

export default function SubscriptionCheckout() {
  const navigate  = useNavigate();
  const plan      = sessionStorage.getItem("chosenPlan") || "monthly";
  const price     = PLAN_PRICES[plan];

  const [step, setStep]               = useState(0); // 0=kitchen 1=details 2=payment
  const [kitchens, setKitchens]       = useState([]);
  const [selectedKitchen, setSelectedKitchen] = useState(null);
  const [loading, setLoading]         = useState(true);
  const [submitting, setSubmitting]   = useState(false);

  // customer details
  const [form, setForm] = useState({
    name:"", phone:"", address:"", city:"", pincode:"",
    mealType:"veg", lunchSlot: "12:00 PM – 1:00 PM", dinnerSlot: "7:00 PM – 8:00 PM", coupon:"",
  });
  const [discount, setDiscount]   = useState(0);
  const [couponMsg, setCouponMsg] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);

  // ── Fetch cloud kitchens ───────────────────────────────────────────────────
  useEffect(() => {
    const fetchKitchens = async () => {
  try {
    const { data } = await API.get("/customer/restaurants");
    const list = data.data || data.restaurants || [];
    // ✅ Only Cloud Kitchens — never show regular restaurants
    const cloudKitchens = list.filter(r =>
      (r.type || "").toLowerCase().includes("cloud")
    );
    setKitchens(cloudKitchens);
      } catch {
        setKitchens([]);
      } finally {
        setLoading(false);
      }
    };
    fetchKitchens();

    // Pre-fill name & phone from localStorage
    try {
      const u = JSON.parse(localStorage.getItem("user") || "{}");
      if (u.name)  setForm(p => ({ ...p, name:  u.name  }));
      if (u.phone) setForm(p => ({ ...p, phone: u.phone }));
    } catch {}
  }, []);

  const field = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const applyCoupon = async () => {
    if (!form.coupon.trim()) return;
    try {
      const { data } = await API.post("/customer/subscription/apply-coupon", { code: form.coupon, planType: plan });
      if (data.success) {
        setDiscount(data.data.discount || 10);
        setCouponApplied(true);
        setCouponMsg(`✅ ${data.data.discount || 10}% off applied!`);
      }
    } catch {
      setDiscount(0);
      setCouponApplied(false);
      setCouponMsg("❌ Invalid coupon code");
    }
  };

  const finalPrice = Math.round(price - price * discount / 100);

  // ── Load Razorpay script dynamically ──────────────────────────────────────
  const loadRazorpayScript = () =>
    new Promise((resolve) => {
      if (window.Razorpay) { resolve(true); return; }
      const s = document.createElement("script");
      s.src = "https://checkout.razorpay.com/v1/checkout.js";
      s.onload  = () => resolve(true);
      s.onerror = () => resolve(false);
      document.body.appendChild(s);
    });

  // ── Razorpay payment ───────────────────────────────────────────────────────
  const handlePayment = async () => {
    if (!form.name || !form.phone || !form.address) {
      alert("Please fill all required fields");
      return;
    }
    setSubmitting(true);

    // 0. Ensure script loaded
    const loaded = await loadRazorpayScript();
    if (!loaded) {
      alert("Failed to load payment gateway. Check your internet connection.");
      setSubmitting(false);
      return;
    }

    const rzpKey = import.meta.env.VITE_RAZORPAY_KEY;
    if (!rzpKey) {
      alert("Razorpay key missing. Add VITE_RAZORPAY_KEY to your frontend .env file.");
      setSubmitting(false);
      return;
    }

    try {
      // 1. Create Razorpay order on backend
      const { data: orderData } = await API.post("/customer/payments/create-razorpay-order", {
        amount: finalPrice,
        receipt: `sub_${Date.now()}`,
      });
      const rzpOrder = orderData.data;

      // 2. Open Razorpay modal
      const options = {
        key: rzpKey,
        amount:      rzpOrder.amount,
        currency:    "INR",
        name:        "QuickBite Subscription",
        description: `${plan.charAt(0).toUpperCase() + plan.slice(1)} Meal Plan`,
        order_id:    rzpOrder.id,
        prefill: {
          name:    form.name,
          contact: form.phone,
        },
        theme: { color: "#f97316" },
        config: {
          display: {
            blocks: {
              utib: { name: "Pay via UPI", instruments: [{ method: "upi" }] },
            },
            sequence: ["block.utib"],
            preferences: { show_default_blocks: true },
          },
        },
        handler: async (response) => {
          try {
            // 3. Verify + create subscription
            await API.post("/customer/subscription/create", {
              planType:           plan,
              duration:           plan === "weekly" ? 7 : 30,
              mealType:           form.mealType,
              lunchSlot:         form.lunchSlot,
              dinnerSlot:        form.dinnerSlot,
              couponCode:         couponApplied ? form.coupon : undefined,
              kitchenId:          selectedKitchen._id,
              address:            form.address,
              city:               form.city,
              pincode:            form.pincode,
              razorpayOrderId:    response.razorpay_order_id,
              razorpayPaymentId:  response.razorpay_payment_id,
              razorpaySignature:  response.razorpay_signature,
            });

            // Store for success page + mark sidebar
            sessionStorage.setItem("subKitchen", JSON.stringify(selectedKitchen));
            sessionStorage.setItem("subDetails", JSON.stringify({ ...form, plan, price: finalPrice }));
            localStorage.setItem("hasSubscription", "true");
            navigate("/customer/subscription-success");
          } catch (subErr) {
            console.error("Subscription creation error:", subErr);
            const msg = subErr?.response?.data?.message || subErr?.message || "Unknown error";
            alert(`Subscription creation failed: ${msg}\n\nCheck backend console for details.`);
          }
        },
        modal: { ondismiss: () => setSubmitting(false) },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      alert(err.response?.data?.message || "Payment initiation failed");
      setSubmitting(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 pb-12">

      {/* Top bar */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
          <button onClick={() => step === 0 ? navigate(-1) : setStep(s => s - 1)}
            className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-gray-100 transition text-gray-500">
            <FaArrowLeft size={14} />
          </button>
          <div className="flex-1">
            <p className="text-xs text-gray-400 font-medium">
              {plan.charAt(0).toUpperCase() + plan.slice(1)} Plan · ₹{finalPrice}
            </p>
            <h1 className="text-base font-black text-gray-800">{STEPS[step]}</h1>
          </div>
          {/* Step pills */}
          <div className="flex gap-1.5">
            {STEPS.map((_, i) => (
              <div key={i} className={`h-2 rounded-full transition-all duration-300 ${i <= step ? "bg-orange-500 w-6" : "bg-gray-200 w-2"}`} />
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">

        {/* ════ STEP 0: KITCHEN SELECTION ════ */}
        {step === 0 && (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h2 className="text-xl font-black text-gray-800">Pick Your Kitchen</h2>
              <p className="text-gray-400 text-sm mt-1">Choose the cloud kitchen that will prepare your daily meals</p>
            </div>

            {loading ? (
              <div className="flex justify-center py-16">
                <FaSpinner className="animate-spin text-orange-500 text-3xl" />
              </div>
            ) : kitchens.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
                <MdRestaurant className="text-5xl text-gray-300 mx-auto mb-3" />
                <p className="text-gray-400 font-medium">No cloud kitchens available</p>
              </div>
            ) : (
              kitchens.map(k => {
                const isSelected = selectedKitchen?._id === k._id;
                return (
                  <div key={k._id} onClick={() => setSelectedKitchen(k)}
                    className={`bg-white rounded-2xl border-2 overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-lg ${
                      isSelected ? "border-orange-400 shadow-lg shadow-orange-100" : "border-gray-100 shadow-sm"
                    }`}>
                    <div className="flex gap-4 p-4">
                      {/* Kitchen image */}
                      <div className="relative w-24 h-24 rounded-xl overflow-hidden flex-shrink-0">
                        <img src={k.image || k.logo || "https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=300&q=80"}
                          alt={k.name} className="w-full h-full object-cover" />
                        {isSelected && (
                          <div className="absolute inset-0 bg-orange-500/20 flex items-center justify-center">
                            <div className="w-7 h-7 bg-orange-500 rounded-full flex items-center justify-center">
                              <FaCheck className="text-white text-xs" />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-black text-gray-800 text-sm leading-tight">{k.name}</h3>
                          <span className="text-[10px] bg-purple-100 text-purple-700 font-bold px-2 py-0.5 rounded-full flex-shrink-0">
                            Cloud Kitchen
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5 truncate">
                          {Array.isArray(k.cuisine) ? k.cuisine.join(", ") : k.cuisine || "Multi-Cuisine"}
                        </p>

                        <div className="flex items-center gap-3 mt-2">
                          <div className="flex items-center gap-1 text-xs text-gray-600">
                            <FaStar className="text-yellow-400 text-[10px]" />
                            <span className="font-semibold">{k.rating || "4.2"}</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-gray-400">
                            <FaClock className="text-[10px]" />
                            {k.deliveryTime || 30} min
                          </div>
                          {k.minOrder && (
                            <div className="text-xs text-gray-400">Min ₹{k.minOrder}</div>
                          )}
                        </div>

                        {k.description && (
                          <p className="text-xs text-gray-400 mt-1.5 line-clamp-2 leading-relaxed">{k.description}</p>
                        )}
                      </div>
                    </div>

                    {isSelected && (
                      <div className="bg-orange-50 border-t border-orange-100 px-4 py-2 flex items-center gap-2">
                        <FaCheck className="text-orange-500 text-xs" />
                        <span className="text-xs font-bold text-orange-600">Selected — your daily meals will come from here</span>
                      </div>
                    )}
                  </div>
                );
              })
            )}

            <button
              onClick={() => { if (!selectedKitchen) { alert("Please select a kitchen"); return; } setStep(1); }}
              disabled={!selectedKitchen || loading}
              className="w-full mt-2 py-4 bg-gradient-to-r from-orange-500 to-amber-400 hover:from-orange-600 text-white font-black text-base rounded-2xl shadow-xl shadow-orange-200 transition disabled:opacity-40 flex items-center justify-center gap-2">
              Continue <FaChevronRight size={12} />
            </button>
          </div>
        )}

        {/* ════ STEP 1: CUSTOMER DETAILS ════ */}
        {step === 1 && (
          <div className="space-y-5">
            {/* Selected kitchen recap */}
            <div className="flex items-center gap-3 bg-orange-50 border border-orange-100 rounded-2xl px-4 py-3">
              <img src={selectedKitchen?.image || selectedKitchen?.logo || "https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=100&q=80"}
                alt="" className="w-10 h-10 rounded-lg object-cover" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-400 font-medium">Your Kitchen</p>
                <p className="text-sm font-black text-gray-800 truncate">{selectedKitchen?.name}</p>
              </div>
              <button onClick={() => setStep(0)} className="text-xs text-orange-500 font-semibold">Change</button>
            </div>

            {/* Name + phone */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4 shadow-sm">
              <h3 className="font-black text-sm text-gray-700">Contact Info</h3>
              {[
                { label:"Full Name *",    key:"name",  type:"text", placeholder:"Your name" },
                { label:"Phone Number *", key:"phone", type:"tel",  placeholder:"10-digit mobile" },
              ].map(({ label, key, type, placeholder }) => (
                <div key={key}>
                  <label className="text-xs text-gray-500 font-semibold uppercase tracking-wide">{label}</label>
                  <input type={type} value={form[key]} onChange={e => field(key, e.target.value)}
                    placeholder={placeholder}
                    className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-3 text-sm focus:outline-none focus:border-orange-400 transition" />
                </div>
              ))}
            </div>

            {/* Address */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4 shadow-sm">
              <h3 className="font-black text-sm text-gray-700 flex items-center gap-2">
                <FaMapMarkerAlt className="text-orange-500" /> Delivery Address
              </h3>
              <div>
                <label className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Street Address *</label>
                <textarea rows={2} value={form.address} onChange={e => field("address", e.target.value)}
                  placeholder="House no, street, area..."
                  className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-3 text-sm focus:outline-none focus:border-orange-400 transition resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label:"City", key:"city", placeholder:"City" },
                  { label:"Pincode", key:"pincode", placeholder:"Pincode" },
                ].map(({ label, key, placeholder }) => (
                  <div key={key}>
                    <label className="text-xs text-gray-500 font-semibold uppercase tracking-wide">{label}</label>
                    <input type="text" value={form[key]} onChange={e => field(key, e.target.value)}
                      placeholder={placeholder}
                      className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-3 text-sm focus:outline-none focus:border-orange-400 transition" />
                  </div>
                ))}
              </div>
            </div>

            {/* Meal type */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <h3 className="font-black text-sm text-gray-700 mb-3">Meal Preference</h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { val:"veg",     label:"Vegetarian",     icon:<FaLeaf className="text-green-500" />,       border:"border-green-400", bg:"bg-green-50" },
                  { val:"non-veg", label:"Non-Vegetarian", icon:<FaDrumstickBite className="text-red-500" />, border:"border-red-400",   bg:"bg-red-50"   },
                ].map(opt => (
                  <button key={opt.val} onClick={() => field("mealType", opt.val)}
                    className={`flex flex-col items-center gap-2 py-4 rounded-2xl border-2 transition-all text-sm font-bold ${
                      form.mealType === opt.val ? `${opt.bg} ${opt.border} text-gray-800` : "border-gray-100 bg-gray-50 text-gray-500"
                    }`}>
                    <span className="text-xl">{opt.icon}</span>
                    {opt.label}
                    {form.mealType === opt.val && <FaCheck className="text-xs text-green-600" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Delivery slots — Lunch + Dinner (both required) */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-5">
              <h3 className="font-black text-sm text-gray-700 flex items-center gap-2">
                <FaClock className="text-orange-500" /> Delivery Slots
                <span className="text-[10px] text-gray-400 font-medium ml-1">(Select both)</span>
              </h3>

              {/* LUNCH */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-base">🌤️</span>
                  <p className="text-xs font-black text-gray-700 uppercase tracking-widest">Lunch</p>
                  {form.lunchSlot && (
                    <span className="ml-auto text-[10px] bg-orange-100 text-orange-600 font-bold px-2 py-0.5 rounded-full">
                      {form.lunchSlot}
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {LUNCH_SLOTS.map(s => (
                    <button key={s} onClick={() => field("lunchSlot", s)}
                      className={`px-3 py-2.5 rounded-xl border-2 text-xs font-semibold text-left transition-all duration-150 flex items-center justify-between ${
                        form.lunchSlot === s
                          ? "border-orange-400 bg-orange-50 text-orange-600"
                          : "border-gray-100 text-gray-600 hover:border-orange-200"
                      }`}>
                      <span>{s}</span>
                      {form.lunchSlot === s && <FaCheck className="text-orange-500 text-[9px] flex-shrink-0 ml-1" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Divider */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-gray-100" />
                <span className="text-xs text-gray-400 font-medium">and</span>
                <div className="flex-1 h-px bg-gray-100" />
              </div>

              {/* DINNER */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-base">🌙</span>
                  <p className="text-xs font-black text-gray-700 uppercase tracking-widest">Dinner</p>
                  {form.dinnerSlot && (
                    <span className="ml-auto text-[10px] bg-blue-100 text-blue-600 font-bold px-2 py-0.5 rounded-full">
                      {form.dinnerSlot}
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {DINNER_SLOTS.map(s => (
                    <button key={s} onClick={() => field("dinnerSlot", s)}
                      className={`px-3 py-2.5 rounded-xl border-2 text-xs font-semibold text-left transition-all duration-150 flex items-center justify-between ${
                        form.dinnerSlot === s
                          ? "border-blue-400 bg-blue-50 text-blue-600"
                          : "border-gray-100 text-gray-600 hover:border-blue-200"
                      }`}>
                      <span>{s}</span>
                      {form.dinnerSlot === s && <FaCheck className="text-blue-500 text-[9px] flex-shrink-0 ml-1" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Summary pill */}
              {form.lunchSlot && form.dinnerSlot && (
                <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-2.5 flex items-center gap-2">
                  <FaCheck className="text-green-500 text-xs flex-shrink-0" />
                  <p className="text-xs text-green-700 font-semibold">
                    Lunch {form.lunchSlot} {" & "} Dinner {form.dinnerSlot}
                  </p>
                </div>
              )}
            </div>

            {/* Coupon */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <h3 className="font-black text-sm text-gray-700 mb-3">🎫 Coupon Code</h3>
              <div className="flex gap-2">
                <input value={form.coupon} onChange={e => field("coupon", e.target.value)}
                  disabled={couponApplied}
                  placeholder="Enter coupon code"
                  className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-orange-400 disabled:bg-gray-50 transition" />
                <button onClick={couponApplied ? () => { setDiscount(0); setCouponApplied(false); setCouponMsg(""); field("coupon",""); } : applyCoupon}
                  className={`px-4 rounded-xl text-sm font-bold transition ${
                    couponApplied ? "bg-gray-200 text-gray-600" : "bg-orange-500 text-white hover:bg-orange-600"
                  }`}>
                  {couponApplied ? "Remove" : "Apply"}
                </button>
              </div>
              {couponMsg && <p className="text-xs mt-2 font-medium text-gray-600">{couponMsg}</p>}
            </div>

            {/* Price summary */}
            <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4">
              <div className="flex justify-between text-sm mb-1.5">
                <span className="text-gray-500">{plan.charAt(0).toUpperCase() + plan.slice(1)} Plan</span>
                <span className="font-semibold text-gray-700">₹{price}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-green-600">Coupon Discount ({discount}%)</span>
                  <span className="font-semibold text-green-600">- ₹{price - finalPrice}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-black border-t border-orange-200 pt-2 mt-2">
                <span className="text-gray-800">Total</span>
                <span className="text-orange-500">₹{finalPrice}</span>
              </div>
            </div>

            <button onClick={() => {
                if (!form.name || !form.phone || !form.address) { alert("Please fill Name, Phone and Address"); return; }
                if (!form.lunchSlot || !form.dinnerSlot) { alert("Please select both a Lunch and Dinner delivery slot"); return; }
                setStep(2);
              }}
              className="w-full py-4 bg-gradient-to-r from-orange-500 to-amber-400 hover:from-orange-600 text-white font-black text-base rounded-2xl shadow-xl shadow-orange-200 transition flex items-center justify-center gap-2">
              Review & Pay <FaChevronRight size={12} />
            </button>
          </div>
        )}

        {/* ════ STEP 2: PAYMENT REVIEW ════ */}
        {step === 2 && (
          <div className="space-y-5">
            <div className="text-center mb-2">
              <h2 className="text-xl font-black text-gray-800">Review & Pay</h2>
              <p className="text-gray-400 text-sm mt-1">Everything look good? Complete your subscription.</p>
            </div>

            {/* Kitchen */}
            <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-3">Your Kitchen</p>
              <div className="flex items-center gap-3">
                <img src={selectedKitchen?.image || selectedKitchen?.logo || "https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=100&q=80"}
                  alt="" className="w-14 h-14 rounded-xl object-cover" />
                <div>
                  <p className="font-black text-gray-800">{selectedKitchen?.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {Array.isArray(selectedKitchen?.cuisine) ? selectedKitchen.cuisine.join(", ") : selectedKitchen?.cuisine || "Multi-Cuisine"}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <FaStar className="text-yellow-400 text-[10px]" />
                    <span className="text-xs font-semibold text-gray-600">{selectedKitchen?.rating || "4.2"}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Details summary */}
            <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm space-y-3">
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Your Details</p>
              {[
                { label:"Name",      value: form.name },
                { label:"Phone",     value: form.phone },
                { label:"Address",   value: `${form.address}${form.city ? ", " + form.city : ""}${form.pincode ? " - " + form.pincode : ""}` },
                { label:"Meal",      value: form.mealType === "veg" ? "🥗 Vegetarian" : "🍗 Non-Vegetarian" },
                { label:"Lunch Slot",  value: form.lunchSlot },
                { label:"Dinner Slot", value: form.dinnerSlot },
                { label:"Plan",      value: `${plan.charAt(0).toUpperCase() + plan.slice(1)} · ${plan === "weekly" ? "7 days" : "30 days"}` },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between items-start gap-4 text-sm">
                  <span className="text-gray-400 flex-shrink-0">{label}</span>
                  <span className="font-semibold text-gray-700 text-right">{value || "—"}</span>
                </div>
              ))}
            </div>

            {/* Amount */}
            <div className="bg-gradient-to-r from-orange-500 to-amber-400 rounded-2xl p-5 text-white">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-white/80 text-sm">Total Amount</p>
                  <p className="text-3xl font-black">₹{finalPrice}</p>
                  {discount > 0 && <p className="text-white/70 text-xs line-through mt-0.5">₹{price}</p>}
                </div>
                <div className="text-right">
                  <p className="text-white/80 text-xs">via Razorpay</p>
                  <p className="text-white font-bold text-sm mt-0.5">Secure Payment 🔒</p>
                </div>
              </div>
            </div>

            <button onClick={handlePayment} disabled={submitting}
              className="w-full py-4 bg-gradient-to-r from-orange-500 to-amber-400 hover:from-orange-600 text-white font-black text-lg rounded-2xl shadow-xl shadow-orange-200 transition disabled:opacity-60 flex items-center justify-center gap-2">
              {submitting ? <><FaSpinner className="animate-spin" /> Processing...</> : <>Pay ₹{finalPrice} & Subscribe</>}
            </button>

            <p className="text-center text-xs text-gray-400">
              🔒 Secured by Razorpay · Cancel anytime · No hidden charges
            </p>
          </div>
        )}
      </div>
    </div>
  );
}