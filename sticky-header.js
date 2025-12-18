document.addEventListener("DOMContentLoaded", function() {
    
    // 1. Find the trigger element and get the project ID
    const container = document.getElementById('head-trigger');
    if (!container) return; // Stop if not on a project page

    const projectId = container.getAttribute('data-id');
    if (!projectId) return; // Stop if no ID is set

    // 2. Fetch the JSON data
    fetch('/archive/projects.json')
        .then(response => response.json())
        .then(projects => {
            
            // 3. Find the matching project
            const project = projects.find(p => p.id === projectId);
            if (!project) {
                console.error(`Project ID "${projectId}" not found in JSON.`);
                return;
            }

            // --- 4. POPULATE THE MAIN HEADER ---

            // A. The Cover Image
            const imgContainer = container.querySelector('[alt="headImage"]');
            if (imgContainer) {
                // Check if we found the new ID or the old alt wrapper
                const imgTag = document.getElementById('header-cover-img');
                if (imgTag) {
                    imgTag.src = project.image;
                    imgTag.alt = project.title;
                } else {
                    // Fallback if using the older HTML structure
                    imgContainer.innerHTML = `<img class="object-cover w-full h-full" src="${project.image}" alt="${project.title}">`;
                }
            }

            // B. The Title & Subtitle logic
            const titleElement = document.getElementById('project-title');
            const subtitleElement = document.getElementById('project-subtitle');
            
            if (titleElement) {
                if (project.title.includes(':')) {
                    const parts = project.title.split(':');
                    titleElement.innerText = parts[0].trim(); // Main Title
                    
                    if (subtitleElement && parts[1]) {
                        subtitleElement.innerText = parts[1].trim(); // Subtitle
                    }
                } else {
                    titleElement.innerText = project.title;
                }
            }

            // C. Genre & Date
            const genreElement = document.getElementById('project-genre');
            if (genreElement) genreElement.innerText = project.genre; 

            const dateElement = document.getElementById('project-date');
            if (dateElement) {
                dateElement.innerHTML = project.date.replace('–', '–<br>'); 
            }

            // --- 5. INITIALIZE STICKY HEADER ---
            // We run this HERE, inside the .then(), so it sees the populated text!
            initStickyHeader();

        })
        .catch(error => console.error('Error loading project header:', error));
});


/* =========================================
   HELPER FUNCTION: STICKY HEADER LOGIC
   ========================================= */
function initStickyHeader() {
    // 1. Get the source elements
    const triggerSection = document.getElementById('head-trigger');
    const sourceTitle = document.getElementById('project-title');

    // Safety check
    if (!triggerSection || !sourceTitle) return;

    // 2. Create the Sticky Bar
    const stickyBar = document.createElement('div');
    
    // Tailwind styling: Fixed, top-0, z-40, hidden by default (opacity-0)
    stickyBar.className = "fixed top-0 left-0 w-full text-white p-4 z-10 transition-all duration-500 opacity-0 pointer-events-none";
    
    // Create inner container for alignment
    const innerText = document.createElement('div');
    // lg:ml-[16.66%] aligns with col-start-3
    innerText.className = "max-w-7xl mx-auto px-4 lg:px-0 text-xs text-center lg:text-left lg:ml-[16.66%] uppercase"; 
    
    // COPY THE TEXT: Now this works because the JSON data has loaded!
    innerText.innerHTML = sourceTitle.innerText; 

    // Append to body
    stickyBar.appendChild(innerText);
    document.body.appendChild(stickyBar);

    // 3. Set up the Observer
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            // Show bar only if Head Trigger is OFF screen AND we scrolled down
            if (!entry.isIntersecting && window.scrollY > 100) {
                stickyBar.classList.remove('opacity-0');
            } else {
                stickyBar.classList.add('opacity-0');
            }
        });
    }, {
        rootMargin: '0px 0px 0px 0px', 
        threshold: 0
    });

    observer.observe(triggerSection);
}