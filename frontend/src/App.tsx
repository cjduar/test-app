import { useState } from "react";
import { Login } from "./components/LoginForm";
import { FeedbackForm } from "./components/FeedbackForm";
import { FeedbackList } from "./components/FeedbackList";
import { useAuth } from "./AuthContext";

function App() {
  const [reloadKey, setReloadKey] = useState(0);
  const { username, clearToken, token } = useAuth();

  const logout = () => {
    clearToken();
  };

  if (!token) return <Login onLogin={() => {}} />;

  return (
    <div className="container">
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h1>Feedback App</h1>
        <div>
          Logged in as <strong>{username}</strong> |
          <button onClick={logout} style={{ marginLeft: 10 }}>Logout</button>
        </div>
      </div>

      <FeedbackForm onSubmit={() => setReloadKey((k) => k + 1)} />
      <hr />
      <FeedbackList key={reloadKey} />
    </div>
  );
}

export default App;
