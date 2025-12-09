document.addEventListener("DOMContentLoaded", function() {
    const grid = document.getElementById('archive-grid');

    // Fetch the data file
    fetch('projects.json')
        .then(response => response.json())
        .then(projects => {
            
            projects.forEach(project => {
                
                // Pure HTML structure with semantic classes only.
                // No styling is happening here anymore.
                const cardHTML = `
                    <a href="${project.link}" class="project-card">
                        
                        <div class="card-image-wrapper">
                            <img src="${project.image}" alt="${project.title}" class="card-image">
                        </div>

                        <div class="card-content">
                            <h2 class="card-title">${project.title}</h2>
                            
                            <div class="card-meta">
                                <p class="meta-item flex flex-row justify-between"><span class="meta-label">Time</span><span class="text-right">${project.date}</span></p>
                                <p class="meta-item flex flex-row justify-between"><span class="meta-label">Genre</span><span class="text-right">${project.genre}</span></p>
                                <p class="meta-item flex flex-row justify-between"><span class="meta-label">Tools</span><span class="text-right">${project.software}</span></p>
                            </div>
                        </div>
                    </a>
                `;

                // Inject into grid
                grid.innerHTML += cardHTML;
            });

        })
        .catch(error => console.error('Error loading projects:', error));
});