// Floating Bottom-Right Back Button Widget
(function () {
    function isHomePage() {
        const path = window.location.pathname;
        return path.endsWith('index.html') || path.endsWith('index_alt.html') || path === '/' || path.endsWith('/');
    }

    function initNavWidget() {
        // Never render the back widget on Home page
        if (isHomePage()) return;

        if (document.getElementById('corner-back-widget')) return;

        const widget = document.createElement('div');
        widget.id = 'corner-back-widget';
        widget.className = 'corner-back-widget';

        widget.innerHTML = `
            <button id="corner-back-btn" class="corner-back-btn" type="button" aria-label="Voltar para a página anterior">
                <span class="back-btn-arrow">←</span> VOLTAR
            </button>
        `;

        document.body.appendChild(widget);

        const btn = document.getElementById('corner-back-btn');
        if (!btn) return;

        let isTriggered = false;

        function triggerReturnBack() {
            if (isTriggered) return;
            isTriggered = true;
            document.body.classList.add('page-exit');
            setTimeout(() => {
                if (window.history.length > 1 && document.referrer && document.referrer.indexOf(window.location.host) !== -1) {
                    window.history.back();
                } else {
                    window.location.href = 'index.html';
                }
            }, 350);
        }

        btn.addEventListener('click', (e) => {
            e.preventDefault();
            triggerReturnBack();
        });

        window.addEventListener('pageshow', () => {
            document.body.classList.remove('page-exit');
            isTriggered = false;
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initNavWidget);
    } else {
        initNavWidget();
    }
})();
