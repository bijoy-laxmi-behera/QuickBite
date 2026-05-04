import { useState, useEffect } from "react";
import API from "@/services/axios";
import toast from "react-hot-toast";

function AddDishModal({ isOpen, onClose, editingDish, refreshMenu }) {

  const [formData, setFormData] = useState({
    name: "",
    price: "",
    category: "",
    orderType: "",
  });

  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);

  // LOAD EDIT DATA
  useEffect(() => {
    if (editingDish) {
      setFormData({
        name: editingDish.name || "",
        price: editingDish.price || "",
        category: editingDish.category?._id || "", // backend support
        orderType: editingDish.orderType || "",
      });

      setImagePreview(editingDish.image || null);
    } else {
      resetForm();
    }
  }, [editingDish, isOpen]);

  const resetForm = () => {
    setFormData({
      name: "",
      price: "",
      category: "",
      orderType: "",
    });
    setImage(null);
    setImagePreview(null);
  };

  if (!isOpen) return null;

  // INPUT CHANGE
  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // IMAGE UPLOAD
  const handleImageUpload = (e) => {
    const file = e.target.files[0];

    if (file) {
      setImage(file);

      // revoke old preview (memory cleanup)
      if (imagePreview) URL.revokeObjectURL(imagePreview);

      setImagePreview(URL.createObjectURL(file));
    }
  };

  // SUBMIT
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.price) {
      return toast.error("Name & Price required");
    }

    try {
      setLoading(true);

      const data = new FormData();

      Object.entries(formData).forEach(([key, value]) => {
        if (value) data.append(key, value);
      });

      if (image) {
        data.append("image", image);
      }

      if (editingDish) {
        await API.put(`/vendor/menu/${editingDish._id}`, data);
        toast.success("Dish updated");
      } else {
        await API.post("/vendor/menu", data);
        toast.success("Dish added");
      }

      await refreshMenu?.();

      resetForm();
      onClose();

    } catch (error) {
      console.error(error);
      toast.error(
        error?.response?.data?.message || "Failed to save dish"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

      <div className="bg-white w-full max-w-lg rounded-xl p-6 shadow-lg animate-fadeIn">

        <h2 className="text-xl font-semibold mb-4">
          {editingDish ? "Edit Dish" : "Add New Dish"}
        </h2>

        <form className="space-y-4" onSubmit={handleSubmit}>

          {/* NAME */}
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Dish Name"
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-400"
            required
          />

          {/* PRICE */}
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            placeholder="Price"
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-400"
            required
          />

          {/* CATEGORY */}
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2"
          >
            <option value="">Select Category</option>
            <option value="Breakfast">Breakfast</option>
            <option value="Lunch">Lunch</option>
            <option value="Dinner">Dinner</option>
            <option value="Snacks">Snacks</option>
          </select>

          {/* ORDER TYPE */}
          <select
            name="orderType"
            value={formData.orderType}
            onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2"
          >
            <option value="">Select Type</option>
            <option value="Subscription">Subscription</option>
            <option value="One-time">One-time</option>
            <option value="Both">Both</option>
          </select>

          {/* IMAGE */}
          <div>
            <input type="file" accept="image/*" onChange={handleImageUpload} />

            {imagePreview && (
              <img
                src={imagePreview}
                alt="Preview"
                className="mt-3 w-full h-40 object-cover rounded-lg border"
              />
            )}
          </div>

          {/* BUTTONS */}
          <div className="flex justify-end gap-3 mt-4">

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-lg"
              disabled={loading}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 flex items-center gap-2"
            >
              {loading ? "Saving..." : "Save Dish"}
            </button>

          </div>

        </form>

      </div>
    </div>
  );
}

export default AddDishModal;