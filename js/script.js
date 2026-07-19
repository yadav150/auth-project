// ============================================================
//  SCRIPT.JS – GLOBAL UI (Hamburger + Active States)
// ============================================================

(function() {
    'use strict';

    function initHamburger() {
        var hamburger = document.getElementById('hamburgerBtn');
        var mobileNav = document.getElementById('mobileNav');

        if (!hamburger || !mobileNav) return;

        hamburger.addEventListener('click', function(e) {
            e.stopPropagation();
            var isOpen = mobileNav.classList.toggle('open');
            hamburger.setAttribute('aria-expanded', isOpen);
        });

        document.addEventListener('click', function(e) {
            if (mobileNav.classList.contains('open') &&
                !mobileNav.contains(e.target) &&
                !hamburger.contains(e.target)) {
                mobileNav.classList.remove('open');
                hamburger.setAttribute('aria-expanded', 'false');
            }
        });

        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && mobileNav.classList.contains('open')) {
                mobileNav.classList.remove('open');
                hamburger.setAttribute('aria-expanded', 'false');
                hamburger.focus();
            }
        });

        var mobileLinks = mobileNav.querySelectorAll('.mobile-nav-list a');
        mobileLinks.forEach(function(link) {
            link.addEventListener('click', function() {
                mobileLinks.forEach(function(l) { l.classList.remove('active'); });
                this.classList.add('active');
                mobileNav.classList.remove('open');
                hamburger.setAttribute('aria-expanded', 'false');
            });
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initHamburger);
    } else {
        initHamburger();
    }

})();
