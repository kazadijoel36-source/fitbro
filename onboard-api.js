const API_BASE = window.location.hostname.includes("render.com") 
    ? "https://fitbro-os.onrender.com" 
    : "http://127.0.0.1:8000";

async function finalizeOnboarding() {
    const userId = localStorage.getItem('fitbro_user_id') || "1";
    const data = {
        weight: parseFloat(document.getElementById('in-weight').value),
        target: parseFloat(document.getElementById('in-target').value),
        height: parseInt(document.getElementById('in-height').value),
        lactose: onboardState.lactose ? "YES" : "NO",
        pushups: parseInt(document.getElementById('in-push').value),
        pullups: parseInt(document.getElementById('in-pull').value)
    };

    try {
        const res = await fetch(`${API_BASE}/initialize-vanguard/${userId}`, {
            method: 'POST',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });

        if (res.ok) {
            window.location.href = 'dashboard.html';
        } else {
            console.error("INITIALIZATION_REJECTED");
        }
    } catch (e) {
        alert("CRITICAL_SYSTEM_ERROR: Check Backend Link.");
    }
}