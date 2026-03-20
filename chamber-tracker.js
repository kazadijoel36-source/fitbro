// VANGUARD_MISSION_TRACKER_CORE
const TRACKER_API = window.location.hostname.includes("render.com") 
    ? "https://fitbro-os.onrender.com" 
    : "http://127.0.0.1:8000";

function displayTasks(workoutText) {
    const list = document.getElementById('task-list');
    // Split the AI text into individual exercise cards
    const exercises = workoutText.split('\n').filter(line => line.length > 5);
    
    list.innerHTML = exercises.map((ex, i) => `
        <div class="card task-card" id="task-${i}" style="margin-bottom:10px;">
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <div>
                    <span class="tag">Task_0${i+1}</span>
                    <h3 style="font-size:0.9rem;">${ex.toUpperCase()}</h3>
                </div>
                <button class="btn-sync" onclick="clearTask(${i}, this)" style="background:var(--border); color:white; border:none; padding:5px 10px; font-size:0.6rem;">COMPLETE</button>
            </div>
        </div>
    `).join('');

    // Add the final upload button at the end of the list
    const uploadBtn = document.createElement('button');
    uploadBtn.className = "btn-execute";
    uploadBtn.style.marginTop = "20px";
    uploadBtn.innerText = "UPLOAD MISSION DATA (+500 XP)";
    uploadBtn.onclick = uploadMission;
    list.appendChild(uploadBtn);
}

function clearTask(id, btn) {
    const card = document.getElementById(`task-${id}`);
    card.style.opacity = "0.3";
    card.style.borderColor = "var(--primary)";
    btn.innerText = "CLEARED";
    btn.disabled = true;
    if (navigator.vibrate) navigator.vibrate(50);
}

async function uploadMission() {
    const userId = localStorage.getItem('fitbro_user_id') || "1";
    const hud = document.getElementById('hud-status');
    
    if(hud) hud.innerText = "UPLOADING_TO_VAULT...";
    
    try {
        const res = await fetch(`${TRACKER_API}/api/sync-xp?operative_id=${userId}&amount=500&source=CHAMBER_COMPLETE`, {
            method: 'POST'
        });
        
        if(res.ok) {
            if(hud) hud.innerText = "MISSION_SUCCESS_XP_SYNCED";
            setTimeout(() => { window.location.href = 'dashboard.html'; }, 1500);
        }
    } catch (e) {
        if(hud) hud.innerText = "SYNC_FAILED: RETRYING...";
    }
}