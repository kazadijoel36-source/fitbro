// Ensure API_BASE is defined globally or shared
const API_BASE_TRACKER = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    ? "http://127.0.0.1:8000" 
    : "https://fitbro-os.onrender.com";

function displayTasks(workoutText) {
    const list = document.getElementById('task-list');
    const exercises = workoutText.split('\n').filter(line => line.length > 5);
    
    list.innerHTML = exercises.map((ex, i) => `
        <div class="task-card" id="task-${i}">
            <div>
                <span class="mono-tag">Task_0${i+1}</span>
                <h3>${ex.toUpperCase()}</h3>
            </div>
            <button class="btn-sync" onclick="clearTask(${i}, this)">COMPLETE</button>
        </div>
    `).join('');

    const uploadBtn = document.createElement('button');
    uploadBtn.className = "btn-exe";
    uploadBtn.style.marginTop = "20px";
    uploadBtn.innerText = "UPLOAD MISSION DATA (+500 XP)";
    uploadBtn.onclick = uploadMission;
    list.appendChild(uploadBtn);
}

function clearTask(id, btn) {
    document.getElementById(`task-${id}`).classList.add('cleared');
    btn.innerText = "CLEARED";
    btn.disabled = true;
    logTerminal(`TASK_0${id+1}_SUCCESSFUL.`);
}

async function uploadMission() {
    const userId = localStorage.getItem('fitbro_user_id');
    logTerminal("UPLOADING_TO_VAULT...");
    
    try {
        await fetch(`${API_BASE_TRACKER}/ai-log?user_id=${userId}&food_input=COMPLETED_CHAMBER_SESSION`, {method:'POST'});
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1000);
    } catch (e) {
        logTerminal("UPLOAD_FAILED");
    }
}