/* ======================================================
   SECTION 1: GLOBAL TOGGLE FUNCTIONS 
   ====================================================== */

function toggleFeature(containerId, feature, btnElement) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`Container #${containerId} not found.`);
        return;
    }
    
    const currentValue = getComputedStyle(container).getPropertyValue(`--${feature}`).trim();
    const newValue = (currentValue === '1') ? '0' : '1';
    
    container.style.setProperty(`--${feature}`, newValue);

    if (btnElement) {
        btnElement.classList.toggle('active-set');
    }
}

function resetJessFeatures(btnElement) {
    const container = document.getElementById('jess-container');
    if (!container) return;

    container.style.setProperty('--ss01', '0');
    container.style.setProperty('--ss02', '0');
    container.style.setProperty('--calt', '1'); 
    container.style.setProperty('--liga', '1'); 
    container.style.setProperty('--dlig', '1'); 

    const buttons = container.querySelectorAll('.style-button');
    buttons.forEach(btn => btn.classList.remove('active-set'));
    
    if(btnElement) {
        btnElement.classList.add('active-set');
        setTimeout(() => btnElement.classList.remove('active-set'), 500);
    }
}


/* ======================================================
   SECTION 2: PAGE LOAD ANIMATIONS
   ====================================================== */

document.addEventListener("DOMContentLoaded", function() {

    // --- FUNCTION A: LETTER-BY-LETTER BREATHING (Inkai) ---
    function initBreathingText(elementId, minWeight, maxWeight, step, speed) {
        const element = document.getElementById(elementId);
        if (!element) return;
        
        const text = element.innerText;
        element.innerHTML = text.split('').map(char => {
            if (char === ' ') return ' '; 
            return `<span class="inline-block">${char}</span>`;
        }).join('');

        const spans = element.querySelectorAll('span');

        spans.forEach((span) => {
            let currentWeight = Math.floor((Math.random() * (maxWeight - minWeight + 1) + minWeight) / step) * step;
            let direction = Math.random() > 0.5 ? 1 : -1;

            setInterval(() => {
                span.style.fontVariationSettings = `"wght" ${currentWeight}`;
                span.style.fontWeight = currentWeight;

                if (currentWeight >= maxWeight) direction = -1;
                else if (currentWeight <= minWeight) direction = 1;
                currentWeight += (step * direction);
            }, speed);
        });
    }

    // --- FUNCTION B: SINGLE AXIS WAVY TEXT (Jess & Desire) ---
    function initWavyText(elementId, minWeight, maxWeight, step, speed) {
        const element = document.getElementById(elementId);
        if (!element) return;

        let currentWeight = minWeight;
        let direction = 1; 

        setInterval(() => {
            element.style.fontVariationSettings = `"wght" ${currentWeight}`;
            element.style.fontWeight = currentWeight;

            if (currentWeight >= maxWeight) direction = -1;
            else if (currentWeight <= minWeight) direction = 1;
            
            currentWeight += (step * direction);
        }, speed);
    }

    // --- FUNCTION C: DUAL AXIS WAVY TEXT (Speechless) ---
    // Handles Weight AND Width animating at different speeds
    function initDualWavyText(elementId, wghtOpts, wdthOpts) {
        const element = document.getElementById(elementId);
        if (!element) return;

        // Initial State
        let currentWght = wghtOpts.min;
        let currentWdth = wdthOpts.min;
        let dirWght = 1;
        let dirWdth = 1;

        // Helper to update CSS (Merges both values)
        const updateStyle = () => {
            element.style.fontVariationSettings = `"wght" ${currentWght}, "wdth" ${currentWdth}`;
            // Optional: Map fontWeight to wght for fallback
            element.style.fontWeight = currentWght; 
        };

        // Loop 1: Animate Weight
        setInterval(() => {
            if (currentWght >= wghtOpts.max) dirWght = -1;
            else if (currentWght <= wghtOpts.min) dirWght = 1;
            currentWght += (wghtOpts.step * dirWght);
            updateStyle();
        }, wghtOpts.speed);

        // Loop 2: Animate Width (Runs independently)
        setInterval(() => {
            if (currentWdth >= wdthOpts.max) dirWdth = -1;
            else if (currentWdth <= wdthOpts.min) dirWdth = 1;
            currentWdth += (wdthOpts.step * dirWdth);
            updateStyle();
        }, wdthOpts.speed);
    }


    // ==========================================
    // === ACTIVATE ANIMATIONS ===
    // ==========================================

    // 1. INKAI
    initBreathingText('breathing-text', 400, 900, 50, 100);

    // 2. JESS JESS WRITE
    initWavyText('wave-text', 200, 600, 1, 5);

    // 3. DESIRE
    initWavyText('wavy-desire', 80, 125, 0.5, 20);

    // 4. SPEECHLESS (Dual Axis)
    // Weight: 400-800, Speed 10ms (Fast)
    // Width: 200-400, Speed 30ms (Slower)
    initDualWavyText('wavy-speechless', 
        { min: 400, max: 800, step: 5, speed: 20 }, 
        { min: 200, max: 400, step: 1, speed: 30 }
    );


    // --- PART D: AUTO STYLE SHIFTER (Drowsy) ---
    const shiftingElement = document.getElementById('style-shift');
    if (shiftingElement) {
        const styles = [
            '"ss01" 0, "ss02" 0', 
            '"ss01" 1',           
            '"ss02" 1'            
        ];
        let currentIndex = 0;

        setInterval(() => {
            currentIndex++;
            if (currentIndex >= styles.length) currentIndex = 0;
            shiftingElement.style.fontFeatureSettings = styles[currentIndex];
        }, 800); 
    }

});
