// ============================================================
//  AUTH.JS – Login & Signup Logic (Fixed Error Handling)
//  Fixes: User-friendly error messages for invalid login
//  Also checks for modal existence to avoid errors.
// ============================================================

(function() {
    'use strict';

    // ---- Determine which page we're on ----
    var isLoginPage = document.getElementById('loginForm') !== null;
    var isSignupPage = document.getElementById('signupForm') !== null;

    // ---- DOM REFS (Login Page) ----
    var loginForm = document.getElementById('loginForm');
    var loginEmail = document.getElementById('loginEmail');
    var loginPassword = document.getElementById('loginPassword');
    var forgotPasswordLink = document.getElementById('forgotPasswordLink');
    var googleLoginBtn = document.getElementById('googleLoginBtn');
    var loginError = document.getElementById('loginError');

    // ---- DOM REFS (Signup Page) ----
    var signupForm = document.getElementById('signupForm');
    var signupName = document.getElementById('signupName');
    var signupEmail = document.getElementById('signupEmail');
    var signupPassword = document.getElementById('signupPassword');
    var googleSignupBtn = document.getElementById('googleSignupBtn');
    var signupError = document.getElementById('signupError');

    // ---- MODAL (User Not Found) ----
    var userNotFoundModal = document.getElementById('userNotFoundModal');

    // ============================================================
    //  UTILITY: SHOW/HIDE ERROR
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

    function showModal(modal) {
        if (!modal) return;
        modal.style.display = 'flex';
    }

    function hideModal(modal) {
        if (!modal) return;
        modal.style.display = 'none';
    }

    // ============================================================
    //  REDIRECT TO DASHBOARD
    // ============================================================
    function redirectToDashboard() {
        window.location.href = '/auth-project/dashboard.html';
    }

    // ============================================================
    //  CHECK AUTH STATE ON LOAD (NO RELOAD LOOP)
    // ============================================================
    if (typeof window.initAuthListener === 'function') {
        window.initAuthListener(function(user) {
            if (user) {
                if (isLoginPage || isSignupPage) {
                    redirectToDashboard();
                }
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
                    showModal(userNotFoundModal);
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
                redirectToDashboard();
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
    //  FORGOT PASSWORD
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
                alert('Password reset email sent. Check your inbox.');
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

    if (googleLoginBtn) {
        googleLoginBtn.addEventListener('click', handleGoogleSignIn);
    }

    if (googleSignupBtn) {
        googleSignupBtn.addEventListener('click', handleGoogleSignIn);
    }

    // ============================================================
    //  CLOSE MODAL ON OUTSIDE CLICK OR ESCAPE
    // ============================================================
    if (userNotFoundModal) {
        userNotFoundModal.addEventListener('click', function(e) {
            if (e.target === this) {
                hideModal(this);
            }
        });

        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && userNotFoundModal.style.display === 'flex') {
                hideModal(userNotFoundModal);
            }
        });
    }

})();
