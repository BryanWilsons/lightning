import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import api, { setAccessToken, setTokenHandlers } from "../Helpers/Api";
import { toast } from "react-toastify";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessTokenState] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const updateAccessToken = useCallback((token) => {
    setAccessToken(token);          // update axios module
    setAccessTokenState(token);     // update react state
  }, []);

  const heroku = 'https://usps-29d8a6abcbd1.herokuapp.com'
//const heroku = 'http://localhost:5004'


const logout = useCallback(async () => {
  try {
    await api.post("/auth/logout");
  } catch (err) {
    console.error("Logout request failed:", err);
  } finally {
    updateAccessToken(null);
    setUser(null);
  }
}, [updateAccessToken]);


  // Let the axios interceptor talk back to React
  useEffect(() => {
    setTokenHandlers({
      onRefreshed: (token) => updateAccessToken(token),
      onFailure: () => {
        updateAccessToken(null);
        setUser(null);
      },
    });
  }, [updateAccessToken]);

  // On app start → try silent refresh
  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data } = await api.post("/auth/refresh");
        updateAccessToken(data.accessToken);

        // Get current user
        const me = await api.get("/auth/me");
        setUser(me.data);
      } catch (err) {
        updateAccessToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, [updateAccessToken]);

const login = useCallback(async (email, password) => {
  try {
  const { data } = await api.post("/auth/login", {
    email,
    password,
  });

  updateAccessToken(data.accessToken);
  setUser(data.user);

  return data.user;
} catch (err) {
  // 1. Network / server offline
  if (!err.response) {
    // No response at all → network error, CORS, server down, etc.
    toast.warning("Server offline or network error");
    console.log("Network error:", err.message);
    return;
  }

  // 2. Server responded with an error (credentials, validation, etc.)
  const status = err.response.status;
  const message = err.response.data?.message || "Login failed";

  if (status === 401) {
    toast.error("Invalid email or password");
  } else if (status === 400) {
    toast.error(message); // validation errors, etc.
  } else {
    toast.error(`Error ${status}: ${message}`);
  }

  console.log("Server error:", status, err.response.data);
}
// try{
//   const { data } = await api.post("/auth/login", {
//     email,
//     password,
//   });

//   updateAccessToken(data.accessToken);
//   setUser(data.user);

//   return data.user;
// }catch (err) {

// console.log();   // ← call it here

// }
}, [updateAccessToken]);

  const company = user?.company ?? null;
  
  const value = useMemo(
    () => ({
      user,
    company,
      accessToken,
      isLoading,
      isAuthenticated: !!user && !!accessToken,
      login,
      logout,
heroku,
api
    }),
    [user, accessToken, isLoading, logout,heroku,login,api ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};

