document.addEventListener("DOMContentLoaded", () => {
    const listContainer = document.getElementById('archive-list');
    const bgImage = document.getElementById('bg-image');
    
    // 1. Fetch Data
    fetch('projects.json')
        .then(response => response.json())
        .then(data => {
            renderProjects(data);
            setupInteractions();
            // Default active: First project
            if(data.length > 0) activateProject(0);
        })
        .catch(err => console.error("Error loading JSON:", err));

    // 2. Render HTML
    function renderProjects(projects) {
        listContainer.innerHTML = projects.map((p, index) => {
            
            // Logic: Split Title/Subtitle and find Year
            let mainTitle = p.title;
            let subTitle = "";
            if (p.title.includes(":")) {
                const parts = p.title.split(":");
                mainTitle = parts[0].trim();
                subTitle = parts[1].trim();
            }
            const yearMatch = p.date.match(/\d{4}/g);
            const year = yearMatch ? yearMatch[yearMatch.length - 1] : "";

            // Safely handle missing overview (defaults to empty string)
            const overviewText = p.overview || "";

            return `
            <div class="project-item contents group" data-index="${index}" data-cover="${p.image}">
                
                <div class="view-compact z-10 col-start-1 col-span-7 lg:col-start-6 lg:col-span-7 grid grid-cols-subgrid cursor-pointer">
                    <div class="col-span-full grid grid-cols-subgrid gap-4 px-4 py-3">
                        <label class="col-span-3 cursor-pointer truncate">${mainTitle}</label>
                        <label class="col-span-1 cursor-pointer">${year}</label>
                        <label class="col-span-1 cursor-pointer truncate">${p.genre.split(',')[0]}</label>
                        <label class="col-span-2 cursor-pointer truncate">${p.software}</label>
                    </div>
                    <hr class="col-span-full border-white/30">
                </div>

                <div class="view-expanded z-10 col-start-1 col-span-7 lg:col-start-6 lg:col-span-7 grid grid-cols-subgrid cursor-pointer">
                    <div class="col-span-full grid grid-cols-subgrid gap-x-4 gap-y-2 px-4 py-3">
                        <div class="col-span-full lg:col-span-3 py-2 space-y-2">
                            <a href="${p.link}" class="text-3xl">${mainTitle}</a>
                            <p class="text-sm">${subTitle}</p>
                        </div>
                        <div class="col-span-full lg:col-span-4 py-2">
                            <a href="${p.link}" class="inline-block border border-white px-4 py-2 rounded-[8px] text-xs hover:bg-white hover:text-black transition-colors">Case Study ←</a>
                        </div>
                        <hr class="col-span-full my-2 border-white">
                        
                        <div class="col-span-3 text-sm leading-relaxed">
                            <label class="block">${p.date}</label>
                            <label class="block">${p.genre}</label>
                            <label class="block">${p.software}</label>
                        </div>
                        
                        <div class="col-span-3 leading-relaxed">
                             <p class="mb-4 block">${overviewText}</p>
                        </div>
                    </div>
                    <hr class="col-span-full border-white/50">
                </div>
            </div>
            `;
        }).join('');
    }

    // 3. Activate Project Logic
    function activateProject(index) {
        const items = document.querySelectorAll('.project-item');
        
        items.forEach(item => item.classList.remove('active'));

        if (items[index]) {
            const target = items[index];
            target.classList.add('active');
            
            // Background Image Swap
            const coverSrc = target.getAttribute('data-cover');
            if (!bgImage.src.includes(coverSrc)) {
                bgImage.style.opacity = 0;
                setTimeout(() => {
                    bgImage.src = coverSrc;
                    bgImage.style.opacity = 0.3; 
                }, 200);
            }
        }
    }

    // 4. Interaction Setup
    function setupInteractions() {
        const items = document.querySelectorAll('.project-item');

        // Desktop: Hover
        items.forEach(item => {
            item.addEventListener('mouseenter', () => {
                if (window.innerWidth >= 1024) {
                    activateProject(item.getAttribute('data-index'));
                }
            });
        });

        // Mobile: Scroll
        const observer = new IntersectionObserver((entries) => {
            if (window.innerWidth < 1024) {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        activateProject(entry.target.getAttribute('data-index'));
                    }
                });
            }
        }, { rootMargin: '-40% 0px -40% 0px', threshold: 0 });

        items.forEach(item => observer.observe(item));
    }
});