import { createContext, useEffect, useState } from "react";
import axios from "../api/axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [user, setUser] = useState(() => {
    const cached = localStorage.getItem("user");
    return cached ? JSON.parse(cached) : null;
  });
  const [loadingUser, setLoadingUser] = useState(Boolean(localStorage.getItem("token")));

  const login = (data) => {
    const nextToken = data?.token ?? null;
    const nextUser = data?.user ?? null;
    if (nextToken) {
      localStorage.setItem("token", nextToken);
      setToken(nextToken);
    } else {
      localStorage.removeItem("token");
      setToken(null);
    }
    if (nextUser) {
      localStorage.setItem("user", JSON.stringify(nextUser));
      setUser(nextUser);
    } else {
      localStorage.removeItem("user");
      setUser(null);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
  };

  useEffect(() => {
    const bootstrapUser = async () => {
      if (!token) {
        setLoadingUser(false);
        return;
      }

      try {
        const res = await axios.get("/api/auth/validate", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.data?.valid || !res.data?.user) {
          logout();
          return;
        }
        setUser(res.data.user);
        localStorage.setItem("user", JSON.stringify(res.data.user));
      } catch {
        logout();
      } finally {
        setLoadingUser(false);
      }
    };

    bootstrapUser();
  }, [token]);

  return (
    <AuthContext.Provider value={{ token, user, login, logout, loadingUser }}>
      {children}
    </AuthContext.Provider>
  );
};