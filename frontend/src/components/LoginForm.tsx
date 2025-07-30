import { useState } from "react";
import { useAuth } from "../AuthContext";
import styles from "./LoginForm.module.css";

export function Login({ onLogin }: { onLogin: () => void }) {
  const { setToken } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [remember, setRemember] = useState(false);

  const submit = async () => {

    if (!username || !password) {
      setError("Username and password are required");
      return;
    }

    try {
      const res = await fetch("http://localhost:8000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (res.ok) {
        const data = await res.json();
        setToken(data.token);
        onLogin();
      } else {
        setError("Invalid credentials");
      }
    } catch {
      setError("Server error");
    }
  };

   return (
    <div className={styles.container}>
      <h2 className={styles.title}>Login</h2>
      {error && <p className={styles.error}>{error}</p>}
      <form onSubmit={submit}>
        <input
          className={styles.input}
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          className={styles.input}
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <label>
          <input
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
          /> Remember me
        </label>
        <button className={styles.button} type="submit">Login</button>
      </form>
    </div>
  );
}

