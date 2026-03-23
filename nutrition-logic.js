/**
 * VANGUARD_OS: NUTRITION_VAULT_LOGIC
 */

// 1. SMART_URL_DETECTION
const NUT_API = window.location.hostname.includes("render.com") 
    ? "https://fitbro-os.onrender.com" 
    : "http://127.0.0.1:8000";

const userId = localStorage.getItem('fitbro_user_id') || "1";

/**
 * REFRESH_NUTRITION: Updates the UI history and calorie totals
 */
async function refreshNutrition() {
    const list = document.getElementById('m-list');
    const kcalDisplay = document.getElementById('total-kcal');
    const countDisplay = document.getElementById('meal-count');

    try {
        const res = await fetch(`${NUT_API}/history/${userId}`);
        if (!res.ok) throw new Error("VAULT_LINK_SEVERED");
        
        const data = await res.json();
        // Handle both object {history: []} and array [] formats
        const historyArray = data.history || data; 
        
        let totalKcal = 0;

        if (list) {
            if (historyArray.length === 0) {
                list.innerHTML = `<div style="text-align:center; color:#444; padding:20px;">NO_FUEL_RECORDS_FOUND</div>`;
            } else {
                list.innerHTML = historyArray.map(item => {
                    const calories = item.calories || 400;
                    totalKcal += calories;
                    return `
                        <div class="card" style="margin-bottom:10px; border-left: 3px solid var(--primary); padding:15px;">
                            <div style="display:flex; justify-content:space-between; align-items:center;">
                                <div>
                                    <span class="tag" style="margin:0;">Analysis_Complete</span>
                                    <b style="text-transform: uppercase; font-size:0.8rem; display:block;">${item.meal_description || item.event}</b>
                                </div>
                                <div style="text-align:right;">
                                    <span style="color:var(--primary); font-family:'Archivo Black';">+${calories}</span>
                                    <span class="tag" style="margin:0;">KCAL</span>
                                </div>
                            </div>
                        </div>
                    `;
                }).join('');
            }
        }

        if (kcalDisplay) kcalDisplay.innerText = totalKcal;
        if (countDisplay) countDisplay.innerText = historyArray.length;

    } catch (e) {
        if (list) list.innerHTML = `<div class="tag" style="color:var(--danger); text-align:center;">DATABASE_OFFLINE</div>`;
    }
}

/**
 * SYNC_FUEL: Sends meal data to AI for analysis
 */
async function syncFuel() {
    async function syncFuel() {
    const food = document.getElementById('food-input').value;
    if(!food) return alert("INPUT_REQUIRED");

    // SMART_URL: Detects if you are on your ProBook or Phone (Render)
    const API_BASE = window.location.hostname.includes("render.com") 
        ? "https://fitbro-os.onrender.com" 
        : "http://127.0.0.1:8000";

    try {
        // Now it uses the dynamic API_BASE instead of a hardcoded IP
        const res = await fetch(`${API_BASE}/ai-log?user_id=1&food_input=${encodeURIComponent(food)}`, { 
            method: 'POST' 
        });
        
        if(res.ok) {
            alert("FUEL_RECORD_STORED");
            document.getElementById('food-input').value = "";
        } else {
            alert("SYNC_FAILURE_404");
        }
    } catch (e) {
        alert("SYSTEM_OFFLINE: DATABASE_LINK_SEVERED");
    }
}
    const input = document.getElementById('food-input');
    const btn = document.getElementById('sync-btn');
    if (!input || !input.value) return alert("INPUT_REQUIRED");

    const originalText = btn.innerText;
    btn.innerText = "ANALYZING...";
    btn.disabled = true;

    try {
        const res = await fetch(`${NUT_API}/ai-log?user_id=${userId}&food_input=${encodeURIComponent(input.value)}`, { 
            method: 'POST' 
        });

        if (res.ok) {
            input.value = "";
            btn.innerText = "SYNC_SUCCESSFUL";
            if (navigator.vibrate) navigator.vibrate(20);
            await refreshNutrition();
        } else {
            throw new Error("SYNC_FAILED");
        }
    } catch (e) {
        btn.innerText = "RETRY_SYNC";
    } finally {
        setTimeout(() => {
            btn.innerText = originalText;
            btn.disabled = false;
        }, 2000);
    }
}

// Custom Cursor Utility
document.addEventListener('mousemove', (e) => {
    const c = document.getElementById('custom-cursor');
    if(c) {
        c.style.left = e.clientX + 'px';
        c.style.top = e.clientY + 'px';
    }
});

window.onload = refreshNutrition;