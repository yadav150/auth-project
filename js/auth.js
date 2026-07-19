// ============================================================
//  AUTH.JS – Login & Signup Logic (Yadav Authentication Project)
//  Uses functions from firebase-config.js
// ============================================================

(function() {
    'use strict';

    // ---- Determine which page we're on ----
    const isLoginPage = document.getElementById('loginForm') !== null;
    const isSignupPage = document.getElementById('signupForm') !== null;

    // ---- DOM REFS (Login Page) ----
    const loginForm = document.getElementById('loginForm');
    const loginEmail = document.getElementById('loginEmail');
    const loginPassword = document.getElementById('loginPassword');
    const forgotPasswordLink = document.getElementById('forgotPasswordLink');
    const googleLoginBtn = document.getElementById('googleLoginBtn');
    const loginError = document.getElementById('loginError');

    // ---- DOM REFS (Signup Page) ----
    const signupForm = document.getElementById('signupForm');
    const signupName = document.getElementById('signupName');
    const signupEmail = document.getElementById('signupEmail');
    const signupPassword = document.getElementById('signupPassword');
    const googleSignupBtn = document.getElementById('googleSignupBtn');
    const signupError = document.getElementById('signupError');

    // ============================================================
    //  UTILITY: SHOW ERROR
    // ============================================================
    function setError(el, msg) {
        if (!el) return;
        el.textContent = msg;
        el.classList.add('show');
    }

    function clearError(el) {
        if (!el) return;
        el.classList.remove('show');
        el.textContent = '';
    }

    // ============================================================
    //  REDIRECT TO DASHBOARD
    // ============================================================
    function redirectToDashboard() {
        window.location.href = '/auth-project/dashboard.html';
    }

    // ============================================================
    //  CHECK AUTH STATE ON LOAD
    // ============================================================
    window.initAuthListener(function(user) {
        if (user) {
            // If already logged in, redirect to dashboard
            redirectToDashboard();
        }
    });

    // ============================================================
    //  LOGIN FORM
    // ============================================================
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            clearError(loginError);

            const email = loginEmail.value.trim();
            const password = loginPassword.value;

            if (!email || !password) {
                setError(loginError, 'Please fill in all fields.');
                return;
            }

            try {
                await window.loginUser(email, password);
                redirectToDashboard();
            } catch (err) {
                setError(loginError, err.message);
            }
        });
    }

    // ============================================================
    //  SIGNUP FORM
    // ============================================================
    if (signupForm) {
        signupForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            clearError(signupError);

            const name = signupName.value.trim();
            const email = signupEmail.value.trim();
            const password = signupPassword.value;

            if (!name || !email || !password) {
                setError(signupError, 'Please fill in all fields.');
                return;
            }

            if (password.length < 6) {
                setError(signupError, 'Password must be at least 6 characters.');
                return;
            }

            try {
                const user = await window.signupUser(email, password, name);
                await window.saveUserProfile(user.uid, {
                    name: name,
                    email: user.email,
                    role: 'Member',
                    joinDate: new Date().toISOString(),
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });
                await window.addActivityLog(user.uid, { device: 'Browser (Signup)' });
                redirectToDashboard();
            } catch (err) {
                setError(signupError, err.message);
            }
        });
    }

    // ============================================================
    //  FORGOT PASSWORD
    // ============================================================
    if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener('click', async function(e) {
            e.preventDefault();
            clearError(loginError);

            const email = loginEmail.value.trim();
            if (!email) {
                setError(loginError, 'Please enter your email address first.');
                return;
            }

            try {
                await window.sendPasswordReset(email);
                alert('Password reset email sent. Check your inbox.');
            } catch (err) {
                setError(loginError, err.message);
            }
        });
    }

    // ============================================================
    //  GOOGLE SIGN-IN (Login & Signup)
    // ============================================================
    async function handleGoogleSignIn() {
        try {
            const user = await window.signInWithGoogle();
            // Check if new user (profile may not exist)
            const profile = await window.getUserProfile(user.uid);
            if (!profile) {
                await window.saveUserProfile(user.uid, {
                    name: user.displayName || 'User',
                    email: user.email,
                    photoURL: user.photoURL || null,
                    role: 'Member',
                    joinDate: new Date().toISOString(),
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });
            }
            await window.addActivityLog(user.uid, { device: 'Google Sign-In' });
            redirectToDashboard();
        } catch (err) {
            const errorEl = isLoginPage ? loginError : signupError;
            if (errorEl) setError(errorEl, err.message);
        }
    }

    if (googleLoginBtn) {
        googleLoginBtn.addEventListener('click', handleGoogleSignIn);
    }

    if (googleSignupBtn) {
        googleSignupBtn.addEventListener('click', handleGoogleSignIn);
    }

})();
