async function checkSystemHealth() {
    try {
        const res = await fetch(`http://127.0.0.1:8000/health-check`);
        const data = await res.json();
        
        const statusTag = document.getElementById('u-email');
        if (data.status === "ONLINE") {
            console.log("> NEURAL_LINK_STABLE");
            statusTag.style.borderLeft = "4px solid var(--primary)";
        } else {
            console.warn("> LINK_CORRUPTED: " + data.error_log);
            statusTag.style.borderLeft = "4px solid var(--danger)";
        }
    } catch (e) {
        console.error("> BACKEND_OFFLINE");
    }
}

// Call this inside your refreshAll() functionasync function updateVitals() {
    const userId = localStorage.getItem('fitbro_user_id');
    const res = await fetch(`http://127.0.0.1:8000/vitals/${userId}`);
    const v = await res.json();

    document.getElementById('u-email').innerText = `OPERATIVE: ${v.email.toUpperCase()}`;
    document.getElementById('lvl-display').innerText = `VANGUARD OPERATIVE // LVL ${v.current_level}`;
    document.getElementById('xp-text').innerText = `${v.xp} XP`;
    // XP Scaling logic (1000 XP per level)
    document.getElementById('xp-bar').style.width = (v.xp % 1000 / 10) + "%";

async function addWater() {
    const userId = localStorage.getItem('fitbro_user_id');
    try {
        const res = await fetch(`${API_BASE}/add-water/${userId}`, { method: 'POST' });
        if (res.ok) {
            console.log("> HYDRATION_SYNCED");
            // Important: Use 'await' so it waits for the refresh to finish
            await refreshAll(); 
        }
    } catch (e) {
        console.error("> WATER_LINK_FAILED", e);
    }
}

async function updateVitals() {
    const userId = localStorage.getItem('fitbro_user_id');
    const res = await fetch(`http://127.0.0.1:8000/vitals/${userId}`);
    const v = await res.json();

    // Fix the Name and XP display
    const nameLabel = document.getElementById('u-email');
    const lvlLabel = document.getElementById('lvl-display');
    const xpBar = document.getElementById('xp-bar');

    if(nameLabel) nameLabel.innerText = `OPERATIVE: ${v.full_name ? v.full_name.toUpperCase() : "JOEL KAZADI"}`;
    if(lvlLabel) lvlLabel.innerText = `LVL ${v.current_level || 1}`;
    
    // XP Calculation
    if(xpBar) {
        const progress = (v.xp % 1000) / 10;
        xpBar.style.width = progress + "%";
    }
}