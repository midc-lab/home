'use strict';

document.querySelectorAll('.faq-item').forEach((item, idx) => {
  const q   = item.querySelector('.faq-question');
  const a   = item.querySelector('.faq-answer');
  const ico = item.querySelector('.toggle-icon');

  if (!q || !a || !ico) return; 

  const toggle = () => {
    const open = item.classList.toggle('active');
    ico.textContent = open ? '-' : '+';
    q.setAttribute('aria-expanded', open);
  };

  q.addEventListener('click', toggle);
  ico.addEventListener('click', e => { e.stopPropagation(); toggle(); });

  q.setAttribute('aria-expanded', 'false');
  q.setAttribute('aria-controls', `faq-${idx}`);
  a.setAttribute('id', `faq-${idx}`);
});

document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const header = document.querySelector('.header');
      const offset = (header ? header.offsetHeight : 0) + 20;
      window.scrollTo({ top: target.offsetTop - offset, behavior: 'smooth' });
    }
  });
});

if (!document.querySelector('.skip-link')) {
  const skip = document.createElement('a');
  skip.href = '#main';
  skip.textContent = 'Skip to main content';
  skip.className = 'skip-link';
  document.body.insertBefore(skip, document.body.firstChild);
}

document.documentElement.classList.remove('preload');

'use strict';

const HeaderUtils = {
    debounce(func, wait, immediate) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                timeout = null;
                if (!immediate) func(...args);
            };
            const callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func(...args);
        };
    },

    throttle(func, limit) {
        let inThrottle;
        return function (...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
};


class SmartHeader {
    constructor() {
        this.header = document.querySelector('.header');
        this.logo = document.querySelector('.logo');
        this.navToggle = document.querySelector('.nav-toggle');
        this.navigation = document.querySelector('.navigation');
        this.navBackdrop = null;
        this.lastScrollY = 0;
        this.scrollThreshold = 100;
        this.hideThreshold = 200;
        this.isHidden = false;
        this.isMobile = window.innerWidth <= 768;
        this.isMenuOpen = false;
        this.init();
    }

    init() {
        if (!this.header) return;

        this.setupScrollHandler();
        this.setupLogoInteraction();
        this.setupResizeHandler();
        this.setupNavigation();
        this.setupMobileMenu();
    }

    setupScrollHandler() {
        window.addEventListener('scroll', HeaderUtils.throttle(() => {
            this.handleScroll();
        }, 16));
    }

    handleScroll() {
        const currentScrollY = window.pageYOffset;
        const scrollingDown = currentScrollY > this.lastScrollY;
        const scrolledPastThreshold = currentScrollY > this.scrollThreshold;

        if (scrolledPastThreshold && !this.header.classList.contains('scrolled')) {
            this.header.classList.add('scrolled');
        } else if (!scrolledPastThreshold && this.header.classList.contains('scrolled')) {
            this.header.classList.remove('scrolled');
        }

        if (this.isMobile && !this.isMenuOpen && Math.abs(currentScrollY - this.lastScrollY) > 5) {
            if (scrollingDown && currentScrollY > this.hideThreshold && !this.isHidden) {
                this.hideHeader();
            } else if (!scrollingDown && this.isHidden && currentScrollY < this.hideThreshold * 0.8) {
                this.showHeader();
            }
        }

        this.lastScrollY = currentScrollY;
    }

    hideHeader() {
        this.header.classList.add('header-hidden');
        this.isHidden = true;
    }

    showHeader() {
        this.header.classList.remove('header-hidden');
        this.isHidden = false;
    }

    setupLogoInteraction() {
        const logos = document.querySelectorAll('.logo');
        logos.forEach(logo => {
            logo.addEventListener('click', () => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        });
    }

    setupResizeHandler() {
        window.addEventListener('resize', HeaderUtils.debounce(() => {
            const wasMobile = this.isMobile;
            this.isMobile = window.innerWidth <= 768;

            if (!this.isMobile && this.isHidden) {
                this.showHeader();
            }
            if (wasMobile && !this.isMobile && this.isMenuOpen) {
                this.closeMobileMenu();
            }
        }, 250));
    }
    setupMobileMenu() {
        if (!this.navToggle || !this.navigation) return;

        this.navBackdrop = document.createElement('div');
        this.navBackdrop.className = 'nav-backdrop';
        document.body.appendChild(this.navBackdrop);

        this.navToggle.addEventListener('click', () => {
            this.isMenuOpen ? this.closeMobileMenu() : this.openMobileMenu();
        });

        this.navBackdrop.addEventListener('click', () => this.closeMobileMenu());

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isMenuOpen) this.closeMobileMenu();
        });

        this.navigation.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => this.closeMobileMenu());
        });
    }

    openMobileMenu() {
        this.isMenuOpen = true;
        this.navigation.classList.add('nav-open');
        this.navBackdrop.classList.add('visible');
        this.navToggle.setAttribute('aria-expanded', 'true');
        document.body.style.overflow = 'hidden';
    }

    closeMobileMenu() {
        this.isMenuOpen = false;
        this.navigation.classList.remove('nav-open');
        this.navBackdrop.classList.remove('visible');
        this.navToggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
    }

    setupNavigation() {
        const navLinks = document.querySelectorAll('.nav-link');
        const sections = document.querySelectorAll('section[id], main[id]');

        navLinks.forEach(link => {
            const href = link.getAttribute('href') || '';
            if (href.startsWith('#')) {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    const targetElement = document.querySelector(href);
                    if (targetElement) {
                        this.smoothScrollTo(targetElement);
                        this.updateURL(href);
                    }
                });
            }
        });

        if (sections.length > 0) {
            this.setupActiveNavigation(navLinks, sections);
        }
    }

    smoothScrollTo(element) {
        const headerHeight = this.header.offsetHeight;
        const targetPosition = element.getBoundingClientRect().top + window.pageYOffset - headerHeight - 20;

        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });
    }

    updateURL(hash) {
        if (history.pushState) {
            history.pushState(null, null, hash);
        }
    }

    setupActiveNavigation(navLinks, sections) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.setActiveNavItem(navLinks, entry.target.id);
                }
            });
        }, {
            rootMargin: '-20% 0px -80% 0px'
        });

        sections.forEach(section => observer.observe(section));
    }

    setActiveNavItem(navLinks, sectionId) {
        navLinks.forEach(link => {
            const isActive = link.getAttribute('href') === `#${sectionId}`;
            link.classList.toggle('active', isActive);
        });
    }

    destroy() {
        window.removeEventListener('scroll', this.handleScroll);
        window.removeEventListener('resize', this.handleResize);
    }
}

