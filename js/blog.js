const ARTICLES_JSON_URL = 'js/articles.json';
const ARTICLES_DIR = 'content/articles/';

// Utility to create a card for an article
function createArticleCard(article) {
    const card = document.createElement('article');
    card.className = 'technical-card';
    card.style.position = 'relative'; // Permite que o link esticado cubra toda a div

    // Create tags HTML
    const tags = Array.isArray(article.tags) ? article.tags : [];
    const tagsHtml = tags.map(tag => `<span class="badge badge-info">#${tag}</span>`).join(' ');

    let displayTime = '';
    let displayDate = article.date;

    // Extract time from ISO string
    if (article.date && article.date.includes('T')) {
        const timePart = article.date.split('T')[1];
        displayTime = timePart.substring(0, 5); // get HH:MM
        displayDate = article.date.split('T')[0];
    }

    const readingTimeHtml = displayTime ? ` • ${displayTime}` : '';

    card.innerHTML = `
        <header class="card-header" style="margin-bottom: 0;">
            <h3 class="card-title">${article.title}</h3>
            <div class="card-meta" style="margin-bottom: 8px; position: relative; z-index: 2;">
                ${tagsHtml}
            </div>
            <div style="font-family: var(--font-mono); font-size: 0.75rem; color: var(--text-secondary);">
                ${displayDate}${readingTimeHtml}
            </div>
        </header>
        <footer class="card-footer" style="border-top: none; padding-top: var(--spacing-sm);">
            <a href="article.html?id=${encodeURIComponent(article.id)}" class="tech-link">
                LER_ARTIGO -&gt;
                <span style="position: absolute; top: 0; right: 0; bottom: 0; left: 0; z-index: 1;"></span>
            </a>
        </footer>
    `;
    return card;
}

// Render list of articles (for blog.html or index.html)
async function renderArticleList() {
    const postsContainer = document.getElementById('posts');
    const recentProjectsContainer = document.getElementById('recent-articles-grid'); // for index.html

    if (!postsContainer && !recentProjectsContainer) return;

    try {
        // Cache buster for local development
        const response = await fetch(`${ARTICLES_JSON_URL}?t=${new Date().getTime()}`);
        if (!response.ok) throw new Error('Failed to load articles.json');

        const articles = await response.json();
        if (postsContainer) {
            postsContainer.innerHTML = '';
            // Apply list layout instead of grid for full articles page
            postsContainer.className = 'card-list';
            if (articles.length === 0) {
                postsContainer.innerHTML = '<div style="text-align: center; padding: 3rem 1rem; color: var(--text-secondary);"><p>Nenhum artigo publicado ainda.</p></div>';
            } else {
                articles.forEach(article => {
                    postsContainer.appendChild(createArticleCard(article));
                });
            }
        }

        if (recentProjectsContainer) {
            recentProjectsContainer.innerHTML = '';
            if (articles.length === 0) {
                recentProjectsContainer.innerHTML = '<div style="text-align: center; padding: 2rem 1rem; color: var(--text-secondary); grid-column: 1 / -1;"><p>Nenhum artigo recente.</p></div>';
            } else {
                // Show only the 2 most recent for index
                articles.slice(0, 2).forEach(article => {
                    recentProjectsContainer.appendChild(createArticleCard(article));
                });
            }
        }

    } catch (error) {
        console.error('Error loading articles:', error);
        if (postsContainer) postsContainer.innerHTML = '<p>Erro ao carregar artigos. Certifique-se de ter rodado python3 build_index.py</p>';
    }
}

// Render a single article (for article.html)
async function renderSingleArticle() {
    const articleContainer = document.getElementById('article-content');
    if (!articleContainer) return;

    const urlParams = new URLSearchParams(window.location.search);
    const articleId = urlParams.get('id');

    if (!articleId) {
        articleContainer.innerHTML = '<p>Artigo não especificado.</p>';
        return;
    }

    try {
        // Fetch article metadata
        const responseList = await fetch(`${ARTICLES_JSON_URL}?t=${new Date().getTime()}`);
        const articles = await responseList.json();
        let articleMeta = articles.find(a => a.id === parseInt(articleId));

        if (articleMeta) {
            document.title = `${articleMeta.title} // weslley343`;
            const titleEl = document.getElementById('article-title');
            if (titleEl) titleEl.textContent = articleMeta.title;

            const metaEl = document.getElementById('article-meta');
            if (metaEl) {
                let displayDate = articleMeta.date;
                let displayTime = '';
                if (articleMeta.date && articleMeta.date.includes('T')) {
                    displayDate = articleMeta.date.split('T')[0];
                    displayTime = articleMeta.date.split('T')[1].substring(0, 5);
                }
                const timeHtml = displayTime ? ` &nbsp;|&nbsp; ${displayTime}` : '';

                metaEl.innerHTML = `
                    ${displayDate} ${timeHtml}
                `;
            }
        } else {
            throw new Error('Artigo não encontrado no índice.');
        }

        // Fetch markdown content
        const markdownUrl = `${ARTICLES_DIR}${encodeURIComponent(articleMeta.filename)}`;
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
        // Since article.html is in the root directory, a path like ../media/img.jpg or ../../media/img.jpg
        // needs to point to content/media/img.jpg
        cleanMarkdown = cleanMarkdown.replace(/!\[(.*?)\]\((?:\.\.\/)+(.*?)\)/g, '![$1](content/$2)');

        // Render markdown
        // Requires marked.js loaded
        if (typeof marked !== 'undefined') {
            articleContainer.innerHTML = marked.parse(cleanMarkdown);
        } else {
            articleContainer.innerHTML = '<p>Erro: biblioteca marked.js não carregada.</p>';
        }

    } catch (error) {
        console.error('Error rendering article:', error);
        articleContainer.innerHTML = '<p>Erro ao carregar o conteúdo do artigo.</p>';
    }
}


// Initialization
document.addEventListener('DOMContentLoaded', () => {
    renderArticleList();
    renderSingleArticle();
});
