const questionInput = document.getElementById("question");
const investigateBtn = document.getElementById("investigateBtn");
const loading = document.getElementById("loading");
const result = document.getElementById("result");
const answer = document.getElementById("answer");
const score = document.getElementById("score");
const uploadBtn = document.getElementById("uploadBtn");
const logFile = document.getElementById("logFile");
const uploadStatus = document.getElementById("uploadStatus");
const dropZone = document.getElementById("dropZone");
const selectedFile = document.getElementById("selectedFile");
const selectedFileName = document.getElementById("selectedFileName");
const selectedFileSize = document.getElementById("selectedFileSize");

const isLocalDevelopment =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1";
const API_URL = isLocalDevelopment
    ? "http://127.0.0.1:8000"
    : window.location.origin;

function formatFileSize(bytes) {
    if (bytes < 1024) {
        return `${bytes} B`;
    }

    if (bytes < 1024 * 1024) {
        return `${(bytes / 1024).toFixed(1)} KB`;
    }

    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function showSelectedFile(file) {
    if (!file) {
        selectedFile.hidden = true;
        return;
    }

    selectedFileName.textContent = file.name;
    selectedFileSize.textContent = formatFileSize(file.size);
    selectedFile.hidden = false;
}

logFile.addEventListener("change", function () {
    showSelectedFile(logFile.files[0]);
});

["dragenter", "dragover"].forEach(eventName => {
    dropZone.addEventListener(eventName, function (event) {
        event.preventDefault();
        dropZone.classList.add("drag-over");
    });
});

["dragleave", "drop"].forEach(eventName => {
    dropZone.addEventListener(eventName, function (event) {
        event.preventDefault();
        dropZone.classList.remove("drag-over");
    });
});

dropZone.addEventListener("drop", function (event) {
    const file = event.dataTransfer.files[0];
    if (!file) {
        return;
    }

    const transfer = new DataTransfer();
    transfer.items.add(file);
    logFile.files = transfer.files;
    showSelectedFile(file);
});

document.querySelectorAll(".prompt-chip").forEach(button => {
    button.addEventListener("click", function () {
        questionInput.value = button.dataset.prompt;
        questionInput.focus();
    });
});

document.querySelectorAll(".primary-nav .nav-link").forEach(link => {
    link.addEventListener("click", function () {
        document.querySelectorAll(".primary-nav .nav-link").forEach(item => {
            item.classList.remove("active");
            item.removeAttribute("aria-current");
        });
        link.classList.add("active");
        link.setAttribute("aria-current", "page");
    });
});

investigateBtn.addEventListener("click", async function (event) {
    event.preventDefault();

    const question = questionInput.value.trim();
    if (!question) {
        questionInput.focus();
        questionInput.setCustomValidity("Enter a question to investigate.");
        questionInput.reportValidity();
        questionInput.addEventListener("input", () => {
            questionInput.setCustomValidity("");
        }, { once: true });
        return;
    }

    loading.style.display = "flex";
    result.style.display = "none";
    investigateBtn.disabled = true;
    document.getElementById("resultStatus").textContent = "ANALYZING";

    try {
        const response = await fetch(`${API_URL}/investigate`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ question })
        });
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.detail || "Investigation failed.");
        }

        answer.textContent = data.answer ?? "No answer was returned.";
        score.textContent = data.similarity_score ?? "N/A";
        document.getElementById("resultStatus").textContent = "COMPLETE";
        result.style.display = "block";
        result.scrollIntoView({ behavior: "smooth", block: "nearest" });
    } catch (error) {
        console.error("Investigation error:", error);
        answer.textContent = error.message || "Unable to connect to the backend.";
        score.textContent = "N/A";
        document.getElementById("resultStatus").textContent = "FAILED";
        result.style.display = "block";
    } finally {
        loading.style.display = "none";
        investigateBtn.disabled = false;
    }
});

function renderTimeline(data) {
    const chart = document.getElementById("timelineChart");
    chart.replaceChildren();

    if (data.length === 0) {
        const empty = document.createElement("p");
        empty.className = "chart-empty";
        empty.textContent = "Upload a log to see activity by minute.";
        chart.appendChild(empty);
        return;
    }

    const visibleWindows = data.slice(-36);
    const maxErrors = Math.max(
        1,
        ...visibleWindows.map(item => Number(item.error_count) || 0)
    );

    visibleWindows.forEach(item => {
        const column = document.createElement("div");
        column.className = "timeline-column";

        const errorCount = Number(item.error_count) || 0;
        const severity = String(item.severity || "normal").toLowerCase();
        column.title =
            `${item.timestamp}: ${errorCount} errors, ${item.warning_count} warnings (${item.severity})`;

        const track = document.createElement("div");
        track.className = "timeline-track";

        const bar = document.createElement("span");
        bar.className = `timeline-bar severity-${severity}`;
        bar.style.height = `${Math.max(3, (errorCount / maxErrors) * 100)}%`;
        track.appendChild(bar);

        const label = document.createElement("span");
        label.className = "timeline-label";
        label.textContent = String(item.timestamp || "").slice(11, 16);

        column.append(track, label);
        chart.appendChild(column);
    });
}

