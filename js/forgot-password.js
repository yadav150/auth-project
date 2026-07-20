document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('resetForm');
    const emailInput = document.getElementById('resetEmail');
    const flash = document.getElementById('flashMessage');

    function showFlash(msg, isError = true) {
        flash.textContent = msg;
        flash.style.display = 'block';
        flash.className = 'flash-message' + (isError ? ' error' : ' success');
        setTimeout(() => { flash.style.display = 'none'; }, 6000);
    }

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        const email = emailInput.value.trim();
        if (!email) {
            showFlash('Please enter your email.');
            return;
        }
        // Firebase send password reset email
        firebase.auth().sendPasswordResetEmail(email)
            .then(function() {
                showFlash('Reset link sent! Check your email.', false);
            })
            .catch(function(error) {
                showFlash(error.message);
            });
    });
});
