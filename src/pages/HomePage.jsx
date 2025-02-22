import { useState } from "react";
import Navbar from "../components/Navbar";
import ProductManagement from "../components/ProductManagement";
import CustomerManagement from "../components/CustomerManagement";
import PaymentManagement from "../components/PaymentManagement";
import OrderManagement from "../components/OrderManagement";

export default function HomePage() {
  const [activeComponent, setActiveComponent] = useState("Products");

  const handleItemClick = (item) => {
    setActiveComponent(item);
  };

  return (
    <div>
      <Navbar onItemClick={handleItemClick} />
      {activeComponent === "Products" && <ProductManagement />}
      {activeComponent === "Customers" && <CustomerManagement />}
      {activeComponent === "Payments" && <PaymentManagement />}
      {activeComponent === "Orders" && <OrderManagement />}
    </div>
  );
}
