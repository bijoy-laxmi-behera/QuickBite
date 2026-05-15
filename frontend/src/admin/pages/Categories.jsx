// src/admin/pages/Categories.jsx
import { useState, useEffect } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Search,
  RefreshCw,
  Tag,
  X,
  Check,
  Loader2,
} from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

// ── Image map matching customer CategorySection ────────────
const categoryImages = {
  All: "https://img.icons8.com/color/96/restaurant.png",
  Pizza: "https://img.icons8.com/color/96/pizza.png",
  Biryani: "https://img.icons8.com/color/96/biryani.png",
  Burger: "https://img.icons8.com/color/96/hamburger.png",
  Cake: "https://img.icons8.com/color/96/birthday-cake.png",
  Chicken: "https://img.icons8.com/color/96/chicken.png",
  Coffee: "https://img.icons8.com/color/96/coffee.png",
  Dessert: "https://img.icons8.com/color/96/ice-cream-cone.png",
  Dosa: "https://img.icons8.com/color/96/dosa.png",
  Egg: "https://img.icons8.com/color/96/eggs.png",
  Fish: "https://img.icons8.com/color/96/fish-food.png",
  "Fried Rice": "https://img.icons8.com/color/96/fried-rice.png",
  Healthy: "https://img.icons8.com/color/96/salad.png",
  Juice: "https://img.icons8.com/color/96/juice.png",
  "Meal Box": "https://img.icons8.com/color/96/bento.png",
  Noodles: "https://img.icons8.com/color/96/noodles.png",
  Paneer: "https://img.icons8.com/color/96/cheese.png",
  Pasta: "https://img.icons8.com/color/96/pasta.png",
  Roti: "https://img.icons8.com/color/96/bread.png",
  Tiffin: "https://img.icons8.com/color/96/tiffin.png",
};

const defaultCategories = [
  "Pizza",
  "Biryani",
  "Burger",
  "Cake",
  "Chicken",
  "Coffee",
  "Dessert",
  "Dosa",
  "Egg",
  "Fish",
  "Fried Rice",
  "Healthy",
  "Juice",
  "Meal Box",
  "Noodles",
  "Paneer",
  "Pasta",
  "Roti",
  "Tiffin",
];

