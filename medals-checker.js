/**
 * VANGUARD_OS: MEDAL_CHECKER_LOGIC
 */
const MEDAL_API = window.location.hostname.includes("render.com") 
    ? "https://fitbro-os.onrender.com" 
    : "http://127.0.0.1:8000";

async function renderCabinet() {
    const userId = localStorage.getItem('fitbro_user_id') || "1";
    const cabinet = document.getElementById('cabinet');
    
    try {
        // 1. Fetch live operative vitals
        const res = await fetch(`${MEDAL_API}/vitals/${userId}`);
        const v = await res.json();

        // 2. Map through the medals-data.js array
        // NOTE: Ensure VANGUARD_MEDALS is available from medals-data.js
        cabinet.innerHTML = VANGUARD_MEDALS.map(m => {
            let unlocked = false;

            // TACTICAL_UNLOCK_LOGIC
            if (m.id === 'vanguard_init') unlocked = true; // Onboarding complete
            if (m.id === 'iron_lung' && v.hydration_target) unlocked = true;
            if (m.id === 'first_blood' && v.kinetic_target) unlocked = true;
            if (m.id === 'clean_fuel' && v.nutrition_target) unlocked = true;
            if (m.id === 'titan_strength' && v.xp >= 5000) unlocked = true;
            if (m.id === 'centurion' && v.steps >= 10000) unlocked = true;

            return `
                <div class="card ${unlocked ? 'unlocked' : ''}" style="opacity: ${unlocked ? '1' : '0.2'}; padding: 20px; border: 1px solid ${unlocked ? 'var(--primary)' : 'var(--border)'}; text-align: center;">
                    <span class="medal-icon" style="font-size: 2rem; display: block; margin-bottom: 10px; filter: ${unlocked ? 'none' : 'grayscale(1)'};">
                        ${m.icon}
                    </span>
                    <span class="tag" style="font-size: 0.5rem; margin-bottom: 5px;">${m.name}</span>
                    <small style="font-size: 0.45rem; color: ${unlocked ? 'var(--primary)' : '#555'}; display: block;">
                        ${unlocked ? '[ UNLOCKED ]' : '[ LOCKED ]'}
                    </small>
                </div>
            `;
        }).join('');

    } catch (e) {
        console.error("> MEDAL_ARRAY_SYNC_FAILURE:", e);
        cabinet.innerHTML = `<div style="grid-column: span 2; color: var(--danger); text-align: center;">DATABASE_LINK_SEVERED</div>`;
    }
}

// Custom Cursor for Desktop support
document.addEventListener('mousemove', (e) => {
    const c = document.getElementById('custom-cursor');
    if(c) {
        c.style.left = e.clientX + 'px';
        c.style.top = e.clientY + 'px';
    }
});

window.onload = renderCabinet;