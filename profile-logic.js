async function loadDossier() {
    const userId = localStorage.getItem('fitbro_user_id');
    const res = await fetch(`http://127.0.0.1:8000/vitals/${userId}`);
    const v = await res.json();

    const stats = document.getElementById('baseline-stats');
    stats.innerHTML = `
        <div style="display:flex; justify-content:space-between; padding:10px 0; border-bottom:1px solid #111;">
            <span class="mono-tag">MAX_PUSHUPS</span>
            <b style="color:var(--primary)">${v.max_pushups} REPS</b>
        </div>
        <div style="display:flex; justify-content:space-between; padding:10px 0; border-bottom:1px solid #111;">
            <span class="mono-tag">MAX_PULLUPS</span>
            <b style="color:var(--primary)">${v.max_pullups} REPS</b>
        </div>
        <div style="display:flex; justify-content:space-between; padding:10px 0; border-bottom:1px solid #111;">
            <span class="mono-tag">DIET_FILTER</span>
            <b style="color:var(--danger)">LACTOSE_INTOLERANT</b>
        </div>
    `;
}

document.addEventListener('mousemove', (e) => {
    const c = document.getElementById('custom-cursor');
    if(c) {
        c.style.left = e.clientX + 'px';
        c.style.top = e.clientY + 'px';
    }
});

window.onload = loadDossier;