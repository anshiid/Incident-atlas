from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from app.rag import answer_question
from app.ml_model import detect_anomalies, get_affected_service

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

    answer, score = answer_question(data.question)

    return {
        "question": data.question,
        "similarity_score": round(float(score), 2),
        "answer": answer
    }

@app.get("/anomalies")
def get_anomalies():
    data = detect_anomalies()

    records = data.to_dict(orient="records")

    service = get_affected_service()

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
        item["affected_service"] = service

        # Convert model score to a normal Python float
        item["score"] = round(float(item["score"]), 3)

    return records

@app.post("/upload-log")
async def upload_log(file: UploadFile = File(...)):

    contents = await file.read()

    with open("data/logs/uploaded.log", "wb") as output_file:
        output_file.write(contents)

    return {
        "message": "Log file uploaded successfully",
        "filename": file.filename
    }