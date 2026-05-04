import { useState, useEffect } from "react";
import { FaUser, FaEnvelope, FaPhone, FaCamera, FaSignOutAlt, FaTrash, FaChevronRight } from "react-icons/fa";

const menuItems = [
  { icon: "📦", label: "My Orders",     page: "orders" },
  { icon: "❤️", label: "Favourites",    page: "favourites" },
  { icon: "📍", label: "My Addresses",  page: "addresses" },
  { icon: "💳", label: "Payments",      page: "payments" },
  { icon: "⭐", label: "Reviews",       page: "reviews" },
  { icon: "🔔", label: "Notifications", page: "notifications" },
];

function Profile({ setPage }) {
  const [user, setUser] = useState({ name: "", email: "", phone: "" });
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem("user") || "{}");
    setUser({ name: u.name || "Foodie", email: u.email || "", phone: u.phone || "" });
  }, []);

  const handleUpdate = () => {
    localStorage.setItem("user", JSON.stringify(user));
    setEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleDelete = () => {
    if (window.confirm("Delete your account? This cannot be undone.")) {
      localStorage.removeItem("user");
      window.location.reload();
    }
  };

  const initials = user.name ? user.name.slice(0, 2).toUpperCase() : "QB";

  return (
    <div className="bg-gray-50 min-h-screen pb-8">
      <div className="max-w-md mx-auto px-4 pt-4">

        {/* AVATAR CARD */}
        <div className="bg-gradient-to-br from-orange-500 to-yellow-400 rounded-3xl p-6 mb-5 text-white shadow-xl">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-full flex items-center justify-center text-2xl font-extrabold shadow-lg">
                {initials}
              </div>
              <button className="absolute -bottom-1 -right-1 w-6 h-6 bg-white text-orange-500 rounded-full flex items-center justify-center shadow">
                <FaCamera className="text-[10px]" />
              </button>
            </div>
            <div className="flex-1">
              <h2 className="font-extrabold text-lg">{user.name || "Set your name"}</h2>
              <p className="text-white/80 text-sm">{user.email || "No email set"}</p>
            </div>
            <button
              onClick={() => setEditing(!editing)}
              className="bg-white/20 hover:bg-white/30 transition text-white text-xs font-semibold px-3 py-1.5 rounded-full"
            >
              {editing ? "Cancel" : "Edit"}
            </button>
          </div>
        </div>

        {/* EDIT FORM */}
        {editing && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-4">
            <h3 className="font-bold text-sm text-gray-700 mb-3">Edit Profile</h3>
            <div className="space-y-3">
              {[
                { icon: <FaUser />, key: "name",  placeholder: "Your name",  type: "text" },
                { icon: <FaEnvelope />, key: "email", placeholder: "Email address", type: "email" },
                { icon: <FaPhone />, key: "phone", placeholder: "Phone number",   type: "tel" },
              ].map(({ icon, key, placeholder, type }) => (
                <div key={key} className="flex items-center gap-3 border border-gray-200 rounded-xl px-3 focus-within:border-orange-400 transition">
                  <span className="text-gray-400 text-sm">{icon}</span>
                  <input
                    type={type}
                    placeholder={placeholder}
                    value={user[key]}
                    onChange={(e) => setUser({ ...user, [key]: e.target.value })}
                    className="flex-1 py-2.5 text-sm outline-none bg-transparent"
                  />
                </div>
              ))}
            </div>
            <button
              onClick={handleUpdate}
              className="w-full mt-4 bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl font-bold transition"
            >
              {saved ? "✅ Saved!" : "Save Changes"}
            </button>
          </div>
        )}

        {/* MENU */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-4">
          {menuItems.map((item, idx) => (
            <button
              key={item.page}
              onClick={() => setPage && setPage(item.page)}
              className={`w-full flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 transition text-left ${idx < menuItems.length - 1 ? "border-b border-gray-50" : ""}`}
            >
              <span className="text-lg w-7 text-center">{item.icon}</span>
              <span className="flex-1 text-sm font-semibold text-gray-700">{item.label}</span>
              <FaChevronRight className="text-gray-300 text-xs" />
            </button>
          ))}
        </div>

        {/* DANGER ZONE */}
        <div className="bg-white rounded-2xl shadow-sm border border-red-50 overflow-hidden">
          <button className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-red-50 transition border-b border-red-50">
            <FaSignOutAlt className="text-red-400 w-7 text-center" />
            <span className="flex-1 text-sm font-semibold text-red-500">Logout</span>
          </button>
          <button
            onClick={handleDelete}
            className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-red-50 transition"
          >
            <FaTrash className="text-red-400 w-7 text-center" />
            <span className="flex-1 text-sm font-semibold text-red-500">Delete Account</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default Profile;