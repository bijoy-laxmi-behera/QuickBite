import Recommended from "../components/Recommended";
import SubscriptionSection from "../components/SubscriptionSection";

function Home() {
  return (
    <div className="space-y-6">

      <SubscriptionSection />

      <Recommended />

    </div>
  );
}

export default Home;