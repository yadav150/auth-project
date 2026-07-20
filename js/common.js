// ===== Firebase Configuration (your new SDK) =====
const firebaseConfig = {
  apiKey: "AIzaSyDFnxF_v-fXGiZeL_OEMzmKrPdR1PE3KfU",
  authDomain: "auth-project-by-yadav.firebaseapp.com",
  projectId: "auth-project-by-yadav",
  storageBucket: "auth-project-by-yadav.firebasestorage.app",
  messagingSenderId: "351339588417",
  appId: "1:351339588417:web:37475410e0f70a6470cfc0",
  measurementId: "G-788ZZB8CTB"  // (optional, not used here)
};

// Initialize Firebase (compat mode)
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
