// ==========================================
// Main JavaScript - Landing Page Animations and Interactions
// ==========================================

// Initialize GSAP and ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

// ==========================================
// Loading Screen Animation
// ==========================================
class LoadingScreen {
    constructor() {
        this.loadingScreen = document.querySelector('.loading-screen');
        this.init();
    }

    init() {
        // Set initial states
        gsap.set('.loading-content h2', { opacity: 0, y: 30 });
        gsap.set('.dna-helix', { opacity: 0, scale: 0.5 });

        // Animate loading screen entrance
        const tl = gsap.timeline();
        tl.to('.dna-helix', {
            opacity: 1,
            scale: 1,
            duration: 0.8,
            ease: "elastic.out(1, 0.75)"
        })
        .to('.loading-content h2', {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: "power2.out"
        }, "-=0.3");

        // Hide loading screen after content loads
        window.addEventListener('load', () => {
            setTimeout(() => this.hideLoading(), 1500);
        });
    }

    hideLoading() {
        gsap.to(this.loadingScreen, {
            opacity: 0,
            duration: 0.8,
            ease: "power2.inOut",
            onComplete: () => {
                this.loadingScreen.style.display = 'none';
                // Initialize page animations after loading is complete
                new PageAnimations();
            }
        });
    }
}

// ==========================================
// Page Animations
// ==========================================
class PageAnimations {
    constructor() {
        this.initNavigation();
        this.initHeroAnimations();
        this.initScrollAnimations();
        this.initParticleSystem();
        this.initInteractiveElements();
        this.initFooterBackground();
    }

