const VITALS_API = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    ? "http://127.0.0.1:8000" 
    : "https://fitbro-os.onrender.com";

async function checkSystemHealth() {
    try {
        const res = await fetch(`${VITALS_API}/health-check`);
        const data = await res.json();
        const statusTag = document.getElementById('u-email');
        if (data.status === "ONLINE" && statusTag) {
            statusTag.style.borderLeft = "4px solid var(--primary)";
        }
    } catch (e) { console.error("> BACKEND_OFFLINE"); }
}

async function updateVitals() {
    const userId = localStorage.getItem('fitbro_user_id') || "1";
    try {
        const res = await fetch(`${VITALS_API}/vitals/${userId}`);
        const v = await res.json();

        const nameLabel = document.getElementById('u-email');
        const lvlLabel = document.getElementById('lvl-display');
        const xpBar = document.getElementById('xp-bar');

        if(nameLabel) nameLabel.innerText = `OPERATIVE: ${v.full_name ? v.full_name.toUpperCase() : "JOEL KAZADI"}`;
        if(lvlLabel) lvlLabel.innerText = `LVL ${v.current_level || 1}`;
        if(xpBar) {
            const progress = (v.xp % 1000) / 10;
            xpBar.style.width = progress + "%";
        }
    } catch (e) { console.log("VITALS_LINK_FAILED"); }
}