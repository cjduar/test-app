import { useState } from "react";
import { useAuth } from "../AuthContext";
import styles from "./FeedbackForm.module.css";

export function FeedbackForm({ onSubmit }: { onSubmit: () => void }) {
  const [message, setMessage] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!message.trim()) {
      setError("Message is required.");
      return;
    }
    if (message.length < 5) {
      setError("Message must be at least 5 characters.");
      return;
    }

    setLoading(true);
    setSuccess(false);
    setError("");

    const formData = new FormData();
    formData.append("id", Date.now().toString());
    formData.append("message", message);
    if (file) formData.append("file", file);

    try {
      const res = await fetch("http://localhost:8000/feedback", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || "Error submitting feedback");
      }

      setMessage("");
      setFile(null);
      setSuccess(true);
      setError("");
      onSubmit();
    } catch (err: any) {
      setError(err.message);
    }finally {
    setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Submit Feedback</h2>
      <form onSubmit={submit}>
        <textarea
          className={styles.textarea}
          placeholder="Enter your feedback"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
        />
        <label className={styles.fileLabel}>
          Upload File
          <input
            type="file"
            className={styles.fileInput}
            onChange={handleFileChange}
            hidden
          />
        </label>
        {file && <div className={styles.fileName}>{file.name}</div>}
        <button type="submit" className={styles.button} disabled={loading}>
          {loading ? "Submitting..." : "Submit"}
        </button>
      </form>
      {success && <p className={styles.success}>Feedback submitted successfully!</p>}
      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
}
