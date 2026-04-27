import { useEffect, useState } from "react";
import API from "@/services/axios";
import toast from "react-hot-toast";

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({ name: "", phone: "", vehicle: "", licensePlate: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await API.get("/delivery/profile");
      const data = res.data.data;
      setProfile(data);
      setForm({
        name:         data.name || "",
        phone:        data.phone || "",
        vehicle:      data.vehicle || "",
        licensePlate: data.licensePlate || "",
      });
    } catch {
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await API.put("/delivery/profile", form);
      toast.success("Profile updated!");
      setEditMode(false);
      fetchProfile();
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">

      {/* Avatar Card */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-5">
        <div className="w-16 h-16 rounded-full bg-orange-500 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
          {profile?.name?.[0]?.toUpperCase() || "D"}
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-800">{profile?.name || "Delivery Partner"}</h2>
          <p className="text-gray-400 text-sm">{profile?.email}</p>
          <span className="inline-block mt-1 text-xs bg-orange-100 text-orange-600 font-semibold px-2.5 py-0.5 rounded-full capitalize">
            {profile?.role}
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm text-center">
          <p className="text-2xl font-bold text-gray-800">{profile?.totalDeliveries || 0}</p>
          <p className="text-xs text-gray-400 mt-1">Total Deliveries</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm text-center">
          <p className="text-2xl font-bold text-gray-800">⭐ {profile?.rating?.toFixed(1) || "0.0"}</p>
          <p className="text-xs text-gray-400 mt-1">Rating</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm text-center">
          <p className="text-2xl font-bold text-gray-800">₹{profile?.totalEarnings || 0}</p>
          <p className="text-xs text-gray-400 mt-1">Total Earned</p>
        </div>
      </div>

      {/* Editable Form */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-gray-800">Personal Details</h3>
          <button
            onClick={() => setEditMode(!editMode)}
            className={`text-sm font-semibold px-4 py-1.5 rounded-lg transition ${
              editMode
                ? "bg-gray-100 text-gray-600 hover:bg-gray-200"
                : "bg-orange-50 text-orange-500 hover:bg-orange-100"
            }`}
          >
            {editMode ? "Cancel" : "Edit"}
          </button>
        </div>

        <div className="space-y-4">
          <Field
            label="Full Name"
            value={form.name}
            disabled={!editMode}
            onChange={(v) => setForm({ ...form, name: v })}
          />
          <Field
            label="Phone Number"
            value={form.phone}
            disabled={!editMode}
            onChange={(v) => setForm({ ...form, phone: v })}
          />
          <Field
            label="Vehicle Type"
            value={form.vehicle}
            disabled={!editMode}
            onChange={(v) => setForm({ ...form, vehicle: v })}
            placeholder="e.g. Bike, Scooter"
          />
          <Field
            label="License Plate"
            value={form.licensePlate}
            disabled={!editMode}
            onChange={(v) => setForm({ ...form, licensePlate: v })}
            placeholder="e.g. OD 05 AB 1234"
          />

          {/* Read-only */}
          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">
              Email
            </label>
            <input
              type="text"
              value={profile?.email || ""}
              disabled
              className="w-full border border-gray-100 bg-gray-50 rounded-xl px-4 py-2.5 text-sm text-gray-400 cursor-not-allowed"
            />
          </div>
        </div>

        {editMode && (
          <button
            onClick={handleSave}
            disabled={saving}
            className="mt-5 w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white py-3 rounded-xl font-semibold transition"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        )}
      </div>

    </div>
  );
}

function Field({ label, value, disabled, onChange, placeholder }) {
  return (
    <div>
      <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">
        {label}
      </label>
      <input
        type="text"
        value={value}
        disabled={disabled}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none transition ${
          disabled
            ? "border-gray-100 bg-gray-50 text-gray-500 cursor-not-allowed"
            : "border-gray-200 bg-white focus:ring-2 focus:ring-orange-400 focus:border-transparent"
        }`}
      />
    </div>
  );
}
