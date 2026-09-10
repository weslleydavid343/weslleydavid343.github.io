// Preloader Script for WD343 Site
// Preloads critical WebP images and displays a minimalist loading screen before site presentation.

(function () {
    // Critical WebP Assets to preload
    const CRITICAL_IMAGES = [
        'assets/20191109_112944_min_grain.webp',
        'assets/20210711_163112_min_grain.webp',
        'assets/IMG_6301_min_grain.webp',
        'assets/me2_min_grain.webp',
        'assets/20191109_112944_min.webp',
        'assets/20210711_163112_min.webp',
        'assets/me2.webp',
        'assets/me.webp'
    ];

    // Inject Preloader Styles immediately
    const style = document.createElement('style');
    style.id = 'preloader-styles';
    style.textContent = `
        #site-preloader {
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            height: 100dvh;
            background-color: #0d0f12;
            z-index: 999999;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            opacity: 1;
            transition: opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1), visibility 0.5s cubic-bezier(0.16, 1, 0.3, 1);
            user-select: none;
            -webkit-user-select: none;
            font-family: 'JetBrains Mono', monospace;
            color: #f4ebd0;
        }

        #site-preloader.loaded {
            opacity: 0;
            visibility: hidden;
            pointer-events: none;
        }

        .preloader-content {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 20px;
            text-align: center;
            max-width: 300px;
            width: 85%;
        }

        .preloader-brand {
            font-family: 'JetBrains Mono', monospace;
            font-size: 2rem;
            font-weight: 700;
            color: #ffffff;
            background-color: #000000;
            padding: 6px 22px;
            border-radius: 6px;
            border: 1px solid #d4c3a3;
            letter-spacing: 0.08em;
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.5);
        }

        .preloader-status {
            font-size: 0.82rem;
            color: #d4c3a3;
            letter-spacing: 0.06em;
            text-transform: uppercase;
        }

        .preloader-bar-container {
            width: 100%;
            height: 6px;
            background-color: rgba(212, 195, 163, 0.2);
            border-radius: 3px;
            overflow: hidden;
            position: relative;
        }

        .preloader-bar-fill {
            height: 100%;
            width: 0%;
            background-color: #f4ebd0;
            border-radius: 3px;
            transition: width 0.15s ease-out;
        }

        .preloader-percent {
            font-size: 0.78rem;
            color: #786551;
            letter-spacing: 0.05em;
        }
    `;
    if (document.head) {
        document.head.appendChild(style);
    } else {
        document.addEventListener('DOMContentLoaded', () => {
            document.head.appendChild(style);
        });
    }

    let isFinished = false;

    function finishLoading() {
        if (isFinished) return;
        isFinished = true;
        
        const statusText = document.getElementById('preloader-status-text');
        const bar = document.getElementById('preloader-bar');
        const percentText = document.getElementById('preloader-percent-text');
        
        if (statusText) statusText.textContent = 'PRONTO';
        if (bar) bar.style.width = '100%';
        if (percentText) percentText.textContent = '100%';

        setTimeout(() => {
            const preloader = document.getElementById('site-preloader');
            if (preloader) {
                preloader.classList.add('loaded');
                setTimeout(() => {
                    if (preloader.parentNode) {
                        preloader.parentNode.removeChild(preloader);
                    }
                }, 500);
            }
        }, 180);
    }

    function createPreloaderHTML() {
        if (document.getElementById('site-preloader')) return;
        const preloader = document.createElement('div');
        preloader.id = 'site-preloader';
        preloader.innerHTML = `
            <div class="preloader-content">
                <div class="preloader-brand">WD343</div>
                <div class="preloader-status" id="preloader-status-text">CARREGANDO RECURSOS...</div>
                <div class="preloader-bar-container">
                    <div class="preloader-bar-fill" id="preloader-bar"></div>
                </div>
                <div class="preloader-percent" id="preloader-percent-text">0%</div>
            </div>
        `;

        if (document.body) {
            document.body.prepend(preloader);
        } else {
            document.addEventListener('DOMContentLoaded', () => {
                document.body.prepend(preloader);
            });
        }
    }

    createPreloaderHTML();

    // Track Image Loading Progress
    let loadedCount = 0;
    const totalImages = CRITICAL_IMAGES.length;

    function updateProgress() {
        if (isFinished) return;
        loadedCount++;
        const percent = Math.min(100, Math.round((loadedCount / totalImages) * 100));

        const bar = document.getElementById('preloader-bar');
        const percentText = document.getElementById('preloader-percent-text');

        if (bar) bar.style.width = `${percent}%`;
        if (percentText) percentText.textContent = `${percent}%`;

        if (loadedCount >= totalImages) {
            finishLoading();
        }
    }

    // Preload each WebP image
    CRITICAL_IMAGES.forEach(src => {
        const img = new Image();
        img.onload = updateProgress;
        img.onerror = updateProgress;
        img.src = src;
    });

    // Fallback safety timeout (max 2.5s)
    setTimeout(() => {
        finishLoading();
    }, 2500);

    // Also wait for window load event
    window.addEventListener('load', () => {
        if (loadedCount >= Math.ceil(totalImages / 2)) {
            finishLoading();
        }
    });

    // Handle BFCache restoration (pageshow event when returning via back button/gesture)
    window.addEventListener('pageshow', (event) => {
        document.body.classList.remove('page-exit');
        finishLoading();
        const preloader = document.getElementById('site-preloader');
        if (preloader) {
            preloader.classList.add('loaded');
            if (preloader.parentNode) {
                preloader.parentNode.removeChild(preloader);
            }
        }
    });

})();

