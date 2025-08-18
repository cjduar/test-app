import { useState } from "react";
import { type Feedback } from "../types/feedback";
import { useAuth } from "../AuthContext";
import { Toast } from "./Toast";
import styles from "./EditFeedbackForm.module.css";

export function EditFeedbackForm({
  item,
  onSave,
  onCancel,
}: {
  item: Feedback;
  onSave: () => void;
  onCancel: () => void;
}) {
  const { token } = useAuth();
  const [message, setMessage] = useState(item.message);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const save = async () => {
    try {
      setLoading(true);
      const res = await fetch(`http://localhost:8000/feedback/${item.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id: item.id, message }),
      });

      if (!res.ok) {
        const data = await res.json();
        const detail = data.detail;

        if (Array.isArray(detail) && detail[0]?.msg) {
          throw new Error(detail[0].msg);
        } else if (typeof detail === "string") {
          throw new Error(detail);
        } else {
          throw new Error("Failed to update feedback");
        }
      }

      setToast({ message: "Feedback updated successfully", type: "success" });
      onSave();
    } catch (err: any) {
      const message =
        err?.message ||
        (err?.detail?.[0]?.msg ??
          (typeof err === "string"
            ? err
            : JSON.stringify(err))) ||
        "Update failed";

      setToast({ message, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Edit Feedback</h2>
      <textarea
        className={styles.textarea}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <div className={styles.buttonGroup}>
        <button
          className={`${styles.button} ${styles.save}`}
          onClick={save}
          disabled={loading}
        >
          {loading ? "Saving..." : "Save"}
        </button>
        <button
          className={`${styles.button} ${styles.cancel}`}
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </button>
      </div>

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