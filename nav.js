/* ======================================================
   PART 0: DYNAMIC THEME EXTRACTION
   ====================================================== */
// We read the computed color of the body (which you set via Tailwind classes like text-[#111010])
// and apply it to the navigation elements.

const bodyStyles = window.getComputedStyle(document.body);
const themeText = bodyStyles.color; 
const themeBG = bodyStyles.backgroundColor; 

const encodedColor = encodeURIComponent(themeText);
const waveSvg = `data:image/svg+xml;charset=utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='3' viewBox='0 0 12 3'%3E%3Cpath d='M0,3 C3,3 3,0 6,0 C9,0 9,3 12,3' fill='none' stroke='${encodedColor}' stroke-width='1.5'/%3E%3C/svg%3E`;

// Create a dynamic stylesheet
const navStyleSheet = document.createElement("style");
navStyleSheet.innerText = `
    /* Force links to use the theme text color */
    body .dynamic-theme-nav {
        color: ${themeText};
        text-decoration: none;
        transition: all 0.3s ease-out;
    }

    body .toc-link dynamic-theme-wavy {
        color: ${themeText};
        opacity:0.7;
    }
    body .toc-link dynamic-theme-wavy:hover {
        color: ${themeText};
        opacity:1;

    }

    body .active-toc-link {
        opacity: 1 !important; 
        background: url("${waveSvg}") repeat-x bottom left;
        background-size: 12px 3px;
        padding-bottom: 2px; 
        animation: moveWave 1s linear infinite;
    }

    body .button-contact{
        color: ${themeText} !important;
        padding: 3px 6px;
        background-color:transparent;
        border: 1px solid ${themeText} !important;
        border-radius: 5px;
        transition: all 0.3s ease-out;
    }
    body .button-contact:hover{
        color: ${themeBG} !important;
        background-color: ${themeText} !important;
    }
    
    /* HR lines in the menu */
    .dynamic-theme-hr {
        border-color: ${themeText};
        opacity: 1;
    }
    
`;
document.head.appendChild(navStyleSheet);


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
            
            // --- NEW LOGIC ---
            const menuLinks = placeholder.querySelectorAll('a');
            const menuHrs = placeholder.querySelectorAll('hr');

            menuLinks.forEach(link => {
                // THE FIX: Skip elements that are contact buttons
                if (link.classList.contains('button-contact')) return;

                link.classList.add('dynamic-theme-nav', 'transition-all', 'duration-300', 'hover:tracking-widest');
                link.classList.remove('hover:text-gray-300'); 
            });

            menuHrs.forEach(hr => {
                hr.classList.add('dynamic-theme-hr');
                hr.classList.remove('border-white/20'); 
            });

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
   SECTION 4: SCROLL SPY
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
                    link.classList.remove('active-toc-link');
                });

                const activeLink = document.querySelector(`.toc-link[href="#${id}"]`);
                if (activeLink) {
                    activeLink.classList.add('active-toc-link');
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
    generatePageTOC();

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

        // B. Populate Page Content
        const contentSections = document.querySelectorAll('div[data-id]');
        const wavyNavList = document.getElementById('toc-list');
        
        if (wavyNavList) wavyNavList.innerHTML = '';

        contentSections.forEach(section => {
            const projectId = section.getAttribute('data-id');
            const project = projects.find(p => p.id === projectId);

            if (project) {
                const titleEl = section.querySelector('.js-title');
                const metaEl = section.querySelector('.js-meta');
                let cleanTitle = project.title.includes(':') ? project.title.split(':')[0].trim() : project.title;

                if (titleEl) titleEl.innerHTML = project.title.replace(':', '<br>');
                if (metaEl) metaEl.innerHTML = `${project.date}<br>${project.software}`;

                if (wavyNavList) {
                    const li = document.createElement('li');
                    const a = document.createElement('a');
                    
                    a.href = `#${section.id}`; 
                    a.className = "toc-link toc-link dynamic-theme-wavy capitalize transition-colors duration-300 block w-fit max-w-[10rem] truncate";
                    
                    a.innerText = cleanTitle.toLowerCase(); 
                    a.title = cleanTitle; 

                    li.appendChild(a);
                    wavyNavList.appendChild(li);
                }
            }
        });

        initScrollSpy();
    })
    .catch(error => console.error('Error loading project data:', error));
}

function generatePageTOC() {
    const tocList = document.getElementById('toc-project-list') || document.getElementById('toc-list');
    
    if (!tocList || tocList.innerHTML.trim() !== "") return; 

    const sections = document.querySelectorAll('div[id^="sec-"]');

    sections.forEach(section => {
        const titleSpan = section.querySelector('.js-section-title');
        
        if (titleSpan) {
            const titleText = titleSpan.innerText;
            const li = document.createElement('li');
            const a = document.createElement('a');
            
            a.href = `#${section.id}`;
            a.className = "toc-link dynamic-theme-wavy capitalize transition-colors duration-300 block w-fit max-w-[10rem] truncate";
            
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