import { useEffect, useState } from "react";
import { type Feedback } from "../types/feedback";
import { EditFeedbackForm } from "./EditFeedbackForm";
import { useAuth } from "../AuthContext";
import styles from "./FeedbackList.module.css";

export function FeedbackList() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [editing, setEditing] = useState<number | null>(null);
  const [error, setError] = useState("");
  const { token } = useAuth();

  const load = async () => {
    try {
      const res = await fetch("http://localhost:8000/feedback");
      const data = await res.json();
      setFeedbacks(data);
      setError("");
    } catch {
      setError("Failed to fetch feedback");
    }
  };

  useEffect(() => {
    load();
  }, []);

  const deleteItem = async (id: number) => {

    await fetch(`http://localhost:8000/feedback/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    load();
  };

  return (
    <div className={styles.container}>
      {feedbacks.map((fb) => (
        <div key={fb.id} className={styles.item}>
          {editing === fb.id ? (
            <EditFeedbackForm
              item={fb}
              onSave={() => {
                setEditing(null);
                load();
              }}
              onCancel={() => setEditing(null)}
            />
          ) : (
            <>
              <p className={styles.message}>{fb.message}</p>
              {fb.file_path && (
                <a
                  href={`http://localhost:8000/${fb.file_path}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.fileLink}
                >
                  View File
                </a>
              )}
              <div className={styles.actions}>
                <button
                  className={`${styles.button} ${styles.edit}`}
                  onClick={() => setEditing(fb.id)}
                >
                  Edit
                </button>
                <button
                  className={`${styles.button} ${styles.delete}`}
                  onClick={() => deleteItem(fb.id)}
                >
                  Delete
                </button>
              </div>
            </>
          )}
        </div>
      ))}
    </div>
    );
}