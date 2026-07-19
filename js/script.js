// ============================================================
//  SCRIPT.JS – GLOBAL UI (Hamburger + Active States)
//  Hamburger always starts collapsed (three lines)
// ============================================================

(function() {
    'use strict';

    function initHamburger() {
        var hamburger = document.getElementById('hamburgerBtn');
        var mobileNav = document.getElementById('mobileNav');

        // ---- RESET: Ensure hamburger starts collapsed on every page load ----
        if (mobileNav) {
            mobileNav.classList.remove('open');
        }
        if (hamburger) {
            hamburger.setAttribute('aria-expanded', 'false');
        }

        // Exit if elements don't exist
        if (!hamburger || !mobileNav) return;

        // ---- Toggle on click ----
        hamburger.addEventListener('click', function(e) {
            e.stopPropagation();
            var isOpen = mobileNav.classList.toggle('open');
            hamburger.setAttribute('aria-expanded', isOpen);
        });

        // ---- Close on outside click ----
        document.addEventListener('click', function(e) {
            if (mobileNav.classList.contains('open') &&
                !mobileNav.contains(e.target) &&
                !hamburger.contains(e.target)) {
                mobileNav.classList.remove('open');
                hamburger.setAttribute('aria-expanded', 'false');
            }
        });

        // ---- Close on Escape key ----
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && mobileNav.classList.contains('open')) {
                mobileNav.classList.remove('open');
                hamburger.setAttribute('aria-expanded', 'false');
                hamburger.focus();
            }
        });

        // ---- Active state on link click ----
        var mobileLinks = mobileNav.querySelectorAll('.mobile-nav-list a');
        mobileLinks.forEach(function(link) {
            link.addEventListener('click', function() {
                // Remove active from all links
                mobileLinks.forEach(function(l) {
                    l.classList.remove('active');
                });
                // Add active to clicked link
                this.classList.add('active');

                // Close nav after click
                mobileNav.classList.remove('open');
                hamburger.setAttribute('aria-expanded', 'false');
            });
        });
    }

    // ============================================================
    //  RUN ON DOM READY – Also reset on pageshow (for back/forward)
    // ============================================================
    function resetHamburger() {
        var mobileNav = document.getElementById('mobileNav');
        var hamburger = document.getElementById('hamburgerBtn');
        if (mobileNav) {
            mobileNav.classList.remove('open');
        }
        if (hamburger) {
            hamburger.setAttribute('aria-expanded', 'false');
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            initHamburger();
            resetHamburger();
        });
    } else {
        initHamburger();
        resetHamburger();
    }

    // ---- Also reset on pageshow (for back/forward navigation) ----
    window.addEventListener('pageshow', function() {
        resetHamburger();
    });

})();
