/* ======================================================
   SECTION 1: MOBILE MENU INTERACTION
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
   SECTION 2: INITIALIZATION (Runs on Load)
   ====================================================== */

document.addEventListener("DOMContentLoaded", function() {
    loadNavigation();      // Loads the header/menu
    initScrollSpy();       // Wavy nav highlighting
    loadGlobalProjectData(); // NEW: Loads Links AND Page Content from JSON
});


/* ======================================================
   SECTION 3: NAVIGATION LOADER
   ====================================================== */

function loadNavigation() {
    fetch('/nav.html')
    .then(response => {
        if (!response.ok) throw new Error("Could not load nav.html");
        return response.text();
    })
    .then(data => {
        const placeholder = document.getElementById('nav-placeholder');
        if (placeholder) {
            placeholder.innerHTML = data;
            highlightActivePage();
        }
    })
    .catch(error => console.error('Error loading navigation:', error));
}


function highlightActivePage() {
    const dotIcon = '<span style="margin-right: 5px;">●</span>';
    
    // Get current path
    let currentPath = window.location.pathname;
    if (currentPath.endsWith('index.html')) currentPath = currentPath.replace('index.html', '');
    if (currentPath.endsWith('/') && currentPath.length > 1) currentPath = currentPath.slice(0, -1);
    if (currentPath === "") currentPath = "/";

    const navLinks = document.querySelectorAll('#desktop-nav a, #mobile-nav a');

    navLinks.forEach(link => {
        let linkHref = link.getAttribute('href');
        if (!linkHref) return;
        if (linkHref.endsWith('/') && linkHref.length > 1) linkHref = linkHref.slice(0, -1);

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


/* ======================================================
   SECTION 4: SCROLL SPY (Bottom Wavy Nav)
   ====================================================== */

function initScrollSpy() {
    const sections = document.querySelectorAll('div[id^="sec-"]');
    const navLinks = document.querySelectorAll('.toc-link');

    if (sections.length === 0) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                
                navLinks.forEach(link => link.classList.remove('active-toc-link'));

                const activeLink = document.querySelector(`.toc-link[href="#${id}"]`);
                if (activeLink) activeLink.classList.add('active-toc-link');
            }
        });
    }, {
        rootMargin: '-45% 0px -45% 0px' 
    });

    sections.forEach(section => observer.observe(section));
}


/* ======================================================
   SECTION 5: GLOBAL DATA MANAGER (LINKS & CONTENT)
   (Replaces the old Link Manager)
   ====================================================== */

function loadGlobalProjectData() {
    // 1. Fetch JSON once
    fetch('/archive/projects.json')
    .then(response => response.json())
    .then(projects => {
        
        // --- PART A: UPDATE LINKS (Lookup System) ---
        const urlMap = {};
        projects.forEach(p => { if (p.id) urlMap[p.id] = p.link; });

        const linksToUpdate = document.querySelectorAll('a[data-project]');
        linksToUpdate.forEach(link => {
            const projectId = link.getAttribute('data-project');
            if (urlMap[projectId]) {
                link.setAttribute('href', urlMap[projectId]);
            }
        });

        // --- PART B: UPDATE PAGE CONTENT (Branding/Motion Lists) ---
        // Finds any div with data-id="..." and fills its inner .js-title/.js-meta
        const contentSections = document.querySelectorAll('div[data-id]');
        
        contentSections.forEach(section => {
            const projectId = section.getAttribute('data-id');
            // Skip the main header if you are using header-loader.js separately
            // OR let this handle it if classes match.
            
            const project = projects.find(p => p.id === projectId);

            if (project) {
                // 1. Fill Title (.js-title)
                const titleEl = section.querySelector('.js-title');
                if (titleEl) {
                    // Split title logic: "Name: Subtitle" -> "Name<br>Subtitle"
                    if (project.title.includes(':')) {
                        titleEl.innerHTML = project.title.replace(':', '<br>');
                    } else {
                        titleEl.innerHTML = project.title;
                    }
                }

                // 2. Fill Meta (.js-meta)
                const metaEl = section.querySelector('.js-meta');
                if (metaEl) {
                    metaEl.innerHTML = `${project.date}<br>${project.genre}`;
                }
            }
        });

    })
    .catch(error => console.error('Error loading project data:', error));
}


/* ======================================================
   SECTION 6: UTILITIES (Favicon & Analytics)
   ====================================================== */

// Auto-Add Favicon
(function() {
    let link = document.querySelector("link[rel~='icon']");
    if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
    }
    link.type = 'image/png'; 
    link.href = '/assets/favicon.png'; 
})();

// Google Analytics
(function() {
    const gaId = 'G-X3R45LM72X'; // Your ID
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        console.log("Google Analytics skipped (Localhost)");
        return;
    }
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + gaId;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', gaId);
})();