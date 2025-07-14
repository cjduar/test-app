from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List

app = FastAPI()

# ✅ Allow frontend origin
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # or ["*"] for all
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Feedback(BaseModel):
    id: int
    message: str

fake_db = []

@app.get("/feedback", response_model=List[Feedback])
def get_feedback():
    return fake_db

@app.post("/feedback", response_model=Feedback)
def submit_feedback(feedback: Feedback):
    fake_db.append(feedback)
    return feedback
