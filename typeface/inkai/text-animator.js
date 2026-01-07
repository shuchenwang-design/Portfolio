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
        // Numbers
        '1': 'one', '2': 'two', '3': 'three', '4': 'four', '5': 'five',
        '6': 'six', '7': 'seven', '8': 'eight', '9': 'nine', '0': 'zero',

        // Symbols & Currency
        '@': 'at', '&': 'ampersand', '™': 'trademark', '°': 'degree', '|': 'bar',
        '¢': 'cent', '$': 'dollar', '€': 'Euro', '£': 'sterling', '¥': 'yen',
        '+': 'plus', '−': 'minus', '×': 'multiply', '÷': 'divide', '=': 'equal',
        '≠': 'notequal', '>': 'greater', '<': 'less', '≥': 'greaterequal', '≤': 'lessequal',
        '±': 'plusminus', '≈': 'approxequal', '~': 'asciitilde', '^': 'asciicircum',
        '%': 'percent', '‰': 'perthousand',

        // Arrows
        '↑': 'arrowup', '↗': 'arrownortheast', '→': 'arrowright', '↘': 'arrowsoutheast',
        '↓': 'arrowdown', '↙': 'arrowsouthwest', '←': 'arrowleft', '↖': 'arrownorthwest',
        '↔': 'arrowleftrightarrow', '↕': 'arrowupdownarrow',

        // Punctuation
        '!': 'exclam', '?': 'question', '¡': 'exclamdown', '¿': 'questiondown',
        '·': 'periodcentered', '•': 'bullet', '#': 'numbersign', '/': 'slash',
        '\\': 'backslash', '{': 'braceleft', '[': 'bracketleft', '(': 'parenleft',
        '*': 'asterisk', ')': 'parenright', ']': 'bracketright', '}': 'braceright',
        '-': 'hyphen', '–': 'endash', '—': 'emdash', '_': 'underscore',
        '.': 'period', ',': 'comma', ':': 'colon', ';': 'semicolon', '…': 'ellipsis',
        '“': 'quotedblleft', '”': 'quotedblright', '‘': 'quoteleft', '’': 'quoteright',
        '"': 'quotedbl', "'": 'quotesingle', ' ': 'space',

        // Uppercase Latin Extended
        'Á': 'Aacute', 'Ă': 'Abreve', 'Ǎ': 'Acaron', 'Â': 'Acircumflex', 'Ä': 'Adieresis',
        'À': 'Agrave', 'Ā': 'Amacron', 'Ą': 'Aogonek', 'Å': 'Aring', 'Ã': 'Atilde', 'Æ': 'AE',
        'Ć': 'Cacute', 'Č': 'Ccaron', 'Ç': 'Ccedilla', 'Ĉ': 'Ccircumflex', 'Ċ': 'Cdotaccent',
        'Ď': 'Dcaron', 'Đ': 'Dcroat', 'Ð': 'Eth',
        'É': 'Eacute', 'Ě': 'Ecaron', 'Ê': 'Ecircumflex', 'Ë': 'Edieresis', 'Ė': 'Edotaccent',
        'È': 'Egrave', 'Ē': 'Emacron', 'Ę': 'Eogonek', 'Ẽ': 'Etilde', 'Ə': 'Schwa',
        'Ğ': 'Gbreve', 'Ĝ': 'Gcircumflex', 'Ģ': 'Gcommaaccent', 'Ġ': 'Gdotaccent', 'Ḡ': 'Gmacron',
        'Ħ': 'Hbar', 'Ĥ': 'Hcircumflex', 'Ĳ': 'IJ',
        'Í': 'Iacute', 'Ǐ': 'Icaron', 'Î': 'Icircumflex', 'Ï': 'Idieresis', 'İ': 'Idotaccent',
        'Ì': 'Igrave', 'Ī': 'Imacron', 'Į': 'Iogonek', 'Ĩ': 'Itilde',
        'J': 'J', 'Ĵ': 'Jcircumflex',
        'Ķ': 'Kcommaaccent',
        'Ĺ': 'Lacute', 'Ľ': 'Lcaron', 'Ļ': 'Lcommaaccent', 'Ł': 'Lslash',
        'Ń': 'Nacute', 'Ň': 'Ncaron', 'Ņ': 'Ncommaaccent', 'Ñ': 'Ntilde',
        'Ó': 'Oacute', 'Ǒ': 'Ocaron', 'Ô': 'Ocircumflex', 'Ö': 'Odieresis', 'Ò': 'Ograve',
        'Ő': 'Ohungarumlaut', 'Ō': 'Omacron', 'Ø': 'Oslash', 'Õ': 'Otilde', 'Œ': 'OE',
        'Þ': 'Thorn',
        'Ŕ': 'Racute', 'Ř': 'Rcaron', 'Ŗ': 'Rcommaaccent',
        'Ś': 'Sacute', 'Š': 'Scaron', 'Ş': 'Scedilla', 'Ŝ': 'Scircumflex', 'Ș': 'Scommaaccent', 'ẞ': 'Germandbls',
        'Ť': 'Tcaron', 'Ţ': 'Tcedilla', 'Ț': 'Tcommaaccent',
        'Ú': 'Uacute', 'Ŭ': 'Ubreve', 'Ǔ': 'Ucaron', 'Û': 'Ucircumflex', 'Ü': 'Udieresis',
        'Ǘ': 'Udieresisacute', 'Ǚ': 'Udieresiscaron', 'Ǜ': 'Udieresisgrave', 'Ǖ': 'Udieresismacron',
        'Ù': 'Ugrave', 'Ű': 'Uhungarumlaut', 'Ū': 'Umacron', 'Ų': 'Uogonek', 'Ů': 'Uring', 'Ũ': 'Utilde',
        'Ẃ': 'Wacute', 'Ŵ': 'Wcircumflex', 'Ẅ': 'Wdieresis', 'Ẁ': 'Wgrave',
        'Ý': 'Yacute', 'Ŷ': 'Ycircumflex', 'Ÿ': 'Ydieresis', 'Ỳ': 'Ygrave', 'Ỹ': 'Ytilde',
        'Ź': 'Zacute', 'Ž': 'Zcaron', 'Ż': 'Zdotaccent',

        // Lowercase Latin Extended
        'á': 'aacute', 'ă': 'abreve', 'ǎ': 'acaron', 'â': 'acircumflex', 'ä': 'adieresis',
        'à': 'agrave', 'ā': 'amacron', 'ą': 'aogonek', 'å': 'aring', 'ã': 'atilde', 'æ': 'ae',
        'ć': 'cacute', 'č': 'ccaron', 'ç': 'ccedilla', 'ĉ': 'ccircumflex', 'ċ': 'cdotaccent',
        'ď': 'dcaron', 'đ': 'dcroat', 'ð': 'eth',
        'é': 'eacute', 'ě': 'ecaron', 'ê': 'ecircumflex', 'ë': 'edieresis', 'ė': 'edotaccent',
        'è': 'egrave', 'ē': 'emacron', 'ę': 'eogonek', 'ẽ': 'etilde', 'ə': 'schwa',
        'ğ': 'gbreve', 'ĝ': 'gcircumflex', 'ģ': 'gcommaaccent', 'ġ': 'gdotaccent', 'ḡ': 'gmacron',
        'ħ': 'hbar', 'ĥ': 'hcircumflex', 'ĳ': 'ij',
        'í': 'iacute', 'ǐ': 'icaron', 'î': 'icircumflex', 'ï': 'idieresis', 'ì': 'igrave',
        'ī': 'imacron', 'į': 'iogonek', 'ĩ': 'itilde', 'ı': 'dotlessi',
        'j': 'j', 'ĵ': 'jcircumflex',
        'ķ': 'kcommaaccent',
        'ĺ': 'lacute', 'ľ': 'lcaron', 'ļ': 'lcommaaccent', 'ł': 'lslash',
        'ń': 'nacute', 'ň': 'ncaron', 'ņ': 'ncommaaccent', 'ñ': 'ntilde',
        'ó': 'oacute', 'ǒ': 'ocaron', 'ô': 'ocircumflex', 'ö': 'odieresis', 'ò': 'ograve',
        'ő': 'ohungarumlaut', 'ō': 'omacron', 'ø': 'oslash', 'õ': 'otilde', 'œ': 'oe',
        'þ': 'thorn',
        'ŕ': 'racute', 'ř': 'rcaron', 'ŗ': 'rcommaaccent',
        'ś': 'sacute', 'š': 'scaron', 'ş': 'scedilla', 'ŝ': 'scircumflex', 'ș': 'scommaaccent', 'ß': 'germandbls',
        'ť': 'tcaron', 'ţ': 'tcedilla', 'ț': 'tcommaaccent',
        'ú': 'uacute', 'ŭ': 'ubreve', 'ǔ': 'ucaron', 'û': 'ucircumflex', 'ü': 'udieresis',
        'ǘ': 'udieresisacute', 'ǚ': 'udieresiscaron', 'ǜ': 'udieresisgrave', 'ǖ': 'udieresismacron',
        'ù': 'ugrave', 'ű': 'uhungarumlaut', 'ū': 'umacron', 'ų': 'uogonek', 'ů': 'uring', 'ũ': 'utilde',
        'ẃ': 'wacute', 'ŵ': 'wcircumflex', 'ẅ': 'wdieresis', 'ẁ': 'wgrave',
        'ý': 'yacute', 'ŷ': 'ycircumflex', 'ÿ': 'ydieresis', 'ỳ': 'ygrave', 'ỹ': 'ytilde',
        'ź': 'zacute', 'ž': 'zcaron', 'ż': 'zdotaccent'
    };

    // 2. Generate Grid
    sourceContainers.forEach(container => {
        let items = [];

        // CHECK: Is this a ligature box?
        if (container.classList.contains('ligature-grid')) {
            // METHOD A: Split by SPACES (for ligatures like "fi", "ffi")
            // We trim() to remove start/end whitespace, then split by 1 or more spaces
            items = container.innerText.trim().split(/\s+/);
        } else {
            // METHOD B: Split by CHARACTER (Standard)
            // Remove newlines and split every single character
            items = container.innerText.replace(/\n/g, '').split('');
        }

        // Clear the container
        container.innerHTML = ''; 
        
        // Generate Cells
        items.forEach(char => {
            // Skip empty items (e.g. trailing spaces)
            if (!char) return; 

            const cell = document.createElement('div');
            cell.innerText = char;
            
            // Note: Added 'ligature-cell' class for specific styling if needed
            cell.className = "glyph-cell aspect-square flex items-center justify-center border-r border-b border-[#292626] hover:bg-[#292626] hover:text-[#F0E9DD] cursor-crosshair transition-colors duration-100 text-2xl";
            
            // For ligatures, we might want to turn on "liga" explicitly in the grid cell
            if (char.length > 1) {
                cell.style.fontFeatureSettings = '"liga" 1, "dlig" 1'; 
            }

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