/* ======================================================
   GLOBAL TOGGLE FUNCTIONS 
   ====================================================== */

// 1. Universal Toggle Function
function toggleFeature(containerId, feature, btnElement) {
    const container = document.getElementById(containerId);
    if (!container) return;

    // Get current state (0 or 1)
    const currentValue = getComputedStyle(container).getPropertyValue(`--${feature}`).trim();
    
    // Flip it
    const newValue = currentValue === '1' ? '0' : '1';
    
    // Update CSS
    container.style.setProperty(`--${feature}`, newValue);

    // Update Button Visuals
    if (btnElement) {
        btnElement.classList.toggle('active-set');
    }
}

// 2. Reset / Default Function
function resetJessFeatures(btnElement) {
    const container = document.getElementById('jess-container');
    if (!container) return;

    // Reset variables to your desired "Default" state
    container.style.setProperty('--ss01', '0');
    container.style.setProperty('--ss02', '0');
    container.style.setProperty('--calt', '1'); // Default On
    container.style.setProperty('--liga', '1'); // Default On
    container.style.setProperty('--dlig', '0'); // Default Off

    // Remove 'active-set' visual from ALL buttons in this container
    const buttons = container.querySelectorAll('.style-button');
    buttons.forEach(btn => btn.classList.remove('active-set'));
    
    // Optional: Highlight the "Default" button briefly
    if(btnElement) {
        btnElement.classList.add('active-set');
        setTimeout(() => btnElement.classList.remove('active-set'), 500);
    }
}

/* ======================================================
   1. GLOBAL FUNCTIONS 
   (Must be outside DOMContentLoaded so HTML onclick="" works)
   ====================================================== */

function toggleStyle(set, btnElement) {
    const container = document.getElementById('drowsy-container');
    
    // Safety check
    if (!container) return;

    // 1. Get current variable value (0 or 1)
    const currentValue = getComputedStyle(container).getPropertyValue(`--${set}`).trim();
    
    // 2. Flip it
    const newValue = currentValue === '1' ? '0' : '1';
    
    // 3. Update CSS Variable
    container.style.setProperty(`--${set}`, newValue);

    // 4. Update Button Visuals
    if (btnElement) {
        btnElement.classList.toggle('active-set');
    }
}


/* ======================================================
   2. PAGE LOAD LOGIC
   (Runs only after HTML is ready)
   ====================================================== */
document.addEventListener("DOMContentLoaded", function() {

    // --- PART A: BREATHING TEXT (Weight Animation) ---
    const breathingElement = document.getElementById('breathing-text');
    if (breathingElement) {
        const text = breathingElement.innerText;
        
        // Wrap letters
        breathingElement.innerHTML = text.split('').map(char => {
            if (char === ' ') return ' '; 
            return `<span class="inline-block">${char}</span>`;
        }).join('');

        const spans = breathingElement.querySelectorAll('span');
        const minWeight = 400;
        const maxWeight = 900;
        const step = 50;
        const speed = 100;

        spans.forEach((span) => {
            // Random start
            let currentWeight = Math.floor((Math.random() * (maxWeight - minWeight + 1) + minWeight) / 50) * 50;
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

    // ---for jess jess write wave text---
const waveElement = document.getElementById('wave-text');

if (waveElement) {
    // Configuration
    const minWeight = 200;
    const maxWeight = 600;
    const step = 1;
    const speed = 5; // Lower number = faster update rate

    // Initialize state
    let currentWeight = minWeight;
    let direction = 1; // 1 = getting bolder, -1 = getting thinner

    setInterval(() => {
        // Apply styles to the Main Container (No splitting needed)
        waveElement.style.fontVariationSettings = `"wght" ${currentWeight}`;
        waveElement.style.fontWeight = currentWeight;

        // Logic to ping-pong between min and max
        if (currentWeight >= maxWeight) {
            direction = -1;
        } else if (currentWeight <= minWeight) {
            direction = 1;
        }
        
        currentWeight += (step * direction);
    }, speed);
}


    // --- PART B: AUTO STYLE SHIFTER (The Paragraph Loop) ---
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
        }, 1000); 
    }

    

});