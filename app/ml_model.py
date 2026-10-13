import pandas as pd
from sklearn.ensemble import IsolationForest
from collections import Counter


def detect_anomalies():

    training_data = pd.read_csv("data/training_data.csv")

    uploaded_data = parse_uploaded_log()

    model = IsolationForest(
        contamination=0.2,
        random_state=42
    )

    model.fit(training_data)

    prediction = model.predict(uploaded_data)
    score = model.decision_function(uploaded_data)

    uploaded_data["anomaly"] = prediction
    uploaded_data["score"] = score

    return uploaded_data

def parse_uploaded_log():
    info_count = 0
    warning_count = 0
    error_count = 0

    with open("data/logs/uploaded.log", "r") as file:
        lines = file.readlines()

    for line in lines:
        parts = line.split("|")

        if len(parts) >= 2:
            level = parts[1].strip()

            if level == "INFO":
                info_count += 1

            elif level == "WARNING":
                warning_count += 1

            elif level == "ERROR":
                error_count += 1

    return pd.DataFrame([{
        "info_count": info_count,
        "warning_count": warning_count,
        "error_count": error_count
    }])

def get_affected_service():
    with open("data/logs/uploaded.log", "r") as file:
        lines = file.readlines()

    services = []

    for line in lines:
        parts = line.split("|")

        if len(parts) >= 4:
            level = parts[1].strip()
            service = parts[2].strip()

            if level == "ERROR":
                services.append(service)

    if services:
        return Counter(services).most_common(1)[0][0]

    return "UNKNOWN"