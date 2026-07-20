document.addEventListener('DOMContentLoaded', function() {
    const signupForm = document.getElementById('signupForm');
    const nameInput = document.getElementById('signupName');
    const emailInput = document.getElementById('signupEmail');
    const passwordInput = document.getElementById('signupPassword');
    const flash = document.getElementById('flashMessage');

    // If already logged in, redirect to dashboard
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            window.location.href = 'dashboard.html';
        }
    });

    function showFlash(msg, isError = true) {
        flash.textContent = msg;
        flash.style.display = 'block';
        flash.className = 'flash-message' + (isError ? ' error' : ' success');
        // For success, we want to show a permanent-like message until user clicks link
        if (!isError) {
            // Add a clickable link to login
            const link = document.createElement('a');
            link.href = 'login.html';
            link.textContent = ' click here to login';
            link.style.fontWeight = 'bold';
            flash.appendChild(link);
        } else {
            setTimeout(() => { flash.style.display = 'none'; }, 5000);
        }
    }

    signupForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const name = nameInput.value.trim();
        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();

        if (!name || !email || !password) {
            showFlash('All fields are required.');
            return;
        }
        if (password.length < 6) {
            showFlash('Password must be at least 6 characters.');
            return;
        }

        firebase.auth().createUserWithEmailAndPassword(email, password)
            .then(function(userCredential) {
                // Update profile with displayName
                return userCredential.user.updateProfile({ displayName: name });
            })
            .then(function() {
                // Show success with link to login, then sign out so they must login
                showFlash('Your account has been successfully created. Please', false);
                // Sign out the user so they are not auto-logged in
                firebase.auth().signOut();
            })
            .catch(function(error) {
                showFlash(error.message);
            });
    });
});
