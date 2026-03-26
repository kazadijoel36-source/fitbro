let currentStep = 1;
const totalSteps = 19;
const userData = {};

const steps = {
    1: { q: "WHAT IS YOUR GENDER?", type: "choice", options: ["MALE", "FEMALE", "OTHER"] },
    2: { q: "WHAT IS YOUR PRIMARY GOAL?", type: "choice", options: ["LOSE WEIGHT", "BUILD MUSCLE", "GET FIT"] },
    3: { q: "HOW ACTIVE ARE YOU?", type: "choice", options: ["SEDENTARY", "MODERATE", "ATHLETE"] },
    4: { q: "SELECT YOUR WEIGHT (KG)", type: "ruler", min: 40, max: 150 },
    // ... we will add the rest to reach 19
    19: { q: "MAX PUSH-UPS (BASELINE)", type: "number", placeholder: "Enter max reps" }
};

function renderStep() {
    const container = document.getElementById('survey-container');
    const step = steps[currentStep];
    
    // Update Progress
    document.getElementById('progress-fill').style.width = `${(currentStep/totalSteps)*100}%`;
    document.getElementById('step-number').innerText = `STEP ${currentStep < 10 ? '0' + currentStep : currentStep}/19`;

    let html = `<h2>${step.q}</h2>`;
    
    if (step.type === "choice") {
        html += step.options.map(opt => `<button class="choice-btn" onclick="saveData('${opt}')">${opt}</button>`).join('');
    } else if (step.type === "ruler") {
        html += `<div class="ruler-value"><span id="ruler-display">${step.min}</span> KG</div>
                 <input type="range" min="${step.min}" max="${step.max}" value="${step.min}" class="ruler-slider" oninput="updateRuler(this.value)">`;
    } else if (step.type === "number") {
        html += `<input type="number" id="num-input" placeholder="${step.placeholder}" class="tactical-input">`;
    }

    container.innerHTML = html;
}

function updateRuler(val) {
    document.getElementById('ruler-display').innerText = val;
    userData.weight = val;
}

function nextStep() {
    if (currentStep < totalSteps) {
        currentStep++;
        renderStep();
    } else {
        finishInduction();
    }
}

// Initial Run
renderStep();