// src/AuthContext.js
import React, { createContext, useEffect, useState } from "react";
import { apiFetch } from "./api";

export const AuthContext = createContext({
  user: null,
  loading: true,
  setUser: () => {},
  logout: async () => {}
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On app start: check session
  useEffect(() => {
    let mounted = true;
    async function checkSession() {
      try {
        const res = await apiFetch("me.php", { method: "GET" });
        if (res.ok && res.data && res.data.user) {
          if (mounted) setUser(res.data.user);
        } else {
          if (mounted) setUser(null);
        }
      } catch (e) {
        if (mounted) setUser(null);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    checkSession();
    return () => { mounted = false; };
  }, []);

  async function logout() {
    try {
      await apiFetch("logout.php", { method: "POST" });
    } catch (e) {
      // ignore
    } finally {
      setUser(null);
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
