from collections import defaultdict
from ml_model import detect_anomalies
from rag import answer_question


def analyze_logs():

    file = open("data/logs/sample.log", "r")

    logs = file.readlines()

    time_windows = defaultdict(lambda: {
        "API": {"INFO": 0, "WARNING": 0, "ERROR": 0},
        "PAYMENT": {"INFO": 0, "WARNING": 0, "ERROR": 0},
        "DATABASE": {"INFO": 0, "WARNING": 0, "ERROR": 0}
    })

    for log in logs:

        if log.strip() == "":
            continue

        parts = log.strip().split(" | ")

        timestamp = parts[0]
        level = parts[1]
        service = parts[2]

        minute = timestamp[:16]

        time_windows[minute][service][level] += 1

    file.close()

    data = []
    minutes = []

    for minute, services in time_windows.items():

        minutes.append(minute)

        data.append([
            services["API"]["ERROR"],
            services["PAYMENT"]["ERROR"],
            services["DATABASE"]["ERROR"]
        ])

    predictions, scores = detect_anomalies(data)

    for i in range(len(minutes)):

        print("Time:", minutes[i])

        print("API errors:", data[i][0])
        print("PAYMENT errors:", data[i][1])
        print("DATABASE errors:", data[i][2])

        print("Anomaly score:", round(scores[i], 3))

        if predictions[i] == -1:

            services = {
            "API": data[i][0],
            "PAYMENT": data[i][1],
            "DATABASE": data[i][2]
    }

            affected_service = max(services, key=services.get)
            error_count = services[affected_service]

            print("🚨 ANOMALY DETECTED")
            print("Most affected service:", affected_service)
            print("Error count:", error_count)

            investigation_question = (
                f"Why is the {affected_service} service experiencing "
                f"{error_count} errors?"
        )

            ai_answer, rag_score = answer_question(investigation_question)

            print("\n🤖 AI INVESTIGATION")
            print("--------------------")
            print("Question:", investigation_question)
            print("Knowledge similarity:", round(rag_score, 3))
            print("\nAnalysis:")
            print(ai_answer)

        else:
            print("✅ Normal")

        print("--------------------")


analyze_logs()