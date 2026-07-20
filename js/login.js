document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('loginEmail');
    const passwordInput = document.getElementById('loginPassword');
    const flash = document.getElementById('flashMessage');

    // Redirect if already logged in
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            window.location.href = 'dashboard.html';
        }
    });

    function showFlash(msg, isError = true) {
        flash.textContent = msg;
        flash.style.display = 'block';
        flash.className = 'flash-message' + (isError ? ' error' : ' success');
        setTimeout(() => { flash.style.display = 'none'; }, 5000);
    }

    // Email/password login
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();
        if (!email || !password) {
            showFlash('Please fill in both fields.');
            return;
        }
        firebase.auth().signInWithEmailAndPassword(email, password)
            .then(() => {
                // Redirect handled by onAuthStateChanged
            })
            .catch(function(error) {
                showFlash(error.message);
            });
    });

    // Google login
    document.getElementById('googleLoginBtn').addEventListener('click', function() {
        const provider = new firebase.auth.GoogleAuthProvider();
        firebase.auth().signInWithPopup(provider)
            .then(() => {
                // Redirect handled by onAuthStateChanged
            })
            .catch(function(error) {
                showFlash(error.message);
            });
    });
});
