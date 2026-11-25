import { createContext, useContext } from "react";

// Only accounts carrying this Appwrite user label can manage photos. Signing
// in alone is not enough: Appwrite lets anyone create an account through the
// API, so the label (set in the console) is the real gate, mirrored in the
// table and bucket permissions.
export const ADMIN_LABEL = "admin";

export const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);
