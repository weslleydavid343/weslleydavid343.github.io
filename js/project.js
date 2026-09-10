const PROJECTS_JSON_URL = 'js/projects.json';
const PROJECTS_DIR = 'content/projects/';

// Utility to create a card for a project
function createProjectCard(project) {
    const card = document.createElement('article');
    card.className = 'technical-card';
    card.style.position = 'relative'; // Permite que o link esticado cubra toda a div

    // Create tags HTML
    const tags = Array.isArray(project.tags) ? project.tags : [];
    const tagsHtml = tags.map(tag => `<span class="badge badge-info">#${tag}</span>`).join(' ');

    let displayTime = '';
    let displayDate = project.date;

    // Extract time from ISO string
    if (project.date && project.date.includes('T')) {
        const timePart = project.date.split('T')[1];
        displayTime = timePart.substring(0, 5); // get HH:MM
        displayDate = project.date.split('T')[0];
    }

    const readingTimeHtml = displayTime ? ` • ${displayTime}` : '';

    card.innerHTML = `
        <header class="card-header" style="margin-bottom: 0;">
            <h3 class="card-title">${project.title}</h3>
            <div class="card-meta" style="margin-bottom: 8px; position: relative; z-index: 2;">
                ${tagsHtml}
            </div>
            <div style="font-family: var(--font-mono); font-size: 0.75rem; color: var(--text-secondary);">
                ${displayDate}${readingTimeHtml}
            </div>
        </header>
        <footer class="card-footer" style="border-top: none; padding-top: var(--spacing-sm);">
            <a href="project.html?id=${encodeURIComponent(project.id)}" class="tech-link">
                LER_PROJETO -&gt;
                <span style="position: absolute; top: 0; right: 0; bottom: 0; left: 0; z-index: 1;"></span>
            </a>
        </footer>
    `;
    return card;
}

// Render list of projects (for me.html)
async function renderProjectsList() {
    const projectsContainer = document.getElementById('projects-container');
    if (!projectsContainer) return;

    try {
        const response = await fetch(`${PROJECTS_JSON_URL}?t=${new Date().getTime()}`);
        if (!response.ok) throw new Error('Failed to load projects.json');

        const projects = await response.json();

        projectsContainer.innerHTML = '';
        if (projects.length === 0) {
            projectsContainer.innerHTML = '<div style="text-align: center; padding: 3rem 1rem; color: var(--text-secondary);"><p>Coisas boas estão por vir, esteja atento ; )</p></div>';
        } else {
            projects.forEach(project => {
                projectsContainer.appendChild(createProjectCard(project));
            });
        }
    } catch (error) {
        console.error('Error loading projects:', error);
        projectsContainer.innerHTML = '<p>Erro ao carregar projetos. Certifique-se de ter rodado python3 build_index.py</p>';
    }
}

// Render a single project (for project.html)
async function renderSingleProject() {
    const projectContainer = document.getElementById('article-content');
    if (!projectContainer) return;

    const urlParams = new URLSearchParams(window.location.search);
    const projectId = urlParams.get('id');

    if (!projectId) {
        projectContainer.innerHTML = '<p>Projeto não especificado.</p>';
        return;
    }

    try {
        // Fetch project metadata
        const responseProjects = await fetch(`${PROJECTS_JSON_URL}?t=${new Date().getTime()}`);
        const projects = await responseProjects.json();
        const projectMeta = projects.find(a => a.id === parseInt(projectId));

        if (projectMeta) {
            document.title = `${projectMeta.title} // weslley343`;
            const titleEl = document.getElementById('article-title');
            if (titleEl) titleEl.textContent = projectMeta.title;

            const metaEl = document.getElementById('article-meta');
            if (metaEl) {
                let displayDate = projectMeta.date;
                let displayTime = '';
                if (projectMeta.date && projectMeta.date.includes('T')) {
                    displayDate = projectMeta.date.split('T')[0];
                    displayTime = projectMeta.date.split('T')[1].substring(0, 5);
                }
                const timeHtml = displayTime ? ` &nbsp;|&nbsp; ${displayTime}` : '';

                metaEl.innerHTML = `
                    ${displayDate} ${timeHtml}
                `;
            }
        } else {
            throw new Error('Projeto não encontrado no índice.');
        }

        // Fetch markdown content
        const markdownUrl = `${PROJECTS_DIR}${encodeURIComponent(projectMeta.filename)}`;
        const response = await fetch(`${markdownUrl}?t=${new Date().getTime()}`);
        if (!response.ok) throw new Error('Failed to load markdown file');

        const markdownContent = await response.text();

        // Strip out top frontmatter blocks to not render them as text
        let cleanMarkdown = markdownContent;
        // Remove Obsidian id/data/tags properties at top
        cleanMarkdown = cleanMarkdown.replace(/^id:.*?\n/g, '');
        cleanMarkdown = cleanMarkdown.replace(/^data:.*?\n/g, '');
        cleanMarkdown = cleanMarkdown.replace(/^tags:.*?\n/g, '');
        // Remove standard yaml frontmatter
        cleanMarkdown = cleanMarkdown.replace(/^---\s*\n.*?\n---\s*\n/ms, '');
        // Remove yaml frontmatter wrapped in codeblock
        cleanMarkdown = cleanMarkdown.replace(/^```[a-z]*\n---\s*\n.*?\n---\s*\n```\s*\n/ms, '');

        // Fix relative image paths from Obsidian
        cleanMarkdown = cleanMarkdown.replace(/!\[(.*?)\]\((?:\.\.\/)+(.*?)\)/g, '![$1](content/$2)');

        // Render markdown
        // Requires marked.js loaded
        if (typeof marked !== 'undefined') {
            projectContainer.innerHTML = marked.parse(cleanMarkdown);
        } else {
            projectContainer.innerHTML = '<p>Erro: biblioteca marked.js não carregada.</p>';
        }

    } catch (error) {
        console.error('Error rendering project:', error);
        projectContainer.innerHTML = '<p>Erro ao carregar o conteúdo do projeto.</p>';
    }
}

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    renderProjectsList();
    renderSingleProject();
});
