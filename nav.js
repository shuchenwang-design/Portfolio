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

function highlightActivePage() {
    const dotIcon = '<span style="margin-right: 5px;">●</span>'; // Your dot symbol
    
    // Get current path (e.g., "branding.html")
    let path = window.location.pathname.split("/").pop();
    if (path === "") path = "index.html";

    // Find links inside the newly loaded nav
    const navLinks = document.querySelectorAll('#main-nav a');

    navLinks.forEach(link => {
        const linkHref = link.getAttribute('href');
        // Check match
        if (linkHref && path.includes(linkHref)) {
            link.innerHTML = dotIcon + link.innerHTML;
            link.classList.add('active-page');
        }
    });
}