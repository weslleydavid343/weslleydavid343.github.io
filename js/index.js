// JavaScript for Home Page

document.addEventListener('DOMContentLoaded', () => {
    // Handle bfcache restoration (pageshow event when returning via back button)
    window.addEventListener('pageshow', () => {
        document.body.classList.remove('page-exit');
    });

    // Keyboard Shortcuts for 1-4 keys to navigate quickly
    window.addEventListener('keydown', (e) => {
        if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;

        const valueUrls = {
            '1': 'index.html',
            '2': 'logs.html',
            '3': 'blog.html',
            '4': 'me.html'
        };

        if (valueUrls[e.key]) {
            e.preventDefault();
            if (window.location.pathname.endsWith(valueUrls[e.key])) return;
            document.body.classList.add('page-exit');
            setTimeout(() => {
                window.location.href = valueUrls[e.key];
            }, 250);
        }
    });
});



