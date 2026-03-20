/**
 * VANGUARD_OS: PROFILE_DOSSIER_LOGIC
 */
const PROF_API = window.location.hostname.includes("render.com") 
    ? "https://fitbro-os.onrender.com" 
    : "http://127.0.0.1:8000";

async function loadDossier() {
    const userId = localStorage.getItem('fitbro_user_id') || "1";
    const statsContainer = document.getElementById('baseline-stats');

    try {
        console.log(`> RETRIEVING_DOSSIER_FROM: ${PROF_API}/vitals/${userId}`);
        const res = await fetch(`${PROF_API}/vitals/${userId}`);
        const v = await res.json();

        if (statsContainer) {
            statsContainer.innerHTML = `
                <div style="display:flex; justify-content:space-between; padding:15px 0; border-bottom:1px solid #151515;">
                    <span class="mono-tag">PUSH-UP_THRESHOLD</span>
                    <b style="color:var(--primary); font-family:'Archivo Black';">${v.max_pushups || v.pushup_max || 0} REPS</b>
                </div>
                <div style="display:flex; justify-content:space-between; padding:15px 0; border-bottom:1px solid #151515;">
                    <span class="mono-tag">PULL-UP_THRESHOLD</span>
                    <b style="color:var(--primary); font-family:'Archivo Black';">${v.max_pullups || v.pullup_max || 0} REPS</b>
                </div>
                <div style="display:flex; justify-content:space-between; padding:15px 0; border-bottom:1px solid #151515;">
                    <span class="mono-tag">BIOLOGICAL_HAZARD</span>
                    <b style="color:var(--danger); font-family:'Archivo Black';">
                        ${v.lactose_intolerant === "YES" || v.lactose === true ? 'LACTOSE_ACTIVE' : 'NONE_DETECTED'}
                    </b>
                </div>
            `;
        }
    } catch (e) {
        console.error("> DOSSIER_LINK_FAILED:", e);
        if (statsContainer) statsContainer.innerHTML = `<div class="tag" style="color:var(--danger)">SYSTEM_OFFLINE: DATABASE_DISCONNECTED</div>`;
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

window.onload = loadDossier;