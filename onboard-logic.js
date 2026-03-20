let onboardState = {
    lactose: false
};

function nextStep(stepNum) {
    // Basic validation
    const w = document.getElementById('in-weight').value;
    if (stepNum === 2 && !w) {
        alert("CRITICAL: Weight data missing.");
        return;
    }

    document.querySelectorAll('.step-box').forEach(box => box.classList.remove('active'));
    document.getElementById(`step-${stepNum}`).classList.add('active');
}

function toggleLactose() {
    onboardState.lactose = !onboardState.lactose;
    const btn = document.getElementById('lac-toggle');
    btn.classList.toggle('done');
    btn.innerText = onboardState.lactose ? "[X] LACTOSE_INTOLERANT_ACTIVE" : "[ ] LACTOSE_INTOLERANT_HAZARD";
}

// Custom Cursor Utility
document.addEventListener('mousemove', (e) => {
    const c = document.getElementById('custom-cursor');
    if(c) {
        c.style.left = e.clientX + 'px';
        c.style.top = e.clientY + 'px';
    }
});