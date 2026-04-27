import { createContext, useContext, useState } from "react";

const DeliveryContext = createContext();

export const DeliveryProvider = ({ children }) => {
  const [online, setOnline] = useState(true);

  return (
    <DeliveryContext.Provider value={{ online, setOnline }}>
      {children}
    </DeliveryContext.Provider>
  );
};

export const useDelivery = () => useContext(DeliveryContext);