    initNavigation() {
        // Animate navigation on scroll
        ScrollTrigger.create({
            trigger: "body",
            start: "top -80",
            end: "bottom bottom",
            onUpdate: (self) => {
                if (self.direction === 1) {
                    // Scrolling down
                    gsap.to('.header', {
                        y: -80,
                        duration: 0.3,
                        ease: "power2.out"
                    });
                } else {
                    // Scrolling up
                    gsap.to('.header', {
                        y: 0,
                        duration: 0.3,
                        ease: "power2.out"
                    });
                }
            }
        });

        // Animate nav links on hover
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('mouseenter', () => {
                gsap.to(link, {
                    scale: 1.05,
                    duration: 0.2,
                    ease: "power2.out"
                });
            });

            link.addEventListener('mouseleave', () => {
                gsap.to(link, {
                    scale: 1,
                    duration: 0.2,
                    ease: "power2.out"
                });
            });
        });
    }

    initHeroAnimations() {
        // Set initial states
        gsap.set('.hero-title .title-line', { opacity: 0, y: 50 });
        gsap.set('.hero-subtitle', { opacity: 0, y: 30 });
        gsap.set('.hero-buttons .btn', { opacity: 0, y: 30 });
        gsap.set('.protein-container', { opacity: 0, scale: 0.8 });

        // Create main hero timeline
        const heroTl = gsap.timeline({ delay: 0.5 });

        // Animate title lines with stagger
        heroTl.to('.hero-title .title-line', {
            opacity: 1,
            y: 0,
            duration: 0.8,
            stagger: 0.2,
            ease: "power3.out"
        })
        .to('.hero-subtitle', {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: "power2.out"
        }, "-=0.3")
        .to('.hero-buttons .btn', {
            opacity: 1,
            y: 0,
            duration: 0.5,
            stagger: 0.1,
            ease: "back.out(1.7)"
        }, "-=0.2")
        .to('.protein-container', {
            opacity: 1,
            scale: 1,
            duration: 1,
            ease: "elastic.out(1, 0.5)"
        }, "-=0.8");

        // Animate protein model rotation
        gsap.to('.protein-model', {
            rotation: 360,
            duration: 20,
            repeat: -1,
            ease: "none"
        });

        // Animate individual atoms
        gsap.to('.atom', {
            rotation: 360,
            duration: 15,
            repeat: -1,
            ease: "none",
            stagger: 0.5
        });

        // Pulse glow effect
        gsap.to('.glow-effect', {
            scale: 1.2,
            opacity: 0.8,
            duration: 3,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut"
        });
    }

    initScrollAnimations() {
        // Features section animation
        gsap.set('.section-title', { opacity: 0, y: 30 });
        gsap.set('.section-subtitle', { opacity: 0, y: 20 });
        gsap.set('.feature-card', { opacity: 0, y: 50 });

        ScrollTrigger.create({
            trigger: '.features',
            start: "top 80%",
            end: "bottom 20%",
            animation: gsap.timeline()
                .to('.section-title', {
                    opacity: 1,
                    y: 0,
                    duration: 0.8,
                    ease: "power2.out"
                })
                .to('.section-subtitle', {
                    opacity: 1,
                    y: 0,
                    duration: 0.6,
                    ease: "power2.out"
                }, "-=0.3")
                .to('.feature-card', {
                    opacity: 1,
                    y: 0,
                    duration: 0.6,
                    stagger: 0.1,
                    ease: "back.out(1.7)"
                }, "-=0.3")
        });

        // CTA section animation
        gsap.set('.cta-content h2, .cta-content p, .cta-content .btn', { opacity: 0, y: 30 });

        ScrollTrigger.create({
            trigger: '.cta',
            start: "top 80%",
            animation: gsap.timeline()
                .to('.cta-content h2', {
                    opacity: 1,
                    y: 0,
                    duration: 0.8,
                    ease: "power2.out"
                })
                .to('.cta-content p', {
                    opacity: 1,
                    y: 0,
                    duration: 0.6,
                    ease: "power2.out"
                }, "-=0.3")
                .to('.cta-content .btn', {
                    opacity: 1,
                    y: 0,
                    duration: 0.6,
                    ease: "back.out(1.7)"
                }, "-=0.3")
        });

    }

    initParticleSystem() {
        // Create floating particles
        const particleContainer = document.querySelector('.hero-background');
        
        for (let i = 0; i < 20; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.setProperty('--x', `${Math.random() * 100}%`);
            particle.style.setProperty('--y', `${Math.random() * 100}%`);
            particle.style.setProperty('--delay', `${Math.random() * 5}s`);
            particleContainer.appendChild(particle);

            // Random movement animation
            gsap.to(particle, {
                x: `${(Math.random() - 0.5) * 100}px`,
                y: `${(Math.random() - 0.5) * 100}px`,
                duration: 10 + Math.random() * 10,
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut",
                delay: Math.random() * 5
            });
        }
    }

    initInteractiveElements() {
        // Button hover animations
        document.querySelectorAll('.btn').forEach(btn => {
            btn.addEventListener('mouseenter', () => {
                gsap.to(btn, {
                    scale: 1.05,
                    duration: 0.3,
                    ease: "back.out(1.7)"
                });
            });

            btn.addEventListener('mouseleave', () => {
                gsap.to(btn, {
                    scale: 1,
                    duration: 0.3,
                    ease: "power2.out"
                });
            });
        });

        // Feature card hover animations
        document.querySelectorAll('.feature-card').forEach(card => {
            card.addEventListener('mouseenter', () => {
                gsap.to(card, {
                    y: -10,
                    duration: 0.4,
                    ease: "power2.out"
                });
                
                gsap.to(card.querySelector('.feature-icon'), {
                    rotation: 10,
                    scale: 1.1,
                    duration: 0.4,
                    ease: "back.out(1.7)"
                });
            });

            card.addEventListener('mouseleave', () => {
                gsap.to(card, {
                    y: 0,
                    duration: 0.4,
                    ease: "power2.out"
                });
                
                gsap.to(card.querySelector('.feature-icon'), {
                    rotation: 0,
                    scale: 1,
                    duration: 0.4,
                    ease: "power2.out"
                });
            });
        });

    }

    initFooterBackground() {
        // Create animated background for footer
        const footer = document.querySelector('.footer');
        if (!footer) return;
        
        // Create floating DNA helixes
        for (let i = 0; i < 15; i++) {
            const helix = document.createElement('div');
            helix.className = 'footer-helix';
            helix.innerHTML = '🧬';
            helix.style.cssText = `
                position: absolute;
                color: rgba(240, 147, 251, 0.1);
                font-size: ${Math.random() * 20 + 15}px;
                left: ${Math.random() * 100}%;
                top: ${Math.random() * 100}%;
                pointer-events: none;
                z-index: 1;
            `;
            footer.appendChild(helix);
            
            // Animate each helix
            gsap.to(helix, {
                y: Math.random() * 50 - 25,
                x: Math.random() * 50 - 25,
                rotation: 360,
                duration: Math.random() * 10 + 10,
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut",
                delay: Math.random() * 5
            });
        }
        
        // Create floating particles
        for (let i = 0; i < 25; i++) {
            const particle = document.createElement('div');
            particle.className = 'footer-particle';
            particle.style.cssText = `
                position: absolute;
                width: ${Math.random() * 4 + 2}px;
                height: ${Math.random() * 4 + 2}px;
                background: rgba(102, 126, 234, ${Math.random() * 0.3 + 0.1});
                border-radius: 50%;
                left: ${Math.random() * 100}%;
                top: ${Math.random() * 100}%;
                pointer-events: none;
                z-index: 1;
            `;
            footer.appendChild(particle);
            
            // Animate particles
            gsap.to(particle, {
                y: Math.random() * 100 - 50,
                x: Math.random() * 100 - 50,
                scale: Math.random() * 2 + 0.5,
                opacity: Math.random() * 0.5 + 0.2,
                duration: Math.random() * 8 + 6,
                repeat: -1,
                yoyo: true,
                ease: "power1.inOut",
                delay: Math.random() * 3
            });
        }
        
        // Create gradient waves
        const wave1 = document.createElement('div');
        const wave2 = document.createElement('div');
        const wave3 = document.createElement('div');
        
        [wave1, wave2, wave3].forEach((wave, index) => {
            wave.className = `footer-wave wave-${index + 1}`;
            wave.style.cssText = `
                position: absolute;
                top: 0;
                left: -100%;
                width: 200%;
                height: 100%;
                background: linear-gradient(45deg, 
                    rgba(102, 126, 234, 0.05) 0%, 
                    rgba(240, 147, 251, 0.05) 50%, 
                    rgba(245, 87, 108, 0.05) 100%);
                pointer-events: none;
                z-index: 0;
            `;
            footer.appendChild(wave);
            
            // Animate waves
            gsap.to(wave, {
                x: '100%',
                duration: 15 + index * 5,
                repeat: -1,
                ease: "none",
                delay: index * 2
            });
            
            gsap.to(wave, {
                opacity: 0.3,
                duration: 3 + index,
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut"
            });
        });
    }

}

