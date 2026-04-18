// Animation for the swire spider SVG
// Uses pure JavaScript with easing functions

// Easing functions
function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
}

function easeInOutBack(t) {
    const c1 = 1.70158;
    const c2 = c1 * 1.525;
    return t < 0.5
        ? (Math.pow(2 * t, 2) * ((c2 + 1) * 2 * t - c2)) / 2
        : (Math.pow(2 * t - 2, 2) * ((c2 + 1) * (t * 2 - 2) + c2) + 2) / 2;
}

// Animation function
function animateSpider() {
    const svg = document.querySelector('svg');
    if (!svg) {
        console.error('SVG not found');
        return;
    }

    const body = svg.querySelector('#body-path');
    const leftEye = svg.querySelector('#left-eye-path');
    const rightEye = svg.querySelector('#right-eye-path');

    if (!body || !leftEye || !rightEye) {
        console.error('SVG elements not found');
        return;
    }

    // Get initial body transform - preserve original X position
    const initialTransform = body.getAttribute('transform') || 'translate(0,0)';
    const initialMatch = initialTransform.match(/translate\(([^,]+),([^)]+)\)/);
    const initialX = initialMatch ? parseFloat(initialMatch[1]) : 0;
    const initialY = initialMatch ? parseFloat(initialMatch[2]) : 0;

    // Part 1: Descend the spider (easeOutCubic)
    const descendDuration = 1000;
    const descendStart = performance.now();
    const descendTargetY = initialY + 100;

    function descend(timestamp) {
        const elapsed = timestamp - descendStart;
        const progress = Math.min(elapsed / descendDuration, 1);
        const easedProgress = easeOutCubic(progress);
        const currentY = initialY + (descendTargetY - initialY) * easedProgress;

        // Preserve original X, only animate Y
        body.setAttribute('transform', `translate(${initialX},${currentY})`);
        leftEye.setAttribute('transform', `translate(0,${currentY - initialY})`);
        rightEye.setAttribute('transform', `translate(0,${currentY - initialY})`);

        if (progress < 1) {
            requestAnimationFrame(descend);
        } else {
            // Part 2: Side-to-side movement
            setTimeout(() => {
                // Move left
                body.setAttribute('transform', `translate(${initialX - 10},${descendTargetY})`);
                setTimeout(() => {
                    // Move right
                    body.setAttribute('transform', `translate(${initialX + 10},${descendTargetY})`);
                    setTimeout(() => {
                        // Move left
                        body.setAttribute('transform', `translate(${initialX},${descendTargetY})`);
                        setTimeout(() => {
                            // Return to center
                            body.setAttribute('transform', `translate(${initialX},${descendTargetY})`);
                            
                            // Part 3: Ascend the spider (easeInOutBack)
                            const ascendDuration = 1000;
                            const ascendStart = performance.now();

                            function ascend(timestamp) {
                                const elapsed = timestamp - ascendStart;
                                const progress = Math.min(elapsed / ascendDuration, 1);
                                const easedProgress = easeInOutBack(progress);
                                const currentY = descendTargetY + (initialY - descendTargetY) * easedProgress;

                                // Preserve original X, animate Y back
                                body.setAttribute('transform', `translate(${initialX},${currentY})`);
                                leftEye.setAttribute('transform', `translate(0,${currentY - initialY})`);
                                rightEye.setAttribute('transform', `translate(0,${currentY - initialY})`);

                                if (progress < 1) {
                                    requestAnimationFrame(ascend);
                                } else {
                                    // Reset eye transforms after animation
                                    leftEye.removeAttribute('transform');
                                    rightEye.removeAttribute('transform');
                                    
                                    // Reset body to original position
                                    body.setAttribute('transform', initialTransform);
                                    
                                    // Part 4: Blinking loop (optimized)
                                    startBlinking();
                                }
                            }
                            requestAnimationFrame(ascend);
                        }, 1000);
                    }, 1000);
                }, 1000);
            }, 1000);
        }
    }
    requestAnimationFrame(descend);

    // Optimized blinking function
    function startBlinking() {
        let isBlinking = true;

        function blinkSequence() {
            if (!isBlinking) return;

            const randomDelay = Math.random() * (1500 - 200) + 200;
            const blinkCount = Math.floor(Math.random() * 3) + 1; // Reduced from 5 to 3

            setTimeout(() => {
                if (!isBlinking) return;

                for (let i = 0; i < blinkCount; i++) {
                    setTimeout(() => {
                        if (!isBlinking) return;
                        rightEye.setAttribute('opacity', '0');
                        setTimeout(() => {
                            if (!isBlinking) return;
                            leftEye.setAttribute('opacity', '0');
                            setTimeout(() => {
                                if (!isBlinking) return;
                                rightEye.setAttribute('opacity', '1');
                                leftEye.setAttribute('opacity', '1');
                            }, 50); // Reduced from 100ms
                        }, 50); // Reduced from 100ms
                    }, i * 150); // Reduced from 200ms
                }
                
                // Use setTimeout instead of recursion to avoid stack issues
                if (isBlinking) {
                    setTimeout(blinkSequence, randomDelay + blinkCount * 150);
                }
            }, randomDelay);
        }

        // Start the blinking
        blinkSequence();

        // Cleanup function
        return () => {
            isBlinking = false;
            // Reset eyes to visible
            rightEye.setAttribute('opacity', '1');
            leftEye.setAttribute('opacity', '1');
        };
    }
}

// Start animation when page is fully loaded (including images)
window.addEventListener('load', animateSpider);