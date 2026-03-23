/**
 * VANGUARD_OS: NUTRITION_VAULT_LOGIC
 * RESTORED_CLEAN_BUILD
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
        console.log(`> QUERYING_VAULT: ${NUT_API}/history/${userId}`);
        const res = await fetch(`${NUT_API}/history/${userId}`);
        if (!res.ok) throw new Error("VAULT_LINK_SEVERED");
        
        const data = await res.json();
        // Standardize the response format
        const historyArray = data.history || data; 
        
        let totalKcal = 0;

        if (list) {
            if (historyArray.length === 0) {
                list.innerHTML = `<div style="text-align:center; color:#444; padding:20px;">NO_FUEL_RECORDS_FOUND</div>`;
            } else {
                list.innerHTML = historyArray.map(item => {
                    // Extract calories from AI analysis string if needed
                    const calories = item.amount || 400; 
                    totalKcal += calories;
                    return `
                        <div class="card" style="margin-bottom:10px; border-left: 3px solid var(--primary); padding:15px;">
                            <div style="display:flex; justify-content:space-between; align-items:center;">
                                <div>
                                    <span class="tag" style="margin:0;">Analysis_Complete</span>
                                    <b style="text-transform: uppercase; font-size:0.8rem; display:block;">${item.event || "UNKNOWN_FUEL"}</b>
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
        console.error("> NUTRITION_VAULT_OFFLINE:", e);
        if (list) list.innerHTML = `<div class="tag" style="color:var(--danger); text-align:center;">DATABASE_OFFLINE</div>`;
    }
}

/**
 * SYNC_FUEL: Sends meal data to AI for analysis
 */
async function syncFuel() {
    const input = document.getElementById('food-input');
    const btn = document.querySelector('.btn-execute'); // Standardized selector

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
            btn.style.backgroundColor = "var(--primary)";
            
            if (navigator.vibrate) navigator.vibrate(20);
            
            // Wait briefly so the DB can update before we refresh
            setTimeout(refreshNutrition, 500); 
        } else {
            throw new Error("SYNC_FAILED");
        }
    } catch (e) {
        btn.innerText = "RETRY_SYNC";
        btn.style.backgroundColor = "var(--danger)";
    } finally {
        setTimeout(() => {
            btn.innerText = originalText;
            btn.style.backgroundColor = "";
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

// Load the vault data on boot
window.onload = refreshNutrition;