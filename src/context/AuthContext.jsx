import { createContext, useContext, useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from "firebase/auth";
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebase/config";

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Register new user
  const register = async (email, password, username, phone) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const newUser = userCredential.user;

      // Update Firebase Auth profile
      await updateProfile(newUser, { displayName: username });

      // Send verification email
      await sendEmailVerification(newUser);

      // Store user data in Firestore with emailVerified: false
      await setDoc(doc(db, "customers", newUser.uid), {
        username,
        email,
        phone,
        emailVerified: false, // Default to false
        joinedAt: serverTimestamp(),
        uid: newUser.uid,
      });

      console.log("User registered. Verification email sent.");
      return userCredential;
    } catch (error) {
      console.error("Error registering user:", error);
      throw error;
    }
  };

  // Login user
  const login = async (email, password) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const loggedInUser = userCredential.user;

    // Check if email is verified
    if (loggedInUser.emailVerified) {
      // Update Firestore field to emailVerified: true
      const userRef = doc(db, "customers", loggedInUser.uid);
      await updateDoc(userRef, { emailVerified: true });
      console.log("Email verified. Firestore updated.");
    }

    return userCredential;
  };

  // Logout user
  const logout = async () => {
    await signOut(auth);
  };

  // Reset password
  const resetPassword = async (email) => {
    await sendPasswordResetEmail(auth, email);
  };

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        // Fetch Firestore data
        const userRef = doc(db, "customers", currentUser.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const userData = userSnap.data();

          // Update Firestore if email is verified
          if (currentUser.emailVerified && !userData.emailVerified) {
            await updateDoc(userRef, { emailVerified: true });
            console.log("Email verification updated in Firestore.");
          }

          setUser({ ...currentUser, ...userData });
        } else {
          setUser(currentUser);
        }
      } else {
        setUser(null);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    user,
    loading,
    register,
    login,
    logout,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};

// PropTypes validation
AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default AuthProvider;