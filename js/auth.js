// ============================================================
//  AUTH.JS – Login & Signup Logic (Fixed)
//  - Signup → Login with success message
//  - Login → Dashboard
//  - Logout → Login (handled by dashboard.js)
//  - Password reset → inline message (no alert)
//  - Error messages in error div, no browser alerts
// ============================================================

(function() {
    'use strict';

    // ---- Determine page ----
    var isLoginPage = document.getElementById('loginForm') !== null;
    var isSignupPage = document.getElementById('signupForm') !== null;

    // ---- Login DOM ----
    var loginForm = document.getElementById('loginForm');
    var loginEmail = document.getElementById('loginEmail');
    var loginPassword = document.getElementById('loginPassword');
    var forgotPasswordLink = document.getElementById('forgotPasswordLink');
    var googleLoginBtn = document.getElementById('googleLoginBtn');
    var loginError = document.getElementById('loginError');

    // ---- Signup DOM ----
    var signupForm = document.getElementById('signupForm');
    var signupName = document.getElementById('signupName');
    var signupEmail = document.getElementById('signupEmail');
    var signupPassword = document.getElementById('signupPassword');
    var googleSignupBtn = document.getElementById('googleSignupBtn');
    var signupError = document.getElementById('signupError');

    // ---- Modal (User Not Found) ----
    var userNotFoundModal = document.getElementById('userNotFoundModal');

    // ---- Utilities ----
    function setError(el, msg) {
        if (!el) return;
        el.textContent = msg;
        el.classList.add('show');
        // Ensure success message is hidden if error appears
        var successMsg = document.getElementById('signupSuccessMsg');
        if (successMsg) successMsg.style.display = 'none';
    }

    function clearError(el) {
        if (!el) return;
        el.classList.remove('show');
        el.textContent = '';
    }

    function setSuccess(el, msg) {
        if (!el) return;
        el.textContent = msg;
        el.style.display = 'block';
        // Hide error if present
        if (loginError) loginError.classList.remove('show');
        setTimeout(function() {
            el.style.display = 'none';
        }, 5000);
    }

    function showModal(modal) {
        if (!modal) return;
        modal.style.display = 'flex';
    }

    function hideModal(modal) {
        if (!modal) return;
        modal.style.display = 'none';
    }

    function redirectToDashboard() {
        window.location.href = '/auth-project/dashboard.html';
    }

    function redirectToLogin() {
        window.location.href = '/auth-project/login.html';
    }

    // ---- Auth state check (if logged in, redirect away from login/signup) ----
    if (typeof window.initAuthListener === 'function') {
        window.initAuthListener(function(user) {
            if (user && (isLoginPage || isSignupPage)) {
                redirectToDashboard();
            }
        });
    }

    // ============================================================
    //  LOGIN FORM
    // ============================================================
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            clearError(loginError);

            var email = loginEmail.value.trim();
            var password = loginPassword.value;

            if (!email || !password) {
                setError(loginError, 'Please fill in all fields.');
                return;
            }

            try {
                await window.loginUser(email, password);
                redirectToDashboard();
            } catch (err) {
                if (err.code === 'auth/user-not-found') {
                    clearError(loginError);
                    if (userNotFoundModal) {
                        showModal(userNotFoundModal);
                    } else {
                        setError(loginError, 'No user found. Please sign up.');
                    }
                } else if (err.code === 'auth/wrong-password') {
                    setError(loginError, 'Incorrect password. Please try again.');
                } else if (err.code === 'auth/invalid-login-credentials') {
                    setError(loginError, 'Invalid email or password. Please try again.');
                } else if (err.code === 'auth/too-many-requests') {
                    setError(loginError, 'Too many failed attempts. Please try again later.');
                } else {
                    setError(loginError, 'Login failed. Please check your credentials and try again.');
                }
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

            var name = signupName.value.trim();
            var email = signupEmail.value.trim();
            var password = signupPassword.value;

            if (!name || !email || !password) {
                setError(signupError, 'Please fill in all fields.');
                return;
            }

            if (password.length < 6) {
                setError(signupError, 'Password must be at least 6 characters.');
                return;
            }

            try {
                var user = await window.signupUser(email, password, name);
                await window.saveUserProfile(user.uid, {
                    name: name,
                    email: user.email,
                    role: 'Member',
                    joinDate: new Date().toISOString(),
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });
                await window.addActivityLog(user.uid, { device: 'Browser (Signup)' });

                // Redirect to login with success message
                window.location.href = '/auth-project/login.html?signup=success';

            } catch (err) {
                if (err.code === 'auth/email-already-in-use') {
                    setError(signupError, 'This email is already registered. Please sign in.');
                } else if (err.code === 'auth/weak-password') {
                    setError(signupError, 'Password is too weak. Use at least 6 characters.');
                } else {
                    setError(signupError, 'Signup failed. Please try again.');
                }
            }
        });
    }

    // ============================================================
    //  FORGOT PASSWORD (no alert, uses inline message)
    // ============================================================
    if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener('click', async function(e) {
            e.preventDefault();
            clearError(loginError);

            var email = loginEmail.value.trim();
            if (!email) {
                setError(loginError, 'Please enter your email address first.');
                return;
            }

            try {
                await window.sendPasswordReset(email);
                // Show success in error div (reuse as success)
                loginError.classList.remove('show');
                loginError.textContent = '';
                var successDiv = document.getElementById('signupSuccessMsg');
                if (successDiv) {
                    setSuccess(successDiv, 'Password reset email sent. Check your inbox.');
                } else {
                    // Fallback: create a temporary success message
                    var temp = document.createElement('div');
                    temp.style.cssText = 'padding:10px 14px;background:#dcfce7;border:1px solid #bbf7d0;border-radius:8px;color:#166534;font-size:.9rem;margin-bottom:16px;';
                    temp.textContent = 'Password reset email sent. Check your inbox.';
                    var parent = forgotPasswordLink.closest('.auth-view');
                    if (parent) parent.insertBefore(temp, loginForm);
                    setTimeout(function() { temp.remove(); }, 5000);
                }
            } catch (err) {
                if (err.code === 'auth/user-not-found') {
                    setError(loginError, 'No account found with this email.');
                } else {
                    setError(loginError, 'Failed to send reset email. Please try again.');
                }
            }
        });
    }

    // ============================================================
    //  GOOGLE SIGN-IN
    // ============================================================
    async function handleGoogleSignIn() {
        try {
            var user = await window.signInWithGoogle();
            var profile = await window.getUserProfile(user.uid);
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
            var errorEl = isLoginPage ? loginError : signupError;
            if (errorEl) setError(errorEl, 'Google sign-in failed. Please try again.');
        }
    }

    if (googleLoginBtn) googleLoginBtn.addEventListener('click', handleGoogleSignIn);
    if (googleSignupBtn) googleSignupBtn.addEventListener('click', handleGoogleSignIn);

    // ============================================================
    //  SHOW SIGNUP SUCCESS MESSAGE ON LOGIN PAGE
    // ============================================================
    if (isLoginPage) {
        var urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('signup') === 'success') {
            var msg = document.getElementById('signupSuccessMsg');
            if (msg) {
                msg.style.display = 'block';
                // Clean URL
                var cleanUrl = window.location.pathname;
                window.history.replaceState({}, document.title, cleanUrl);
            }
        }
    }

    // ============================================================
    //  CLOSE MODAL ON OUTSIDE CLICK OR ESCAPE
    // ============================================================
    if (userNotFoundModal) {
        userNotFoundModal.addEventListener('click', function(e) {
            if (e.target === this) hideModal(this);
        });
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && userNotFoundModal.style.display === 'flex') {
                hideModal(userNotFoundModal);
            }
        });
    }

})();