// ── Toast ──────────────────────────────────────────────────
function Toast({ message, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <div
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl shadow-lg text-white text-sm font-medium
      ${type === "success" ? "bg-green-600" : "bg-red-600"}`}
    >
      {type === "success" ? <Check size={16} /> : <X size={16} />}
      {message}
      <button onClick={onClose}>
        <X size={14} className="opacity-70" />
      </button>
    </div>
  );
}

// ── Modal ──────────────────────────────────────────────────
function CategoryModal({ category, onClose, onSave }) {
  const [form, setForm] = useState({
    name: category?.name || "",
    description: category?.description || "",
    image: category?.image || "",
    isActive: category?.isActive ?? true,
  });
  const [saving, setSaving] = useState(false);
  const [imageMode, setImageMode] = useState("upload");

  const handleSave = async () => {
    if (!form.name.trim()) {
      alert("Name is required");
      return;
    }
    setSaving(true);
    await onSave(category?._id, form);
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-800">
            {category ? "Edit Category" : "Add Category"}
          </h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg"
          >
            <X size={18} />
          </button>
        </div>

        {/* Name */}
        <div>
          <label className="text-xs font-semibold text-gray-500 mb-1 block">
            Category Name *
          </label>
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="e.g. Biryani"
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
          {/* Quick select from defaults */}
          {!category && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {defaultCategories.map((name) => (
                <button
                  key={name}
                  onClick={() =>
                    setForm({
                      ...form,
                      name,
                      image: categoryImages[name] || "",
                    })
                  }
                  className={`text-xs px-2.5 py-1 rounded-full border transition ${
                    form.name === name
                      ? "bg-orange-500 text-white border-orange-500"
                      : "border-gray-200 text-gray-500 hover:border-orange-300"
                  }`}
                >
                  {name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="text-xs font-semibold text-gray-500 mb-1 block">
            Description
          </label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Optional description..."
            rows={2}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
          />
        </div>

        {/* Image — Upload OR URL */}
        <div>
          <label className="text-xs font-semibold text-gray-500 mb-1 block">
            Category Image
          </label>

          {/* Tab toggle */}
          <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-3 w-fit">
            <button
              type="button"
              onClick={() => setImageMode("upload")}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium transition ${
                imageMode === "upload"
                  ? "bg-white shadow text-orange-500"
                  : "text-gray-500"
              }`}
            >
              📁 Upload File
            </button>
            <button
              type="button"
              onClick={() => setImageMode("url")}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium transition ${
                imageMode === "url"
                  ? "bg-white shadow text-orange-500"
                  : "text-gray-500"
              }`}
            >
              🔗 Image URL
            </button>
          </div>

          {/* Upload */}
          {imageMode === "upload" && (
            <div
              onClick={() => document.getElementById("cat-img-upload").click()}
              className="border-2 border-dashed border-gray-200 hover:border-orange-400 rounded-xl p-4 text-center cursor-pointer transition"
            >
              <input
                id="cat-img-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onloadend = () =>
                    setForm({ ...form, image: reader.result });
                  reader.readAsDataURL(file);
                }}
              />
              {form.image && form.image.startsWith("data:") ? (
                <img
                  src={form.image}
                  alt="preview"
                  className="w-16 h-16 mx-auto object-contain rounded-xl"
                />
              ) : (
                <>
                  <p className="text-2xl mb-1">🖼️</p>
                  <p className="text-xs text-gray-400">Click to upload image</p>
                  <p className="text-xs text-gray-300 mt-0.5">
                    PNG, JPG, WebP up to 5MB
                  </p>
                </>
              )}
            </div>
          )}

          {/* URL */}
          {imageMode === "url" && (
            <input
              value={form.image?.startsWith("data:") ? "" : form.image}
              onChange={(e) => setForm({ ...form, image: e.target.value })}
              placeholder="https://example.com/image.png"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          )}

          {/* Preview */}
          {form.image &&
            !form.image.startsWith("data:") &&
            imageMode === "url" && (
              <img
                src={form.image}
                alt="preview"
                className="w-12 h-12 mt-2 object-contain rounded-lg border"
                onError={(e) => (e.target.style.display = "none")}
              />
            )}
        </div>

        {/* Active toggle */}
        <div className="flex items-center gap-3">
          <label className="text-xs font-semibold text-gray-500">Active</label>
          <button
            onClick={() => setForm({ ...form, isActive: !form.isActive })}
            className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full transition ${
              form.isActive
                ? "bg-green-100 text-green-700"
                : "bg-gray-100 text-gray-500"
            }`}
          >
            {form.isActive ? (
              <ToggleRight size={15} />
            ) : (
              <ToggleLeft size={15} />
            )}
            {form.isActive ? "Active" : "Inactive"}
          </button>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-[2] py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {saving ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <Check size={15} />
            )}
            {saving ? "Saving..." : "Save Category"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────
export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [toast, setToast] = useState(null);

  const token = localStorage.getItem("token");

  const fetchWithAuth = async (endpoint, options = {}) => {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "API Error");
    return data;
  };

  const showToast = (message, type = "success") => setToast({ message, type });

  const fetchCategories = async () => {
    try {
      setLoading(true);
      // Try admin endpoint first, fallback to customer endpoint
      const data = await fetchWithAuth("/admin/categories").catch(() =>
        fetchWithAuth("/customer/categories"),
      );
      setCategories(data.data || data.categories || []);
    } catch (err) {
      showToast("Failed to load categories", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSave = async (id, form) => {
    try {
      if (id) {
        await fetchWithAuth(`/admin/categories/${id}`, {
          method: "PUT",
          body: JSON.stringify(form),
        });
        showToast("Category updated successfully");
      } else {
        await fetchWithAuth("/admin/categories", {
          method: "POST",
          body: JSON.stringify(form),
        });
        showToast("Category created successfully");
      }
      setShowModal(false);
      setEditTarget(null);
      fetchCategories();
    } catch (err) {
      showToast(err.message || "Failed to save category", "error");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this category? This may affect menu items.")) return;
    try {
      await fetchWithAuth(`/admin/categories/${id}`, { method: "DELETE" });
      showToast("Category deleted");
      fetchCategories();
    } catch (err) {
      showToast("Failed to delete", "error");
    }
  };

  const handleToggle = async (id) => {
    try {
      await fetchWithAuth(`/admin/categories/${id}/toggle`, {
        method: "PATCH",
      });
      showToast("Status updated");
      fetchCategories();
    } catch (err) {
      showToast("Failed to update status", "error");
    }
  };

  const filtered = categories.filter((c) =>
    c.name?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Categories</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Manage food categories shown to customers
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchCategories}
            className="flex items-center gap-2 text-sm text-orange-500 border border-orange-200 px-3 py-2 rounded-xl hover:border-orange-400 transition"
          >
            <RefreshCw size={14} /> Refresh
          </button>
          <button
            onClick={() => {
              setEditTarget(null);
              setShowModal(true);
            }}
            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-4 py-2 rounded-xl transition"
          >
            <Plus size={16} /> Add Category
          </button>
        </div>
      </div>

      {/* Summary pills */}
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-xl px-4 py-2 text-sm">
          <Tag size={14} className="text-orange-500" />
          <span className="font-semibold text-orange-700">
            {categories.length}
          </span>
          <span className="text-orange-600">total</span>
        </div>
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-2 text-sm">
          <span className="font-semibold text-green-700">
            {categories.filter((c) => c.isActive !== false).length}
          </span>
          <span className="text-green-600">active</span>
        </div>
        <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm">
          <span className="font-semibold text-gray-700">
            {categories.filter((c) => c.isActive === false).length}
          </span>
          <span className="text-gray-500">inactive</span>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search
          size={15}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search categories..."
          className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
        />
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {[...Array(10)].map((_, i) => (
            <div
              key={i}
              className="h-32 bg-gray-100 rounded-2xl animate-pulse"
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-dashed border-gray-200 rounded-2xl p-14 text-center">
          <Tag size={36} className="text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No categories found</p>
          <button
            onClick={() => {
              setEditTarget(null);
              setShowModal(true);
            }}
            className="mt-3 text-orange-500 text-sm font-semibold hover:underline"
          >
            + Add your first category
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filtered.map((cat) => (
            <div
              key={cat._id}
              className={`bg-white border rounded-2xl p-4 flex flex-col items-center gap-3 shadow-sm hover:shadow-md transition-shadow group relative ${
                cat.isActive === false ? "opacity-50" : ""
              }`}
            >
              {/* Status dot */}
              <span
                className={`absolute top-3 right-3 w-2 h-2 rounded-full ${
                  cat.isActive === false ? "bg-gray-400" : "bg-green-500"
                }`}
              />

              {/* Image */}
              <div className="w-16 h-16 rounded-2xl bg-orange-50 flex items-center justify-center overflow-hidden">
                {cat.image ? (
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-12 h-12 object-contain"
                    onError={(e) => {
                      e.target.src =
                        categoryImages[cat.name] ||
                        "https://img.icons8.com/color/96/restaurant.png";
                    }}
                  />
                ) : (
                  <Tag size={24} className="text-orange-400" />
                )}
              </div>

              {/* Name */}
              <div className="text-center">
                <p className="text-sm font-bold text-gray-800">{cat.name}</p>
                {cat.itemCount > 0 && (
                  <p className="text-xs text-gray-400 mt-0.5">
                    {cat.itemCount} items
                  </p>
                )}
              </div>

              {/* Actions — show on hover */}
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleToggle(cat._id)}
                  className={`p-1.5 rounded-lg text-xs transition ${
                    cat.isActive === false
                      ? "bg-green-50 text-green-600 hover:bg-green-100"
                      : "bg-gray-50 text-gray-500 hover:bg-gray-100"
                  }`}
                  title={cat.isActive === false ? "Activate" : "Deactivate"}
                >
                  {cat.isActive === false ? (
                    <ToggleRight size={14} />
                  ) : (
                    <ToggleLeft size={14} />
                  )}
                </button>
                <button
                  onClick={() => {
                    setEditTarget(cat);
                    setShowModal(true);
                  }}
                  className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition"
                  title="Edit"
                >
                  <Pencil size={14} />
                </button>
                <button
                  onClick={() => handleDelete(cat._id)}
                  className="p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition"
                  title="Delete"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Default categories hint */}
      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
        <p className="text-sm font-semibold text-blue-700 mb-1">💡 Tip</p>
        <p className="text-xs text-blue-600">
          Categories added here will appear in the customer home page under
          "Explore Category". Make sure the category name matches exactly (e.g.
          "Biryani", "Fried Rice") to use the built-in category images on the
          customer side.
        </p>
      </div>

      {/* Modal */}
      {showModal && (
        <CategoryModal
          category={editTarget}
          onClose={() => {
            setShowModal(false);
            setEditTarget(null);
          }}
          onSave={handleSave}
        />
      )}

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
