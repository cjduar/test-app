import { useState } from "react";
import { useAuth } from "../AuthContext";
import { Toast } from "./Toast";
import styles from "./FeedbackForm.module.css";

interface Props {
  onSubmit: () => void;
}

export function FeedbackForm({ onSubmit }: { onSubmit: () => void }) {
  const { token } = useAuth();
  const [message, setMessage] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!message.trim()) {
      setToast({ message:"Message is required.", type:"error"});
      return;
    }
    if (message.length < 5) {
      setToast({ message: "Message must be at least 5 characters.", type:"error"});
      return;
    }

    setLoading(true);
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
      setToast({ message: "Feedback submitted successfully!", type: "success" });
      onSubmit();
    } catch (err: any) {
      setToast({message: err.message, type:"error"});
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
      
      {/* ✅ Toast notifications */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
