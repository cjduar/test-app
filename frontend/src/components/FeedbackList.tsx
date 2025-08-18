import { useEffect, useState } from "react";
import { type Feedback } from "../types/feedback";
import { EditFeedbackForm } from "./EditFeedbackForm";
import { useAuth } from "../AuthContext";
import styles from "./FeedbackList.module.css";
import { Toast } from "./Toast";

export function FeedbackList() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [editing, setEditing] = useState<number | null>(null);
  const [error, setError] = useState("");
  const { token, role } = useAuth();
  const [loading, setLoading] = useState(false);
  
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Pagination & search
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);
 

  const PAGE_SIZE = 5;

  const load = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `http://localhost:8000/feedback?q=${encodeURIComponent(search)}&page=${page}&page_size=${PAGE_SIZE}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!res.ok) {
        throw new Error("Failed to fetch feedback");
      }
      const data = await res.json();
      setFeedbacks(data.items);
      setTotal(data.total);
      setHasMore(data.items.length === PAGE_SIZE && page * PAGE_SIZE < data.total);
      setError("");
    } catch (err: any) {
      setError(err.message);
      setToast({ message: err.message, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      load();
    }
  }, [token, page, search]);

  const deleteItem = async (id: number) => {
    try {
      const res = await fetch(`http://localhost:8000/feedback/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error("Failed to delete feedback");
      setToast({ message: "Feedback deleted successfully", type: "success" });
      load();
    } catch (err: any){
      setToast({ message: err.message || "Delete failed", type: "error" });
    }
  };

  return (
    <div className={styles.container}>
      <h2>All Feedback</h2>

      {/* Search box */}
      <input
        type="text"
        placeholder="Search feedback"
        value={search}
        onChange={(e) => {
          setPage(1); // reset to first page on new search
          setSearch(e.target.value);
        }}
      />

      {loading && <p>Loading feedback...</p>}
      {error && <p className={styles.error}>{error}</p>}

      {feedbacks.length === 0 && !loading && <p>No feedback found.</p>}

      {feedbacks.map((item) => (
        <div key={item.id} className={styles.item}>
          {editing === item.id ? (
            <EditFeedbackForm
              item={item}
              onSave={() => {
                setEditing(null);
                setToast({ message: "Feedback updated successfully", type: "success" });
                load();
              }}
              onCancel={() => setEditing(null)}
            />
          ) : (
            <>
              <p className={styles.message}>{item.message}</p>
              {item.file_path && (
                <a
                  href={`http://localhost:8000/${item.file_path}`}
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
                  onClick={() => setEditing(item.id)}
                >
                  Edit
                </button>
                {role === "admin" && (
                  <button
                    className={`${styles.button} ${styles.delete}`}
                    onClick={() => deleteItem(item.id)}
                  >
                    Delete
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      ))}
      {/* Results counter */}
      {total > 0 && (
        <p>
          Showing {(page - 1) * PAGE_SIZE + 1}–
          {Math.min(page * PAGE_SIZE, total)} of {total} results
        </p>
      )}

      {/* Pagination controls */}
      <div className={styles.actions}>
        <button disabled={page === 1} onClick={() => setPage(page - 1)}>
          Prev
        </button>
        <span>Page {page}</span>
        <button disabled={!hasMore} onClick={() => setPage(page + 1)}>
          Next
        </button>
      </div>

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