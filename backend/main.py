# backend/main.py
from fastapi import FastAPI, HTTPException, Depends, status, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional
import shutil
import os
from fastapi.staticfiles import StaticFiles
from uuid import uuid4
from fastapi import Header


app = FastAPI()

app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

class Feedback(BaseModel):
    id: int
    message: str = Field(..., min_length=5, max_length=500)
    file_path: Optional[str] = None

class User(BaseModel):
    username: str
    password: str

fake_db: List[Feedback] = []
authenticated_users = {"testuser": "password123"}
auth_tokens = {}

def fake_auth(user: User):
    if authenticated_users.get(user.username) == user.password:
        return True
    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

def get_current_user(username: str = Form(...), password: str = Form(...)):
    if authenticated_users.get(username) == password:
        return username
    raise HTTPException(status_code=401, detail="Unauthorized")

def verify_token(authorization: str = Header(...)):
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid token format")
    token = authorization[7:]
    if token not in auth_tokens:
        raise HTTPException(status_code=401, detail="Unauthorized")
    return auth_tokens[token]  # returns username

@app.post("/login")
def login(user: User):
    if fake_auth(user):
        token = str(uuid4())  # generate fake token
        auth_tokens[token] = user.username
        return {"token": token}
    raise HTTPException(status_code=401, detail="Invalid credentials")

@app.get("/me")
def get_current_user_info(authorization: str = Header(...)):
    username = verify_token(authorization)
    return {"username": username}

@app.get("/feedback", response_model=List[Feedback])
def get_feedback():
    return fake_db

@app.post("/feedback", response_model=Feedback)
def submit_feedback(
    id: int = Form(...),
    message: str = Form(...),
    file: Optional[UploadFile] = File(None),
    authorization: str = Header(...)
):
    username = verify_token(authorization)

    if message == "trigger_error":
        raise HTTPException(status_code=500, detail="Simulated server error")

    file_path = None
    if file:
        file_path = os.path.join(UPLOAD_DIR, file.filename)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

    feedback = Feedback(id=id, message=message, file_path=file_path)
    fake_db.append(feedback)
    return feedback

@app.put("/feedback/{feedback_id}", response_model=Feedback)
def update_feedback(
    feedback_id: int,
    updated_feedback: Feedback,
    authorization: str = Header(...)
):
    username = verify_token(authorization)

    for i, item in enumerate(fake_db):
        if item.id == feedback_id:
            fake_db[i] = updated_feedback
            return updated_feedback
    raise HTTPException(status_code=404, detail="Feedback not found")

@app.delete("/feedback/{feedback_id}")
def delete_feedback(feedback_id: int, authorization: str = Header(...)):
    username = verify_token(authorization)

    global fake_db
    initial_len = len(fake_db)
    fake_db = [f for f in fake_db if f.id != feedback_id]
    if len(fake_db) < initial_len:
        return {"message": "Deleted"}
    raise HTTPException(status_code=404, detail="Feedback not found")
