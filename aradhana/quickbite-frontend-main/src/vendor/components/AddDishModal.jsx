import { useState, useEffect } from "react";

function AddDishModal({ isOpen, onClose, editingDish }) {

const [imagePreview, setImagePreview] = useState(null);

useEffect(() => {
if (editingDish) {
setImagePreview(editingDish.image);
}
}, [editingDish]);

if (!isOpen) return null;

const handleImageUpload = (e) => {
const file = e.target.files[0];

```
if (file) {
  const imageURL = URL.createObjectURL(file);
  setImagePreview(imageURL);
}
```

};

return ( <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

```
  <div className="bg-white w-full max-w-lg rounded-xl p-6 shadow-lg">

    <h2 className="text-xl font-semibold mb-4">
      {editingDish ? "Edit Dish" : "Add New Dish"}
    </h2>

    <form className="space-y-4">

      {/* Dish Name */}
      <input
        type="text"
        placeholder="Dish Name"
        className="w-full border rounded-lg px-3 py-2"
      />

      {/* Price */}
      <input
        type="number"
        placeholder="Price"
        className="w-full border rounded-lg px-3 py-2"
      />

      {/* Category */}
      <select className="w-full border rounded-lg px-3 py-2">
        <option>Breakfast</option>
        <option>Lunch</option>
        <option>Dinner</option>
        <option>Snacks</option>
      </select>

      {/* Order Type */}
      <select className="w-full border rounded-lg px-3 py-2">
        <option>Subscription</option>
        <option>One-time</option>
        <option>Both</option>
      </select>


      {/* Image Upload */}
      <div>

        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
        />

        {imagePreview && (
          <img
            src={imagePreview}
            alt="Preview"
            className="mt-3 w-full h-40 object-cover rounded-lg"
          />
        )}

      </div>


      {/* Buttons */}
      <div className="flex justify-end gap-3 mt-4">

        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 border rounded-lg"
        >
          Cancel
        </button>

        <button
          type="submit"
          className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
        >
          Save Dish
        </button>

      </div>

    </form>

  </div>

</div>


);
}

export default AddDishModal;
