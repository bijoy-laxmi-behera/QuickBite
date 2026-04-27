import DeliverySidebar from "../components/DeliverySidebar";
import Navbar from "../components/Navbar";

const Profile = () => {
  return (
    <div className="space-y-6">

      {/* Header */}
      <h1 className="text-2xl font-semibold">Profile</h1>

      {/* Profile Card */}
      <div className="bg-white rounded-xl shadow p-6 space-y-3">
        <p>
          <span className="font-medium text-gray-600">Name:</span>{" "}
          Delivery Partner
        </p>

        <p>
          <span className="font-medium text-gray-600">Phone:</span>{" "}
          9876543210
        </p>
      </div>

    </div>
  );
};

export default Profile;