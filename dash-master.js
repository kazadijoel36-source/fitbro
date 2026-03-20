// VANGUARD_OS_CORE_ENGINE
const USER_ID = 1;

async function syncCommandCenter() {
    try {
        const response = await fetch(`http://127.0.0.1:8000/vitals/${USER_ID}`);
        const data = await response.json();

        if (data.status !== "INTERNAL_SYNC_ERROR") {
            // 1. IDENTITY & XP
            document.getElementById('u-email').innerText = data.codename.toUpperCase();
            document.getElementById('xp-text').innerText = `${data.xp} XP`;
            
            // Level Calculation (Every 1000 XP = 1 Level)
            const level = Math.floor(data.xp / 1000) + 1;
            const currentXPInLevel = data.xp % 1000;
            document.getElementById('lvl-display').innerText = `LEVEL ${level}`;
            document.getElementById('xp-bar').style.width = `${(currentXPInLevel / 1000) * 100}%`;

            // 2. WEIGHT CLUSTER
            const current = parseFloat(data.current);
            const goal = parseFloat(data.goal);
            const remain = (current - goal).toFixed(1);

            document.querySelector('#w-current b').innerText = `${current} KG`;
            document.querySelector('#w-diff b').innerText = `${remain} KG`;
            
            // Color logic for remain (Green if goal reached)
            if (remain <= 0) {
                document.getElementById('w-diff').style.borderColor = 'var(--primary)';
                document.querySelector('#w-diff b').style.color = 'var(--primary)';
            }

            // 3. RING ANIMATIONS (SVG MATH)
            updateRing('ring-steps', 0, 10000, 283); // Example: 0 steps out of 10k
            updateRing('ring-kcal', 0, 2500, 220);   // Example: 0 kcal out of 2500
            updateRing('ring-water', waterIntake, 3000, 157); 
        }
    } catch (err) {
        console.error("DATA_LINK_SEVERED", err);
    }
}

function updateRing(elementId, value, target, maxOffset) {
    const ring = document.getElementById(elementId);
    if (!ring) return;
    const percentage = Math.min(value / target, 1);
    const offset = maxOffset - (percentage * maxOffset);
    ring.style.strokeDashoffset = offset;
}

// HYDRATION LOGIC
let waterIntake = 0;
function addWater() {
    waterIntake += 250;
    document.getElementById('h2o').innerText = `${waterIntake}ml`;
    document.getElementById('water-val').innerText = waterIntake;
    
    // Animate the blue ring
    updateRing('ring-water', waterIntake, 3000, 157);
    
    // Haptic Feedback
    if (navigator.vibrate) navigator.vibrate(20);
    
    // Mission Check
    if (waterIntake >= 2000) {
        document.getElementById('m-hyd').innerHTML = `<span style="color:var(--primary)">[X] HYDRATION_TARGET</span>`;
    }
}

// SPLASH SCREEN REMOVAL
window.onload = () => {
    const bar = document.getElementById('splash-bar');
    bar.style.width = "100%";
    
    setTimeout(() => {
        document.getElementById('splash').style.opacity = "0";
        setTimeout(() => {
            document.getElementById('splash').style.display = "none";
        }, 500);
        syncCommandCenter();
    }, 1600);
};