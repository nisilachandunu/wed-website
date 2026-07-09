/* ============================================
   WEDDING WEBSITE — Nisila & Yashmi
   JavaScript — Animations, Countdown, Interactions
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // ============================================
    // INTRO PRELOADER + HERO NAME LETTER REVEAL
    // ============================================
    const preloader = document.getElementById('preloader');
    const nameSpans = document.querySelectorAll('.hero-names .groom-name, .hero-names .bride-name');

    // Split names into individually animated letters
    let letterDelay = 0.15;
    nameSpans.forEach(span => {
        const text = span.textContent;
        span.textContent = '';
        [...text].forEach(char => {
            const letter = document.createElement('span');
            letter.className = 'letter';
            letter.textContent = char;
            letter.style.setProperty('--ld', `${letterDelay}s`);
            letterDelay += 0.09;
            span.appendChild(letter);
        });
        letterDelay += 0.25;
    });

    function finishIntro() {
        if (preloader) preloader.classList.add('hidden');
        document.body.classList.add('intro-done');

        // Once letters have landed, restore plain text so the
        // golden shimmer gradient clips cleanly across each name
        setTimeout(() => {
            nameSpans.forEach(span => {
                span.textContent = span.textContent;
            });
            document.body.classList.add('names-settled');
        }, (letterDelay + 1.2) * 1000);
    }

    if (reducedMotion) {
        if (preloader) preloader.remove();
        document.body.classList.add('intro-done');
    } else {
        // Let the rings draw and the monogram breathe before revealing
        setTimeout(finishIntro, 2400);
    }

    // ============================================
    // SCROLL PROGRESS BAR
    // ============================================
    const scrollProgress = document.getElementById('scrollProgress');

    function updateScrollProgress() {
        if (!scrollProgress) return;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = docHeight > 0 ? (window.scrollY / docHeight) * 100 : 0;
        scrollProgress.style.width = `${progress}%`;
    }

    window.addEventListener('scroll', updateScrollProgress, { passive: true });
    updateScrollProgress();

    // ============================================
    // HERO SPARKLES
    // ============================================
    const sparklesContainer = document.getElementById('heroSparkles');
    if (sparklesContainer && !reducedMotion) {
        const sparkleCount = window.innerWidth <= 768 ? 14 : 26;
        for (let i = 0; i < sparkleCount; i++) {
            const s = document.createElement('div');
            s.className = 'sparkle';
            s.style.left = `${Math.random() * 100}%`;
            s.style.top = `${Math.random() * 100}%`;
            s.style.setProperty('--sd', `${3 + Math.random() * 4}s`);
            s.style.setProperty('--sdel', `${Math.random() * 5}s`);
            s.style.setProperty('--so', `${0.4 + Math.random() * 0.5}`);
            const size = 2 + Math.random() * 3;
            s.style.width = `${size}px`;
            s.style.height = `${size}px`;
            sparklesContainer.appendChild(s);
        }
    }

    // ============================================
    // COUNTDOWN TIMER
    // ============================================
    const weddingDate = new Date('August 20, 2026 10:00:00').getTime();

    function updateCountdown() {
        const now = new Date().getTime();
        const distance = weddingDate - now;

        if (distance < 0) {
            document.getElementById('countdown').innerHTML = `
                <div class="countdown-item">
                    <span class="countdown-number" style="font-family: var(--font-script); font-size: 2rem;">Just Married!</span>
                </div>
            `;
            return;
        }

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        setCountdownValue('days', String(days).padStart(3, '0'));
        setCountdownValue('hours', String(hours).padStart(2, '0'));
        setCountdownValue('minutes', String(minutes).padStart(2, '0'));
        setCountdownValue('seconds', String(seconds).padStart(2, '0'));
    }

    function setCountdownValue(id, value) {
        const el = document.getElementById(id);
        if (el.textContent !== value) {
            el.textContent = value;
            if (!reducedMotion) {
                el.classList.remove('tick');
                void el.offsetWidth; // restart the tick animation
                el.classList.add('tick');
            }
        }
    }

    updateCountdown();
    setInterval(updateCountdown, 1000);

    // ============================================
    // NAVIGATION
    // ============================================
    const navbar = document.getElementById('navbar');
    const navToggle = document.getElementById('navToggle');
    const navLinks = document.getElementById('navLinks');

    // Mobile toggle
    navToggle.addEventListener('click', () => {
        const isOpen = navLinks.classList.toggle('open');
        document.documentElement.classList.toggle('menu-open', isOpen);
    });

    // Close on link click
    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('open');
            document.documentElement.classList.remove('menu-open');
        });
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
        if (!navbar.contains(e.target)) {
            navLinks.classList.remove('open');
            document.documentElement.classList.remove('menu-open');
        }
    });

    // Active link highlighting
    const sections = document.querySelectorAll('section[id]');

    function highlightNav() {
        const scrollY = window.scrollY + 200;
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');
            const navLink = document.querySelector(`.nav-links a[href="#${sectionId}"]`);

            if (navLink) {
                if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
                    navLink.style.color = '';
                    navLink.classList.add('active-link');
                } else {
                    navLink.classList.remove('active-link');
                }
            }
        });
    }

    // Combined, rAF-throttled scroll handler (navbar state + nav highlighting + parallax)
    const heroEl = document.querySelector('.hero');

    function onMainScroll() {
        if (window.scrollY > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        highlightNav();

        if (heroEl && window.scrollY < window.innerHeight) {
            heroEl.style.backgroundPositionY = `${window.scrollY * 0.3}px`;
        }
    }

    let mainScrollTicking = false;
    window.addEventListener('scroll', () => {
        if (!mainScrollTicking) {
            requestAnimationFrame(() => {
                onMainScroll();
                mainScrollTicking = false;
            });
            mainScrollTicking = true;
        }
    }, { passive: true });

    // ============================================
    // SCROLL ANIMATIONS
    // ============================================
    const animateElements = document.querySelectorAll('[data-animate]');

    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -80px 0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                // Stagger animations
                setTimeout(() => {
                    entry.target.classList.add('animate-in');
                }, index * 100);
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    animateElements.forEach(el => observer.observe(el));

    // ============================================
    // FLOATING PETALS — subtle, mobile-friendly
    // ============================================
    const petalsContainer = document.getElementById('petals');
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (petalsContainer && !prefersReducedMotion) {
        let activePetals = 0;

        function isMobile() {
            return window.innerWidth <= 768;
        }

        function createPetal() {
            const mobile = isMobile();
            const maxPetals = mobile ? 6 : 12;
            if (activePetals >= maxPetals) return;

            const petal = document.createElement('div');
            petal.classList.add('petal');
            if (mobile) petal.classList.add('petal--mobile');

            const startX = Math.random() * window.innerWidth;
            const duration = mobile ? 12 + Math.random() * 8 : 10 + Math.random() * 8;
            const size = mobile
                ? 0.28 + Math.random() * 0.22
                : 0.45 + Math.random() * 0.35;
            const drift = mobile ? 30 + Math.random() * 40 : 50 + Math.random() * 60;

            petal.style.left = `${startX}px`;
            petal.style.animationDuration = `${duration}s`;
            petal.style.fontSize = `${size}rem`;
            petal.style.animationDelay = `${Math.random() * 3}s`;
            petal.style.setProperty('--drift', `${drift}px`);

            petalsContainer.appendChild(petal);
            activePetals++;

            setTimeout(() => {
                petal.remove();
                activePetals--;
            }, (duration + 2) * 1000);
        }

        const interval = isMobile() ? 5000 : 3000;
        setInterval(createPetal, interval);

        const initialCount = isMobile() ? 2 : 4;
        for (let i = 0; i < initialCount; i++) {
            setTimeout(createPetal, i * 600);
        }
    }

    // ============================================
    // RSVP FORM
    // ============================================
    const rsvpForm = document.getElementById('rsvpForm');
    const toast = document.getElementById('toast');

    rsvpForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const name = document.getElementById('guestName').value;
        const attending = document.getElementById('attending').value;
        const message = document.getElementById('message').value;

        // Build WhatsApp message
        const attendingText = attending === 'yes' ? 'Joyfully Accepts' : 'Regretfully Declines';
        const whatsappMessage =
            `*Wedding RSVP — Nisila & Yashmi*\n` +
            `━━━━━━━━━━━━━━━━━━\n` +
            `*Name:* ${name}\n` +
            `*Attending:* ${attendingText}\n` +
            `${message ? `*Message:* ${message}\n` : ''}` +
            `━━━━━━━━━━━━━━━━━━\n` +
            `Sent from the Wedding Website`;

        const whatsappURL = `https://wa.me/94701990692?text=${encodeURIComponent(whatsappMessage)}`;

        // Show toast
        showToast(attending === 'yes'
            ? `Thank you, ${name}! Redirecting to WhatsApp...`
            : `Thank you, ${name}. Redirecting to WhatsApp...`
        );

        // Reset form
        rsvpForm.reset();

        // Open WhatsApp after a short delay so the user sees the toast
        setTimeout(() => {
            window.open(whatsappURL, '_blank');
        }, 1500);
    });

    function showToast(msg) {
        const toastMsg = toast.querySelector('.toast-message');
        toastMsg.textContent = msg;
        toast.classList.add('show');
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 4000);
    }

    // ============================================
    // SMOOTH REVEAL — Hero elements
    // ============================================
    const heroContent = document.querySelector('.hero-content');
    if (heroContent) {
        heroContent.style.opacity = '0';
        heroContent.style.transform = 'translateY(30px)';
        heroContent.style.transition = 'opacity 1.2s ease, transform 1.2s ease';
        
        setTimeout(() => {
            heroContent.style.opacity = '1';
            heroContent.style.transform = 'translateY(0)';
        }, 300);
    }

    // ============================================
    // TYPING EFFECT FOR HERO (Subtle)
    // ============================================
    const heroSubtitle = document.querySelector('.hero-subtitle');
    if (heroSubtitle && !reducedMotion) {
        const originalText = heroSubtitle.textContent;
        heroSubtitle.textContent = '\u00A0'; // keep height while empty

        let i = 0;
        function typeWriter() {
            if (i < originalText.length) {
                heroSubtitle.textContent = originalText.slice(0, i + 1);
                i++;
                setTimeout(typeWriter, 80);
            }
        }

        // Start once the preloader has lifted and the subtitle is fading in
        setTimeout(typeWriter, 2900);
    }

    // ============================================
    // BACK TO TOP
    // ============================================
    const backToTop = document.getElementById('backToTop');
    if (backToTop) {
        window.addEventListener('scroll', () => {
            backToTop.classList.toggle('visible', window.scrollY > 600);
        }, { passive: true });

        backToTop.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // ============================================
    // FOOTER — floating hearts (CSS-drawn, not emoji)
    // ============================================
    const footerHearts = document.getElementById('footerHearts');
    if (footerHearts && !reducedMotion) {
        const heartCount = window.innerWidth <= 768 ? 6 : 10;
        for (let i = 0; i < heartCount; i++) {
            const h = document.createElement('span');
            h.className = 'floating-heart';
            h.style.left = `${5 + Math.random() * 90}%`;
            const size = 0.6 + Math.random() * 0.9;
            h.style.width = `${size}rem`;
            h.style.height = `${size}rem`;
            h.style.setProperty('--hfd', `${7 + Math.random() * 6}s`);
            h.style.setProperty('--hfdel', `${Math.random() * 8}s`);
            footerHearts.appendChild(h);
        }
    }

    // ============================================
    // TIMELINE — golden line draws as you scroll
    // ============================================
    const timeline = document.querySelector('.timeline');
    if (timeline) {
        const progressLine = document.createElement('div');
        progressLine.className = 'timeline-progress';
        timeline.appendChild(progressLine);

        function updateTimelineProgress() {
            const rect = timeline.getBoundingClientRect();
            const viewportMid = window.innerHeight * 0.65;
            const progress = Math.min(Math.max(viewportMid - rect.top, 0), rect.height);
            progressLine.style.height = `${progress}px`;
        }

        window.addEventListener('scroll', updateTimelineProgress, { passive: true });
        updateTimelineProgress();
    }

});
