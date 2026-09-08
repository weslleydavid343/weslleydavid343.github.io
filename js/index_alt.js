// JavaScript for Dynamic Slider (Stationary Popup at Initial Touch Point)

document.addEventListener('DOMContentLoaded', () => {
    const inputLayer = document.getElementById('input');
    const display = document.getElementById('slider-display');
    const popup = document.getElementById('floating-slider-popup');
    const slider = document.getElementById('dynamic-slider');

    if (!inputLayer || !popup || !slider || !display) return;

    let isDragging = false;
    let startX = 0;
    let isLeftSide = true; // true: Left Side (1->4 sliding right), false: Right Side (1->4 sliding left)

    // Value Mapping Dictionary
    const valueNames = {
        1: 'HOME',
        2: 'LOGS',
        3: 'BLOG',
        4: 'SOBRE'
    };

    // Page Redirection URLs
    const valueUrls = {
        1: 'index.html',
        2: 'logs.html',
        3: 'blog.html',
        4: 'me.html'
    };

    // Position popup ABOVE initial touch point ONCE
    function positionPopup(clientX, clientY) {
        popup.classList.remove('hidden');

        const popupWidth = popup.offsetWidth || 220;
        const popupHeight = popup.offsetHeight || 60;

        let left = clientX - (popupWidth / 2);
        left = Math.max(12, Math.min(left, window.innerWidth - popupWidth - 12));

        // Default position: ABOVE cursor/touch point
        let top = clientY - popupHeight - 16;
        if (top < 12) {
            // Fallback below cursor if near top edge of viewport
            top = clientY + 16;
        }
        top = Math.max(12, Math.min(top, window.innerHeight - popupHeight - 12));

        popup.style.left = `${left}px`;
        popup.style.top = `${top}px`;
    }

    // Set slider orientation
    function setSliderOrientation(isLeft) {
        slider.dir = isLeft ? 'ltr' : 'rtl';
    }

    const homeFullscreen = document.getElementById('home-fullscreen');
    const card3dScene = document.getElementById('card-3d-scene');
    const outputCard = document.getElementById('output-card');

    const bgLayer1 = document.getElementById('output-bg-1');
    const bgLayer2 = document.getElementById('output-bg-2');
    let activeLayer = bgLayer1;
    let inactiveLayer = bgLayer2;
    let currentVal = null;

    // Section Background Classes
    const valueClasses = {
        1: 'bg-home',
        2: 'bg-logs',
        3: 'bg-blog',
        4: 'bg-sobre'
    };

    // Section Descriptions Dictionary
    const valueDescriptions = {
        1: '',
        2: 'notas curtas...',
        3: 'artigos e reviews aleatórias...',
        4: 'talvez eu apague esse blog amanhã...'
    };

    const cardDescription = document.getElementById('card-description');

    // Smooth text updates with micro fade/translate
    function updateCardText(numericVal) {
        const newTitle = valueNames[numericVal] || 'HOME';
        const newDesc = valueDescriptions[numericVal] || '';

        if (display && display.textContent !== newTitle) {
            display.style.opacity = '0';
            display.style.transform = 'translateY(-4px)';
            setTimeout(() => {
                display.textContent = newTitle;
                display.style.opacity = '1';
                display.style.transform = 'translateY(0)';
            }, 80);
        }

        if (cardDescription && cardDescription.textContent !== newDesc) {
            cardDescription.style.opacity = '0';
            cardDescription.style.transform = 'translateY(4px)';
            setTimeout(() => {
                cardDescription.textContent = newDesc;
                cardDescription.style.opacity = '1';
                cardDescription.style.transform = 'translateY(0)';
            }, 80);
        }
    }

    // Update Output View (Step 1: Fullscreen Home, Steps 2-4: 3D Y-Axis Spinning Card)
    function updateValue(val) {
        let numericVal = parseInt(val, 10);
        numericVal = Math.max(1, Math.min(4, numericVal));

        slider.value = numericVal;

        if (numericVal === currentVal) return;
        const prevVal = currentVal;
        currentVal = numericVal;

        updateCardText(numericVal);

        if (numericVal === 1) {
            // Step 1: Fullscreen Hero View with "WD343" and Random Subtitle
            if (homeFullscreen) homeFullscreen.classList.remove('hidden-home');
            if (card3dScene) card3dScene.classList.add('hidden-card');
        } else {
            // Steps 2, 3, 4: Playing Card View with Y-Axis Spin Animation
            if (homeFullscreen) homeFullscreen.classList.add('hidden-home');
            if (card3dScene) card3dScene.classList.remove('hidden-card');

            // Trigger direction-aware 3D Card Spin Animation smoothly via rAF
            if (outputCard) {
                const spinClass = (prevVal !== null && numericVal < prevVal) ? 'flip-spinning-prev' : 'flip-spinning-next';
                outputCard.classList.remove('flip-spinning-next', 'flip-spinning-prev', 'flip-spinning');
                requestAnimationFrame(() => {
                    outputCard.classList.add(spinClass);
                });
            }

            // Update Image Layer inside the Card smoothly
            const bgClass = valueClasses[numericVal];
            if (bgClass && activeLayer && inactiveLayer) {
                inactiveLayer.className = `card-img-layer ${bgClass}`;
                requestAnimationFrame(() => {
                    inactiveLayer.classList.add('active');
                    activeLayer.classList.remove('active');

                    const temp = activeLayer;
                    activeLayer = inactiveLayer;
                    inactiveLayer = temp;
                });
            }
        }
    }

    // Navigate to selected section page
    function navigateToSection(val) {
        const numericVal = parseInt(val, 10);
        popup.classList.add('hidden');

        // Do not reload if target is HOME (step 1 / index.html), since we are already on it!
        if (numericVal === 1) return;

        const targetUrl = valueUrls[numericVal];
        if (targetUrl) {
            document.body.classList.add('page-exit');
            setTimeout(() => {
                currentVal = null;
                updateValue(1);
                window.location.href = targetUrl;
            }, 350);
        }
    }


    // Pointer/Touch Start (Positions popup ONCE at initial touch location)
    function handleStart(e) {
        // Don't re-center if tapping directly on the slider popup itself
        if (popup.contains(e.target)) return;

        isDragging = true;

        let clientX = e.clientX;
        let clientY = e.clientY;

        if (e.touches && e.touches.length > 0) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        }

        startX = clientX;

        // Check screen side: Left side vs Right side
        const halfWidth = window.innerWidth / 2;
        isLeftSide = clientX <= halfWidth;

        setSliderOrientation(isLeftSide);
        positionPopup(clientX, clientY);

        // Touch start value on BOTH sides MUST ALWAYS BE 1 (HOME)
        updateValue(1);
    }

    // Pointer/Touch Dragging across screen (Slider popup stays STATIONARY in place)
    function handleMove(e) {
        if (!isDragging) return;

        let clientX = e.clientX;

        if (e.touches && e.touches.length > 0) {
            clientX = e.touches[0].clientX;
        }

        // Popup remains stationary at initial position!
        const deltaX = clientX - startX;

        let newValue;
        if (isLeftSide) {
            // Left Side: sliding right -> 1: HOME → 2: LOGS → 3: BLOG → 4: SOBRE
            const stepChange = Math.round(deltaX / 45);
            newValue = 1 + stepChange;
        } else {
            // Right Side: sliding left -> 1: HOME → 2: LOGS → 3: BLOG → 4: SOBRE
            const distanceMovedLeft = -deltaX;
            const stepChange = Math.round(distanceMovedLeft / 45);
            newValue = 1 + stepChange;
        }

        updateValue(newValue);
    }

    // Pointer/Touch End
    function handleEnd() {
        if (!isDragging) return;
        isDragging = false;
        navigateToSection(slider.value);
    }

    // Event Listeners for Input Layer
    inputLayer.addEventListener('pointerdown', handleStart);
    inputLayer.addEventListener('touchstart', handleStart, { passive: true });

    window.addEventListener('pointermove', handleMove);
    window.addEventListener('touchmove', handleMove, { passive: true });

    window.addEventListener('pointerup', handleEnd);
    window.addEventListener('touchend', handleEnd);

    // Direct Slider Input listener
    slider.addEventListener('input', (e) => {
        updateValue(e.target.value);
    });

    slider.addEventListener('change', (e) => {
        navigateToSection(e.target.value);
    });

    // Clean up DOM state when navigating away so BFCache saves step 1 (Home) state
    window.addEventListener('pagehide', () => {
        isDragging = false;
        popup.classList.add('hidden');
        currentVal = null;
        updateValue(1);
    });

    // Handle bfcache restoration (pageshow event when returning via back button/gesture)
    window.addEventListener('pageshow', () => {
        document.body.classList.remove('page-exit');
        isDragging = false;
        popup.classList.add('hidden');
        currentVal = null;
        updateValue(1);
    });

    // Initialize default state
    setSliderOrientation(true);
    updateValue(1);
});


