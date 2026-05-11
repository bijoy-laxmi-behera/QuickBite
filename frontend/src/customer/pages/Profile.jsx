import { useState, useEffect } from "react";
import { FaUser, FaEnvelope, FaPhone, FaCamera, FaSignOutAlt, FaTrash, FaChevronRight, FaSpinner } from "react-icons/fa";
import API from "../../services/axios"; // ADDED: Import axios config
import { useNavigate } from "react-router-dom"; // ADDED: For navigation after logout

const menuItems = [
  { icon: "📦", label: "My Orders",     page: "orders" },
  { icon: "❤️", label: "Favourites",    page: "favourites" },
  { icon: "📍", label: "My Addresses",  page: "addresses" },
  { icon: "💳", label: "Payments",      page: "payments" },
  { icon: "⭐", label: "Reviews",       page: "reviews" },
  { icon: "🔔", label: "Notifications", page: "notifications" },
];

function Profile({ setPage }) {
  const navigate = useNavigate();
  const [user, setUser] = useState({ name: "", email: "", phone: "", avatar: "" });
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);

  // ADDED: Fetch user profile from backend
  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await API.get("/customer/me");
        
        if (response.data.success) {
          const userData = response.data.data;
          setUser({
            name: userData.name || "",
            email: userData.email || "",
            phone: userData.phone || "",
            avatar: userData.avatar || "",
            _id: userData._id,
            role: userData.role
          });
          // Save to localStorage for quick access
          localStorage.setItem("user", JSON.stringify(userData));
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        // Fallback to localStorage
        const savedUser = localStorage.getItem("user");
        if (savedUser) {
          try {
            setUser(JSON.parse(savedUser));
          } catch (e) {}
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // ADDED: Update profile via API
  const handleUpdate = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please login to update profile");
      navigate("/login");
      return;
    }

    setUpdating(true);
    try {
      const response = await API.put("/customer/me", {
        name: user.name,
        email: user.email,
        phone: user.phone
      });
      
      if (response.data.success) {
        const updatedUser = response.data.data;
        setUser({
          ...user,
          name: updatedUser.name,
          email: updatedUser.email,
          phone: updatedUser.phone
        });
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setEditing(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      alert(error.response?.data?.message || "Failed to update profile");
    } finally {
      setUpdating(false);
    }
  };

  // ADDED: Handle avatar upload
  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      alert("Please upload an image file");
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      alert("Image size should be less than 5MB");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please login to update avatar");
      navigate("/login");
      return;
    }

    const formData = new FormData();
    formData.append("avatar", file);

    setAvatarLoading(true);
    try {
      const response = await API.put("/customer/me/avatar", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      
      if (response.data.success) {
        setUser({ ...user, avatar: response.data.data.avatar });
        localStorage.setItem("user", JSON.stringify({ ...user, avatar: response.data.data.avatar }));
        alert("Avatar updated successfully!");
      }
    } catch (error) {
      console.error("Error uploading avatar:", error);
      alert(error.response?.data?.message || "Failed to upload avatar");
    } finally {
      setAvatarLoading(false);
    }
  };

  // ADDED: Handle logout
  const handleLogout = async () => {
    if (!window.confirm("Are you sure you want to logout?")) return;
    
    try {
      // Optional: Call logout API to invalidate token
      const token = localStorage.getItem("token");
      if (token) {
        await API.post("/auth/logout").catch(() => {});
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("lastOrderId");
      localStorage.removeItem("trackingOrderId");
      navigate("/login");
    }
  };

  // ADDED: Handle account deletion
  const handleDelete = async () => {
    const confirmText = window.prompt("Type 'DELETE' to confirm account deletion:");
    if (confirmText !== "DELETE") {
      alert("Account not deleted. Type 'DELETE' to confirm.");
      return;
    }
    
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please login to delete account");
      navigate("/login");
      return;
    }

    if (!window.confirm("Are you ABSOLUTELY sure? This action cannot be undone!")) return;
    
    try {
      const response = await API.delete("/customer/me");
      
      if (response.data.success) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("lastOrderId");
        localStorage.removeItem("trackingOrderId");
        alert("Account deleted successfully");
        navigate("/register");
      }
    } catch (error) {
      console.error("Error deleting account:", error);
      alert(error.response?.data?.message || "Failed to delete account");
    }
  };

  const initials = user.name ? user.name.slice(0, 2).toUpperCase() : "QB";

  // Loading state
  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen pb-8">
        <div className="max-w-md mx-auto px-4 pt-4 flex justify-center items-center min-h-[60vh]">
          <FaSpinner className="animate-spin text-orange-500 text-3xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen pb-8">
      <div className="max-w-md mx-auto px-4 pt-4">

        {/* AVATAR CARD */}
        <div className="bg-gradient-to-br from-orange-500 to-yellow-400 rounded-3xl p-6 mb-5 text-white shadow-xl">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-full flex items-center justify-center text-2xl font-extrabold shadow-lg overflow-hidden">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  initials
                )}
              </div>
              <label className="absolute -bottom-1 -right-1 w-6 h-6 bg-white text-orange-500 rounded-full flex items-center justify-center shadow cursor-pointer hover:bg-gray-100 transition">
                {avatarLoading ? (
                  <FaSpinner className="animate-spin text-[10px]" />
                ) : (
                  <FaCamera className="text-[10px]" />
                )}
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                  disabled={avatarLoading}
                />
              </label>
            </div>
            <div className="flex-1">
              <h2 className="font-extrabold text-lg">{user.name || "Set your name"}</h2>
              <p className="text-white/80 text-sm">{user.email || "No email set"}</p>
              {user.phone && (
                <p className="text-white/60 text-xs mt-1">📞 {user.phone}</p>
              )}
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
                    value={user[key] || ""}
                    onChange={(e) => setUser({ ...user, [key]: e.target.value })}
                    className="flex-1 py-2.5 text-sm outline-none bg-transparent"
                  />
                </div>
              ))}
            </div>
            <button
              onClick={handleUpdate}
              disabled={updating}
              className="w-full mt-4 bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl font-bold transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {updating ? <FaSpinner className="animate-spin" /> : null}
              {updating ? "Saving..." : saved ? "✅ Saved!" : "Save Changes"}
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
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-red-50 transition border-b border-red-50"
          >
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