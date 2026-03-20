// VANGUARD_VITAL_MONITOR_CORE
const VITALS_API = window.location.hostname.includes("render.com") 
    ? "https://fitbro-os.onrender.com" 
    : "http://127.0.0.1:8000";

async function refreshAll() {
    const userId = localStorage.getItem('fitbro_user_id') || "1";
    
    try {
        const res = await fetch(`${VITALS_API}/vitals/${userId}`);
        if (!res.ok) throw new Error("LINK_FAILED");
        
        const v = await res.json();

        // 1. Target UI Elements
        const opName = document.getElementById('op-id');
        const lvlLabel = document.getElementById('lvl-display');
        const xpText = document.getElementById('xp-display');
        const xpBar = document.getElementById('xp-fill');

        // 2. Inject Data
        if(opName) opName.innerText = `OPERATIVE: ${v.codename.toUpperCase()}`;
        if(lvlLabel) {
            const calculatedLevel = Math.floor(v.xp / 1000) + 1;
            lvlLabel.innerText = `LVL ${calculatedLevel}`;
        }
        if(xpText) xpText.innerText = `${v.xp} XP`;
        
        // 3. Animate XP Bar (Progress toward next 1000 XP)
        if(xpBar) {
            const progress = (v.xp % 1000) / 10;
            xpBar.style.width = progress + "%";
        }

        console.log("> VITALS_SYNC_COMPLETE");
    } catch (e) { 
        console.warn("> SYSTEM_SYNC_FAILURE: Check Backend Connection"); 
    }
}

// Auto-refresh vitals every 30 seconds to keep the dashboard live
setInterval(refreshAll, 30000);