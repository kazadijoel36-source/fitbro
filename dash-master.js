const MASTER_API = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    ? "http://127.0.0.1:8000" 
    : "https://fitbro-os.onrender.com";
const USER_ID = localStorage.getItem('fitbro_user_id') || "1";

async function syncCommandCenter() {
    try {
        const response = await fetch(`${MASTER_API}/vitals/${USER_ID}`);
        const data = await response.json();

        if (data.status !== "INTERNAL_SYNC_ERROR") {
            document.getElementById('u-email').innerText = data.codename.toUpperCase();
            document.getElementById('xp-text').innerText = `${data.xp} XP`;
            const level = Math.floor(data.xp / 1000) + 1;
            const currentXPInLevel = data.xp % 1000;
            document.getElementById('lvl-display').innerText = `LEVEL ${level}`;
            document.getElementById('xp-bar').style.width = `${(currentXPInLevel / 1000) * 100}%`;

            const current = parseFloat(data.current);
            const goal = parseFloat(data.goal);
            const remain = (current - goal).toFixed(1);
            document.querySelector('#w-current b').innerText = `${current} KG`;
            document.querySelector('#w-diff b').innerText = `${remain} KG`;
            
            if (remain <= 0) {
                document.getElementById('w-diff').style.borderColor = 'var(--primary)';
                document.querySelector('#w-diff b').style.color = 'var(--primary)';
            }
            updateRing('ring-steps', data.daily_steps || 0, 10000, 283);
            updateRing('ring-kcal', 0, 2500, 220); 
            updateRing('ring-water', waterIntake, 3000, 157); 
        }
    } catch (err) { console.error("DATA_LINK_SEVERED", err); }
}

function updateRing(elementId, value, target, maxOffset) {
    const ring = document.getElementById(elementId);
    if (!ring) return;
    const percentage = Math.min(value / target, 1);
    const offset = maxOffset - (percentage * maxOffset);
    ring.style.strokeDashoffset = offset;
}

let waterIntake = 0;
function addWater() {
    waterIntake += 250;
    const display = document.getElementById('h2o');
    if(display) display.innerText = `${waterIntake}ml`;
    updateRing('ring-water', waterIntake, 3000, 157);
    if (navigator.vibrate) navigator.vibrate(20);
}