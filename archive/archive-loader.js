document.addEventListener("DOMContentLoaded", function() {
    const grid = document.getElementById('archive-grid');

    // Fetch the data file
    fetch('/archive/projects.json')
        .then(response => response.json())
        .then(projects => {
            
            projects.forEach(project => {
                
                // 1. SPLIT TITLE LOGIC
                // We do the split logic BEFORE building the HTML string
                let titleHtml = '';
                if (project.title.includes(':')) {
                    const parts = project.title.split(':');
                    // Main Title: text-2xl (Large)
                    // Subtitle: text-base (Small)
                    titleHtml = `
                        <span class="block text-3xl leading-none">${parts[0].trim()}</span>
                        <span class="block text-base font-normal mt-1">${parts[1].trim()}</span>
                    `;
                } else {
                    // No colon? Just one big title
                    titleHtml = `<span class="block text-2xl leading-none">${project.title}</span>`;
                }

                // 2. BUILD THE CARD
                const cardHTML = `
                    <a href="${project.link}" class="project-card group block">
                        
                        <div class="card-image-wrapper mb-4 overflow-hidden">
                            <img src="${project.image}" alt="${project.title}" class="card-image w-full h-full object-cover transition-transform duration-700 group-hover:scale-105">
                        </div>

                        <div class="card-content">
                            <h2 class="card-title mb-2">${titleHtml}</h2>
                            
                            <div class="card-meta text-xs text-gray-400 mt-4 border-t border-gray-800 pt-2 space-y-2">
                                <div class=" flex felx-row gap-x-4 gap-y-1 justify-between">
                                    <span class="meta-label text-gray-500 w-[50px]">Time</span>
                                    <p class="meta-item max-w-[160px] text-right"> ${project.date}</p>
                                </div>
                                <div class=" flex felx-row gap-x-4 gap-y-1 justify-between">
                                    <span class="meta-label text-gray-500 w-[50px]">Genre</span>
                                    <p class="meta-item max-w-[160px] text-right"> ${project.genre}</p>
                                </div>
                                <div class=" flex felx-row gap-x-4 gap-y-1 justify-between">
                                    <span class="meta-label text-gray-500 w-[50px]">Tools</span>
                                    <p class="meta-item max-w-[160px] text-right"> ${project.software}</p>
                                </div>
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