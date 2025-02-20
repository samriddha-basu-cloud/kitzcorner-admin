import { Routes, Route, Navigate } from 'react-router-dom';
import Login from '../components/Login';
import Registration from '../components/Registration';
import ForgotPassword from '../components/ForgotPassword';
import { useAuth } from '../context/AuthContext';
import Logo from '../assets/app_icon_kitzcorner.png';

const LoginRegisterPage = () => {
  const { user } = useAuth();

  // Redirect to home if user is already logged in
  if (user) {
    return <Navigate to="/" />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-md">
        {/* Card with subtle glow effect */}
        <div className="bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-700 backdrop-blur-sm">
          {/* Logo area with improved spacing */}
          <div className="pt-8 pb-4 px-8 flex justify-center">
            <div className="relative">
              <div className="absolute -inset-1 rounded-full blur-md bg-blue-500/30"></div>
              <img 
                src={Logo} 
                alt="Kitzcorner" 
                className="relative h-40 w-40 object-contain drop-shadow-lg" 
              />
            </div>
          </div>
          
          {/* Content area with improved padding */}
          <div className="px-2 pb-4 pt-2">
            <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-2 shadow-inner">
              <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/register" element={<Registration />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
              </Routes>
            </div>
            
            {/* Footer with branding */}
            <div className="mt-8 text-center">
              <p className="text-gray-500 text-xs">
                © {new Date().getFullYear()} Kitzcorner. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginRegisterPage;