import { useState, useEffect } from "react";

function Profile() {
  const [user, setUser] = useState({
    name: "",
    email: "",
    phone: "",
  });

  // ✅ Load user (temporary localStorage)
  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem("user"));
    if (savedUser) {
      setUser({
        name: savedUser.name || "",
        email: savedUser.email || "",
        phone: savedUser.phone || "",
      });
    }
  }, []);

  // ✅ Update Profile
  const handleUpdate = () => {
    localStorage.setItem("user", JSON.stringify(user));
    alert("Profile updated ✅");
  };

  // ✅ Delete Account
  const handleDelete = () => {
    if (window.confirm("Are you sure?")) {
      localStorage.removeItem("user");
      window.location.reload();
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-white p-6 rounded-xl shadow">

      <h2 className="text-xl font-bold mb-4">My Profile</h2>

      <input
        value={user.name}
        onChange={(e) => setUser({ ...user, name: e.target.value })}
        placeholder="Name"
        className="w-full border p-2 mb-3 rounded"
      />

      <input
        value={user.email}
        onChange={(e) => setUser({ ...user, email: e.target.value })}
        placeholder="Email"
        className="w-full border p-2 mb-3 rounded"
      />

      <input
        value={user.phone}
        onChange={(e) => setUser({ ...user, phone: e.target.value })}
        placeholder="Phone"
        className="w-full border p-2 mb-4 rounded"
      />

      <div className="flex gap-3">
        <button
          onClick={handleUpdate}
          className="bg-orange-500 text-white px-4 py-2 rounded"
        >
          Update
        </button>

        <button
          onClick={handleDelete}
          className="bg-red-500 text-white px-4 py-2 rounded"
        >
          Delete Account
        </button>
      </div>

    </div>
  );
}

export default Profile;