// ==========================================
// Mobile Navigation
// ==========================================
class MobileNavigation {
    constructor() {
        this.toggle = document.querySelector('.mobile-menu-toggle');
        this.navLinks = document.querySelector('.nav-links');
        this.isOpen = false;
        
        if (this.toggle) {
            this.init();
        }
    }

    init() {
        this.toggle.addEventListener('click', () => {
            this.toggleMenu();
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (this.isOpen && !this.toggle.contains(e.target) && !this.navLinks.contains(e.target)) {
                this.closeMenu();
            }
        });

        // Close menu on window resize
        window.addEventListener('resize', () => {
            if (window.innerWidth > 768 && this.isOpen) {
                this.closeMenu();
            }
        });
    }

    toggleMenu() {
        if (this.isOpen) {
            this.closeMenu();
        } else {
            this.openMenu();
        }
    }

    openMenu() {
        this.isOpen = true;
        this.toggle.classList.add('active');
        
        // Animate toggle button
        gsap.to(this.toggle.children[0], { rotation: 45, y: 6, duration: 0.3 });
        gsap.to(this.toggle.children[1], { opacity: 0, duration: 0.3 });
        gsap.to(this.toggle.children[2], { rotation: -45, y: -6, duration: 0.3 });

        // Show and animate menu
        this.navLinks.style.display = 'flex';
        gsap.fromTo(this.navLinks, 
            { 
                opacity: 0, 
                y: -20,
                flexDirection: 'column',
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                background: 'white',
                padding: '1rem',
                boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
            },
            { 
                opacity: 1, 
                y: 0, 
                duration: 0.4, 
                ease: "back.out(1.7)" 
            }
        );
    }

