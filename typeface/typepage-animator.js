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

    function initBreathingLogic(element, minWeight, maxWeight, step, speed) {
        const text = element.innerText; 
        element.innerHTML = text.split('').map(char => {
            if (char === '\n') return '<br>'; 
            if (char === ' ') return ' '; 
            return `<span style="display:inline-block">${char}</span>`;
        }).join('');

        const spans = element.querySelectorAll('span');
        spans.forEach((span) => {
            let currentWeight = Math.floor((Math.random() * (maxWeight - minWeight + 1) + minWeight) / step) * step;
            let direction = Math.random() > 0.5 ? 1 : -1;

            const intervalId = setInterval(() => {
                // FIX: Combine weight AND kerning in one variation/feature update
                // Note: 'kern' is usually on by default, but forcing it in feature settings ensures it stays.
                
                // 1. Set Weight
                span.style.fontVariationSettings = `"wght" ${currentWeight}`;
                span.style.fontWeight = currentWeight;

                // 2. FORCE Kerning (and other standard features)
                // If you are using other features like 'liga' or 'ss01' in the main text, 
                // you might need to append them here too, e.g. '"kern" 1, "liga" 1'
                span.style.fontFeatureSettings = '"kern" 1, "liga" 1, "calt" 1'; 

                if (currentWeight >= maxWeight) direction = -1;
                else if (currentWeight <= minWeight) direction = 1;
                currentWeight += (step * direction);
            }, speed);

            breathingIntervals.push(intervalId);
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