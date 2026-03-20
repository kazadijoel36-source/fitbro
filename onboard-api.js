const API_BASE = "https://addie-unoiling-confusedly.ngrok-free.dev";
const vHeaders = { "ngrok-skip-browser-warning": "69420", "Content-Type": "application/json" };

async function finalizeOnboarding() {
    const userId = localStorage.getItem('fitbro_user_id');
    const data = {
        weight: parseFloat(document.getElementById('in-weight').value),
        target: parseFloat(document.getElementById('in-target').value),
        height: parseInt(document.getElementById('in-height').value),
        lactose: onboardState.lactose,
        pushups: parseInt(document.getElementById('in-push').value),
        pullups: parseInt(document.getElementById('in-pull').value)
    };

    const res = await fetch(`${API_BASE}/initialize-vanguard/${userId}`, {
        method: 'POST',
        headers: vHeaders,
        body: JSON.stringify(data)
    });

    if (res.ok) window.location.href = 'dashboard.html';
}