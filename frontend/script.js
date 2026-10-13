const questionInput = document.getElementById("question");
const investigateBtn = document.getElementById("investigateBtn");

const loading = document.getElementById("loading");
const result = document.getElementById("result");

const answer = document.getElementById("answer");
const score = document.getElementById("score");


investigateBtn.addEventListener("click", async function () {

    const question = questionInput.value.trim();

    if (question === "") {
        alert("Please enter a problem.");
        return;
    }

    loading.style.display = "block";
    result.style.display = "none";

    try {

        const response = await fetch(
            "http://127.0.0.1:8000/investigate",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    question: question
                })
            }
        );

        if (!response.ok) {
            throw new Error("Server error");
        }

        const data = await response.json();

        answer.textContent = data.answer;
        score.textContent = data.similarity_score;

        result.style.display = "block";

    } catch (error) {

        answer.textContent =
            "Unable to connect to the AI backend.";

        result.style.display = "block";

        console.error(error);

    } finally {

        loading.style.display = "none";
    }
});

// Load detected anomalies
async function loadAnomalies() {
    try {
        const response = await fetch("http://127.0.0.1:8000/anomalies");

        if (!response.ok) {
            throw new Error("Could not load anomalies");
        }

        const data = await response.json();

const anomalies = data.filter(item => item.anomaly === -1);

document.getElementById("totalAnomalies").textContent = anomalies.length;

document.getElementById("criticalCount").textContent =
    anomalies.filter(item => item.severity === "CRITICAL").length;

document.getElementById("highCount").textContent =
    anomalies.filter(item => item.severity === "HIGH").length;

document.getElementById("normalCount").textContent =
    anomalies.filter(item => item.severity === "NORMAL").length;

    const oldSection = document.getElementById("anomaly-section");

if (oldSection) {
    oldSection.remove();
}

const section = document.createElement("div");
        section.id = "anomaly-section";

        section.innerHTML = `
            <h2>Detected Anomalies</h2>
            <p>Unusual system activity detected by the ML model.</p>
        `;

        anomalies.forEach(item => {
    const card = document.createElement("div");

    card.innerHTML = `
    <p><strong>Info Count:</strong> ${item.info_count}</p>
    <p><strong>Warning Count:</strong> ${item.warning_count}</p>
    <p><strong>Error Count:</strong> ${item.error_count}</p>
    <p><strong>Anomaly:</strong> 🚨 Yes</p>

    <p>
        <strong>Severity:</strong>
        <span class="severity ${item.severity.toLowerCase()}">
            ${item.severity}
        </span>
    </p>

    <p><strong>Affected Service:</strong> ${item.affected_service}</p>

    <p><strong>Anomaly Score:</strong> ${item.score}</p>

    <button class="investigate-anomaly">
        🔎 Investigate This Anomaly
    </button>

    <hr>
`;

    const button = card.querySelector(".investigate-anomaly");

    button.addEventListener("click", async () => {

        questionInput.value =
            `Why are there unusual system errors with ${item.error_count} errors and ${item.warning_count} warnings?`;

        investigateBtn.click();
    });

    section.appendChild(card);
});

        document.body.appendChild(section);

    } catch (error) {
        console.error("Anomaly detection error:", error);
    }
}

const uploadBtn = document.getElementById("uploadBtn");
const logFile = document.getElementById("logFile");
const uploadStatus = document.getElementById("uploadStatus");

uploadBtn.addEventListener("click", async () => {

    if (!logFile.files.length) {
        uploadStatus.textContent = "Please select a log file first.";
        return;
    }

    const formData = new FormData();
    formData.append("file", logFile.files[0]);

    uploadStatus.textContent = "Uploading log file...";

    try {
        const response = await fetch("http://127.0.0.1:8000/upload-log", {
            method: "POST",
            body: formData
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.detail || "Upload failed");
        }

        uploadStatus.textContent =
            `✅ ${result.filename} uploaded successfully.`;

            await loadAnomalies();

    } catch (error) {
        uploadStatus.textContent =
            `❌ ${error.message}`;
    }
});

loadAnomalies();