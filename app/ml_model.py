from collections import Counter, defaultdict
from datetime import datetime

import pandas as pd
from sklearn.ensemble import IsolationForest


UPLOADED_LOG_PATH = "data/logs/uploaded.log"
FEATURE_COLUMNS = ["info_count", "warning_count", "error_count"]


def parse_uploaded_log(log_path=UPLOADED_LOG_PATH):
    time_windows = defaultdict(lambda: {
        "info_count": 0,
        "warning_count": 0,
        "error_count": 0,
        "service_counts": {
            "ERROR": Counter(),
            "WARNING": Counter(),
            "INFO": Counter()
        }
    })

    level_columns = {
        "INFO": "info_count",
        "WARNING": "warning_count",
        "ERROR": "error_count"
    }

    with open(log_path, "r", encoding="utf-8") as file:
        for line_number, raw_line in enumerate(file, start=1):
            if not raw_line.strip():
                continue

            parts = [part.strip() for part in raw_line.split("|")]

            if len(parts) < 3:
                raise ValueError(
                    f"Invalid log format on line {line_number}; "
                    "expected timestamp | level | service."
                )

            try:
                timestamp = datetime.fromisoformat(parts[0])
            except ValueError as error:
                raise ValueError(
                    f"Invalid timestamp on log line {line_number}."
                ) from error

            level = parts[1].upper()
            level = {
                "WARN": "WARNING",
                "FATAL": "ERROR",
                "CRITICAL": "ERROR"
            }.get(level, level)

            if level not in level_columns:
                continue

            minute = timestamp.strftime("%Y-%m-%d %H:%M")
            service = parts[2] or "UNKNOWN"
            window = time_windows[minute]
            window[level_columns[level]] += 1
            window["service_counts"][level][service] += 1

    records = []

    for minute, counts in sorted(time_windows.items()):
        affected_service = "UNKNOWN"
        for level in ("ERROR", "WARNING", "INFO"):
            services = counts["service_counts"][level]
            if services:
                affected_service = services.most_common(1)[0][0]
                break

        records.append({
            "timestamp": minute,
            "info_count": counts["info_count"],
            "warning_count": counts["warning_count"],
            "error_count": counts["error_count"],
            "affected_service": affected_service
        })

    return pd.DataFrame(
        records,
        columns=["timestamp", *FEATURE_COLUMNS, "affected_service"]
    )


def detect_anomalies():
    training_data = pd.read_csv("data/training_data.csv")
    missing_columns = set(FEATURE_COLUMNS) - set(training_data.columns)
    if missing_columns:
        raise ValueError(
            "Training data is missing columns: "
            + ", ".join(sorted(missing_columns))
        )

    uploaded_data = parse_uploaded_log(UPLOADED_LOG_PATH)

    if uploaded_data.empty:
        uploaded_data["anomaly"] = pd.Series(dtype="int64")
        uploaded_data["score"] = pd.Series(dtype="float64")
        return uploaded_data

    model = IsolationForest(
        contamination=0.2,
        random_state=42
    )

    model.fit(training_data[FEATURE_COLUMNS])

    features = uploaded_data[FEATURE_COLUMNS]
    uploaded_data["anomaly"] = model.predict(features)
    uploaded_data["score"] = model.decision_function(features)

    return uploaded_data


def get_uploaded_log_context(
    log_path=UPLOADED_LOG_PATH,
    max_lines=40,
    max_characters=6000
):
    with open(log_path, "r", encoding="utf-8") as file:
        lines = [line.rstrip() for line in file if line.strip()]

    selected_lines = []
    character_count = 0

    for line in reversed(lines[-max_lines:]):
        available = max_characters - character_count
        if available <= 0:
            break

        selected_line = line[:available]
        selected_lines.append(selected_line)
        character_count += len(selected_line) + 1

    return "\n".join(reversed(selected_lines))
