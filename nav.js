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
   SECTION 2: INITIALIZATION
   ====================================================== */

document.addEventListener("DOMContentLoaded", function() {
    loadNavigation();         // Top Header
    loadGlobalProjectData();  // Content & Nav Generation
});


/* ======================================================
   SECTION 3: TOP NAVIGATION LOADER
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
    let currentPath = window.location.pathname;
    
    if (currentPath.endsWith('index.html')) currentPath = currentPath.replace('index.html', '');
    if (currentPath.endsWith('/') && currentPath.length > 1) currentPath = currentPath.slice(0, -1);
    if (currentPath === "") currentPath = "/";

    const navLinks = document.querySelectorAll('#desktop-nav a, #mobile-nav a');

    navLinks.forEach(link => {
        let linkHref = link.getAttribute('href');
        if (!linkHref) return;
        if (linkHref.endsWith('/') && linkHref.length > 1) linkHref = linkHref.slice(0, -1);

        if ((linkHref === "/" && currentPath === "/") || (linkHref !== "/" && currentPath.includes(linkHref))) {
            link.innerHTML = dotIcon + link.innerHTML;
            link.classList.add('active-page');
        }
    });
}


/* ======================================================
   SECTION 4: SCROLL SPY (For both Wavy Nav & TOC List)
   ====================================================== */

function initScrollSpy() {
    const sections = document.querySelectorAll('div[id^="sec-"]');
    const navLinks = document.querySelectorAll('.toc-link');

    if (sections.length === 0) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                
                navLinks.forEach(link => {
                    // Remove active styles
                    link.classList.remove('text-white', 'active-toc-link');
                });

                // Highlight matches
                const activeLink = document.querySelector(`.toc-link[href="#${id}"]`);
                if (activeLink) {
                    activeLink.classList.add('text-white', 'active-toc-link');
                }
            }
        });
    }, {
        rootMargin: '-20% 0px -60% 0px' 
    });

    sections.forEach(section => observer.observe(section));
}


/* ======================================================
   SECTION 5: GLOBAL DATA MANAGER
   ====================================================== */

function loadGlobalProjectData() {
    // 1. Try to generate TOC from Page Content first (For Project Pages)
    generatePageTOC();

    // 2. Fetch JSON for everything else (Archive, Header Data, Wavy Nav)
    fetch('/archive/projects.json')
    .then(response => response.json())
    .then(projects => {
        
        // A. Update Links
        const urlMap = {};
        projects.forEach(p => { if (p.id) urlMap[p.id] = p.link; });
        document.querySelectorAll('a[data-project]').forEach(link => {
            const pid = link.getAttribute('data-project');
            if (urlMap[pid]) link.setAttribute('href', urlMap[pid]);
        });

        // B. Populate Page Content (Title/Meta/Wavy Nav)
        const contentSections = document.querySelectorAll('div[data-id]');
        const wavyNavList = document.getElementById('toc-list');
        
        if (wavyNavList) wavyNavList.innerHTML = '';

        contentSections.forEach(section => {
            const projectId = section.getAttribute('data-id');
            const project = projects.find(p => p.id === projectId);

            if (project) {
                // Populate Headers
                const titleEl = section.querySelector('.js-title');
                const metaEl = section.querySelector('.js-meta');
                
                let cleanTitle = project.title.includes(':') ? project.title.split(':')[0].trim() : project.title;

                if (titleEl) titleEl.innerHTML = project.title.replace(':', '<br>');
                if (metaEl) metaEl.innerHTML = `${project.date}<br>${project.software}`;

                // Generate Wavy Nav (Archive Page)
                // 2. Generate Wavy Nav Link
                if (wavyNavList) {
                    const li = document.createElement('li');
                    const a = document.createElement('a');
                    
                    a.href = `#${section.id}`; 
                    a.className = "toc-link capitalize hover:text-rust-100 transition-colors duration-300 block w-fit max-w-[10rem] truncate";
                    
                    // --- THE FIX: Convert to lowercase ---
                    a.innerText = cleanTitle.toLowerCase(); 
                    
                    a.title = cleanTitle; 

                    li.appendChild(a);
                    wavyNavList.appendChild(li);
                }
            }
        });

        // Initialize ScrollSpy after generating links
        initScrollSpy();
    })
    .catch(error => console.error('Error loading project data:', error));
}


/* ======================================================
   NEW HELPER: GENERATE TOC FROM PAGE CONTENT
   (For Project Detail Pages using #toc-list)
   ====================================================== */

function generatePageTOC() {
    const tocList = document.getElementById('toc-project-list');
    if (!tocList) return; 

    const sections = document.querySelectorAll('div[id^="sec-"]');

    sections.forEach(section => {
        const titleSpan = section.querySelector('.js-section-title');
        
        if (titleSpan) {
            const titleText = titleSpan.innerText;
            
            const li = document.createElement('li');
            const a = document.createElement('a');
            
            a.href = `#${section.id}`;
            
            // Keep your 'capitalize' class here
            a.className = "toc-link capitalize hover:text-white transition-colors duration-300 block w-fit max-w-[10rem] truncate";
            
            // --- THE FIX: Convert to lowercase first ---
            // "OVERVIEW" becomes "overview", then CSS makes it "Overview"
            a.innerText = titleText.toLowerCase(); 
            
            a.title = titleText; 

            li.appendChild(a);
            tocList.appendChild(li);
        }
    });

    initScrollSpy();
}


/* ======================================================
   SECTION 6: UTILITIES
   ====================================================== */

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

(function() {
    const gaId = 'G-X3R45LM72X'; 
    if (window.location.hostname === 'localhost') return;
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + gaId;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', gaId);
})();