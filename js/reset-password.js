document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('newPasswordForm');
    const passwordInput = document.getElementById('newPassword');
    const flash = document.getElementById('flashMessage');

    // Get the oobCode from URL
    const urlParams = new URLSearchParams(window.location.search);
    const oobCode = urlParams.get('oobCode');

    if (!oobCode) {
        flash.textContent = 'Invalid or missing reset code. Please request a new reset link.';
        flash.className = 'flash-message error';
        flash.style.display = 'block';
        form.style.display = 'none';
        return;
    }

    function showFlash(msg, isError = true) {
        flash.textContent = msg;
        flash.style.display = 'block';
        flash.className = 'flash-message' + (isError ? ' error' : ' success');
        if (!isError) {
            // Redirect to login after success
            setTimeout(() => { window.location.href = 'login.html'; }, 3000);
        }
    }

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        const newPassword = passwordInput.value.trim();
        if (newPassword.length < 6) {
            showFlash('Password must be at least 6 characters.');
            return;
        }
        // Apply password reset with oobCode
        firebase.auth().confirmPasswordReset(oobCode, newPassword)
            .then(function() {
                showFlash('Password updated successfully! Redirecting to login...', false);
            })
            .catch(function(error) {
                showFlash(error.message);
            });
    });
});
