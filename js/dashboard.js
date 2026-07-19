// ============================================================
//  DASHBOARD.JS – Profile, Settings, Security
// ============================================================

(function() {
    'use strict';

    // ---- DOM REFS ----
    var sidebarName = document.getElementById('sidebarName');
    var sidebarEmail = document.getElementById('sidebarEmail');
    var sidebarAvatar = document.getElementById('sidebarAvatar');
    var summaryName = document.getElementById('summaryName');
    var summaryRole = document.getElementById('summaryRole');
    var summaryJoinDate = document.getElementById('summaryJoinDate');
    var summaryAvatar = document.getElementById('summaryAvatar');
    var dashboardGreeting = document.getElementById('dashboardGreeting');
    var activityList = document.getElementById('activityList');

    var editName = document.getElementById('editName');
    var editPhone = document.getElementById('editPhone');
    var editBio = document.getElementById('editBio');
    var editLocation = document.getElementById('editLocation');
    var profileForm = document.getElementById('profileForm');
    var profileError = document.getElementById('profileError');
    var profileSuccess = document.getElementById('profileSuccess');
    var cancelProfileEdit = document.getElementById('cancelProfileEdit');

    var avatarInput = document.getElementById('avatarInput');
    var uploadAvatarBtn = document.getElementById('uploadAvatarBtn');
    var removeAvatarBtn = document.getElementById('removeAvatarBtn');
    var avatarPreview = document.getElementById('avatarPreview');

    var emailForm = document.getElementById('emailForm');
    var newEmail = document.getElementById('newEmail');
    var emailPassword = document.getElementById('emailPassword');
    var emailError = document.getElementById('emailError');
    var emailSuccess = document.getElementById('emailSuccess');

    var passwordForm = document.getElementById('passwordForm');
    var currentPassword = document.getElementById('currentPassword');
    var newPassword = document.getElementById('newPassword');
    var confirmPassword = document.getElementById('confirmPassword');
    var passwordError = document.getElementById('passwordError');
    var passwordSuccess = document.getElementById('passwordSuccess');
    var logoutDevicesBtn = document.getElementById('logoutDevicesBtn');
    var deleteAccountBtn = document.getElementById('deleteAccountBtn');
    var deleteError = document.getElementById('deleteError');
    var deviceError = document.getElementById('deviceError');
    var logoutBtnSidebar = document.getElementById('logoutBtnSidebar');

    var logoutModal = document.getElementById('logoutModal');
    var logoutNoBtn = document.getElementById('logoutNoBtn');
    var logoutYesBtn = document.getElementById('logoutYesBtn');

    var navLinks = document.querySelectorAll('.sidebar-nav .nav-link:not(.logout-link)');
    var tabContents = {
        dashboard: document.getElementById('tab-dashboard'),
        settings: document.getElementById('tab-settings'),
        security: document.getElementById('tab-security'),
        help: document.getElementById('tab-help'),
    };

    // ---- Utilities ----
    function getInitials(name) {
        if (!name) return '?';
        var parts = name.trim().split(' ');
        if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
        return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
    }

    function formatDate(timestamp) {
        if (!timestamp) return 'Today';
        var d = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
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

    function showSuccess(el, msg) {
        if (!el) return;
        el.textContent = msg || 'Updated successfully!';
        el.style.display = 'block';
        setTimeout(function() { el.style.display = 'none'; }, 5000);
    }

    function showModal(modal) {
        if (!modal) return;
        modal.style.display = 'flex';
    }

    function hideModal(modal) {
        if (!modal) return;
        modal.style.display = 'none';
    }

    function updateAvatarUI(photoURL, displayName) {
        var initials = getInitials(displayName);
        var elements = [sidebarAvatar, summaryAvatar, avatarPreview];
        elements.forEach(function(el) {
            if (!el) return;
            el.innerHTML = '';
            if (photoURL) {
                var img = document.createElement('img');
                img.src = photoURL;
                img.alt = 'Avatar';
                el.appendChild(img);
            } else {
                el.textContent = initials;
            }
        });
    }

    // ---- Load Profile ----
    async function loadUserProfile(user) {
        try {
            var data = await window.getUserProfile(user.uid) || {};
            var displayName = data.name || user.displayName || user.email || 'User';
            var phone = data.phone || user.phoneNumber || '';
            var bio = data.bio || '';
            var location = data.location || '';
            var role = data.role || 'Member';
            var joinDate = data.joinDate || user.metadata.creationTime || new Date().toISOString();
            var photoURL = user.photoURL || data.photoURL || null;

            sidebarName.textContent = displayName;
            sidebarEmail.textContent = user.email || 'No email';
            summaryName.textContent = displayName;
            summaryRole.textContent = role;
            summaryJoinDate.textContent = 'Joined: ' + formatDate(joinDate);
            dashboardGreeting.textContent = 'Hi, ' + (displayName.split(' ')[0] || 'User') + '!';

            updateAvatarUI(photoURL, displayName);

            editName.value = displayName;
            editPhone.value = phone;
            editBio.value = bio;
            editLocation.value = location;

            window._profileData = { displayName: displayName, phone: phone, bio: bio, location: location, photoURL: photoURL };

        } catch (err) {
            console.warn('Error loading profile:', err);
        }
    }

    // ---- Load Activity ----
    async function loadActivityLog(uid) {
        try {
            var logs = await window.getActivityLog(uid);
            activityList.innerHTML = '';
            if (logs.length === 0) {
                activityList.innerHTML = '<li style="color:#94a3b8;font-size:.9rem;">No recent activity.</li>';
                return;
            }
            logs.forEach(function(log) {
                var li = document.createElement('li');
                var time = log.timestamp ? formatDate(log.timestamp) : 'Unknown';
                var device = log.device || 'Browser';
                li.innerHTML = '<span>Signed in from ' + device + '</span><span>' + time + '</span>';
                activityList.appendChild(li);
            });
        } catch (err) {
            console.warn('Activity log error:', err);
        }
    }

    // ---- Auth State ----
    if (typeof window.initAuthListener === 'function') {
        window.initAuthListener(function(user) {
            if (user) {
                loadUserProfile(user);
                loadActivityLog(user.uid);
            } else {
                window.location.href = '/auth-project/login.html';
            }
        });
    }

    // ---- Profile Update ----
    if (profileForm) {
        profileForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            clearError(profileError);
            profileSuccess.style.display = 'none';

            var name = editName.value.trim();
            var phone = editPhone.value.trim();
            var bio = editBio.value.trim();
            var location = editLocation.value.trim();

            if (!name) { setError(profileError, 'Name is required.'); return; }

            var user = window.auth.currentUser;
            if (!user) return;

            try {
                await user.updateProfile({ displayName: name });
                await window.saveUserProfile(user.uid, { name: name, phone: phone, bio: bio, location: location });

                sidebarName.textContent = name;
                summaryName.textContent = name;
                dashboardGreeting.textContent = 'Hi, ' + (name.split(' ')[0] || 'User') + '!';

                var photoURL = user.photoURL || window._profileData?.photoURL || null;
                updateAvatarUI(photoURL, name);

                showSuccess(profileSuccess, 'Profile updated successfully!');
                window._profileData = { displayName: name, phone: phone, bio: bio, location: location, photoURL: photoURL };

            } catch (err) {
                setError(profileError, err.message);
            }
        });
    }

    if (cancelProfileEdit) {
        cancelProfileEdit.addEventListener('click', function() {
            var data = window._profileData || {};
            editName.value = data.displayName || '';
            editPhone.value = data.phone || '';
            editBio.value = data.bio || '';
            editLocation.value = data.location || '';
            clearError(profileError);
            profileSuccess.style.display = 'none';
        });
    }

    // ---- Avatar ----
    if (uploadAvatarBtn) {
        uploadAvatarBtn.addEventListener('click', function() { avatarInput.click(); });
    }

    if (avatarInput) {
        avatarInput.addEventListener('change', async function(e) {
            var file = this.files[0];
            if (!file) return;
            var user = window.auth.currentUser;
            if (!user) return;

            try {
                var url = await window.uploadAvatar(user.uid, file);
                await user.updateProfile({ photoURL: url });
                await window.saveUserProfile(user.uid, { photoURL: url });

                window._profileData.photoURL = url;
                updateAvatarUI(url, user.displayName || 'User');
                showSuccess(profileSuccess, 'Avatar uploaded successfully!');

            } catch (err) {
                setError(profileError, 'Upload failed: ' + err.message);
            }
            this.value = '';
        });
    }

    if (removeAvatarBtn) {
        removeAvatarBtn.addEventListener('click', async function() {
            var user = window.auth.currentUser;
            if (!user) return;
            if (!confirm('Remove your profile picture?')) return;

            try {
                await user.updateProfile({ photoURL: null });
                await window.saveUserProfile(user.uid, { photoURL: null });
                await window.deleteAvatar(user.uid);

                window._profileData.photoURL = null;
                updateAvatarUI(null, user.displayName || 'User');
                showSuccess(profileSuccess, 'Avatar removed.');

            } catch (err) {
                setError(profileError, 'Failed to remove avatar: ' + err.message);
            }
        });
    }

    // ---- Email ----
    if (emailForm) {
        emailForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            clearError(emailError);
            emailSuccess.style.display = 'none';

            var newEmailVal = newEmail.value.trim();
            var password = emailPassword.value;

            if (!newEmailVal || !password) {
                setError(emailError, 'Please fill in both fields.');
                return;
            }

            var user = window.auth.currentUser;
            if (!user) return;

            try {
                var credential = firebase.auth.EmailAuthProvider.credential(user.email, password);
                await user.reauthenticateWithCredential(credential);
                await user.updateEmail(newEmailVal);
                await user.sendEmailVerification();
                await window.saveUserProfile(user.uid, { email: newEmailVal });

                showSuccess(emailSuccess, 'Verification email sent! Check your inbox.');
                newEmail.value = '';
                emailPassword.value = '';

            } catch (err) {
                setError(emailError, err.message);
            }
        });
    }

    // ---- Password ----
    if (passwordForm) {
        passwordForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            clearError(passwordError);
            passwordSuccess.style.display = 'none';

            var current = currentPassword.value;
            var newPass = newPassword.value;
            var confirm = confirmPassword.value;

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

            var user = window.auth.currentUser;
            if (!user) return;

            try {
                var credential = firebase.auth.EmailAuthProvider.credential(user.email, current);
                await user.reauthenticateWithCredential(credential);
                await user.updatePassword(newPass);

                showSuccess(passwordSuccess, 'Password updated successfully!');
                currentPassword.value = '';
                newPassword.value = '';
                confirmPassword.value = '';

            } catch (err) {
                setError(passwordError, err.message);
            }
        });
    }

    // ---- Logout Modal ----
    if (logoutBtnSidebar) {
        logoutBtnSidebar.addEventListener('click', function(e) {
            e.preventDefault();
            showModal(logoutModal);
        });
    }

    if (logoutNoBtn) {
        logoutNoBtn.addEventListener('click', function() { hideModal(logoutModal); });
    }

    if (logoutYesBtn) {
        logoutYesBtn.addEventListener('click', function() {
            hideModal(logoutModal);
            window.logoutUser();
            window.location.href = '/auth-project/login.html';
        });
    }

    if (logoutModal) {
        logoutModal.addEventListener('click', function(e) {
            if (e.target === this) hideModal(this);
        });
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && logoutModal.style.display === 'flex') {
                hideModal(logoutModal);
            }
        });
    }

    // ---- Other device logout ----
    if (logoutDevicesBtn) {
        logoutDevicesBtn.addEventListener('click', function() {
            alert('To revoke all other sessions, please change your password. This will automatically invalidate all other tokens.');
        });
    }

    // ---- Delete Account ----
    if (deleteAccountBtn) {
        deleteAccountBtn.addEventListener('click', async function() {
            var user = window.auth.currentUser;
            if (!user) return;
            if (!confirm('⚠️ Are you sure you want to delete your account?\nThis action is PERMANENT and cannot be undone.')) return;

            try {
                var password = prompt('Enter your current password to confirm deletion:');
                if (!password) return;
                var credential = firebase.auth.EmailAuthProvider.credential(user.email, password);
                await user.reauthenticateWithCredential(credential);

                await window.db.collection('users').doc(user.uid).delete();
                await window.deleteAvatar(user.uid);
                await user.delete();

                alert('Account deleted successfully.');
                window.location.href = '/auth-project/index.html';

            } catch (err) {
                setError(deleteError, err.message);
            }
        });
    }

    // ---- Tabs ----
    navLinks.forEach(function(link) {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            navLinks.forEach(function(l) { l.classList.remove('active'); });
            this.classList.add('active');

            var tab = this.dataset.tab;
            Object.keys(tabContents).forEach(function(key) {
                if (tabContents[key]) {
                    tabContents[key].style.display = (key === tab) ? 'block' : 'none';
                }
            });
        });
    });

})();
