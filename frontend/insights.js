(function () {
    const severitySegments = [
        ["barCritical", "criticalCount"],
        ["barHigh", "highCount"],
        ["barMedium", "mediumCount"],
        ["barLow", "lowCount"],
        ["barNormal", "normalCount"]
    ];

    function paintSeverity() {
        severitySegments.forEach(([barId, countId]) => {
            const count = Number(document.getElementById(countId).textContent) || 0;
            document.getElementById(barId).style.flexGrow = count;
        });
    }

    function paintScore() {
        const scoreElement = document.getElementById("score");
        const meter = document.querySelector(".score-meter");
        let value = Number.parseFloat(scoreElement.textContent);

        if (!Number.isFinite(value)) {
            value = 0;
        } else if (value >= 0 && value <= 1) {
            value *= 100;
        }

        value = Math.max(0, Math.min(value, 100));
        document.getElementById("scoreFill").style.width = `${value}%`;
        meter.setAttribute("aria-valuenow", String(Math.round(value)));
    }

    function watch(element, callback) {
        new MutationObserver(callback).observe(element, {
            childList: true,
            characterData: true,
            subtree: true
        });
    }

    severitySegments.forEach(([, countId]) => {
        watch(document.getElementById(countId), paintSeverity);
    });
    watch(document.getElementById("score"), paintScore);
    paintSeverity();
    paintScore();
})();
