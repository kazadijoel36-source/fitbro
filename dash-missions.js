const MISSIONS_API = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    ? "http://127.0.0.1:8000" 
    : "https://fitbro-os.onrender.com";

async function updateMissions() {
    const userId = localStorage.getItem('fitbro_user_id') || "1";
    try {
        const res = await fetch(`${MISSIONS_API}/vitals/${userId}`);
        const v = await res.json();

        const steps = v.daily_steps || 0;
        const kcalBurned = Math.floor(steps * 0.04);
        
        document.getElementById('step-val').innerText = steps.toLocaleString();
        document.getElementById('step-kcal').innerText = kcalBurned;
        document.getElementById('u-streak').innerText = (v.streak_days || 0) + "d";
        
        const ring = document.getElementById('step-ring');
        if(ring) ring.style.borderTopColor = steps >= 10000 ? 'var(--primary)' : '#111';

        const missions = {
            'm-hyd': v.hydration_target,
            'm-kin': v.kinetic_target,
            'm-nut': v.nutrition_target
        };

        for (const [id, active] of Object.entries(missions)) {
            const el = document.getElementById(id);
            if (el) {
                if (active) {
                    el.classList.add('done');
                    el.style.borderColor = "var(--primary)";
                    el.style.color = "var(--primary)";
                } else {
                    el.classList.remove('done');
                }
            }
        }
    } catch (e) { console.log("MISSION_SYNC_OFFLINE"); }
}