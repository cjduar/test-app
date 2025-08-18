import { useEffect, useState, createContext, useContext } from "react";

type AuthContextType = {
  token: string;
  username: string;
  role: string;
  setToken: (t: string) => void;
  clearToken: () => void;
};

const AuthContext = createContext<AuthContextType>({
  token: "",
  username: "",
  role: "",
  setToken: () => {},
  clearToken: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setTokenState] = useState("");
  const [username, setUsername] = useState("");
  const [role, setRole] = useState("");

  useEffect(() => {
    const storedToken = sessionStorage.getItem("auth_token");
    if (storedToken) {
      setTokenState(storedToken);

      // ✅ Fetch user info from /me
      fetch("http://localhost:8000/me", {
        headers: {
          Authorization: `Bearer ${storedToken}`,
        },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.username) setUsername(data.username);
          if (data.role) setRole(data.role);
        })
        .catch(() => {
          setTokenState("");
          sessionStorage.removeItem("auth_token");
        });
    }
  }, []);

  const setToken = (t: string) => {
    setTokenState(t);
    sessionStorage.setItem("auth_token", t);

    // ✅ Fetch username on login
    fetch("http://localhost:8000/me", {
      headers: { Authorization: `Bearer ${t}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.username) setUsername(data.username);
        if (data.role) setRole(data.role);
      });
  };

  const clearToken = () => {
    setTokenState("");
    setUsername("");
    setRole("");
    sessionStorage.removeItem("auth_token");
  };

  return (
    <AuthContext.Provider value={{ token, username, role, setToken, clearToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);