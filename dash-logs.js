async function syncF() {
    const userId = localStorage.getItem('fitbro_user_id');
    const input = document.getElementById('f-in').value;
    const btn = document.querySelector('.btn-sync');

    if(!input) return;

    btn.innerText = "ANALYZING...";
    
    try {
        // 1. Send to AI Router
        const res = await fetch(`http://127.0.0.1:8000/ai-log?user_id=${userId}&food_input=${encodeURIComponent(input)}`, {
            method: 'POST'
        });

        if(res.ok) {
            document.getElementById('f-in').value = ''; // Clear input
            btn.innerText = "SYNCED";
            
            // 2. CRITICAL: Trigger the UI Refresh
            await refreshAll(); 
            
            setTimeout(() => { btn.innerText = "ANALYZE"; }, 2000);
        }
    } catch (e) {
        console.error("NUTRITION_LINK_FAILED", e);
        btn.innerText = "RETRY";
    }
}

async function updateLogs() {
    const userId = localStorage.getItem('fitbro_user_id');
    const res = await fetch(`http://127.0.0.1:8000/history/${userId}`);
    const data = await res.json();
    
    const list = document.getElementById('m-list');
    if(!list) return;

    // 3. Inject the History into the HTML
    list.innerHTML = data.history.map(item => `
        <div class="mission-item done" style="margin-bottom:10px; font-size:0.7rem;">
            <span style="color:var(--primary)">[ ANALYZED ]</span> ${item.meal_description.toUpperCase()}<br>
            <span class="mono-tag" style="font-size:0.6rem;">ENERGY_GAIN: ${item.calories} KCAL</span>
        </div>
    `).join('');
}

async function syncF() {
    const userId = localStorage.getItem('fitbro_user_id');
    const val = document.getElementById('f-in').value;
    if(!val) return;
    
    await fetch(`http://127.0.0.1:8000/ai-log?user_id=${userId}&food_input=${val}`, {method:'POST'});
    document.getElementById('f-in').value = '';
    refreshAll();
}

// Cursor HUD logic stays here as a global utility
document.addEventListener('mousemove', (e) => {
    const c = document.getElementById('custom-cursor');
    if(c) {
        c.style.left = e.clientX + 'px';
        c.style.top = e.clientY + 'px';
    }
});