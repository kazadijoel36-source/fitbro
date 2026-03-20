const MEDAL_API = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    ? "http://127.0.0.1:8000" 
    : "https://fitbro-os.onrender.com";

async function renderCabinet() {
    const userId = localStorage.getItem('fitbro_user_id') || "1";
    const cabinet = document.getElementById('cabinet');
    
    try {
        const vRes = await fetch(`${MEDAL_API}/vitals/${userId}`);
        const v = await vRes.json();

        // Using your medals array from gamify.js logic
        const medals = [
            { id: 'init', name: 'SYSTEM_INIT', icon: '🎖️', xp_req: 100 },
            { id: 'vet', name: 'VANGUARD_VET', icon: '🔥', xp_req: 1000 }
        ];

        cabinet.innerHTML = medals.map(m => {
            const unlocked = v.xp >= m.xp_req;
            return `
                <div class="card" style="text-align:center; opacity: ${unlocked ? '1' : '0.3'}">
                    <span style="font-size:2rem; display:block; margin-bottom:10px;">${m.icon}</span>
                    <span class="tag">${m.name}</span>
                    <small style="font-size:0.5rem">${unlocked ? 'UNLOCKED' : 'LOCKED'}</small>
                </div>
            `;
        }).join('');
    } catch (e) { console.log("MEDAL_SYNC_ERROR"); }
}
window.onload = renderCabinet;