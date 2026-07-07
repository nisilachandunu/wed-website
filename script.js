/* ============================================
   WEDDING WEBSITE — Nisila & Yashmi
   JavaScript — Animations, Countdown, Interactions
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

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

        document.getElementById('days').textContent = String(days).padStart(3, '0');
        document.getElementById('hours').textContent = String(hours).padStart(2, '0');
        document.getElementById('minutes').textContent = String(minutes).padStart(2, '0');
        document.getElementById('seconds').textContent = String(seconds).padStart(2, '0');
    }

    updateCountdown();
    setInterval(updateCountdown, 1000);

    // ============================================
    // NAVIGATION
    // ============================================
    const navbar = document.getElementById('navbar');
    const navToggle = document.getElementById('navToggle');
    const navLinks = document.getElementById('navLinks');

    // Scroll effect
    window.addEventListener('scroll', () => {
        if (window.scrollY > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Mobile toggle
    navToggle.addEventListener('click', () => {
        navLinks.classList.toggle('open');
    });

    // Close on link click
    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('open');
        });
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
        if (!navbar.contains(e.target)) {
            navLinks.classList.remove('open');
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

    window.addEventListener('scroll', highlightNav);

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
        const petalEmojis = ['🌸', '✿', '❀'];
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
            petal.textContent = petalEmojis[Math.floor(Math.random() * petalEmojis.length)];

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
        const phone = document.getElementById('guestPhone').value;
        const attending = document.getElementById('attending').value;
        const guests = document.getElementById('guests').value;
        const message = document.getElementById('message').value;

        // Build WhatsApp message
        const attendingText = attending === 'yes' ? '✅ Joyfully Accepts' : '❌ Regretfully Declines';
        const whatsappMessage = 
            `💒 *Wedding RSVP — Nisila & Yashmi*\n` +
            `━━━━━━━━━━━━━━━━━━\n` +
            `👤 *Name:* ${name}\n` +
            `📱 *Phone:* ${phone}\n` +
            `📋 *Attending:* ${attendingText}\n` +
            `👥 *Number of Guests:* ${guests}\n` +
            `${message ? `💬 *Message:* ${message}\n` : ''}` +
            `━━━━━━━━━━━━━━━━━━\n` +
            `Sent from the Wedding Website 💕`;

        const whatsappURL = `https://wa.me/94701990692?text=${encodeURIComponent(whatsappMessage)}`;

        // Show toast
        showToast(attending === 'yes'
            ? `Thank you, ${name}! Redirecting to WhatsApp... 🎉`
            : `Thank you, ${name}. Redirecting to WhatsApp... 💕`
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
    // PARALLAX SUBTLE EFFECT
    // ============================================
    window.addEventListener('scroll', () => {
        const scrolled = window.scrollY;
        const hero = document.querySelector('.hero');
        if (hero && scrolled < window.innerHeight) {
            hero.style.backgroundPositionY = `${scrolled * 0.3}px`;
        }
    });

    // ============================================
    // TYPING EFFECT FOR HERO (Subtle)
    // ============================================
    const heroSubtitle = document.querySelector('.hero-subtitle');
    if (heroSubtitle) {
        const originalText = heroSubtitle.textContent;
        heroSubtitle.textContent = '';
        heroSubtitle.style.visibility = 'visible';
        
        let i = 0;
        function typeWriter() {
            if (i < originalText.length) {
                heroSubtitle.textContent += originalText.charAt(i);
                i++;
                setTimeout(typeWriter, 80);
            }
        }
        
        setTimeout(typeWriter, 1000);
    }

});
