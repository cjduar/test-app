import { useState } from "react";
import { useAuth } from "../AuthContext";
import { type Feedback } from "../types/feedback";
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
    const [message, setMessage] = useState(item.message);
    const { token } = useAuth();

    const save = async () => {
        await fetch(`http://localhost:8000/feedback/${item.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ id: item.id, message }),
        });
        onSave();
    };

    return (
        <div className={styles.container}>
            <h2 className={styles.title}>Edit Feedback</h2>
            <textarea
                className={styles.textarea}
                value={message}
                onChange={e => setMessage(e.target.value)}
            />
            <div className={styles.buttonGroup}>
                <button className={`${styles.button} ${styles.save}`} onClick={save}>
                    Save
                </button>
                <button className={`${styles.button} ${styles.cancel}`} onClick={onCancel}>
                    Cancel
                </button>
            </div>
        </div>
    );
}