class HeaderLoader {
    constructor() {
        this.componentPath = './components/header.html';
        this.cssPath = './components/header.css';
        this.pathConfig = {};
    }

    configurePaths() {
        const currentPath = window.location.pathname.toLowerCase();
        const isInSubfolder = currentPath.includes('/html/');

        if (isInSubfolder) {
            this.componentPath = '../components/header.html';
            this.cssPath = '../components/header.css';
            this.pathConfig = {
                NITA_LOGO_PATH: '../NITA_Logo.png',
                MIDC_LOGO_PATH: '../MIDC_Logo.JPG',
                HOME_PATH: '../index.html',
                MEMBERS_PATH: './team_members.html',
                PROJECTS_PATH: './projects.html',
                PUBLICATIONS_PATH: './publications.html',
                OPPORTUNITIES_PATH: '../index.html#recruitment',
                CONTACT_PATH: '../index.html#contact_us'
            };
        } else {
            this.componentPath = './components/header.html';
            this.cssPath = './components/header.css';
            this.pathConfig = {
                NITA_LOGO_PATH: './NITA_Logo.png',
                MIDC_LOGO_PATH: './MIDC_Logo.JPG',
                HOME_PATH: './index.html',
                MEMBERS_PATH: './HTML/team_members.html',
                PROJECTS_PATH: './HTML/projects.html',
                PUBLICATIONS_PATH: './HTML/publications.html',
                OPPORTUNITIES_PATH: './index.html#recruitment',
                CONTACT_PATH: './index.html#contact_us'
            };
        }
    }

    async loadHeader() {
        try {
            this.configurePaths();

            const response = await fetch(this.componentPath);
            if (!response.ok) {
                throw new Error(`Failed to load header: ${response.status} ${response.statusText} (${this.componentPath})`);
            }

            let headerHTML = await response.text();

            Object.entries(this.pathConfig).forEach(([key, value]) => {
                headerHTML = headerHTML.split(`{{${key}}}`).join(value);
            });

            const headerPlaceholder = document.querySelector('#header-component');
            if (headerPlaceholder) {
                headerPlaceholder.innerHTML = headerHTML;
            } else {
                document.body.insertAdjacentHTML('afterbegin', headerHTML);
            }

            await this.loadCSS();
            new SmartHeader();

            return true;
        } catch (error) {
            console.error('[MIDC Header] Failed to load header component:', error);
            return false;
        }
    }

