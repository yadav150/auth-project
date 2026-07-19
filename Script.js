// ============================================================
//  YADAV AUTHENTICATION PROJECT – Complete Logic
//  Firebase Auth, Firestore, Storage
// ============================================================

(function() {
    'use strict';

    // ============================================================
    //  1. DOM REFS
    // ============================================================
    const authContainer = document.getElementById('authContainer');
    const dashboardContainer = document.getElementById('dashboardContainer');

    // Auth Views
    const loginView = document.getElementById('loginView');
    const signupView = document.getElementById('signupView');
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const loginEmail = document.getElementById('loginEmail');
    const loginPassword = document.getElementById('loginPassword');
    const signupName = document.getElementById('signupName');
    const signupEmail = document.getElementById('signupEmail');
    const signupPassword = document.getElementById('signupPassword');
    const showSignup = document.getElementById('showSignup');
    const showLogin = document.getElementById('showLogin');
    const forgotPasswordLink = document.getElementById('forgotPasswordLink');
    const googleLoginBtn = document.getElementById('googleLoginBtn');
    const googleSignupBtn = document.getElementById('googleSignupBtn');
    const loginError = document.getElementById('loginError');
    const signupError = document.getElementById('signupError');

    // Dashboard
    const sidebarName = document.getElementById('sidebarName');
    const sidebarEmail = document.getElementById('sidebarEmail');
    const sidebarAvatar = document.getElementById('sidebarAvatar');
    const summaryName = document.getElementById('summaryName');
    const summaryRole = document.getElementById('summaryRole');
    const summaryJoinDate = document.getElementById('summaryJoinDate');
    const summaryAvatar = document.getElementById('summaryAvatar');
    const dashboardGreeting = document.getElementById('dashboardGreeting');
    const activityList = document.getElementById('activityList');

    // Settings
    const editName = document.getElementById('editName');
    const editPhone = document.getElementById('editPhone');
    const editBio = document.getElementById('editBio');
    const editLocation = document.getElementById('editLocation');
    const profileForm = document.getElementById('profileForm');
    const profileError = document.getElementById('profileError');
    const profileSuccess = document.getElementById('profileSuccess');
    const cancelProfileEdit = document.getElementById('cancelProfileEdit');

    // Avatar
    const avatarInput = document.getElementById('avatarInput');
    const uploadAvatarBtn = document.getElementById('uploadAvatarBtn');
    const removeAvatarBtn = document.getElementById('removeAvatarBtn');
    const avatarPreview = document.getElementById('avatarPreview');

    // Email
    const emailForm = document.getElementById('emailForm');
    const newEmail = document.getElementById('newEmail');
    const emailPassword = document.getElementById('emailPassword');
    const emailError = document.getElementById('emailError');
    const emailSuccess = document.getElementById('emailSuccess');

    // Security
    const passwordForm = document.getElementById('passwordForm');
    const currentPassword = document.getElementById('currentPassword');
    const newPassword = document.getElementById('newPassword');
    const confirmPassword = document.getElementById('confirmPassword');
    const passwordError = document.getElementById('passwordError');
    const passwordSuccess = document.getElementById('passwordSuccess');
    const logoutDevicesBtn = document.getElementById('logoutDevicesBtn');
    const deleteAccountBtn = document.getElementById('deleteAccountBtn');
    const deleteError = document.getElementById('deleteError');
    const deviceError = document.getElementById('deviceError');
    const logoutBtnSidebar = document.getElementById('logoutBtnSidebar');

    // Tabs
    const navLinks = document.querySelectorAll('.sidebar-nav .nav-link:not(.logout-link)');
    const tabContents = {
        dashboard: document.getElementById('tab-dashboard'),
        settings: document.getElementById('tab-settings'),
        security: document.getElementById('tab-security'),
        help: document.getElementById('tab-help'),
    };

    // Theme toggle
    const themeToggle = document.getElementById('themeToggle');

    // ============================================================
    //  2. UTILITY FUNCTIONS
    // ============================================================
    function showView(view) {
        [loginView, signupView].forEach(el => el.style.display = 'none');
        view.style.display = 'block';
        clearAuthErrors();
    }

    function clearAuthErrors() {
        [loginError, signupError, profileError, emailError, passwordError, deleteError, deviceError].forEach(el => {
            if (el) el.classList.remove('show');
        });
    }

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

    function getInitials(name) {
        if (!name) return '?';
        const parts = name.trim().split(' ');
        if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
        return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
    }

    function formatDate(timestamp) {
        if (!timestamp) return 'Today';
        const d = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    }

    // ============================================================
    //  3. FIREBASE INSTANCES
    // ============================================================
    const auth = firebase.auth();
    const db = firebase.firestore();
    const storage = firebase.storage();

    // ============================================================
    //  4. DARK MODE TOGGLE
    // ============================================================
    (function initDarkMode() {
        const saved = sessionStorage.getItem('theme');
        if (saved === 'dark') document.body.classList.add('dark-mode');

        themeToggle.addEventListener('click', function() {
            document.body.classList.toggle('dark-mode');
            sessionStorage.setItem('theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
        });
    })();

    // ============================================================
    //  5. AUTH STATE OBSERVER
    // ============================================================
    auth.onAuthStateChanged(async user => {
        if (user) {
            authContainer.style.display = 'none';
            dashboardContainer.style.display = 'block';
            await loadUserProfile(user);
            await loadActivityLog(user.uid);
        } else {
            authContainer.style.display = 'block';
            dashboardContainer.style.display = 'none';
            showView(loginView);
        }
    });

    // ============================================================
    //  6. LOAD USER PROFILE (Firestore)
    // ============================================================
    async function loadUserProfile(user) {
        try {
            const doc = await db.collection('users').doc(user.uid).get();
            let data = doc.data() || {};

            const displayName = data.name || user.displayName || user.email || 'User';
            const phone = data.phone || user.phoneNumber || '';
            const bio = data.bio || '';
            const location = data.location || '';
            const role = data.role || 'Member';
            const joinDate = data.joinDate || user.metadata.creationTime || new Date().toISOString();

            sidebarName.textContent = displayName;
            sidebarEmail.textContent = user.email;
            summaryName.textContent = displayName;
            summaryRole.textContent = role;
            summaryJoinDate.textContent = 'Joined: ' + formatDate(joinDate);
            dashboardGreeting.textContent = 'Hi, ' + displayName.split(' ')[0] + '!';

            const photoURL = user.photoURL || data.photoURL || null;
            updateAvatarUI(photoURL, displayName);

            editName.value = displayName;
            editPhone.value = phone;
            editBio.value = bio;
            editLocation.value = location;

            window._profileData = { displayName, phone, bio, location, photoURL };

        } catch (err) {
            console.warn('Error loading profile:', err);
        }
    }

    function updateAvatarUI(photoURL, displayName) {
        const initials = getInitials(displayName);
        const elements = [sidebarAvatar, summaryAvatar, avatarPreview];
        elements.forEach(el => {
            el.innerHTML = '';
            if (photoURL) {
                const img = document.createElement('img');
                img.src = photoURL;
                img.alt = 'Avatar';
                el.appendChild(img);
            } else {
                el.textContent = initials;
            }
        });
    }

    // ============================================================
    //  7. ACTIVITY LOG
    // ============================================================
    async function loadActivityLog(uid) {
        try {
            const snapshot = await db.collection('users').doc(uid).collection('activity')
                .orderBy('timestamp', 'desc').limit(10).get();
            activityList.innerHTML = '';
            if (snapshot.empty) {
                activityList.innerHTML = '<li style="color:var(--text-muted);font-size:.9rem;">No recent activity.</li>';
                return;
            }
            snapshot.forEach(doc => {
                const data = doc.data();
                const li = document.createElement('li');
                const time = data.timestamp ? formatDate(data.timestamp) : 'Unknown';
                const device = data.device || 'Browser';
                li.innerHTML = `<span>Signed in from ${device}</span><span>${time}</span>`;
                activityList.appendChild(li);
            });
        } catch (err) {
            console.warn('Activity log error:', err);
        }
    }

    // ============================================================
    //  8. SAVE PROFILE (Firestore)
    // ============================================================
    profileForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        clearError(profileError);
        profileSuccess.style.display = 'none';

        const name = editName.value.trim();
        const phone = editPhone.value.trim();
        const bio = editBio.value.trim();
        const location = editLocation.value.trim();

        if (!name) {
            setError(profileError, 'Name is required.');
            return;
        }

        const user = auth.currentUser;
        if (!user) return;

        try {
            await user.updateProfile({ displayName: name });

            await db.collection('users').doc(user.uid).set({
                name,
                phone,
                bio,
                location,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            }, { merge: true });

            sidebarName.textContent = name;
            summaryName.textContent = name;
            dashboardGreeting.textContent = 'Hi, ' + name.split(' ')[0] + '!';
            const photoURL = user.photoURL || window._profileData?.photoURL || null;
            updateAvatarUI(photoURL, name);

            profileSuccess.style.display = 'block';
            setTimeout(() => profileSuccess.style.display = 'none', 5000);

            window._profileData = { displayName: name, phone, bio, location, photoURL };

        } catch (err) {
            setError(profileError, err.message);
        }
    });

    cancelProfileEdit.addEventListener('click', function() {
        const data = window._profileData || {};
        editName.value = data.displayName || '';
        editPhone.value = data.phone || '';
        editBio.value = data.bio || '';
        editLocation.value = data.location || '';
        clearError(profileError);
        profileSuccess.style.display = 'none';
    });

    // ============================================================
    //  9. AVATAR UPLOAD / REMOVE
    // ============================================================
    uploadAvatarBtn.addEventListener('click', () => avatarInput.click());

    avatarInput.addEventListener('change', async function(e) {
        const file = this.files[0];
        if (!file) return;
        const user = auth.currentUser;
        if (!user) return;

        try {
            const ref = storage.ref().child('avatars/' + user.uid + '/' + Date.now() + '.jpg');
            const snapshot = await ref.put(file);
            const downloadURL = await snapshot.ref.getDownloadURL();

            await user.updateProfile({ photoURL: downloadURL });
            await db.collection('users').doc(user.uid).set({ photoURL: downloadURL }, { merge: true });

            window._profileData.photoURL = downloadURL;
            updateAvatarUI(downloadURL, user.displayName || 'User');
            profileSuccess.textContent = 'Avatar updated!';
            profileSuccess.style.display = 'block';
            setTimeout(() => profileSuccess.style.display = 'none', 5000);

        } catch (err) {
            setError(profileError, 'Upload failed: ' + err.message);
        }
        this.value = '';
    });

    removeAvatarBtn.addEventListener('click', async function() {
        const user = auth.currentUser;
        if (!user) return;
        if (!confirm('Remove your profile picture?')) return;

        try {
            await user.updateProfile({ photoURL: null });
            await db.collection('users').doc(user.uid).set({ photoURL: null }, { merge: true });

            window._profileData.photoURL = null;
            updateAvatarUI(null, user.displayName || 'User');
            profileSuccess.textContent = 'Avatar removed.';
            profileSuccess.style.display = 'block';
            setTimeout(() => profileSuccess.style.display = 'none', 5000);

        } catch (err) {
            setError(profileError, 'Failed to remove avatar: ' + err.message);
        }
    });

    // ============================================================
    //  10. UPDATE EMAIL (with re‑auth)
    // ============================================================
    emailForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        clearError(emailError);
        emailSuccess.style.display = 'none';

        const newEmailVal = newEmail.value.trim();
        const password = emailPassword.value;

        if (!newEmailVal || !password) {
            setError(emailError, 'Please fill in both fields.');
            return;
        }

        const user = auth.currentUser;
        if (!user) return;

        try {
            const credential = firebase.auth.EmailAuthProvider.credential(user.email, password);
            await user.reauthenticateWithCredential(credential);
            await user.updateEmail(newEmailVal);
            await user.sendEmailVerification();

            await db.collection('users').doc(user.uid).set({ email: newEmailVal }, { merge: true });

            emailSuccess.style.display = 'block';
            emailSuccess.textContent = 'Verification email sent! Check your inbox.';
            newEmail.value = '';
            emailPassword.value = '';
            setTimeout(() => emailSuccess.style.display = 'none', 8000);

        } catch (err) {
            setError(emailError, err.message);
        }
    });

    // ============================================================
    //  11. CHANGE PASSWORD (with re‑auth)
    // ============================================================
    passwordForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        clearError(passwordError);
        passwordSuccess.style.display = 'none';

        const current = currentPassword.value;
        const newPass = newPassword.value;
        const confirm = confirmPassword.value;

        if (!current || !newPass || !confirm) {
            setError(passwordError, 'Please fill in all fields.');
            return;
        }
        if (newPass.length < 6) {
            setError(passwordError, 'New password must be at least 6 characters.');
            return;
        }
        if (newPass !== confirm) {
            setError(passwordError, 'Passwords do not match.');
            return;
        }

        const user = auth.currentUser;
        if (!user) return;

        try {
            const credential = firebase.auth.EmailAuthProvider.credential(user.email, current);
            await user.reauthenticateWithCredential(credential);
            await user.updatePassword(newPass);

            passwordSuccess.style.display = 'block';
            currentPassword.value = '';
            newPassword.value = '';
            confirmPassword.value = '';
            setTimeout(() => passwordSuccess.style.display = 'none', 5000);

        } catch (err) {
            setError(passwordError, err.message);
        }
    });

    // ============================================================
    //  12. LOGOUT FROM ALL OTHER DEVICES (instructional)
    // ============================================================
    logoutDevicesBtn.addEventListener('click', function() {
        alert('To revoke all other sessions, please change your password. This will automatically invalidate all other tokens.');
    });

    // ============================================================
    //  13. DELETE ACCOUNT (Danger Zone)
    // ============================================================
    deleteAccountBtn.addEventListener('click', async function() {
        const user = auth.currentUser;
        if (!user) return;

        const confirmDelete = confirm(
            '⚠️ Are you sure you want to delete your account?\nThis action is PERMANENT and cannot be undone.'
        );
        if (!confirmDelete) return;

        try {
            const password = prompt('Enter your current password to confirm deletion:');
            if (!password) return;
            const credential = firebase.auth.EmailAuthProvider.credential(user.email, password);
            await user.reauthenticateWithCredential(credential);

            await db.collection('users').doc(user.uid).delete();

            try {
                const ref = storage.ref().child('avatars/' + user.uid);
                const list = await ref.listAll();
                list.items.forEach(item => item.delete());
            } catch (e) { /* ignore */ }

            await user.delete();
            alert('Account deleted successfully.');

        } catch (err) {
            setError(deleteError, err.message);
        }
    });

    // ============================================================
    //  14. LOGOUT
    // ============================================================
    function handleLogout() {
        if (confirm('Are you sure you want to sign out?')) {
            auth.signOut();
        }
    }
    logoutBtnSidebar.addEventListener('click', handleLogout);

    // ============================================================
    //  15. TAB SWITCHING
    // ============================================================
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');

            const tab = this.dataset.tab;
            Object.keys(tabContents).forEach(key => {
                tabContents[key].style.display = (key === tab) ? 'block' : 'none';
            });
        });
    });

    // ============================================================
    //  16. AUTH VIEW SWITCHING
    // ============================================================
    showSignup.addEventListener('click', e => {
        e.preventDefault();
        showView(signupView);
    });
    showLogin.addEventListener('click', e => {
        e.preventDefault();
        showView(loginView);
    });

    // ============================================================
    //  17. EMAIL LOGIN
    // ============================================================
    loginForm.addEventListener('submit', e => {
        e.preventDefault();
        clearError(loginError);
        const email = loginEmail.value.trim();
        const pass = loginPassword.value;
        if (!email || !pass) {
            setError(loginError, 'Please fill in all fields.');
            return;
        }
        auth.signInWithEmailAndPassword(email, pass)
            .catch(err => setError(loginError, err.message));
    });

    // ============================================================
    //  18. EMAIL SIGNUP
    // ============================================================
    signupForm.addEventListener('submit', e => {
        e.preventDefault();
        clearError(signupError);
        const name = signupName.value.trim();
        const email = signupEmail.value.trim();
        const pass = signupPassword.value;
        if (!name || !email || !pass) {
            setError(signupError, 'Please fill in all fields.');
            return;
        }
        if (pass.length < 6) {
            setError(signupError, 'Password must be at least 6 characters.');
            return;
        }
        auth.createUserWithEmailAndPassword(email, pass)
            .then(cred => cred.user.updateProfile({ displayName: name }))
            .then(() => {
                const user = auth.currentUser;
                if (user) {
                    db.collection('users').doc(user.uid).set({
                        name: name,
                        email: user.email,
                        role: 'Member',
                        joinDate: new Date().toISOString(),
                        createdAt: firebase.firestore.FieldValue.serverTimestamp()
                    }).catch(console.warn);
                    db.collection('users').doc(user.uid).collection('activity').add({
                        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                        device: 'Browser (Signup)'
                    }).catch(console.warn);
                }
            })
            .catch(err => setError(signupError, err.message));
    });

    // ============================================================
    //  19. GOOGLE AUTH
    // ============================================================
    function signInWithGoogle() {
        const provider = new firebase.auth.GoogleAuthProvider();
        auth.signInWithPopup(provider)
            .then(result => {
                const user = result.user;
                if (result.additionalUserInfo.isNewUser) {
                    db.collection('users').doc(user.uid).set({
                        name: user.displayName || 'User',
                        email: user.email,
                        photoURL: user.photoURL || null,
                        role: 'Member',
                        joinDate: new Date().toISOString(),
                        createdAt: firebase.firestore.FieldValue.serverTimestamp()
                    }).catch(console.warn);
                }
            })
            .catch(err => setError(loginError, err.message));
    }
    googleLoginBtn.addEventListener('click', signInWithGoogle);
    googleSignupBtn.addEventListener('click', signInWithGoogle);

    // ============================================================
    //  20. FORGOT PASSWORD
    // ============================================================
    forgotPasswordLink.addEventListener('click', e => {
        e.preventDefault();
        const email = loginEmail.value.trim();
        if (!email) {
            setError(loginError, 'Please enter your email address first.');
            return;
        }
        auth.sendPasswordResetEmail(email)
            .then(() => alert('Password reset email sent. Check your inbox.'))
            .catch(err => setError(loginError, err.message));
    });

})();
