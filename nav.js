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