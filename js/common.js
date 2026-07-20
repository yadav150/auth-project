// Firebase configuration – replace with your own
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

// ===== Shared DOM helpers =====
document.addEventListener('DOMContentLoaded', function() {
    // Header hamburger toggle
    const navToggle = document.getElementById('navToggle');
    const navLinks = document.getElementById('navLinks');
    if (navToggle && navLinks) {
        navToggle.addEventListener('click', function(e) {
            e.stopPropagation();
            navLinks.classList.toggle('open');
        });
        // Click outside to close
        document.addEventListener('click', function(e) {
            if (!navToggle.contains(e.target) && !navLinks.contains(e.target)) {
                navLinks.classList.remove('open');
            }
        });
    }

    // Footer toggle
    const footerToggle = document.getElementById('footerToggle');
    const footerLinks = document.getElementById('footerLinks');
    if (footerToggle && footerLinks) {
        footerToggle.addEventListener('click', function(e) {
            e.stopPropagation();
            footerLinks.classList.toggle('open');
        });
        document.addEventListener('click', function(e) {
            if (!footerToggle.contains(e.target) && !footerLinks.contains(e.target)) {
                footerLinks.classList.remove('open');
            }
        });
    }
});
