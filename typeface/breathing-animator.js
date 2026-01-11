document.addEventListener("DOMContentLoaded", function() {

    // =================================================================
    // PART 0: DYNAMIC THEME EXTRACTION
    // =================================================================
    // Read the colors directly from the body tag to apply to elements dynamically
    const bodyStyles = window.getComputedStyle(document.body);
    const themeBright = bodyStyles.backgroundColor; // The Bright Background
    const themeDark = bodyStyles.color;         // The Dark Text/Border Color

    // Inject a dynamic stylesheet for the Grid Hover states
    // (We do this because we can't generate Tailwind hover classes dynamically)
    const styleSheet = document.createElement("style");
    styleSheet.innerText = `
        .dynamic-theme-cell {
            border-color: ${themeDark} !important;
            color: ${themeDark};
        }
        .dynamic-theme-cell:hover {
            background-color: ${themeDark} !important;
            color: ${themeBright} !important;
        }

        .previewSlider{
            -webkit-appearance: none;           
            height: 8px;
            background: transparent;
            border: 1pt solid ${themeDark};
            border-radius: 4px;      
            outline: none;
            transition: 0.3s ease;
        }
        .previewSlider::-webkit-slider-thumb {
            -webkit-appearance: none; 
            appearance: none;          
            width: 16px;              
            height: 16px;   
            border:1pt solid ${themeDark};
            background:${themeBright};     
            border-radius: 50%;      
            cursor: pointer;
            transition: 0.3s ease;
        }
        .previewSlider::-webkit-slider-thumb:hover {
            background: ${themeDark};     
        }
        .liga-box{
            aspect-ratio: 8/7;
            background: ${themeBright};
            outline: 1px solid  ${themeDark};
            color:${themeDark};
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            font-feature-settings: "liga" 0, "calt" 0, "dlig" 0;
        }
        .liga-box:hover {
            font-feature-settings: "liga" 1, "calt" 1, "dlig" 1;
        }

        .dlig-span {
            font-feature-settings: "liga" 1, "calt" 1, "dlig" 1;
        }

        .circle-btn {
            width: 16px;
            height: 16px;
            border-radius: 50%;
            border: 1pt solid ${themeDark};
            background-color: transparent;
            cursor: pointer;
            transition: 0.3s ease-in-out;
        }
        .circle-btn.active {
            background-color: ${themeDark};
        }


        .ss-box{
            aspect-ratio: 3/2;
            background: ${themeBright};
            outline: 1px solid  ${themeDark};
            color:${themeDark};
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            font-feature-settings: "liga", "calt", "dlig";
        }

        .glyph-box{
            aspect-ratio: 1/1;
            background: ${themeBright};
            outline: 1px solid  ${themeDark};
            color:${themeDark};
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: crosshair;
            font-feature-settings: "liga", "calt", "dlig";
        }

        .style-button {
            border: 1px solid ${themeDark};
            background-color: ${themeBright};
            padding: 4px 20px;
            border-radius: 6px;
        }

        .style-button.active {
            background-color: ${themeDark};
            color: ${themeBright};
        }
    `;
    document.head.appendChild(styleSheet);


    // =================================================================
    // PART A: TOP PREVIEW (Editable Text, Sliders, Breathing)
    // =================================================================
    
    // --- Elements ---
    const textZone = document.getElementById('editableText');
    const sizeSlider = document.getElementById('fontSizeSlider');
    const weightSlider = document.getElementById('fontWeightSlider');
    const breathBtn = document.getElementById('breathBtn');

    // --- State ---
    let isBreathing = false;
    let breathingIntervals = []; 
    let originalText = "";       

    // 1. Sliders
    if (sizeSlider) {
        sizeSlider.addEventListener('input', (e) => {
            if(textZone) textZone.style.fontSize = (0.01 * e.target.value)+ 'vw';
        });
    }

    if (weightSlider) {
        weightSlider.addEventListener('input', (e) => {
            if (isBreathing) stopBreathing(); // Stop animation if user drags slider
            const val = e.target.value;
            if(textZone) {
                textZone.style.fontWeight = val;
                textZone.style.fontVariationSettings = `"wght" ${val}`;
            }
        });
    }

    // 2. Breathing Logic
    if (breathBtn) {
        breathBtn.addEventListener('click', () => {
            if (!isBreathing) startBreathing();
            else stopBreathing();
        });
    }

    function startBreathing() {
        if(!textZone) return;
        isBreathing = true;
        
        // UI Update
        breathBtn.classList.add('active');
        const label = breathBtn.nextElementSibling;
        if(label) label.innerText = "DYNAMIC WEIGHT: ON";

        // Text Setup
        textZone.contentEditable = "false";
        originalText = textZone.innerHTML;
        textZone.classList.add('uppercase'); 

        initBreathingLogic(textZone, 100, 900, 10, 100); 
    }

    function stopBreathing() {
        if(!textZone) return;
        isBreathing = false;
        
        // UI Update
        breathBtn.classList.remove('active');
        const label = breathBtn.nextElementSibling;
        if(label) label.innerText = "DYNAMIC WEIGHT: OFF";

        // Clear Intervals
        breathingIntervals.forEach(id => clearInterval(id));
        breathingIntervals = [];

        // Restore Text
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

    // =================================================================
    // KERNING DATA (Paste this at the top of your JS or outside the function)
    // =================================================================
    const kerningPairs = {
        // T pairs
        "T,a": -70, "T,J": -60, "T,s": -80, "T,n": -30, "T,-": -80, "T,o": -60, "T,i": -20,
        "T,A": -80, "T,j": -70, "T,:": -80, "T,.": -80, "T,M": -70, "T,u": -65, "T,v": -80, "T,O": -40,
        // U pairs
        "U,A": -20, "U,U": -10, "U,V": -15,
        // Minus pairs
        "-,5": -20, "-,3": -45, "-,2": -40, "-,7": -90, "-,8": -30, "-,1": -80, "-,9": -40,
        // V pairs
        "V,J": -40, "V,n": -20, "V,-": -40, "V,o": -40, "V,A": -60, "V,M": -40, 
        "V,:": -30, "V,.": -95, "V,v": -20, "V,u": -25, "V,O": -40,
        // Number pairs
        "9,-": -20, "9,£": -30, "9,.": -50,
        "X,.": 20, "X,:": 20, "X,-": -40,
        // Y pairs
        "Y,a": -80, "Y,J": -90, "Y,s": -80, "Y,n": -40, "Y,z": -30, "Y,-": -60,
        "Y,o": -80, "Y,u": -30, "Y,M": -70, "Y,:": -40, "Y,S": -15, "Y,p": -60,
        "Y,.": -120, "Y,v": -40, "Y,O": -70,
        // Z pairs
        "Z,.": 20, "Z,O": -30, "Z,:": 20,
        // Symbol pairs
        "±,2": -40, "±,5": -40, "±,7": -40, "±,3": -40,
        "~,2": -40, "~,7": -60, "~,3": -40,
        // 7 pairs
        "7,×": -30, "7,£": -20, "7,<": -60, "7,±": -40, "7,-": -20, "7,€": -40, "7,≠": -40, "7,.": -90,
        // Lowercase pairs
        "a,o": 10,
        "b,)": -30, "b,a": -10, "b,v": -10, "b,.": -50, "b,x": -20,
        "5,.": -55, "5,~": 10, "5,≤": 20,
        // Hyphen pairs
        "-,H": 10, "-,U": -20, "-,Y": -40, "-,T": -70, "-,X": -30, "-,O": 20, "-,S": -20, "-,J": -100, "-,A": 5, "-,V": -30, "-,M": -20,
        // Other lowercase
        "e,v": -10, 
        "f,?": 40, "f,o": -20, "f,*": 40, "f,!": 40, "f,.": -40,
        "3,£": -20, "3,.": -55, "3,¥": -15, "3,±": 0,
        "≤,1": -40, "≤,3": -40,
        "2,€": -40, "2,.": 10, "2,£": -20, "2,-": -20,
        "j,.": -20,
        "×,3": -20, "×,8": 10, "×,2": -20, "×,7": -60, "×,0": 10, "×,1": -50,
        "6,.": -35, "6,×": -30,
        "k,v": -20, "k,*": -40, "k,u": -10, "k,o": -20,
        // A pairs
        "A,*": -40, "A,V": -40, "A,?": -30, "A,-": 10, "A,u": -20, "A,M": -10, "A,:": 15, 
        "A,Y": -69, "A,v": -30, "A,.": 10, "A,T": -60,
        // Zero pairs
        "0,2": -20, "0,£": -20, "0,.": -40, "0,7": -20, "0,×": -30, "0,-": -20,
        // B pairs
        "B,-": 20, "B,Y": -20, "B,:": 10, "B,X": -20, "B,V": -30, "B,.": -30, "B,M": -20,
        "?,A": -20,
        "+,5": -20, "+,7": -20, "+,3": -40,
        // C pairs
        "C,A": -16, "C,.": -28, "C,M": -15, "C,T": -30,
        // n pairs
        "n,*": -40, "n,5": -40, "n,2": -20, "n,7": -60, "n,3": -20, "n,]": -25, "n,8": -10, "n,f": -15, "n,1": -40, "n,“": -60,
        "^,4": -50, "^,7": 20,
        "*,O": -29,
        "o,)": -20, "o,.": -30, "o,a": -10,
        "E,:": 10, "E,.": 30,
        "≥,1": -60,
        "8,.": -15, "8,×": -30,
        // F pairs
        "F,A": -50, "F,.": -80, "F,J": -70, "F,M": -50, "F,o": -20,
        // G pairs
        "G,V": -20, "G,Y": -60, "G,.": 20, "G,T": -50,
        "1,.": -20, "1,^": -40,
        "r,.": -100,
        "H,*": -30,
        "t,*": -30,
        "&,A": -20, "&,M": -40, "&,V": -80,
        "J,.": -20,
        "“,v": -20,
        // K pairs
        "K,a": -30, "K,J": -40, "K,V": -30, "K,n": -20, "K,o": -30, "K,X": -20, "K,A": -60, 
        "K,.": 20, "K,Y": -40, "K,u": -40, "K,v": -50, "K,O": -60,
        "v,o": -20,
        // L pairs
        "L,*": -120, "L,J": -40, "L,V": -100, "L,-": -60, "L,X": -50, "L,A": -20, "L,M": -20, 
        "L,Y": -120, "L,T": -120, "L,O": -40, "L,U": -100,
        "¥,2": -20, "¥,4": -20, "¥,5": -10, "¥,6": -20,
        // M pairs
        "M,V": -50, "M,Y": -80, "M,U": -20, "M,X": -50, "M,T": -70,
        // O pairs
        "O,.": -110, "O,Y": -40, "O,T": -40, "O,X": -30, "O,O": -20, "O,J": -50, "O,A": -50, 
        "O,V": -40, "O,M": -40, "O,Z": -40,
        // Less pairs
        "<,5": -20, "<,7": -40, "<,3": -20,
        // P pairs
        "P,-": -20, "P,o": -60, "P,:": -20, "P,X": -30, "P,O": -20, "P,J": -90, "P,A": -80, 
        "P,V": -20, "P,M": -60, "P,.": -120,
        "4,≤": 20, "4,~": 20, "4,.": -20, "4,^": -30,
        // Q pairs
        "Q,Y": -30, "Q,T": -40, "Q,J": -40, "Q,A": -35, "Q,V": -20, "Q,M": -20, "Q,.": 0,
        // R pairs
        "R,a": -15, "R,J": -40, "R,V": -30, "R,-": -30, "R,o": -20, "R,X": -25, "R,A": -20, 
        "R,M": -20, "R,Y": -40, "R,u": -15, "R,O": -30,
        // Greater pairs
        ">,3": -30, ">,2": -40, ">,5": -30, ">,1": -20,
        "≠,7": -40,
        // S pairs
        "S,A": -30, "S,M": -40, "S,.": -46
    };

    // Map similar glyphs to groups if needed (Optimization)
    // For now, we assume simple character-to-character matching for simplicity.

    function initBreathingLogic(element, minWeight, maxWeight, step, speed) {
        const text = element.innerText; 
        
        // Split into spans and prepare logic
        element.innerHTML = text.split('').map(char => {
            if (char === '\n') return '<br>'; 
            if (char === ' ') return ' '; 
            // Note: transition on margin makes the spacing change smooth
            return `<span style="display:inline-block; transition: margin-right 0.2s ease-out;">${char}</span>`;
        }).join('');

        const spans = element.querySelectorAll('span');

        spans.forEach((span, index) => {
            let currentWeight = Math.floor((Math.random() * (maxWeight - minWeight + 1) + minWeight) / step) * step;
            let direction = Math.random() > 0.5 ? 1 : -1;

            // Apply Static Kerning immediately
            applyKerning(span, spans[index+1]);

            const intervalId = setInterval(() => {
                span.style.fontVariationSettings = `"wght" ${currentWeight}`;
                span.style.fontWeight = currentWeight;

                // Update weight
                if (currentWeight >= maxWeight) direction = -1;
                else if (currentWeight <= minWeight) direction = 1;
                currentWeight += (step * direction);
            }, speed);

            breathingIntervals.push(intervalId);
        });
    }

    function applyKerning(currentSpan, nextSpan) {
        if (!nextSpan) return;

        const leftChar = currentSpan.innerText;
        const rightChar = nextSpan.innerText;
        const key = `${leftChar},${rightChar}`;

        if (kerningPairs[key]) {
            // Convert font units to Em units. 
            // Assuming 1000 units per em (Standard for OTF/TTF).
            // If your UPM is 2048, change 1000 to 2048.
            const marginEm = kerningPairs[key] / 1000;
            
            // Apply negative margin to the right of the current character
            currentSpan.style.marginRight = `${marginEm}em`;
        }
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
    initWavyText('wave-text', 200, 600, 1, 5);

    // 3. Top Buttons (SS01, SS02, Liga, Calt, Dlig) for #editableText
    const topFeatureMap = {
        'ss01Btn': 'ss01',
        'ss02Btn': 'ss02',
        'ligaBtn': 'liga',
        'caltBtn': 'calt',
        'dligBtn': 'dlig'
    };

    const topFeatureState = {};
    
    Object.keys(topFeatureMap).forEach(btnId => {
        const btn = document.getElementById(btnId);
        const tag = topFeatureMap[btnId];
        
        if (btn) {
            topFeatureState[tag] = btn.classList.contains('active') ? 1 : 0;
            btn.addEventListener('click', () => {
                btn.classList.toggle('active');
                topFeatureState[tag] = btn.classList.contains('active') ? 1 : 0;
                applyTopFeatures();
            });
        }
    });

    function applyTopFeatures() {
        if(!textZone) return;
        const settingsString = Object.entries(topFeatureState)
            .map(([tag, value]) => `"${tag}" ${value}`)
            .join(', ');
        textZone.style.fontFeatureSettings = settingsString;
    }
    applyTopFeatures(); // Init on load


    // =================================================================
    // PART B: BOTTOM GLYPH GRID (Selection, Hover, Dictionary)
    // =================================================================

    const glyphList = document.getElementById('glyphList');
    const selectGlyph = document.getElementById('selectGlyph');
    const previewBox = document.getElementById('big-char');
    const unicodeLabel = document.getElementById('meta-unicode');
    const weightLabel = document.getElementById('meta-weight');
    const postscriptLabel = document.getElementById('meta-postscript'); 
    const glyphSlider = document.getElementById('glyph-weight-slider');
    const sourceContainers = document.querySelectorAll('.glyph-grid-source');

    // 1. PostScript Dictionary
    const glyphNames = {
        // Numbers
        '1': 'one', '2': 'two', '3': 'three', '4': 'four', '5': 'five',
        '6': 'six', '7': 'seven', '8': 'eight', '9': 'nine', '0': 'zero',
        // Symbols
        '@': 'at', '&': 'ampersand', '™': 'trademark', '°': 'degree', '|': 'bar',
        '¢': 'cent', '$': 'dollar', '€': 'Euro', '£': 'sterling', '¥': 'yen',
        '+': 'plus', '−': 'minus', '×': 'multiply', '÷': 'divide', '=': 'equal',
        '≠': 'notequal', '>': 'greater', '<': 'less', '≥': 'greaterequal', '≤': 'lessequal',
        '±': 'plusminus', '≈': 'approxequal', '~': 'asciitilde', '^': 'asciicircum',
        '%': 'percent', '‰': 'perthousand',
        // Punctuation
        '!': 'exclam', '?': 'question', '¡': 'exclamdown', '¿': 'questiondown',
        '·': 'periodcentered', '•': 'bullet', '#': 'numbersign', '/': 'slash',
        '\\': 'backslash', '{': 'braceleft', '[': 'bracketleft', '(': 'parenleft',
        '*': 'asterisk', ')': 'parenright', ']': 'bracketright', '}': 'braceright',
        '-': 'hyphen', '–': 'endash', '—': 'emdash', '_': 'underscore',
        '.': 'period', ',': 'comma', ':': 'colon', ';': 'semicolon', '…': 'ellipsis',
        '“': 'quotedblleft', '”': 'quotedblright', '‘': 'quoteleft', '’': 'quoteright',
        '"': 'quotedbl', "'": 'quotesingle', ' ': 'space',
        // Arrows
        '↑': 'arrowup', '↗': 'arrownortheast', '→': 'arrowright', '↘': 'arrowsoutheast',
        '↓': 'arrowdown', '↙': 'arrowsouthwest', '←': 'arrowleft', '↖': 'arrownorthwest',
        '↔': 'arrowleftrightarrow', '↕': 'arrowupdownarrow',
        // Extended Latin
        'Á': 'Aacute', 'Ă': 'Abreve', 'Ǎ': 'Acaron', 'Â': 'Acircumflex', 'Ä': 'Adieresis', 'À': 'Agrave', 'Ā': 'Amacron', 'Ą': 'Aogonek', 'Å': 'Aring', 'Ã': 'Atilde', 'Æ': 'AE', 'Ć': 'Cacute', 'Č': 'Ccaron', 'Ç': 'Ccedilla', 'Ĉ': 'Ccircumflex', 'Ċ': 'Cdotaccent', 'Ď': 'Dcaron', 'Đ': 'Dcroat', 'Ð': 'Eth', 'É': 'Eacute', 'Ě': 'Ecaron', 'Ê': 'Ecircumflex', 'Ë': 'Edieresis', 'Ė': 'Edotaccent', 'È': 'Egrave', 'Ē': 'Emacron', 'Ę': 'Eogonek', 'Ẽ': 'Etilde', 'Ə': 'Schwa', 'Ğ': 'Gbreve', 'Ĝ': 'Gcircumflex', 'Ģ': 'Gcommaaccent', 'Ġ': 'Gdotaccent', 'Ḡ': 'Gmacron', 'Ħ': 'Hbar', 'Ĥ': 'Hcircumflex', 'Ĳ': 'IJ', 'Í': 'Iacute', 'Ǐ': 'Icaron', 'Î': 'Icircumflex', 'Ï': 'Idieresis', 'İ': 'Idotaccent', 'Ì': 'Igrave', 'Ī': 'Imacron', 'Į': 'Iogonek', 'Ĩ': 'Itilde', 'J': 'J', 'Ĵ': 'Jcircumflex', 'Ķ': 'Kcommaaccent', 'Ĺ': 'Lacute', 'Ľ': 'Lcaron', 'Ļ': 'Lcommaaccent', 'Ł': 'Lslash', 'Ń': 'Nacute', 'Ň': 'Ncaron', 'Ņ': 'Ncommaaccent', 'Ñ': 'Ntilde', 'Ó': 'Oacute', 'Ǒ': 'Ocaron', 'Ô': 'Ocircumflex', 'Ö': 'Odieresis', 'Ò': 'Ograve', 'Ő': 'Ohungarumlaut', 'Ō': 'Omacron', 'Ø': 'Oslash', 'Õ': 'Otilde', 'Œ': 'OE', 'Þ': 'Thorn', 'Ŕ': 'Racute', 'Ř': 'Rcaron', 'Ŗ': 'Rcommaaccent', 'Ś': 'Sacute', 'Š': 'Scaron', 'Ş': 'Scedilla', 'Ŝ': 'Scircumflex', 'Ș': 'Scommaaccent', 'ẞ': 'Germandbls', 'Ť': 'Tcaron', 'Ţ': 'Tcedilla', 'Ț': 'Tcommaaccent', 'Ú': 'Uacute', 'Ŭ': 'Ubreve', 'Ǔ': 'Ucaron', 'Û': 'Ucircumflex', 'Ü': 'Udieresis', 'Ǘ': 'Udieresisacute', 'Ǚ': 'Udieresiscaron', 'Ǜ': 'Udieresisgrave', 'Ǖ': 'Udieresismacron', 'Ù': 'Ugrave', 'Ű': 'Uhungarumlaut', 'Ū': 'Umacron', 'Ų': 'Uogonek', 'Ů': 'Uring', 'Ũ': 'Utilde', 'Ẃ': 'Wacute', 'Ŵ': 'Wcircumflex', 'Ẅ': 'Wdieresis', 'Ẁ': 'Wgrave', 'Ý': 'Yacute', 'Ŷ': 'Ycircumflex', 'Ÿ': 'Ydieresis', 'Ỳ': 'Ygrave', 'Ỹ': 'Ytilde', 'Ź': 'Zacute', 'Ž': 'Zcaron', 'Ż': 'Zdotaccent', 'á': 'aacute', 'ă': 'abreve', 'ǎ': 'acaron', 'â': 'acircumflex', 'ä': 'adieresis', 'à': 'agrave', 'ā': 'amacron', 'ą': 'aogonek', 'å': 'aring', 'ã': 'atilde', 'æ': 'ae', 'ć': 'cacute', 'č': 'ccaron', 'ç': 'ccedilla', 'ĉ': 'ccircumflex', 'ċ': 'cdotaccent', 'ď': 'dcaron', 'đ': 'dcroat', 'ð': 'eth', 'é': 'eacute', 'ě': 'ecaron', 'ê': 'ecircumflex', 'ë': 'edieresis', 'ė': 'edotaccent', 'è': 'egrave', 'ē': 'emacron', 'ę': 'eogonek', 'ẽ': 'etilde', 'ə': 'schwa', 'ğ': 'gbreve', 'ĝ': 'gcircumflex', 'ģ': 'gcommaaccent', 'ġ': 'gdotaccent', 'ḡ': 'gmacron', 'ħ': 'hbar', 'ĥ': 'hcircumflex', 'ĳ': 'ij', 'í': 'iacute', 'ǐ': 'icaron', 'î': 'icircumflex', 'ï': 'idieresis', 'ì': 'igrave', 'ī': 'imacron', 'į': 'iogonek', 'ĩ': 'itilde', 'ı': 'dotlessi', 'j': 'j', 'ĵ': 'jcircumflex', 'ķ': 'kcommaaccent', 'ĺ': 'lacute', 'ľ': 'lcaron', 'ļ': 'lcommaaccent', 'ł': 'lslash', 'ń': 'nacute', 'ň': 'ncaron', 'ņ': 'ncommaaccent', 'ñ': 'ntilde', 'ó': 'oacute', 'ǒ': 'ocaron', 'ô': 'ocircumflex', 'ö': 'odieresis', 'ò': 'ograve', 'ő': 'ohungarumlaut', 'ō': 'omacron', 'ø': 'oslash', 'õ': 'otilde', 'œ': 'oe', 'þ': 'thorn', 'ŕ': 'racute', 'ř': 'rcaron', 'ŗ': 'rcommaaccent', 'ś': 'sacute', 'š': 'scaron', 'ş': 'scedilla', 'ŝ': 'scircumflex', 'ș': 'scommaaccent', 'ß': 'germandbls', 'ť': 'tcaron', 'ţ': 'tcedilla', 'ț': 'tcommaaccent', 'ú': 'uacute', 'ŭ': 'ubreve', 'ǔ': 'ucaron', 'û': 'ucircumflex', 'ü': 'udieresis', 'ǘ': 'udieresisacute', 'ǚ': 'udieresiscaron', 'ǜ': 'udieresisgrave', 'ǖ': 'udieresismacron', 'ù': 'ugrave', 'ű': 'uhungarumlaut', 'ū': 'umacron', 'ų': 'uogonek', 'ů': 'uring', 'ũ': 'utilde', 'ẃ': 'wacute', 'ŵ': 'wcircumflex', 'ẅ': 'wdieresis', 'ẁ': 'wgrave', 'ý': 'yacute', 'ŷ': 'ycircumflex', 'ÿ': 'ydieresis', 'ỳ': 'ygrave', 'ỹ': 'ytilde', 'ź': 'zacute', 'ž': 'zcaron', 'ż': 'zdotaccent'
    };

    // 2. Generate Grid
    sourceContainers.forEach(container => {
        let items = [];

        // CHECK: Is this a ligature box?
        if (container.classList.contains('ligature-grid')) {
            // METHOD A: Split by SPACES (for ligatures like "fi", "ffi")
            items = container.innerText.trim().split(/\s+/);
        } else {
            // METHOD B: Split by CHARACTER (Standard)
            items = container.innerText.replace(/\n/g, '').split('');
        }

        // Clear the container
        container.innerHTML = ''; 
        
        // Generate Cells
        items.forEach(char => {
            if (!char) return; 

            const cell = document.createElement('div');
            cell.innerText = char;
            
            // DYNAMIC EDIT: Removed hardcoded colors. 
            // Added 'dynamic-theme-cell' class which uses the injected CSS rules from Part 0.
            cell.className = "glyph-cell aspect-square flex items-center justify-center border-r border-b cursor-crosshair transition-colors duration-100 text-2xl dynamic-theme-cell";
            
            // --- FIX: DELETE THIS BLOCK ---
            // We removed the code that forced settings here. 
            // Now the cell will listen to the parent container's settings.
            // ------------------------------

            cell.addEventListener('mouseenter', () => updatePreview(char));
            container.appendChild(cell);
        });
    });
    
    // 3. Update Preview Logic
    function updatePreview(char) {
        // A. Waterfall Text
        if(previewBox) {
            const spans = previewBox.querySelectorAll('.preview-span');
            spans.forEach(span => span.innerText = char);
        }
        
        // B. Unicode
        const code = char.charCodeAt(0).toString(16).toUpperCase().padStart(4, '0');
        if (unicodeLabel) unicodeLabel.innerText = `U+${code}`;

        // C. PostScript Name
        if (postscriptLabel) {
            const name = glyphNames[char] || char;
            postscriptLabel.innerText = name;
        }
    }

    // 4. Glyph Weight Slider
    if (glyphSlider) {
        glyphSlider.addEventListener('input', (e) => {
            const val = e.target.value;
            
            // Preview Box
            if(previewBox) {
                previewBox.style.fontWeight = val;
                previewBox.style.fontVariationSettings = `"wght" ${val}`;
            }
            
            // Label
            if (weightLabel) weightLabel.innerText = `WEIGHT: ${val}`;

            // Grid Cells
            document.querySelectorAll('.glyph-cell').forEach(cell => {
                cell.style.fontWeight = val;
                cell.style.fontVariationSettings = `"wght" ${val}`;
            });
        });
    }

    // 5. Hover Effects (Invert colors on hover)
    if (glyphList && selectGlyph) {
        // Initial State (Use extracted Theme Colors)
        selectGlyph.style.color = themeDark;
        selectGlyph.style.backgroundColor = themeBright;

        // Hover In -> Invert
        glyphList.addEventListener('mouseenter', () => {
            selectGlyph.style.color = themeBright;
            selectGlyph.style.backgroundColor = themeDark;
        });

        // Hover Out -> Restore
        glyphList.addEventListener('mouseleave', () => {
            selectGlyph.style.color = themeDark;
            selectGlyph.style.backgroundColor = themeBright;
        });
    }

   // 6. Bottom Buttons (SS01, SS02 for Grid)
    const glyphTargets = [
        document.getElementById('selectGlyph'),
        document.getElementById('glyphList')
    ];

    const bottomFeatureMap = {
        'ss01': 'ss01', 
        'ss02': 'ss02'
    };

    // Initialize with standard features ON
    const bottomFeatureState = { 
        'ss01': 0, 
        'ss02': 0, 
        'dlig': 1, 
        'liga': 1, 
        'calt': 1 
    };

    Object.keys(bottomFeatureMap).forEach(btnId => {
        const btn = document.getElementById(btnId);
        const tag = bottomFeatureMap[btnId];

        if (btn) {
            btn.addEventListener('click', () => {
                btn.classList.toggle('active');
                bottomFeatureState[tag] = btn.classList.contains('active') ? 1 : 0;
                updateGlyphStyles();
            });
        }
    });

    function updateGlyphStyles() {
        const settings = Object.entries(bottomFeatureState)
            .map(([tag, value]) => `"${tag}" ${value}`)
            .join(', ');

        glyphTargets.forEach(target => {
            if (target) {
                target.style.fontFeatureSettings = settings;
            }
        });
    }
    
    // --- FIX: Apply the default state (dlig: 1) immediately on load ---
    updateGlyphStyles();


    // =================================================================
    // PART C: DECORATIVE ANIMATIONS (SS-BOX)
    // =================================================================
    const shiftingElements = document.querySelectorAll('.ss-box');

    if (shiftingElements.length > 0) {
        const styles = [
            '"ss01" 0, "ss02" 0, "dlig" 1', 
            '"ss01" 1, "dlig" 1',           
            '"ss01" 1, "dlig" 0'            
        ];

        shiftingElements.forEach((element, index) => {
            let currentIndex = 0; 
            const delay = index * 250; 

            setTimeout(() => {
                setInterval(() => {
                    currentIndex++;
                    if (currentIndex >= styles.length) currentIndex = 0;
                    element.style.fontFeatureSettings = styles[currentIndex];
                }, 800); 
            }, delay);
        });
    }
});