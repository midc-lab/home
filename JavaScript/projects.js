document.addEventListener("DOMContentLoaded", function () {
  // Project filtering functionality
  const filterButtons = document.querySelectorAll(".filter-btn");
  const projectCards = document.querySelectorAll(".project-card");

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      // Update active button
      filterButtons.forEach((btn) => btn.classList.remove("active"));
      button.classList.add("active");

      const filterValue = button.getAttribute("data-filter");

      // Filter projects
      projectCards.forEach((card) => {
        if (filterValue === "all") {
          card.style.display = "block";
        } else {
          if (card.getAttribute("data-category") === filterValue) {
            card.style.display = "block";
          } else {
            card.style.display = "none";
          }
        }
      });
    });
  });

  // Tab functionality for each project card
  const tabButtons = document.querySelectorAll(".tab-btn");

  tabButtons.forEach((button) => {
    button.addEventListener("click", function () {
      // Get the parent project card
      const projectContent = this.closest(".project-content");

      // Remove active class from all tab buttons in this card
      const tabsInThisCard = projectContent.querySelectorAll(".tab-btn");
      tabsInThisCard.forEach((tab) => tab.classList.remove("active"));

      // Add active class to clicked button
      this.classList.add("active");

      // Get the tab content id
      const tabId = this.getAttribute("data-tab");

      // Hide all tab contents in this card
      const tabContentsInThisCard =
        projectContent.querySelectorAll(".tab-content");
      tabContentsInThisCard.forEach((content) =>
        content.classList.remove("active")
      );

      // Show the selected tab content
      const activeContent = document.getElementById(tabId);
      if (activeContent) {
        activeContent.classList.add("active");
      }
    });
  });
});

document.addEventListener("DOMContentLoaded", () => {
  // Dark Mode Toggle
  const themeSwitch = document.getElementById("theme-switch");
  const body = document.body;

  // Check user's previous theme preference
  const currentTheme = localStorage.getItem("theme");
  if (currentTheme) {
    body.classList.add(currentTheme);
    themeSwitch.checked = currentTheme === "dark-mode";
  }

  themeSwitch.addEventListener("change", () => {
    if (themeSwitch.checked) {
      body.classList.add("dark-mode");
      localStorage.setItem("theme", "dark-mode");
    } else {
      body.classList.remove("dark-mode");
      localStorage.removeItem("theme");
    }
  });

  // // Smooth Scrolling
  // const navLinks = document.querySelectorAll(".nav-link");
  // navLinks.forEach((link) => {
  //   link.addEventListener("click", (e) => {
  //     e.preventDefault();
  //     const targetId = link.getAttribute("href");
  //     const targetSection = document.querySelector(targetId);

  //     targetSection.scrollIntoView({
  //       behavior: "smooth",
  //     });
  //   });
  // });

  // Scroll Reveal Animations
  const revealElements = document.querySelectorAll(
    ".hero-section, .about-section, .project-highlights"
  );

  const revealOnScroll = () => {
    revealElements.forEach((element) => {
      const windowHeight = window.innerHeight;
      const revealTop = element.getBoundingClientRect().top;
      const revealPoint = 150;

      if (revealTop < windowHeight - revealPoint) {
        element.classList.add("active");
      } else {
        element.classList.remove("active");
      }
    });
  };

  window.addEventListener("scroll", revealOnScroll);
  revealOnScroll(); // Initial check
});
/* ========================================
   HEADER COMPONENT JAVASCRIPT
   ======================================== */

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

// ============================================
//           SMART HEADER SYSTEM
// ============================================

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
            // Closing the mobile menu automatically when resizing back to desktop
            if (wasMobile && !this.isMobile && this.isMenuOpen) {
                this.closeMobileMenu();
            }
        }, 250));
    }

    // --------------------------------------------
    // Mobile hamburger menu
    // --------------------------------------------
    setupMobileMenu() {
        if (!this.navToggle || !this.navigation) return;

        // Create a single backdrop element, reused across the session
        this.navBackdrop = document.createElement('div');
        this.navBackdrop.className = 'nav-backdrop';
        document.body.appendChild(this.navBackdrop);

        this.navToggle.addEventListener('click', () => {
            this.isMenuOpen ? this.closeMobileMenu() : this.openMobileMenu();
        });

        this.navBackdrop.addEventListener('click', () => this.closeMobileMenu());

        // Close on Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isMenuOpen) this.closeMobileMenu();
        });

        // Close whenever a nav link is tapped
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

// ============================================
//              HEADER LOADER
// ============================================

class HeaderLoader {
    constructor() {
        this.componentPath = './components/header.html';
        this.cssPath = './components/header.css';
        this.pathConfig = {};
    }

    /**
     * Determines whether the current page lives inside the /HTML/ subfolder.
     * Uses a case-insensitive check since GitHub Pages is served from a
     * case-sensitive filesystem and a mismatched check here is the #1 cause
     * of the header silently failing to load on GitHub but working locally.
     */
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

            // Replace every {{PLACEHOLDER}} found in pathConfig — order-independent,
            // so adding/removing keys never silently breaks a stale .replace() chain.
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
            // Visible failure instead of a silently blank header — makes
            // GitHub Pages path issues obvious in DevTools instead of just
            // "the header isn't there and I don't know why."
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

// ============================================
//              INITIALIZATION
// ============================================

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