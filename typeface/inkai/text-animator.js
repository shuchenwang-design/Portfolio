document.addEventListener("DOMContentLoaded", function() {

    // --- ELEMENTS ---
    const textZone = document.getElementById('editableText');
    const sizeSlider = document.getElementById('fontSizeSlider');
    const weightSlider = document.getElementById('fontWeightSlider');
    const ligaBtn = document.getElementById('ligaBtn');
    const breathBtn = document.getElementById('breathBtn');
    
    // New Elements for Glyph List Hover
    const glyphList = document.getElementById('glyphList');
    const selectGlyph = document.getElementById('selectGlyph');

    // --- STATE VARIABLES ---
    let isBreathing = false;
    let breathingIntervals = []; 
    let originalText = "";       

    // ==========================================
    // 1. SLIDERS (Standard)
    // ==========================================
    if (sizeSlider) {
        sizeSlider.addEventListener('input', (e) => {
            textZone.style.fontSize = (0.01 * e.target.value)+ 'vw';
        });
    }

    if (weightSlider) {
        weightSlider.addEventListener('input', (e) => {
            if (isBreathing) stopBreathing(); // Stop animation if user drags slider

            const val = e.target.value;
            textZone.style.fontWeight = val;
            textZone.style.fontVariationSettings = `"wght" ${val}`;
        });
    }

    // ==========================================
    // 2. LIGATURE TOGGLE (Class Toggle)
    // ==========================================
    if (ligaBtn) {
        ligaBtn.addEventListener('click', () => {
            const label = ligaBtn.nextElementSibling;
            
            // Toggle the class
            ligaBtn.classList.toggle('active');

            // Check new state
            if (ligaBtn.classList.contains('active')) {
                // State: ON
                textZone.style.fontFeatureSettings = '"liga" 1';
                label.innerText = "LIGATURE: ON";
            } else {
                // State: OFF
                textZone.style.fontFeatureSettings = '"liga" 0';
                label.innerText = "LIGATURE: OFF";
            }
        });
    }

    // ==========================================
    // 3. BREATHING TOGGLE (Class Toggle)
    // ==========================================
    if (breathBtn) {
        breathBtn.addEventListener('click', () => {
            if (!isBreathing) {
                startBreathing();
            } else {
                stopBreathing();
            }
        });
    }

    function startBreathing() {
        isBreathing = true;
        const label = breathBtn.nextElementSibling;
        
        // 1. Add Active Class
        breathBtn.classList.add('active');
        label.innerText = "BREATHING: ON";

        // 2. Logic
        textZone.contentEditable = "false";
        originalText = textZone.innerHTML;
        textZone.classList.add('uppercase');

        initBreathingLogic(textZone, 100, 900, 10, 100); 
    }

    function stopBreathing() {
        isBreathing = false;
        const label = breathBtn.nextElementSibling;

        // 1. Remove Active Class
        breathBtn.classList.remove('active');
        label.innerText = "BREATHING: OFF";

        // 2. Logic
        breathingIntervals.forEach(id => clearInterval(id));
        breathingIntervals = [];

        textZone.classList.remove('uppercase');
        textZone.innerHTML = originalText;
        textZone.contentEditable = "true";

        // Reset weight to match slider
        if (weightSlider) {
            const val = weightSlider.value;
            textZone.style.fontWeight = val;
            textZone.style.fontVariationSettings = `"wght" ${val}`;
        }
    }

    // --- ANIMATION FUNCTION ---
    function initBreathingLogic(element, minWeight, maxWeight, step, speed) {
        // 1. Get text including newlines (which <br> becomes)
        const text = element.innerText; 
        
        // 2. Map characters
        element.innerHTML = text.split('').map(char => {
            if (char === '\n') return '<br>'; 
            if (char === ' ') return ' '; 
            return `<span style="display:inline-block">${char}</span>`;
        }).join('');

        // 3. Select spans and animate
        const spans = element.querySelectorAll('span');

        spans.forEach((span) => {
            let currentWeight = Math.floor((Math.random() * (maxWeight - minWeight + 1) + minWeight) / step) * step;
            let direction = Math.random() > 0.5 ? 1 : -1;

            const intervalId = setInterval(() => {
                span.style.fontVariationSettings = `"wght" ${currentWeight}`;
                span.style.fontWeight = currentWeight;

                if (currentWeight >= maxWeight) direction = -1;
                else if (currentWeight <= minWeight) direction = 1;
                currentWeight += (step * direction);
            }, speed);

            breathingIntervals.push(intervalId);
        });
    }

    // ==========================================
    // 4. SELECT GLYPHS FROM GRID
    // ==========================================
    
    const sourceContainers = document.querySelectorAll('.glyph-grid-source');
    const previewBox = document.getElementById('big-char');
    const unicodeLabel = document.getElementById('meta-unicode');
    const weightLabel = document.getElementById('meta-weight');
    const postscriptLabel = document.getElementById('meta-postscript'); 
    const slider = document.getElementById('glyph-weight-slider');

    // Glyph Name Dictionary
    const glyphNames = {
        '!': 'exclam', '"': 'quotedbl', '#': 'numbersign', '$': 'dollar',
        '%': 'percent', '&': 'ampersand', '\'': 'quotesingle', '(': 'parenleft',
        ')': 'parenright', '*': 'asterisk', '+': 'plus', ',': 'comma',
        '-': 'hyphen', '.': 'period', '/': 'slash', ':': 'colon',
        ';': 'semicolon', '<': 'less', '=': 'equal', '>': 'greater',
        '?': 'question', '@': 'at', '[': 'bracketleft', '\\': 'backslash',
        ']': 'bracketright', '^': 'asciicircum', '_': 'underscore', '`': 'grave',
        '{': 'braceleft', '|': 'bar', '}': 'braceright', '~': 'asciitilde',
        '0': 'zero', '1': 'one', '2': 'two', '3': 'three', '4': 'four',
        '5': 'five', '6': 'six', '7': 'seven', '8': 'eight', '9': 'nine',
        ' ': 'space'
    };

    // Explode Text into Grid Cells
    sourceContainers.forEach(container => {
        const rawText = container.innerText.replace(/\n/g, ''); 
        container.innerHTML = ''; 
        
        rawText.split('').forEach(char => {
            const cell = document.createElement('div');
            cell.innerText = char;
            cell.className = "glyph-cell aspect-square flex items-center justify-center border-r border-b border-[#111010] hover:bg-[#111010] hover:text-[#f6f0ec] cursor-crosshair transition-colors duration-100 text-2xl";
            
            cell.addEventListener('mouseenter', () => updatePreview(char));
            container.appendChild(cell);
        });
    });

    // Preview Update Function
    function updatePreview(char) {
        // A. Update Waterfall Text
        if(previewBox) {
            const spans = previewBox.querySelectorAll('.preview-span');
            spans.forEach(span => span.innerText = char);
        }
        
        // B. Update Unicode
        const code = char.charCodeAt(0).toString(16).toUpperCase().padStart(4, '0');
        if (unicodeLabel) unicodeLabel.innerText = `U+${code}`;

        // C. Update PostScript Name
        if (postscriptLabel) {
            const name = glyphNames[char] || char;
            postscriptLabel.innerText = name;
        }
    }

    // Weight Slider Logic
    if (slider) {
        slider.addEventListener('input', (e) => {
            const val = e.target.value;
            
            if(previewBox) {
                previewBox.style.fontWeight = val;
                previewBox.style.fontVariationSettings = `"wght" ${val}`;
            }
            
            if (weightLabel) weightLabel.innerText = `WEIGHT: ${val}`;

            document.querySelectorAll('.glyph-cell').forEach(cell => {
                cell.style.fontWeight = val;
                cell.style.fontVariationSettings = `"wght" ${val}`;
            });
        });
    }

    // ==========================================
    // 5. GLYPH LIST HOVER EFFECTS (New)
    // ==========================================
    // When hovering the list, remove colors from selectGlyph. 
    // When not hovering, add colors back.

    if (glyphList && selectGlyph) {
        // 1. Set Default State (Not hovering)
        selectGlyph.classList.add('text-[#111010]', 'bg-[#f6f0ec]');

        // 2. Hover Starts -> Remove colors
        glyphList.addEventListener('mouseleave', () => {
            selectGlyph.classList.remove('text-[#f6f0ec]', 'bg-[#111010]');
            selectGlyph.classList.add('text-[#111010]', 'bg-[#f6f0ec]');
        });

        // 3. Hover Ends -> Add colors back
        glyphList.addEventListener('mouseenter', () => {
            selectGlyph.classList.remove('text-[#111010]', 'bg-[#f6f0ec]');
            selectGlyph.classList.add('text-[#f6f0ec]', 'bg-[#111010]');
        });
    }

});