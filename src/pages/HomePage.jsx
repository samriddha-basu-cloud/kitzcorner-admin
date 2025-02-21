import Navbar from "../components/Navbar";
import ProductManagement from "../components/ProductManagement";
import CustomerManagement from "../components/CustomerManagement";

export default function HomePage() {
  return (
    <div>
      <Navbar />
      <ProductManagement />
      <CustomerManagement />

    </div>
  );
}