
const API = "http://16.171.115.148:8000";

async function apiRequest(path, method = "GET") {
    const response = await fetch(API + path, { method });

    if (!response.ok) {
        throw new Error("Backend returned an error.");
    }

    return response.json();
}

function showMessage(message) {
    document.getElementById("actionMessage").textContent = message;
}

async function refreshDashboard() {
    try {
        const data = await apiRequest("/metrics");

        document.getElementById("connectionStatus").textContent =
            "Backend Connected";

        document.querySelector(".dot").style.background = "#22c55e";

        document.getElementById("activeCloud").textContent =
            data.active_cloud;

        document.getElementById("systemStatus").textContent =
            data.status;

        document.getElementById("cpu").textContent =
            data.cpu_usage + "%";

        document.getElementById("memory").textContent =
            data.memory_usage + "%";

        document.getElementById("latency").textContent =
            data.latency_ms + " ms";

        document.getElementById("cpuBar").style.width =
            Math.min(100, Math.max(0, data.cpu_usage)) + "%";

        document.getElementById("memoryBar").style.width =
            Math.min(100, Math.max(0, data.memory_usage)) + "%";

        await loadLogs();

    } catch (error) {
        document.getElementById("connectionStatus").textContent =
            "Backend Offline";

        document.querySelector(".dot").style.background = "#ef4444";

        document.getElementById("systemStatus").textContent =
            "Disconnected";
    }
}

async function loadLogs() {
    try {
        const result = await apiRequest("/logs");
        const list = document.getElementById("logs");

        list.replaceChildren();

        if (result.logs.length === 0) {
            const item = document.createElement("li");
            item.textContent = "No migration events recorded yet.";
            list.appendChild(item);
            return;
        }

        result.logs.slice().reverse().forEach(message => {
            const item = document.createElement("li");
            item.textContent = message;
            list.appendChild(item);
        });

    } catch (error) {
        console.error("Unable to load migration logs:", error);
    }
}

async function runAction(path) {
    const buttons = document.querySelectorAll(".buttons button");

    buttons.forEach(button => button.disabled = true);

    try {
        const result = await apiRequest(path, "POST");
        showMessage(result.message || "Action completed.");
        await refreshDashboard();

    } catch (error) {
        showMessage(
            "Unable to contact backend. Check that FastAPI is running."
        );

    } finally {
        buttons.forEach(button => button.disabled = false);
    }
}

function simulateLoad() {
    runAction("/simulate-load");
}

function migrateCloud() {
    runAction("/migrate");
}

function resetDemo() {
    runAction("/reset");
}

refreshDashboard();
setInterval(refreshDashboard, 5000);