function renderAnomalies(anomalies) {
    const anomalySection = document.getElementById("anomaly-section");
    anomalySection.replaceChildren();

    if (anomalies.length === 0) {
        const emptyState = document.createElement("div");
        emptyState.className = "empty-state";

        const icon = document.createElement("span");
        icon.className = "empty-orbit";
        icon.setAttribute("aria-hidden", "true");

        const title = document.createElement("strong");
        title.textContent = "No unusual windows detected";

        const description = document.createElement("p");
        description.textContent =
            "All analyzed time windows are within the model's expected range.";

        emptyState.append(icon, title, description);
        anomalySection.appendChild(emptyState);
        return;
    }

    anomalies.forEach(item => {
        const card = document.createElement("article");
        card.className = "anomaly-card";

        const details = [
            ["Time", item.timestamp],
            ["Info Count", item.info_count],
            ["Warning Count", item.warning_count],
            ["Error Count", item.error_count],
            ["Severity", item.severity ?? "UNKNOWN"],
            ["Affected Service", item.affected_service ?? "UNKNOWN"],
            ["Anomaly Score", item.score ?? "N/A"]
        ];

        details.forEach(([label, value]) => {
            const paragraph = document.createElement("p");
            const strong = document.createElement("strong");

            strong.textContent = `${label}: `;
            paragraph.appendChild(strong);

            if (label === "Severity") {
                const badge = document.createElement("span");
                badge.className = `severity ${String(value).toLowerCase()}`;
                badge.textContent = String(value);
                paragraph.appendChild(badge);
            } else {
                paragraph.appendChild(
                    document.createTextNode(String(value ?? "N/A"))
                );
            }

            card.appendChild(paragraph);
        });

        const investigateButton = document.createElement("button");
        investigateButton.type = "button";
        investigateButton.className = "investigate-anomaly";
        investigateButton.textContent = "Investigate this window";

        investigateButton.addEventListener("click", function () {
            questionInput.value =
                `Investigate the ${item.affected_service} activity at ${item.timestamp}. There were ${item.error_count} errors and ${item.warning_count} warnings. What is the likely cause and what should I check?`;

            investigateBtn.click();
            questionInput.focus();
        });

        card.appendChild(investigateButton);
        anomalySection.appendChild(card);
    });
}

async function loadAnomalies() {
    const response = await fetch(`${API_URL}/anomalies`);
    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.detail || "Could not load anomalies.");
    }

    if (!Array.isArray(data)) {
        throw new Error("Unexpected response from the backend.");
    }

    const anomalies = data.filter(item => Number(item.anomaly) === -1);
    const countBySeverity = severity =>
        data.filter(item => item.severity === severity).length;

    document.getElementById("windowCount").textContent = data.length;
    document.getElementById("totalAnomalies").textContent = anomalies.length;
    document.getElementById("criticalCount").textContent =
        countBySeverity("CRITICAL");
    document.getElementById("highCount").textContent =
        countBySeverity("HIGH");
    document.getElementById("mediumCount").textContent =
        countBySeverity("MEDIUM");
    document.getElementById("lowCount").textContent =
        countBySeverity("LOW");
    document.getElementById("normalCount").textContent =
        countBySeverity("NORMAL");

    document.getElementById("criticalLegend").textContent =
        countBySeverity("CRITICAL");
    document.getElementById("highCount").textContent =
        countBySeverity("HIGH");
    document.getElementById("normalLegend").textContent =
        countBySeverity("NORMAL");
    document.getElementById("severityWindowCount").textContent = data.length;
    document.getElementById("navAnomalyCount").textContent = anomalies.length;
    document.getElementById("anomalyCountBadge").textContent =
        `${anomalies.length} ${anomalies.length === 1 ? "finding" : "findings"}`;
    document.getElementById("lastUpdated").textContent =
        `Updated ${new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit"
        })}`;

    renderTimeline(data);
    renderAnomalies(anomalies);
}

uploadBtn.addEventListener("click", async function (event) {
    event.preventDefault();

    if (!logFile.files || logFile.files.length === 0) {
        uploadStatus.textContent = "Choose a log file before starting analysis.";
        return;
    }

    const file = logFile.files[0];
    if (file.size === 0) {
        uploadStatus.textContent = "The selected file is empty.";
        return;
    }

    const formData = new FormData();
    formData.append("file", file);

    uploadBtn.disabled = true;
    uploadStatus.textContent = "Uploading file and scanning time windows...";

    try {
        const response = await fetch(`${API_URL}/upload-log`, {
            method: "POST",
            body: formData
        });
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.detail || "Upload failed.");
        }

        uploadStatus.textContent =
            `${data.filename || file.name} uploaded. Building the dashboard...`;

        try {
            await loadAnomalies();
        } catch (error) {
            console.error("Anomaly detection error:", error);
            uploadStatus.textContent =
                `File uploaded, but dashboard analysis failed: ${error.message}`;
            return;
        }

        uploadStatus.textContent =
            `${data.filename || file.name} analyzed successfully.`;
        document.getElementById("anomaly-dashboard").scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    } catch (error) {
        console.error("Upload error:", error);
        uploadStatus.textContent =
            error.message || "Unable to upload the file.";
    } finally {
        uploadBtn.disabled = false;
    }
});
