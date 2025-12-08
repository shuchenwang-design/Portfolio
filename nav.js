document.addEventListener("DOMContentLoaded", function() {
    loadNavigation();
});

function loadNavigation() {
    fetch('/nav.html') // 1. Go get the file
    .then(response => {
        if (!response.ok) throw new Error("Could not load nav");
        return response.text();
    })
    .then(data => {
        // 2. Paste the content into the placeholder
        document.getElementById('nav-placeholder').innerHTML = data;
        
        // 3. NOW that the nav is there, run the dot logic
        highlightActivePage();
    })
    .catch(error => console.error('Error:', error));
}

function highlightActivePage(basePath) {
    const dotIcon = '<span style="margin-right: 5px;">●</span>';
    
    // 1. Get the full path (e.g., "/archive/index.html")
    let currentPath = window.location.pathname;
    
    // Clean up: Remove the "index.html" part so we just compare folders
    // "/archive/index.html" becomes "/archive/"
    if (currentPath.endsWith('index.html')) {
        currentPath = currentPath.replace('index.html', '');
    }
    // Remove trailing slash for consistency (optional but safer)
    if (currentPath.endsWith('/') && currentPath.length > 1) {
        currentPath = currentPath.slice(0, -1); 
    }

    const navLinks = document.querySelectorAll('#main-nav a');

    navLinks.forEach(link => {
        // Get the link's target (e.g., "/archive/")
        let linkHref = link.getAttribute('href');
        
        // Clean up link href too
        if (linkHref.endsWith('/') && linkHref.length > 1) {
             linkHref = linkHref.slice(0, -1);
        }

        // --- THE MATCHING LOGIC ---

        // Case A: The Home Page (Strict Match)
        // We only want the dot here if we are truly at root, not inside /archive
        if ((linkHref === "/" || linkHref === "") && (currentPath === "" || currentPath === "/")) {
            link.innerHTML = dotIcon + link.innerHTML;
            link.classList.add('active-page');
        }

        // Case B: Inner Pages (Folder Match)
        // If we are at "/archive", match any link that points to "/archive"
        else if (linkHref !== "/" && linkHref !== "" && currentPath.includes(linkHref)) {
            link.innerHTML = dotIcon + link.innerHTML;
            link.classList.add('active-page');
        }
    });
}

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