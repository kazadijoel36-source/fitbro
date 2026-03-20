async function renderCabinet() {
    const userId = localStorage.getItem('fitbro_user_id');
    if(!userId) return;

    const cabinet = document.getElementById('cabinet');
    
    try {
        // Multi-stream data fetch
        const [vRes, hRes] = await Promise.all([
            fetch(`${API_BASE}/vitals/${userId}`),
            fetch(`${API_BASE}/health-check`)
        ]);
        
        const v = await vRes.json();
        const h = await hRes.json();

        cabinet.innerHTML = VANGUARD_MEDALS.map(medal => {
            let isUnlocked = false;

            // TACTICAL LOGIC UNIT
            if (medal.id === 'vanguard_init' && v.xp >= 100) isUnlocked = true;
            if (medal.id === 'iron_lung' && v.current_water_ml >= 3000) isUnlocked = true;
            if (medal.id === 'centurion' && v.daily_steps >= 10000) isUnlocked = true;
            
            // SYSTEM ARCHITECT LOGIC
            if (medal.id === 'sys_architect' && 
                h.status === "ONLINE" && 
                (v.hydration_target || v.nutrition_target)) {
                isUnlocked = true;
            }

            return `
                <div class="card medal-slot ${isUnlocked ? 'unlocked' : ''}">
                    <span class="medal-icon">${medal.icon}</span>
                    <h3 style="font-family:'Archivo Black'; font-size:0.85rem; margin:0;">${medal.name}</h3>
                    <p class="mono-tag" style="font-size:0.55rem; margin-top:10px;">${medal.desc}</p>
                    <span class="lock-status">${isUnlocked ? '[ UNLOCKED ]' : '[ LOCKED ]'}</span>
                </div>
            `;
        }).join('');

    } catch (e) {
        cabinet.innerHTML = `<div class="card span-12" style="color:var(--danger); text-align:center;">LINK_ERROR: DATABASE_OFFLINE</div>`;
    }
}

window.onload = renderCabinet;