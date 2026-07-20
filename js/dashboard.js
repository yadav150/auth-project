document.addEventListener('DOMContentLoaded', function() {
    const navLinks = document.getElementById('navLinks');
    const welcome = document.getElementById('welcomeText');
    const emailDisplay = document.getElementById('userEmailDisplay');
    const logoutBtn = document.getElementById('logoutBtn');
    const settingsBtn = document.getElementById('settingsBtn');
    const changePwBtn = document.getElementById('changePasswordBtn');
    const modal = document.getElementById('changePasswordModal');
    const closeModal = document.getElementById('closeModal');
    const changePwForm = document.getElementById('changePwForm');
    const newPwInput = document.getElementById('newPw');
    const modalFlash = document.getElementById('modalFlash');

    // Auto-logout timer (5 minutes)
    let logoutTimer;
    const TIMEOUT = 5 * 60 * 1000; // 5 minutes

    function resetTimer() {
        clearTimeout(logoutTimer);
        logoutTimer = setTimeout(function() {
            // Logout and redirect
            firebase.auth().signOut().then(() => {
                window.location.href = 'index.html';
            });
        }, TIMEOUT);
    }

    // Reset timer on user activity
    const events = ['mousemove', 'keydown', 'click', 'scroll'];
    events.forEach(ev => document.addEventListener(ev, resetTimer));

    // Check auth state
    firebase.auth().onAuthStateChanged(function(user) {
        if (!user) {
            window.location.href = 'login.html';
            return;
        }
        // Update welcome
        const name = user.displayName || user.email || 'User';
        welcome.textContent = 'Welcome ' + name;
        emailDisplay.textContent = user.email || '';
        // Change nav links for dashboard
        navLinks.innerHTML = `
            <a href="dashboard.html" class="active">Dashboard</a>
            <a href="#" id="navSettings">Settings</a>
            <a href="#" id="navLogout">Logout</a>
            <a href="#">Help</a>
        `;
        // Attach events to new links
        document.getElementById('navSettings').addEventListener('click', function(e) {
            e.preventDefault();
            settingsBtn.click();
        });
        document.getElementById('navLogout').addEventListener('click', function(e) {
            e.preventDefault();
            logoutBtn.click();
        });
        // Start timer
        resetTimer();
    });

    // Logout with confirmation modal (using native confirm for simplicity, but we'll show a custom one)
    // Since user asked for "are you sure yes no button" we'll use a confirm dialog.
    logoutBtn.addEventListener('click', function() {
        if (confirm('Are you sure you want to logout?')) {
            firebase.auth().signOut().then(() => {
                window.location.href = 'index.html';
            });
        }
    });

    // Settings - placeholder
    settingsBtn.addEventListener('click', function() {
        alert('Settings page (coming soon)');
    });

    // Change Password modal
    changePwBtn.addEventListener('click', function() {
        modal.style.display = 'block';
    });
    closeModal.addEventListener('click', function() {
        modal.style.display = 'none';
    });
    window.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });

    changePwForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const newPassword = newPwInput.value.trim();
        if (newPassword.length < 6) {
            modalFlash.textContent = 'Password must be at least 6 characters.';
            modalFlash.className = 'flash-message error';
            modalFlash.style.display = 'block';
            return;
        }
        const user = firebase.auth().currentUser;
        user.updatePassword(newPassword)
            .then(() => {
                modalFlash.textContent = 'Password updated successfully!';
                modalFlash.className = 'flash-message success';
                modalFlash.style.display = 'block';
                newPwInput.value = '';
                setTimeout(() => {
                    modal.style.display = 'none';
                    modalFlash.style.display = 'none';
                }, 2000);
            })
            .catch((error) => {
                modalFlash.textContent = error.message;
                modalFlash.className = 'flash-message error';
                modalFlash.style.display = 'block';
            });
    });
});
