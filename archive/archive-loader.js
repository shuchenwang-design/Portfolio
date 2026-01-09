document.addEventListener("DOMContentLoaded", () => {
    const listContainer = document.getElementById('archive-list');
    const bgImage = document.getElementById('bg-image');
    
    // 1. Fetch Data
    fetch('projects.json')
        .then(response => response.json())
        .then(data => {
            renderProjects(data);
            
            requestAnimationFrame(() => {
                setupInteractions();
                // Default: Activate first project
                if(data.length > 0) activateProject(0);
            });
        })
        .catch(err => console.error("Error loading JSON:", err));

    // 2. Render HTML
    function renderProjects(projects) {
        listContainer.innerHTML = projects.map((p, index) => {
            
            let mainTitle = p.title;
            let subTitle = "";
            if (p.title.includes(":")) {
                const parts = p.title.split(":");
                mainTitle = parts[0].trim();
                subTitle = parts[1].trim();
            }
            const yearMatch = p.date.match(/\d{4}/g);
            const year = yearMatch ? yearMatch[yearMatch.length - 1] : "";
            const overviewText = p.overview || "";

            return `
            <div class="z-20 project-item group col-start-1 col-span-7 lg:col-start-6 lg:col-span-7 grid grid-cols-subgrid " 
                 data-index="${index}" 
                 data-cover="${p.image}">
                
                <div class="view-compact col-span-full grid grid-cols-subgrid cursor-pointer transition-colors">
                    <div class="col-span-full grid grid-cols-subgrid gap-4 px-0 lg:px-4 py-3">
                        <label class="col-span-3 cursor-pointer truncate pointer-events-none">${mainTitle}</label>
                        <label class="col-span-1 cursor-pointer pointer-events-none">${year}</label>
                        <label class="col-span-1 cursor-pointer truncate pointer-events-none">${p.genre.split(',')[0]}</label>
                        <label class="col-span-2 cursor-pointer truncate pointer-events-none">${p.software}</label>
                    </div>
                    <hr class="col-span-full border-white/30">
                </div>

                <div class="view-expanded col-span-full grid grid-cols-subgrid cursor-pointer">
                    <div class="col-span-full grid grid-cols-subgrid gap-x-4 gap-y-2 px-0 lg:px-4 py-3">
                        <div class="col-span-full lg:col-span-3 py-2 space-y-2">
                            <a href="${p.link}" class="text-3xl">${mainTitle}</a>
                            <p class="text-sm">${subTitle}</p>
                        </div>
                        <div class="col-span-full lg:col-span-4 py-2">
                            <a href="${p.link}" class="inline-block border border-white px-4 py-2 rounded-lg text-xs hover:bg-white hover:text-black transition-colors duration-200">Case Study ←</a>
                        </div>
                        <hr class="col-span-full my-2 border-white">
                        
                        <div class="col-span-3 text-sm leading-relaxed">
                            <label class="block">${p.date}</label>
                            <label class="block">${p.genre}</label>
                            <label class="block">${p.software}</label>
                        </div>
                        
                        <div class="col-span-3 leading-relaxed">
                             <div class="space-y-2">${overviewText}</div>
                        </div>
                    </div>
                    <hr class="col-span-full border-white">
                </div>
            </div>
            `;
        }).join('');
    }

    // 3. Activate Project Logic
    function activateProject(index) {
        const items = document.querySelectorAll('.project-item');
        
        if (!items[index]) return;
        
        // Optimize: If already active, do nothing
        if (items[index].classList.contains('active')) return;

        items.forEach(item => item.classList.remove('active'));

        const target = items[index];
        target.classList.add('active');
        
        // Swap Background
        const coverSrc = target.getAttribute('data-cover');
        if (!bgImage.src.includes(coverSrc)) {
            bgImage.style.opacity = 0;
            setTimeout(() => {
                bgImage.src = coverSrc;
                bgImage.style.opacity = 0.3; 
            }, 300);
        }
    }

    // 4. Interaction Setup
    function setupInteractions() {
        const items = document.querySelectorAll('.project-item');

        // A. TAP TO ACTIVATE (New Logic)
        items.forEach(item => {
            item.addEventListener('click', (e) => {
                // If user clicks a Link (<a>), let them navigate. 
                // Do not hijack the click for activation logic.
                if (e.target.closest('a')) return;

                // Otherwise, activate the project (Switch from Compact to Expanded)
                activateProject(item.getAttribute('data-index'));
            });
        });

        // B. DESKTOP HOVER
        items.forEach(item => {
            item.addEventListener('mouseenter', () => {
                if (window.innerWidth >= 1024) {
                    activateProject(item.getAttribute('data-index'));
                }
            });
        });

        // C. MOBILE SCROLL (Intersection Observer)
        const observerOptions = {
            root: null,
            rootMargin: '-20% 0px -50% 0px', 
            threshold: 0
        };

        const observer = new IntersectionObserver((entries) => {
            if (window.innerWidth < 1024) {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        activateProject(entry.target.getAttribute('data-index'));
                    }
                });
            }
        }, observerOptions);

        items.forEach(item => observer.observe(item));
    }
});