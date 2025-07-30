import { useEffect, useState, createContext, useContext } from "react";

type AuthContextType = {
  token: string;
  username: string;
  setToken: (t: string) => void;
  clearToken: () => void;
};

const AuthContext = createContext<AuthContextType>({
  token: "",
  username: "",
  setToken: () => {},
  clearToken: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setTokenState] = useState("");
  const [username, setUsername] = useState("");

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
      });
  };

  const clearToken = () => {
    setTokenState("");
    setUsername("");
    sessionStorage.removeItem("auth_token");
  };

  return (
    <AuthContext.Provider value={{ token, username, setToken, clearToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);