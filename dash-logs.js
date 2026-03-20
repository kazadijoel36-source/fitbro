const API_LOGS = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    ? "http://127.0.0.1:8000" 
    : "https://fitbro-os.onrender.com";

async function syncF() {
    const userId = localStorage.getItem('fitbro_user_id') || "1";
    const input = document.getElementById('f-in').value;
    const btn = document.querySelector('.btn-sync');

    if(!input) return;
    btn.innerText = "ANALYZING...";
    
    try {
        const res = await fetch(`${API_LOGS}/ai-log?user_id=${userId}&food_input=${encodeURIComponent(input)}`, {
            method: 'POST'
        });

        if(res.ok) {
            document.getElementById('f-in').value = ''; 
            btn.innerText = "SYNCED";
            if (typeof refreshAll === 'function') await refreshAll(); 
            setTimeout(() => { btn.innerText = "ANALYZE"; }, 2000);
        }
    } catch (e) {
        btn.innerText = "RETRY";
    }
}

async function updateLogs() {
    const userId = localStorage.getItem('fitbro_user_id') || "1";
    try {
        const res = await fetch(`${API_LOGS}/history/${userId}`);
        const data = await res.json();
        const list = document.getElementById('m-list');
        if(!list) return;

        list.innerHTML = data.history.map(item => `
            <div class="mission-item done" style="margin-bottom:10px; font-size:0.7rem;">
                <span style="color:var(--primary)">[ ANALYZED ]</span> ${item.meal_description.toUpperCase()}<br>
                <span class="mono-tag" style="font-size:0.6rem;">ENERGY_GAIN: ${item.calories} KCAL</span>
            </div>
        `).join('');
    } catch (e) { console.log("HISTORY_OFFLINE"); }
}