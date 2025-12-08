/* ======================================================
   SECTION 1: GLOBAL FUNCTIONS 
   (Must be outside DOMContentLoaded so HTML onclick works)
   ====================================================== */

function toggleMenu() {
    // 1. Target the Mobile Overlay and Button
    const menu = document.getElementById('mobile-menu-overlay');
    const btn = document.getElementById('menu-btn');

    if (!menu || !btn) return;

    // 2. Check if open based on class
    const isOpen = menu.classList.contains('translate-y-0');

    if (isOpen) {
        // --- CLOSE ACTION ---
        menu.classList.remove('translate-y-0');
        menu.classList.add('-translate-y-full');
        
        // Disable clicks so you can click things underneath
        menu.classList.add('pointer-events-none');
        
        // Reset text
        btn.innerText = "MENU";
    } else {
        // --- OPEN ACTION ---
        menu.classList.remove('-translate-y-full');
        menu.classList.add('translate-y-0');
        
        // Enable clicks
        menu.classList.remove('pointer-events-none');
        
        // Change text
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
    // 1. Detect if we are on GitHub Pages or Custom Domain
    const isGitHub = window.location.hostname.includes('github.io');
    
    // IMPORTANT: If you rename your repo, update this string!
    const repoName = ''; 
    
    // Set base path: use repo name if on GitHub, otherwise empty (root)
    const basePath = isGitHub ? repoName : '';

    // 2. Fetch nav.html using the correct path
    fetch(basePath + '/nav.html')
    .then(response => {
        if (!response.ok) throw new Error("Could not load nav.html");
        return response.text();
    })
    .then(data => {
        // Inject HTML
        const placeholder = document.getElementById('nav-placeholder');
        if (placeholder) {
            placeholder.innerHTML = data;
            
            // 3. Run Highlight Logic (pass the basePath so we can ignore it during matching)
            highlightActivePage(basePath);
        }
    })
    .catch(error => console.error('Error loading navigation:', error));
}


function highlightActivePage(basePath) {
    const dotIcon = '<span style="margin-right: 5px;">●</span>';
    
    // 1. Get current browser URL path
    let currentPath = window.location.pathname;
    
    // 2. Clean the path: Remove the GitHub Repo prefix if it exists
    if (basePath && currentPath.startsWith(basePath)) {
        currentPath = currentPath.replace(basePath, '');
    }
    
    // 3. Clean the path: Remove "index.html" and trailing slashes for cleaner matching
    if (currentPath.endsWith('index.html')) {
        currentPath = currentPath.replace('index.html', '');
    }
    if (currentPath.endsWith('/') && currentPath.length > 1) {
        currentPath = currentPath.slice(0, -1);
    }
    // Default to "/" if empty
    if (currentPath === "") currentPath = "/";


    // 4. Select links from BOTH Desktop and Mobile menus
    const navLinks = document.querySelectorAll('#desktop-nav a, #mobile-nav a');

    navLinks.forEach(link => {
        // Get the link target
        let linkHref = link.getAttribute('href');
        if (!linkHref) return;

        // Clean link href as well
        if (linkHref.endsWith('/') && linkHref.length > 1) {
             linkHref = linkHref.slice(0, -1);
        }

        // --- MATCHING LOGIC ---

        // CASE A: Home Page (Strict Match)
        // Only match if both path and link are exactly "/"
        if (linkHref === "/" && currentPath === "/") {
            link.innerHTML = dotIcon + link.innerHTML;
            link.classList.add('active-page');
        }

        // CASE B: Inner Pages (Partial/Folder Match)
        // If link is NOT home, checks if current path includes the link folder
        // e.g. Path "/archive/project1" includes Link "/archive"
        else if (linkHref !== "/" && currentPath.includes(linkHref)) {
            link.innerHTML = dotIcon + link.innerHTML;
            link.classList.add('active-page');
        }
    });
}