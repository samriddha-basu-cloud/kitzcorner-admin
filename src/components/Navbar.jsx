import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import Logo from "../assets/app_icon_kitzcorner.png";
import PropTypes from 'prop-types';

const Navbar = ({ onItemClick }) => {
  const [active, setActive] = useState("Home");
  const [isOpen, setIsOpen] = useState(false);
  const navItems = ["Products", "Customers", "Payments", "Orders", "Reports"];

  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const handleItemClick = (item) => {
    setActive(item);
    setIsOpen(false);
    onItemClick(item);
  };

  return (
    <nav className="w-full bg-gray-900 text-white p-4 shadow-lg fixed top-0 z-50">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <div className="relative flex items-center justify-center space-x-4">
          <div className="absolute -inset-1 rounded-full blur-md bg-blue-500/30"></div>
          <img
            src={Logo}
            alt="Kitzcorner"
            className="relative h-16 w-16 object-contain drop-shadow-lg"
          />
           <p className="text-gray-200 text-xl font-extrabold font-serif">
                  Kitz Admin Corner
                </p>
        </div>

        <ul className="hidden md:flex space-x-6">
          {navItems.map((item) => (
            <motion.li
              key={item}
              className="relative cursor-pointer text-lg font-medium px-4 py-2"
              onClick={() => handleItemClick(item)}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.3 }}
            >
              {item}
              {active === item && (
                <motion.div
                  layoutId="underline"
                  className="absolute left-0 bottom-0 w-full h-1 bg-blue-500 rounded"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                />
              )}
            </motion.li>
          ))}
        </ul>

        <button
          onClick={handleLogout}
          className="hidden md:block ml-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition duration-300"
        >
          Sign out
        </button>

        <button
          className="md:hidden text-white"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden"
          >
            <ul className="flex flex-col space-y-4 mt-4">
              {navItems.map((item) => (
                <motion.li
                  key={item}
                  className="relative cursor-pointer text-lg font-medium px-4 py-2"
                  onClick={() => handleItemClick(item)}
                  whileTap={{ scale: 0.95 }}
                >
                  {item}
                  {active === item && (
                    <motion.div
                      layoutId="mobile-underline"
                      className="absolute left-0 bottom-0 w-full h-1 bg-blue-500 rounded"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    />
                  )}
                </motion.li>
              ))}
              <li>
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition duration-300"
                >
                  Sign out
                </button>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
Navbar.propTypes = {
  onItemClick: PropTypes.func.isRequired,
};


export default Navbar;
