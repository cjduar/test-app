# backend/main.py
from fastapi import FastAPI, HTTPException, Depends, status, UploadFile, File, Form, Header, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from typing import List, Optional
import shutil
import os
from uuid import uuid4

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
    role: str = "user"

fake_db: List[Feedback] = []
authenticated_users = {
    "testuser": {"password": "password123", "role": "user"},
    "admin": {"password": "admin123", "role": "admin"},
}
auth_tokens = {}

def fake_auth(user: User):
    user_record = authenticated_users.get(user.username)
    if user_record and user_record["password"] == user.password:
        return {"username": user.username, "role": user_record["role"]}
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
    return auth_tokens[token]  

@app.post("/login")
def login(user: User):
    auth_info = fake_auth(user)
    token = str(uuid4())
    auth_tokens[token] = auth_info
    return {"token": token}
    raise HTTPException(status_code=401, detail="Invalid credentials")

@app.get("/me")
def get_current_user_info(authorization: str = Header(...)):
    user = verify_token(authorization)
    return {"username": user["username"], "role": user["role"]}

@app.get("/feedback")
def get_feedback(
    q: Optional[str] = Query(None, description="Search query"),
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
):
    filtered = fake_db

    if q:
        filtered = [f for f in fake_db if q.lower() in f.message.lower()]

    total = len(filtered)

    start = (page - 1) * page_size
    end = start + page_size
    items = filtered[start:end]

    return JSONResponse(content={
        "items": [f.dict() for f in items],  # convert Pydantic models to dict
        "total": total
    })

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
    user = verify_token(authorization)
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admins only")

    global fake_db
    initial_len = len(fake_db)
    fake_db = [f for f in fake_db if f.id != feedback_id]
    if len(fake_db) < initial_len:
        return {"message": "Deleted"}
    raise HTTPException(status_code=404, detail="Feedback not found")
