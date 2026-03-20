const API_BASE = "http://127.0.0.1:8000";

async function initiateGeneration() {
    const userId = localStorage.getItem('fitbro_user_id') || "1";
    const hud = document.getElementById('hud-status');
    const list = document.getElementById('task-list');
    const btn = document.getElementById('generate-btn');

    logTerminal("CALIBRATING_NEURAL_DRIVE...");
    btn.disabled = true;
    hud.innerText = "CALIBRATING...";
    list.innerHTML = "<div class='card' style='text-align:center; padding:50px;'>SYNCING_DRILLS...</div>";

    try {
        const dur = document.getElementById('dur').value;
        const foc = document.getElementById('foc').value;
        
        // Using your local Python server
        const res = await fetch(`${API_BASE}/generate-workout/${userId}?duration=${dur}&focus=${foc}`);
        const data = await res.json();
        
        if(data.workout) {
            displayTasks(data.workout);
            hud.innerText = "MISSION_LIVE";
            logTerminal("PROTOCOL_STABILIZED.");
        } else {
            throw new Error("EMPTY_WORKOUT");
        }
    } catch (e) {
        logTerminal("CRITICAL_FAILURE: BACKEND_OFFLINE");
        hud.innerText = "OFFLINE";
        btn.disabled = false;
        list.innerHTML = "<div class='card' style='color:var(--danger); text-align:center;'>DATABASE_LINK_ERROR</div>";
    }
}