    closeMenu() {
        this.isOpen = false;
        this.toggle.classList.remove('active');
        
        // Animate toggle button back
        gsap.to(this.toggle.children[0], { rotation: 0, y: 0, duration: 0.3 });
        gsap.to(this.toggle.children[1], { opacity: 1, duration: 0.3 });
        gsap.to(this.toggle.children[2], { rotation: 0, y: 0, duration: 0.3 });

        // Hide menu
        gsap.to(this.navLinks, {
            opacity: 0,
            y: -20,
            duration: 0.3,
            ease: "power2.in",
            onComplete: () => {
                this.navLinks.style.display = '';
                this.navLinks.style.position = '';
                this.navLinks.style.top = '';
                this.navLinks.style.left = '';
                this.navLinks.style.right = '';
                this.navLinks.style.background = '';
                this.navLinks.style.padding = '';
                this.navLinks.style.boxShadow = '';
            }
        });
    }
}

// ==========================================
// Smooth Page Transitions
// ==========================================
class PageTransitions {
    constructor() {
        this.init();
    }

    init() {
        // Add transition overlay
        const overlay = document.createElement('div');
        overlay.className = 'page-transition-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            z-index: 9999;
            opacity: 0;
            visibility: hidden;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 1.2rem;
            font-weight: 600;
        `;
        overlay.innerHTML = '<div>Loading...</div>';
        document.body.appendChild(overlay);

        // Handle page transitions
        document.querySelectorAll('a[href^="viewer.html"], a[href^="upload.html"], a[href^="lander.html"]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const href = link.getAttribute('href');
                this.transitionTo(href);
            });
        });
    }

    transitionTo(url) {
        const overlay = document.querySelector('.page-transition-overlay');
        
        // Show overlay
        gsap.to(overlay, {
            opacity: 1,
            visibility: 'visible',
            duration: 0.5,
            ease: "power2.inOut",
            onComplete: () => {
                // Navigate to new page
                window.location.href = url;
            }
        });
    }
}

// ==========================================
// Utility Functions
// ==========================================
class Utils {
    static isMobile() {
        return window.innerWidth <= 768;
    }

    static isTablet() {
        return window.innerWidth <= 1024 && window.innerWidth > 768;
    }

    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    static throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        }
    }
}

// ==========================================
// Performance Monitoring
// ==========================================
class PerformanceMonitor {
    constructor() {
        this.init();
    }

    init() {
        // Monitor scroll performance
        let scrollTicking = false;
        
        window.addEventListener('scroll', () => {
            if (!scrollTicking) {
                requestAnimationFrame(() => {
                    // Scroll handling code here
                    scrollTicking = false;
                });
                scrollTicking = true;
            }
        });

        // Monitor resize performance
        window.addEventListener('resize', Utils.debounce(() => {
            ScrollTrigger.refresh();
        }, 250));
    }
}

// ==========================================
// Initialize Application
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    // Check if page is landing page
    if (document.body.classList.contains('upload-page') || 
        document.body.classList.contains('viewer-page')) {
        return; // Don't initialize landing page features on other pages
    }

    // Initialize all components
    new LoadingScreen();
    new MobileNavigation();
    new PageTransitions();
    new PerformanceMonitor();

    // Add custom cursor effect for desktop
    if (!Utils.isMobile()) {
        const cursor = document.createElement('div');
        cursor.className = 'custom-cursor';
        cursor.style.cssText = `
            position: fixed;
            width: 20px;
            height: 20px;
            background: rgba(102, 126, 234, 0.3);
            border-radius: 50%;
            pointer-events: none;
            z-index: 9999;
            transition: transform 0.1s ease;
        `;
        document.body.appendChild(cursor);

        document.addEventListener('mousemove', (e) => {
            gsap.to(cursor, {
                x: e.clientX - 10,
                y: e.clientY - 10,
                duration: 0.1
            });
        });

        document.addEventListener('mouseenter', () => {
            cursor.style.opacity = '1';
        });

        document.addEventListener('mouseleave', () => {
            cursor.style.opacity = '0';
        });
    }

    console.log('ProteinView3D - Landing page initialized successfully! 🧬');
});

// ==========================================
// Export for use in other modules
// ==========================================
window.ProteinView3D = {
    Utils,
    gsap,
    ScrollTrigger
};