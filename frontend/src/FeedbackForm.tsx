// frontend/src/FeedbackForm.tsx
import { useState } from 'react';
import axios from 'axios';

export function FeedbackForm() {
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const submit = async () => {
    await axios.post('http://localhost:8000/feedback', {
      id: Date.now(),
      message,
    });
    setSubmitted(true);
  };

  return (
    <div>
      <h2>Submit Feedback</h2>
      {submitted ? <p>Thanks!</p> : (
        <>
          <textarea value={message} onChange={e => setMessage(e.target.value)} />
          <button onClick={submit}>Send</button>
        </>
      )}
    </div>
  );
}
