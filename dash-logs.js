// VANGUARD_FUEL_SYSTEM_CORE
const LOGS_API = window.location.hostname.includes("render.com") 
    ? "https://fitbro-os.onrender.com" 
    : "http://127.0.0.1:8000";

async function syncF() {
    const userId = localStorage.getItem('fitbro_user_id') || "1";
    const input = document.getElementById('food-input');
    const btn = document.querySelector('.btn-execute');

    if(!input || !input.value) return alert("INPUT_REQUIRED");

    btn.innerText = "ANALYZING...";
    btn.disabled = true;
    
    try {
        const res = await fetch(`${LOGS_API}/ai-log?user_id=${userId}&food_input=${encodeURIComponent(input.value)}`, {
            method: 'POST'
        });

        if(res.ok) {
            input.value = '';
            btn.innerText = "SYNCED";
            // Refresh history list after successful log
            await updateLogs(); 
            setTimeout(() => { 
                btn.innerText = "SYNC_TO_VAULT"; 
                btn.disabled = false;
            }, 2000);
        }
    } catch (e) {
        console.error("LOG_LINK_SEVERED", e);
        btn.innerText = "RETRY";
        btn.disabled = false;
    }
}

async function updateLogs() {
    const userId = localStorage.getItem('fitbro_user_id') || "1";
    const list = document.getElementById('m-list');
    if(!list) return;

    try {
        const res = await fetch(`${LOGS_API}/history/${userId}`);
        const data = await res.json();
        
        if (data.length === 0) {
            list.innerHTML = "<div class='tag'>NO_HISTORY_FOUND</div>";
            return;
        }

        list.innerHTML = data.map(item => `
            <div class="card" style="margin-bottom:10px; font-size:0.7rem; border-color:var(--border); padding:10px;">
                <span style="color:var(--primary)">[ ANALYZED ]</span> ${item.event.toUpperCase()}<br>
                <span class="mono-tag" style="font-size:0.6rem; color:#444;">XP_GAINED: +${item.xp} | ${new Date(item.date).toLocaleDateString()}</span>
            </div>
        `).join('');
    } catch (e) { 
        list.innerHTML = "<span style='color:var(--danger)'>OFFLINE_SYNC_ERROR</span>"; 
    }
}

// Initialize logs when the fuel page opens
if (document.getElementById('m-list')) {
    window.onload = updateLogs;
}