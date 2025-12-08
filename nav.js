/* ======================================================
   SECTION 1: GLOBAL FUNCTIONS 
   ====================================================== */

function toggleMenu() {
    const menu = document.getElementById('mobile-menu-overlay');
    const btn = document.getElementById('menu-btn');

    if (!menu || !btn) return;

    const isOpen = menu.classList.contains('translate-y-0');

    if (isOpen) {
        menu.classList.remove('translate-y-0');
        menu.classList.add('-translate-y-full');
        menu.classList.add('pointer-events-none');
        btn.innerText = "MENU";
    } else {
        menu.classList.remove('-translate-y-full');
        menu.classList.add('translate-y-0');
        menu.classList.remove('pointer-events-none');
        btn.innerText = "CLOSE";
    }
}


/* ======================================================
   SECTION 2: PAGE LOAD LOGIC
   ====================================================== */

document.addEventListener("DOMContentLoaded", function() {
    loadNavigation();
});

function loadNavigation() {
    // With a custom domain, we always look at the root /
    fetch('/nav.html')
    .then(response => {
        if (!response.ok) throw new Error("Could not load nav.html");
        return response.text();
    })
    .then(data => {
        const placeholder = document.getElementById('nav-placeholder');
        if (placeholder) {
            placeholder.innerHTML = data;
            
            // Run Highlight Logic
            highlightActivePage();
        }
    })
    .catch(error => console.error('Error loading navigation:', error));
}


function highlightActivePage() {
    const dotIcon = '<span style="margin-right: 5px;">●</span>';
    
    // Get current path (e.g. "/archive/" or "/")
    let currentPath = window.location.pathname;
    
    // Clean the path
    if (currentPath.endsWith('index.html')) currentPath = currentPath.replace('index.html', '');
    if (currentPath.endsWith('/') && currentPath.length > 1) currentPath = currentPath.slice(0, -1);
    if (currentPath === "") currentPath = "/";

    const navLinks = document.querySelectorAll('#desktop-nav a, #mobile-nav a');

    navLinks.forEach(link => {
        let linkHref = link.getAttribute('href');
        if (!linkHref) return;

        // Clean link href
        if (linkHref.endsWith('/') && linkHref.length > 1) linkHref = linkHref.slice(0, -1);

        // Matching Logic
        if (linkHref === "/" && currentPath === "/") {
            link.innerHTML = dotIcon + link.innerHTML;
            link.classList.add('active-page');
        }
        else if (linkHref !== "/" && currentPath.includes(linkHref)) {
            link.innerHTML = dotIcon + link.innerHTML;
            link.classList.add('active-page');
        }
    });
}

//bottom wavy nav section sensor
document.addEventListener("DOMContentLoaded", function() {
    
    // 1. Select all the sections we want to track
    const sections = document.querySelectorAll('div[id^="sec-"]');
    const navLinks = document.querySelectorAll('.toc-link');

    // 2. Create the Observer
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                
                // Get the ID of the section currently on screen
                const id = entry.target.getAttribute('id');
                
                // Remove active class from ALL links
                navLinks.forEach(link => {
                    link.classList.remove('active-toc-link');
                });

                // Add active class ONLY to the matching link
                const activeLink = document.querySelector(`.toc-link[href="#${id}"]`);
                if (activeLink) {
                    activeLink.classList.add('active-toc-link');
                }
            }
        });
    }, {
        // Options:
        // rootMargin: '-50% 0px -50% 0px' creates a "line" in the middle of the screen.
        // The animation triggers when a section crosses this middle line.
        rootMargin: '-45% 0px -45% 0px' 
    });

    // 3. Tell the observer to watch every section
    sections.forEach(section => {
        observer.observe(section);
    });
});


//Links look up system
/* ======================================================
   AUTOMATIC LINK MANAGER
   Updates all <a data-project="..."> links using JSON data
   ====================================================== */

document.addEventListener("DOMContentLoaded", function() {
    updateProjectLinks();
});

function updateProjectLinks() {
    // 1. Fetch the Master List
    fetch('/archive/projects.json')
    .then(response => response.json())
    .then(projects => {
        
        // 2. Create a "Lookup Map" for speed
        // Turns the array into: { "inkai": "/url...", "ripple": "/url..." }
        const urlMap = {};
        projects.forEach(p => {
            if (p.id) {
                urlMap[p.id] = p.link;
            }
        });

        // 3. Find ALL links on the page waiting for a URL
        const linksToUpdate = document.querySelectorAll('a[data-project]');

        // 4. Update them
        linksToUpdate.forEach(link => {
            const projectId = link.getAttribute('data-project');
            
            // If we have a URL for this ID, update the href
            if (urlMap[projectId]) {
                link.setAttribute('href', urlMap[projectId]);
            } else {
                console.warn(`Project ID "${projectId}" not found in JSON.`);
            }
        });

    })
    .catch(error => console.error('Error updating links:', error));
}


/* ======================================================
   AUTO-ADD FAVICON
   ====================================================== */
(function() {
    // 1. Check if favicon already exists (to avoid duplicates)
    let link = document.querySelector("link[rel~='icon']");
    
    // 2. If not, create it
    if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
    }
    
    // 3. Set the settings
    link.type = 'image/png'; 
    link.href = '/assets/favicon.png'; 
})();
