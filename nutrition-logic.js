const API_BASE = "https://addie-unoiling-confusedly.ngrok-free.dev";
const userId = localStorage.getItem('fitbro_user_id') || 1;
const vHeaders = { "ngrok-skip-browser-warning": "69420", "Content-Type": "application/json" };

async function refreshNutrition() {
    const res = await fetch(`${API_BASE}/history/${userId}`, { headers: vHeaders });
    const data = await res.json();
    
    const list = document.getElementById('m-list');
    let totalKcal = 0;

    list.innerHTML = data.history.map(item => {
        totalKcal += item.calories;
        return `
            <div class="history-item">
                <div style="display:flex; justify-content:space-between;">
                    <b style="text-transform: uppercase;">${item.meal_description}</b>
                    <span style="color:var(--primary)">+${item.calories} KCAL</span>
                </div>
            </div>
        `;
    }).join('');

    document.getElementById('total-kcal').innerText = totalKcal;
    document.getElementById('meal-count').innerText = data.history.length;
}

async function syncF() {
    const input = document.getElementById('f-in');
    if (!input.value) return;

    await fetch(`${API_BASE}/ai-log?user_id=${userId}&food_input=${encodeURIComponent(input.value)}`, {
        method: 'POST',
        headers: vHeaders
    });
    input.value = "";
    await refreshNutrition();
}

window.onload = refreshNutrition;