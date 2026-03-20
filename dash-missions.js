const API_BASE = "https://addie-unoiling-confusedly.ngrok-free.dev";
async function updateMissions() {
    const userId = localStorage.getItem('fitbro_user_id');
    const res = await fetch(`${API_BASE}/vitals/${userId}`);
    const v = await res.json();

    // 1. Force Calorie Calculation (0.04 kcal per step)
    const steps = v.daily_steps || 0;
    const kcalBurned = Math.floor(steps * 0.04);
    
    document.getElementById('step-val').innerText = steps.toLocaleString();
    document.getElementById('step-kcal').innerText = kcalBurned;
    document.getElementById('u-streak').innerText = (v.streak_days || 0) + "d";
    
    // 2. Kinetic Ring Glow
    const ring = document.getElementById('step-ring');
    ring.style.borderTopColor = steps >= 10000 ? 'var(--primary)' : '#111';

    // 3. Mission Status Update (Adding the 'done' class)
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

    // 4. Hydration Generator
    updateHydrationUI(v.current_water_ml);
}

function updateHydrationUI(ml) {
    const bc = document.getElementById('b-cont');
    const display = document.getElementById('h2o');
    if(!bc || !display) return;

    display.innerText = (ml || 0) + "ml";
    bc.innerHTML = '';
    for(let i=0; i<12; i++) {
        const b = document.createElement('div');
        b.className = `bot ${i < (ml/250) ? 'on' : ''}`;
        // Ensure the .bot class is in your styles.css
        bc.appendChild(b);
    }
}