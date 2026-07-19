// ============================================================
//  SCRIPT.JS – GLOBAL UI (Hamburger + Active States)
//  Hamburger always visible, closes on outside click / Escape
//  Active state on clicked nav links
// ============================================================

(function() {
    'use strict';

    function initHamburger() {
        var hamburger = document.getElementById('hamburgerBtn');
        var mobileNav = document.getElementById('mobileNav');

        // Exit if elements don't exist on this page
        if (!hamburger || !mobileNav) return;

        // --- Toggle on click ---
        hamburger.addEventListener('click', function(e) {
            e.stopPropagation();
            var isOpen = mobileNav.classList.toggle('open');
            hamburger.setAttribute('aria-expanded', isOpen);
        });

        // --- Close on outside click ---
        document.addEventListener('click', function(e) {
            if (mobileNav.classList.contains('open') &&
                !mobileNav.contains(e.target) &&
                !hamburger.contains(e.target)) {
                mobileNav.classList.remove('open');
                hamburger.setAttribute('aria-expanded', 'false');
            }
        });

        // --- Close on Escape key ---
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && mobileNav.classList.contains('open')) {
                mobileNav.classList.remove('open');
                hamburger.setAttribute('aria-expanded', 'false');
                hamburger.focus();
            }
        });

        // --- Active state on link click ---
        var mobileLinks = mobileNav.querySelectorAll('.mobile-nav-list a');
        mobileLinks.forEach(function(link) {
            link.addEventListener('click', function() {
                // Remove active from all links
                mobileLinks.forEach(function(l) {
                    l.classList.remove('active');
                });
                // Add active to clicked link
                this.classList.add('active');

                // Close nav after click (for mobile UX)
                mobileNav.classList.remove('open');
                hamburger.setAttribute('aria-expanded', 'false');
            });
        });
    }

    // ============================================================
    //  RUN ON DOM READY
    //  ============================================================
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initHamburger);
    } else {
        initHamburger();
    }

})();
