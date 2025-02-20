import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase/config";
import { doc, setDoc } from "firebase/firestore";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Eye, EyeOff } from "lucide-react";

const Registration = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const validatePassword = (password) => {
    const regex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return regex.test(password);
  };

  const validateIndianPhoneNumber = (phone) => {
    // Strip any non-numeric characters
    const cleanPhone = phone.replace(/\D/g, '');
    
    // Check if it's a valid Indian number (10 digits, optionally with +91 prefix)
    if (/^(\+?91)?[6789]\d{9}$/.test(cleanPhone)) {
      // Format as E.164 (ensure it has +91 prefix)
      return cleanPhone.length === 10 ? `+91${cleanPhone}` : `+${cleanPhone}`;
    }
    return false;
  };

  const createCustomerDocument = async (userId, userData) => {
    try {
      const customerRef = doc(db, "customers", userId);
      await setDoc(customerRef, {
        name: userData.username,
        email: userData.email,
        phone: userData.phone,
        joinedAt: new Date().toISOString(),
        customerId: userId,
      });
      console.log("Customer document created successfully");
    } catch (error) {
      console.error("Error creating customer document:", error);
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validate phone number in E.164 format
    const formattedPhone = validateIndianPhoneNumber(formData.phone);
    if (!formattedPhone) {
      setError("Please enter a valid Indian phone number");
      return;
    }

    if (!validatePassword(formData.password)) {
      setError(
        "Password must be at least 8 characters long and contain uppercase, lowercase, number, and special character."
      );
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setLoading(true);
      const userCredential = await register(
        formData.email,
        formData.password,
        formData.username,
        formattedPhone
      );

      if (!userCredential || !userCredential.user) {
        throw new Error("User registration failed.");
      }

      console.log("User registered:", userCredential.user);

      // Use formatted phone number
      await createCustomerDocument(userCredential.user.uid, {
        ...formData,
        phone: formattedPhone
      });

      setSuccess("Registration successful! Please check your email to verify your account.");
      
      // Clear form
      setFormData({
        username: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
      });

      // Optionally redirect user
      setTimeout(() => navigate("/login"), 3000);
      
    } catch (error) {
      console.error("Registration error:", error);
      if (error.code === "auth/email-already-in-use") {
        setError("An account with this email already exists.");
      } else if (error.code === "auth/invalid-email") {
        setError("Invalid email address.");
      } else {
        setError("Failed to create account. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
       <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-4">
      <Card className="w-full max-w-xl border-0 bg-gradient-to-b from-gray-800 to-gray-900 text-gray-100 shadow-xl">
        <CardHeader className="border-b border-gray-700">
          <CardTitle className="text-2xl font-bold text-center">Create Account</CardTitle>
          <CardDescription className="text-gray-300 text-center">
            Join us to access all features
          </CardDescription>
        </CardHeader>
        
        <CardContent className="pt-6 pb-2">
          {error && (
            <Alert variant="destructive" className="mb-4 border-red-800 bg-red-900/30 text-red-200">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
    
          {success && (
            <Alert className="mb-4 border-green-800 bg-green-900/30 text-green-200">
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}
    
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-medium text-gray-300">
                Username
              </Label>
              <Input
                id="username"
                type="text"
                name="username"
                placeholder="Your username"
                value={formData.username}
                onChange={handleChange}
                required
                className="border-gray-600 bg-gray-800/50 text-gray-100 placeholder:text-gray-500 focus:ring-gray-500 focus:border-gray-500"
              />
            </div>
    
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-300">
                Email
              </Label>
              <Input
                id="email" 
                type="email"
                name="email"
                placeholder="your.email@example.com"
                value={formData.email}
                onChange={handleChange}
                required
                className="border-gray-600 bg-gray-800/50 text-gray-100 placeholder:text-gray-500 focus:ring-gray-500 focus:border-gray-500"
              />
            </div>
    
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-medium text-gray-300">
                Phone Number
              </Label>
              <Input
                id="phone"
                type="tel"
                name="phone"
                placeholder="+91 9XXXXXXXXX"
                value={formData.phone}
                onChange={handleChange}
                required
                className="border-gray-600 bg-gray-800/50 text-gray-100 placeholder:text-gray-500 focus:ring-gray-500 focus:border-gray-500"
              />
              <p className="text-xs text-gray-400">
                Indian format required (+91XXXXXXXXXX)
              </p>
            </div>
    
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-gray-300">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="border-gray-600 bg-gray-800/50 text-gray-100 pr-10 placeholder:text-gray-500 focus:ring-gray-500 focus:border-gray-500"
                />
                <button 
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-300"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <p className="text-xs text-gray-400">
                Must contain uppercase, lowercase, number, and special character (min. 8 characters)
              </p>
            </div>
    
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-300">
                Confirm Password
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="border-gray-600 bg-gray-800/50 text-gray-100 pr-10 placeholder:text-gray-500 focus:ring-gray-500 focus:border-gray-500"
                />
                <button 
                  type="button"
                  onClick={toggleConfirmPasswordVisibility}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-300"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
    
            <Button 
              type="submit" 
              className="w-full bg-[#18284a] hover:bg-[#1f3460] text-white font-medium py-2 mt-2" 
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Account...
                </>
              ) : (
                "Sign Up"
              )}
            </Button>
          </form>
        </CardContent>
    
        <CardFooter className="flex justify-center pt-2 pb-6 border-t border-gray-700 mt-4">
          <p className="text-sm text-gray-300">
            Already have an account?{" "}
            <button
              onClick={() => navigate("/login")}
              className="text-gray-100 hover:text-indigo-300 font-medium"
            >
              Login here
            </button>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Registration;