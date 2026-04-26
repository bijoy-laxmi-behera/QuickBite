import Navbar from "../components/Navbar";
import Recommended from "../components/Recommended";
import SubscriptionSection from "../components/SubscriptionSection";

function Home({ setCart, setPage, setSelectedRestaurant }) {
  return (
    <div className="bg-gray-100 min-h-screen">

      <Navbar />

      <div className="max-w-6xl mx-auto px-4 py-6">

        {/* ✅ ONLY ONE SUBSCRIPTION SECTION */}
        <SubscriptionSection setPage={setPage} />

        {/* ✅ RESTAURANTS */}
        <Recommended 
          setCart={setCart}
          setPage={setPage}
          setSelectedRestaurant={setSelectedRestaurant}
        />

      </div>

    </div>
  );
}

export default Home;