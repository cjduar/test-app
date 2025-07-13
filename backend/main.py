from fastapi import FastAPI
from pydantic import BaseModel
from typing import List

app= FastAPI()

class Feedback(BaseModel):
    id: int
    message: str

fake_db = []

@app.get("/feedback", response_model=List[Feedback])
def get_feedback():
    return fake_db

@app.post("/feedback", response_model=Feedback)
def submit_feedback(feedback:Feedback):
    fake_db.append(feedback)
    return feedback