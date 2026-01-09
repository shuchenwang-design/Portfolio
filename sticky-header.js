document.addEventListener("DOMContentLoaded", function() {
    
    // 1. Find the trigger element
    const container = document.getElementById('head-trigger');
    if (!container) return; 

    const projectId = container.getAttribute('data-id');

    // --- SCENARIO A: STATIC PAGE (No ID, just use existing text) ---
    if (!projectId) {
        initStickyHeader();
        return; 
    }

    // --- SCENARIO B: DYNAMIC PROJECT (Has ID, fetch JSON) ---
    fetch('/archive/projects.json')
        .then(response => response.json())
        .then(projects => {
            const project = projects.find(p => p.id === projectId);
            if (!project) return;

            // Populate Content
            const imgTag = document.getElementById('header-cover-img');
            const imgContainer = container.querySelector('[alt="headImage"]');
            
            if (imgTag) {
                imgTag.src = project.image;
                imgTag.alt = project.title;
            } else if (imgContainer) {
                imgContainer.innerHTML = `<img class="object-cover w-full h-full" src="${project.image}" alt="${project.title}">`;
            }

            const titleElement = document.getElementById('project-title');
            const subtitleElement = document.getElementById('project-subtitle');
            
            if (titleElement) {
                if (project.title.includes(':')) {
                    const parts = project.title.split(':');
                    titleElement.innerText = parts[0].trim();
                    if (subtitleElement && parts[1]) subtitleElement.innerText = parts[1].trim();
                } else {
                    titleElement.innerText = project.title;
                }
            }

            const genreElement = document.getElementById('project-genre');
            if (genreElement) genreElement.innerText = project.genre; 

            const dateElement = document.getElementById('project-date');
            if (dateElement) dateElement.innerHTML = project.date.replace('–', '–<br>'); 

            // Initialize Header AFTER data is loaded
            initStickyHeader();
        })
        .catch(error => console.error('Error loading project header:', error));
});


/* =========================================
   HELPER FUNCTION: STICKY HEADER LOGIC
   ========================================= */
function initStickyHeader() {
    const triggerSection = document.getElementById('head-trigger');
    const sourceTitle = document.getElementById('project-title');

    if (!triggerSection || !sourceTitle) return;

    // 1. Create the Sticky Bar
    const stickyBar = document.createElement('div');
    
    // Added 'bg-black' to match your theme
    stickyBar.className = "fixed top-0 left-0 w-full text-white p-4 z-20 transition-all duration-500 opacity-0 pointer-events-none bg-gradient-to-b from-black to-transparent";
    
    const innerText = document.createElement('div');
    // Align with your grid (col-start-3 is approx 16.66% on 12 col grid)
    innerText.className = "max-w-screen-2xl mx-auto px-4 lg:px-0 text-sm text-center lg:text-left lg:ml-[16.66%]"; 
    
    // Copy the text from the H1
    innerText.innerText = sourceTitle.innerText; 

    stickyBar.appendChild(innerText);
    document.body.appendChild(stickyBar);

    // 2. Observer Logic
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            // If the Title is OFF screen (scrolled past) -> Show Sticky Bar
            if (!entry.isIntersecting && window.scrollY > 50) {
                stickyBar.classList.remove('opacity-0', 'pointer-events-none');
            } else {
                stickyBar.classList.add('opacity-0', 'pointer-events-none');
            }
        });
    }, {
        rootMargin: '0px 0px 0px 0px', 
        threshold: 0
    });

    observer.observe(triggerSection);
}