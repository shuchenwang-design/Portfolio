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
                                <p class="meta-item"><span class="meta-label">Time:</span> ${project.date}</p>
                                <p class="meta-item"><span class="meta-label">Genre:</span> ${project.genre}</p>
                                <p class="meta-item"><span class="meta-label">Tools:</span> ${project.software}</p>
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