    async loadCSS() {
        return new Promise((resolve, reject) => {
            if (document.querySelector('link[href*="header.css"]')) {
                resolve();
                return;
            }

            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = this.cssPath;
            link.onload = resolve;
            link.onerror = () => reject(new Error(`Failed to load header CSS at ${this.cssPath}`));

            document.head.appendChild(link);
        });
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        const headerLoader = new HeaderLoader();
        headerLoader.loadHeader();
    });
} else {
    const headerLoader = new HeaderLoader();
    headerLoader.loadHeader();
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SmartHeader, HeaderLoader };
}
(function () {
    'use strict';

    function initMobileMenu() {
        const navToggle = document.querySelector('.nav-toggle');
        const navigation = document.querySelector('.navigation');

        if (!navToggle || !navigation) return false;

        const backdrop = document.createElement('div');
        backdrop.className = 'nav-backdrop';
        document.body.appendChild(backdrop);

        let isOpen = false;

        function openMenu() {
            isOpen = true;
            navigation.classList.add('nav-open');
            backdrop.classList.add('visible');
            navToggle.setAttribute('aria-expanded', 'true');
            document.body.style.overflow = 'hidden';
        }

        function closeMenu() {
            isOpen = false;
            navigation.classList.remove('nav-open');
            backdrop.classList.remove('visible');
            navToggle.setAttribute('aria-expanded', 'false');
            document.body.style.overflow = '';
        }

        navToggle.addEventListener('click', () => {
            isOpen ? closeMenu() : openMenu();
        });

        backdrop.addEventListener('click', closeMenu);

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && isOpen) closeMenu();
        });

        navigation.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', closeMenu);
        });

        window.addEventListener('resize', () => {
            if (window.innerWidth > 768 && isOpen) closeMenu();
        });

        return true;
    }
    if (!initMobileMenu()) {
        const observer = new MutationObserver(() => {
            if (initMobileMenu()) {
                observer.disconnect();
            }
        });
        observer.observe(document.body, { childList: true, subtree: true });
    }
})();
(function () {
    'use strict';

    if (window.matchMedia('(hover: none), (pointer: coarse)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    try {
        const dot = document.createElement('div');
        dot.id = 'cursor-dot';
        const ring = document.createElement('div');
        ring.id = 'cursor-ring';
        document.body.appendChild(dot);
        document.body.appendChild(ring);

        let mouseX = window.innerWidth / 2;
        let mouseY = window.innerHeight / 2;
        let ringX = mouseX, ringY = mouseY;
        let hasMoved = false;

        dot.style.left = mouseX + 'px';
        dot.style.top = mouseY + 'px';
        ring.style.left = ringX + 'px';
        ring.style.top = ringY + 'px';

        window.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            dot.style.left = mouseX + 'px';
            dot.style.top = mouseY + 'px';

            if (!hasMoved) {
                hasMoved = true;
                document.body.classList.add('custom-cursor-ready');
            }
        });

        function animateRing() {
            ringX += (mouseX - ringX) * 0.18;
            ringY += (mouseY - ringY) * 0.18;
            ring.style.left = ringX + 'px';
            ring.style.top = ringY + 'px';
            requestAnimationFrame(animateRing);
        }
        animateRing();

        const interactiveSelector = 'a, button, input, textarea, select, [role="button"], .btn, label';

        document.addEventListener('mouseover', (e) => {
            if (e.target.closest(interactiveSelector)) {
                document.body.classList.add('cursor-hover');
            }
        });
        document.addEventListener('mouseout', (e) => {
            if (e.target.closest(interactiveSelector)) {
                document.body.classList.remove('cursor-hover');
            }
        });

        document.addEventListener('mousedown', () => document.body.classList.add('cursor-active'));
        document.addEventListener('mouseup', () => document.body.classList.remove('cursor-active'));

        document.addEventListener('mouseleave', () => {
            dot.style.opacity = '0';
            ring.style.opacity = '0';
        });
        document.addEventListener('mouseenter', () => {
            dot.style.opacity = '1';
            ring.style.opacity = '1';
        });
    } catch (err) {
        console.error('[Custom Cursor] Failed to initialize:', err);
    }
})();