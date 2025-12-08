document.addEventListener("DOMContentLoaded", function() {
    
    // 1. Get the source elements
    const triggerSection = document.getElementById('head-trigger');
    const sourceTitle = document.getElementById('project-title');

    // Safety check: if this page doesn't have a project header, stop.
    if (!triggerSection || !sourceTitle) return;

    // 2. Create the Sticky Bar Programmatically
    const stickyBar = document.createElement('div');
    
    // Add Tailwind classes to styling the bar
    // fixed, top-0, z-40 (below nav z-50), transition opacity
    stickyBar.className = "fixed top-0 left-0 w-full text-white p-4 z-40 transition-opacity duration-500 opacity-0 pointer-events-none";
    
    // Create the inner text container
    // We force 'text-xs' here as requested
    const innerText = document.createElement('div');
    innerText.className = "max-w-7xl mx-auto px-4 lg:px-0 text-xs text-center lg:text-left lg:ml-[16.66%]"; 
    // Note: lg:ml-[16.66%] aligns it with your col-start-3 layout (approx)
    
    // Copy the HTML (to keep the <br>) from the original title
    innerText.innerHTML = sourceTitle.innerHTML;

    // Put it together
    stickyBar.appendChild(innerText);
    document.body.appendChild(stickyBar);

    // 3. Set up the Observer (The Scroll Watcher)
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            // entry.isIntersecting means the "Head" section is visible on screen.
            // If it is NOT intersecting (!entry.isIntersecting) and we are scrolled down...
            // ...we show the bar.
            
            // We verify window.scrollY > 100 to ensure we don't trigger it 
            // if the head is just slightly off screen at the very top.
            if (!entry.isIntersecting && window.scrollY > 100) {
                stickyBar.classList.remove('opacity-0');
                stickyBar.classList.remove('pointer-events-none');
            } else {
                stickyBar.classList.add('opacity-0');
                stickyBar.classList.add('pointer-events-none');
            }
        });
    }, {
        // Trigger when the bottom of the "head" section leaves the viewport
        rootMargin: '0px 0px 0px 0px', 
        threshold: 0
    });

    // Start watching the head section
    observer.observe(triggerSection);
});

