from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from app.rag import answer_question
from app.ml_model import (
    UPLOADED_LOG_PATH,
    detect_anomalies,
    get_uploaded_log_context
)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class Question(BaseModel):
    question: str


@app.get("/")
def home():
    return {"message": "AI Problem Detector API is running"}



@app.post("/investigate")
def investigate(data: Question):
    import os

    log_path = UPLOADED_LOG_PATH

    # Require a log file before investigating
    if not os.path.exists(log_path) or os.path.getsize(log_path) == 0:
        raise HTTPException(
            status_code=400,
            detail="Please upload a log file before starting an investigation."
        )

    answer, score = answer_question(
        data.question,
        log_context=get_uploaded_log_context(UPLOADED_LOG_PATH)
    )

    return {
        "question": data.question,
        "similarity_score": round(float(score), 2),
        "answer": answer
    }


@app.get("/anomalies")
def get_anomalies():
    import os

    log_path = UPLOADED_LOG_PATH

    # No uploaded log file exists yet
    if not os.path.exists(log_path):
        return []

    # Empty uploaded file
    if os.path.getsize(log_path) == 0:
        return []

    try:
        data = detect_anomalies()
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error

    records = data.to_dict(orient="records")

    for item in records:
        error_count = item["error_count"]
        warning_count = item["warning_count"]

        if error_count >= 20:
            severity = "CRITICAL"
        elif error_count >= 10:
            severity = "HIGH"
        elif error_count >= 5:
            severity = "MEDIUM"
        elif error_count > 0 or warning_count >= 3:
            severity = "LOW"
        else:
            severity = "NORMAL"

        item["severity"] = severity
        item["score"] = round(float(item["score"]), 3)

    return records

@app.post("/upload-log")
async def upload_log(file: UploadFile = File(...)):
    contents = await file.read()

    if not contents.strip():
        raise HTTPException(
            status_code=400,
            detail="The uploaded log file is empty."
        )

    with open(UPLOADED_LOG_PATH, "wb") as output_file:
        output_file.write(contents)

    return {
        "message": "Log file uploaded successfully",
        "filename": file.filename
    }