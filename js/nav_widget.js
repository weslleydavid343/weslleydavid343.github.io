// Floating Bottom-Right Slide-to-Return Widget (matching voltar.png design)
(function () {
    function isHomePage() {
        const path = window.location.pathname;
        return path.endsWith('index.html') || path.endsWith('index_alt.html') || path === '/' || path.endsWith('/');
    }

    function initSlideWidget() {
        // Never render the back slider widget on Home page or Desktop (>= 992px)
        if (isHomePage()) return;

        if (document.getElementById('corner-slider-widget')) return;

        const widget = document.createElement('div');
        widget.id = 'corner-slider-widget';
        widget.className = 'corner-slider-widget';
        widget.title = 'Deslize para a esquerda para voltar';

        widget.innerHTML = `
            <div class="slider-track-line"></div>
            <div class="slider-target-tick"></div>
            <input type="range" id="corner-slide-input" class="corner-slide-input" min="0" max="100" value="100" step="1">
        `;

        document.body.appendChild(widget);

        const slider = document.getElementById('corner-slide-input');
        if (!slider) return;

        let isTriggered = false;

        function checkRelease() {
            if (isTriggered || window.innerWidth >= 992) return;
            const val = parseInt(slider.value, 10);

            // If dragged left towards target tick (<= 35%), trigger return to Previous Page!
            if (val <= 35) {
                triggerReturnBack();
            } else {
                // Smoothly snap white handle back to right end (100%)
                snapToRight();
            }
        }

        function triggerReturnBack() {
            if (isTriggered) return;
            isTriggered = true;
            slider.value = 0;
            document.body.classList.add('page-exit');
            setTimeout(() => {
                if (window.history.length > 1 && document.referrer && document.referrer.indexOf(window.location.host) !== -1) {
                    window.history.back();
                } else {
                    window.location.href = 'index.html';
                }
            }, 350);
        }

        function snapToRight() {
            let val = parseInt(slider.value, 10);
            if (val >= 100) return;

            const animateSnap = () => {
                val += 15;
                if (val >= 100) {
                    slider.value = 100;
                } else {
                    slider.value = val;
                    requestAnimationFrame(animateSnap);
                }
            };
            requestAnimationFrame(animateSnap);
        }

        // Realtime drag listener
        slider.addEventListener('input', (e) => {
            const val = parseInt(e.target.value, 10);
            if (val <= 20 && !isTriggered) {
                triggerReturnBack();
            }
        });


        slider.addEventListener('change', checkRelease);
        slider.addEventListener('touchend', checkRelease);
        slider.addEventListener('mouseup', checkRelease);

        window.addEventListener('pageshow', () => {
            document.body.classList.remove('page-exit');
            isTriggered = false;
            slider.value = 100;
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initSlideWidget);
    } else {
        initSlideWidget();
    }
})();

