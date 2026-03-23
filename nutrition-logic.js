/**
 * VANGUARD_OS: NUTRITION_VAULT_LOGIC
 * Version: 3.0.5
 * Author: Joel Kazadi
 */

// 1. SMART_URL_DETECTION
// Automatically switches between local development and Render cloud
const NUT_API = window.location.hostname.includes("render.com") 
    ? "https://fitbro-os.onrender.com" 
    : "http://127.0.0.1:8000";

const userId = localStorage.getItem('fitbro_user_id') || "1";

/**
 * REFRESH_NUTRITION: Fetches the full history from the database 
 * and updates the UI cards and calorie counters.
 */
async function refreshNutrition() {
    const list = document.getElementById('m-list');
    const kcalDisplay = document.getElementById('total-kcal');
    const countDisplay = document.getElementById('meal-count');

    try {
        console.log(`> INITIALIZING_VAULT_QUERY: ${NUT_API}/history/${userId}`);
        const res = await fetch(`${NUT_API}/history/${userId}`);
        
        if (!res.ok) throw new Error("VAULT_LINK_SEVERED");
        
        const data = await res.json();
        let totalKcal = 0;

        // Map the database history into tactical UI cards
        if (list) {
            if (data.length === 0) {
                list.innerHTML = `<div class="card" style="text-align:center; color:#444;">NO_FUEL_RECORDS_FOUND</div>`;
            } else {
                list.innerHTML = data.map(item => {
                    // Logic: Use returned calories or default to 400 for analysis
                    const calories = item.calories || 400;
                    totalKcal += calories;
                    
                    return `
                        <div class="card" style="margin-bottom:12px; border-left: 3px solid var(--primary);">
                            <div style="display:flex; justify-content:space-between; align-items:center;">
                                <div>
                                    <span class="tag">Analysis_Complete</span>
                                    <b style="text-transform: uppercase; font-size:0.85rem; display:block; margin-top:5px;">
                                        ${item.event || item.meal_description}
                                    </b>
                                </div>
                                <div style="text-align:right;">
                                    <span style="color:var(--primary); font-family:'Archivo Black'; font-size:1rem;">
                                        +${calories}
                                    </span>
                                    <span class="tag" style="margin:0;">KCAL</span>
                                </div>
                            </div>
                        </div>
                    `;
                }).join('');
            }
        }

        // Update the global metrics if elements exist
        if (kcalDisplay) kcalDisplay.innerText = totalKcal;
        if (countDisplay) countDisplay.innerText = data.length;

        console.log("> NUTRITION_SYNC_SUCCESSFUL");
    } catch (e) {
        console.error("> CRITICAL_SYNC_FAILURE:", e);
        if (list) list.innerHTML = `<div class="card" style="color:var(--danger); text-align:center;">SYSTEM_OFFLINE: DATABASE_LINK_ERROR</div>`;
    }
}

/**
 * SYNC_FUEL: Takes the text input, sends it to the AI for analysis, 
 * and updates the vault history.
 */
async function syncFuel() {
    const food = document.getElementById('food-input').value;
    const API_BASE = window.location.hostname.includes("render.com") 
        ? "https://fitbro-os.onrender.com" 
        : "http://127.0.0.1:8000";

    try {
        const res = await fetch(`${API_BASE}/ai-log?user_id=1&food_input=${encodeURIComponent(food)}`, { method: 'POST' });
        // ... rest of your code
        const response = await fetch(`${NUT_API}/ai-log?user_id=${userId}&food_input=${encodeURIComponent(input.value)}`, {
            method: 'POST'
        });

        if (response.ok) {
            input.value = "";
            btn.innerText = "SYNC_SUCCESSFUL";
            btn.style.backgroundColor = "var(--primary)";
            
            // Trigger haptic feedback on mobile
            if (navigator.vibrate) navigator.vibrate(20);
            
            // Refresh the list to show the new entry
            await refreshNutrition();
        } else {
            throw new Error("API_REJECTION");
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

// Ensure the vault refreshes immediately upon system boot
window.onload = refreshNutrition;