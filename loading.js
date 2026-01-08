document.addEventListener("DOMContentLoaded", function() {
            const screen = document.getElementById('loading-screen');
            const percText = document.getElementById('loading-percentage');
            const bar = document.getElementById('loading-bar');
            
            // --- CONFIGURATION ---
            const groundPercent = 90; // Words hit ground at 80% height
            const gravity = 0.008;     // Acceleration per frame (Higher = gets faster quicker)
            const initialSpeed = 1.6;   // Starting speed
            const spawnRate = 200;    // ms between new words
            
            // --- STATE ---
            let wordsList = ["LOADING"];
            let activeWords = []; // Stores objects { element, velocity, positionY }

            // 1. Fetch Words
            fetch('words.json')
                .then(res => res.json())
                .then(data => { wordsList = data; startRain(); })
                .catch(() => { wordsList = ["INKAI", "DESIGN", "FLOW"]; startRain(); });

            // 2. Progress Bar (Fixed 5 Seconds)
            const duration = 5000; 
            const intervalStep = 100;
            const increment = 100 / (duration / intervalStep);
            let progress = 0;

            const loadInterval = setInterval(() => {
                progress += increment; 
                if (progress >= 100) {
                    progress = 100;
                    clearInterval(loadInterval);
                    finishLoading();
                }
                percText.innerHTML = '<span>I am raining</span><span>' + Math.floor(progress) + '%</span>';
                bar.style.width = progress + "%";
            }, intervalStep);


            // 3. Falling System
            function startRain() {
                // Spawn a new word periodically
                setInterval(spawnWord, spawnRate);
                // Start the physics loop
                requestAnimationFrame(updatePhysics);
            }

            function spawnWord() {
                if (progress >= 100) return;
                const text = wordsList[Math.floor(Math.random() * wordsList.length)];
                const el = document.createElement('div');
                el.classList.add('falling-word');
                el.style.left = (Math.random() * 80 + 10) + "%"; 
                
                // Create spans
                el.innerHTML = text.split('').map(char => `<span>${char}</span>`).join('');
                screen.appendChild(el);
                // Random Font Size (e.g., between 1.2rem and 3.5rem)
                // You can adjust these numbers to control min/max size
                const randomSize = (Math.random() * 6 + 12) + "px"; 
                el.style.fontSize = randomSize;


                // Apply Gravity Weight Animation
                applyGravityWeight(el); 

                activeWords.push({ element: el, y: -200, velocity: initialSpeed });
            }

            function updatePhysics() {
                if (screen.style.display === 'none') return; // Stop if hidden

                const groundPixel = window.innerHeight * (groundPercent / 100);

                // Loop backwards so we can remove items safely
                for (let i = activeWords.length - 1; i >= 0; i--) {
                    let wordObj = activeWords[i];
                    
                    // A. Apply Gravity
                    wordObj.velocity += gravity; 
                    wordObj.y += wordObj.velocity;
                    wordObj.element.style.top = wordObj.y + "px";

                    // B. Collision Detection (Letter by Letter)
                    // We check the LAST child (the bottom-most letter)
                    const lastSpan = wordObj.element.lastElementChild;

                    if (lastSpan) {
                        const rect = lastSpan.getBoundingClientRect();
                        
                        // If the bottom of the letter hits the ground line
                        if (rect.bottom >= groundPixel) {
                            // 1. Create Ripple at that specific letter's X position
                            createRipple(rect.left + (rect.width / 2), groundPixel);
                            
                            // 2. Remove the letter
                            lastSpan.remove();
                            
                            // 3. Slight Bounce/Stall effect
                            //wordObj.velocity *= 0.9; 
                        }
                    } else {
                        // If no spans left, remove the word container
                        wordObj.element.remove();
                        activeWords.splice(i, 1);
                    }

                    // C. Cleanup if word falls way below screen (safety)
                    if (wordObj.y > window.innerHeight + 100) {
                        if(wordObj.element.parentNode) wordObj.element.remove();
                        activeWords.splice(i, 1);
                    }
                }

                requestAnimationFrame(updatePhysics);
            }

            function createRipple(x, y) {
                const ripple = document.createElement('div');
                ripple.classList.add('ripple');
                ripple.style.left = x + "px";
                ripple.style.top = y + "px";
                screen.appendChild(ripple);
                setTimeout(() => ripple.remove(), 600);
            }

            function finishLoading() {
                // STEP 1: Stop spawning words (Already handled by progress >= 100 check in spawnWord)
                
                // STEP 2: Animate UI Elements Out
                const wrapper = document.querySelector('.progress-wrapper');
                const text = document.getElementById('loading-percentage');
                
                // A. Loading Bar Grows Shorter (Scale to 0)
                if (wrapper) wrapper.classList.add('exit-mode');
                
                // B. Text Falls Down
                if (text) text.classList.add('exit-mode');

                // STEP 3: Wait for UI to clear (e.g., 600ms), then wipe background
                setTimeout(() => {
                    // Add the class to prepare for wipe
                    screen.classList.add('slide-out');
                    
                    // Force a browser reflow (optional safety) or just add active class directly
                    setTimeout(() => {
                        screen.classList.add('slide-out-active');
                    }, 50);

                    // STEP 4: Remove from DOM after wipe completes
                    setTimeout(() => {
                        screen.style.display = "none";
                    }, 1100); // 1s transition + buffer

                }, 600);
            }

            // --- FUNCTION: GRAVITY WEIGHT ACCUMULATION ---
            // 1. Starts at 400
            // 2. Grows to 900
            // 3. Bottom letters grow FASTER than top letters
            function applyGravityWeight(element) {
                    if (!element) return;
                    
                    const spans = element.querySelectorAll('span');
                    const totalLetters = spans.length;

                    spans.forEach((span, index) => {
                        // 1. Set Initial State (Light)
                        let currentWeight = 400;
                        span.style.fontVariationSettings = `"wght" ${currentWeight}`;
                        span.style.fontWeight = currentWeight;

                        // 2. Calculate Growth Speed based on position
                        // logic: (Index + 1) / Total. 
                        // Result: Top is ~0.1 (Slow), Bottom is 1.0 (Fast)
                        const positionFactor = Math.pow((index + 1) / totalLetters, 2);
                        
                        // Speed Config:
                        // Top letters add ~0.1 weight per tick (Very slow)
                        // Bottom letters add ~25 weight per tick (Very fast)
                        const growthSpeed = 0.1 + (positionFactor * 80); 

                        // 3. Start Animation Loop
                        const intervalId = setInterval(() => {
                            // Safety: Stop if element removed from screen
                            if(!span.isConnected) { 
                                clearInterval(intervalId); 
                                return; 
                            }

                            // Increment Weight
                            currentWeight += growthSpeed;

                            // Cap at 900 (Max Black)
                            if (currentWeight >= 900) {
                                currentWeight = 900;
                                clearInterval(intervalId); // Stop calculating once full
                            }

                            // Apply
                            span.style.fontVariationSettings = `"wght" ${currentWeight}`;
                            span.style.fontWeight = currentWeight;

                        }, 200); // Updates 20 times per second
                    });
                }

        });