// ============================================================
//  DASHBOARD.JS – Yadav Authentication Project
//  Profile, avatar, settings, security, activity log
// ============================================================

(function() {
    'use strict';

    // ============================================================
    //  DOM REFS
    // ============================================================
    const sidebarName = document.getElementById('sidebarName');
    const sidebarEmail = document.getElementById('sidebarEmail');
    const sidebarAvatar = document.getElementById('sidebarAvatar');
    const summaryName = document.getElementById('summaryName');
    const summaryRole = document.getElementById('summaryRole');
    const summaryJoinDate = document.getElementById('summaryJoinDate');
    const summaryAvatar = document.getElementById('summaryAvatar');
    const dashboardGreeting = document.getElementById('dashboardGreeting');
    const activityList = document.getElementById('activityList');

    const editName = document.getElementById('editName');
    const editPhone = document.getElementById('editPhone');
    const editBio = document.getElementById('editBio');
    const editLocation = document.getElementById('editLocation');
    const profileForm = document.getElementById('profileForm');
    const profileError = document.getElementById('profileError');
    const profileSuccess = document.getElementById('profileSuccess');
    const cancelProfileEdit = document.getElementById('cancelProfileEdit');

    const avatarInput = document.getElementById('avatarInput');
    const uploadAvatarBtn = document.getElementById('uploadAvatarBtn');
    const removeAvatarBtn = document.getElementById('removeAvatarBtn');
    const avatarPreview = document.getElementById('avatarPreview');

    const emailForm = document.getElementById('emailForm');
    const newEmail = document.getElementById('newEmail');
    const emailPassword = document.getElementById('emailPassword');
    const emailError = document.getElementById('emailError');
    const emailSuccess = document.getElementById('emailSuccess');

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

    const navLinks = document.querySelectorAll('.sidebar-nav .nav-link:not(.logout-link)');
    const tabContents = {
        dashboard: document.getElementById('tab-dashboard'),
        settings: document.getElementById('tab-settings'),
        security: document.getElementById('tab-security'),
        help: document.getElementById('tab-help'),
    };

    // ============================================================
    //  UTILITY FUNCTIONS
    // ============================================================
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
        setTimeout(function() {
            el.style.display = 'none';
        }, 5000);
    }

    // ============================================================
    //  UPDATE AVATAR UI
    // ============================================================
    function updateAvatarUI(photoURL, displayName) {
        const initials = getInitials(displayName);
        const elements = [sidebarAvatar, summaryAvatar, avatarPreview];
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

    // ============================================================
    //  LOAD USER PROFILE
    // ============================================================
    async function loadUserProfile(user) {
        try {
            var data = await window.getUserProfile(user.uid) || {};
            var displayName = data.name || user.displayName || user.email || 'User';
            var phone = data.phone || user.phoneNumber || '';
            var bio = data.bio || '';
            var location = data.location || '';
            var role = data.role || 'Member';
            var joinDate = data.joinDate || user.metadata.creationTime || new Date().toISOString();

            sidebarName.textContent = displayName;
            sidebarEmail.textContent = user.email;
            summaryName.textContent = displayName;
            summaryRole.textContent = role;
            summaryJoinDate.textContent = 'Joined: ' + formatDate(joinDate);
            dashboardGreeting.textContent = 'Hi, ' + displayName.split(' ')[0] + '!';

            var photoURL = user.photoURL || data.photoURL || null;
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

    // ============================================================
    //  LOAD ACTIVITY LOG
    // ============================================================
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

    // ============================================================
    //  CHECK AUTH STATE
    // ============================================================
    window.initAuthListener(function(user) {
        if (user) {
            loadUserProfile(user);
            loadActivityLog(user.uid);
        } else {
            window.location.href = '/auth-project/login.html';
        }
    });

    // ============================================================
    //  PROFILE UPDATE
    // ============================================================
    if (profileForm) {
        profileForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            clearError(profileError);
            profileSuccess.style.display = 'none';

            var name = editName.value.trim();
            var phone = editPhone.value.trim();
            var bio = editBio.value.trim();
            var location = editLocation.value.trim();

            if (!name) {
                setError(profileError, 'Name is required.');
                return;
            }

            var user = window.auth.currentUser;
            if (!user) return;

            try {
                await user.updateProfile({ displayName: name });
                await window.saveUserProfile(user.uid, { name: name, phone: phone, bio: bio, location: location });

                sidebarName.textContent = name;
                summaryName.textContent = name;
                dashboardGreeting.textContent = 'Hi, ' + name.split(' ')[0] + '!';
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

    // ============================================================
    //  AVATAR UPLOAD / REMOVE
    // ============================================================
    if (uploadAvatarBtn) {
        uploadAvatarBtn.addEventListener('click', function() {
            avatarInput.click();
        });
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

    // ============================================================
    //  EMAIL UPDATE
    // ============================================================
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

    // ============================================================
    //  CHANGE PASSWORD
    // ============================================================
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

    // ============================================================
    //  LOGOUT OTHER DEVICES
    // ============================================================
    if (logoutDevicesBtn) {
        logoutDevicesBtn.addEventListener('click', function() {
            alert('To revoke all other sessions, please change your password. This will automatically invalidate all other tokens.');
        });
    }

    // ============================================================
    //  DELETE ACCOUNT (Danger Zone)
    // ============================================================
    if (deleteAccountBtn) {
        deleteAccountBtn.addEventListener('click', async function() {
            var user = window.auth.currentUser;
            if (!user) return;

            var confirmDelete = confirm(
                '⚠️ Are you sure you want to delete your account?\nThis action is PERMANENT and cannot be undone.'
            );
            if (!confirmDelete) return;

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

    // ============================================================
    //  LOGOUT
    // ============================================================
    if (logoutBtnSidebar) {
        logoutBtnSidebar.addEventListener('click', function() {
            if (confirm('Are you sure you want to sign out?')) {
                window.logoutUser();
                window.location.href = '/auth-project/login.html';
            }
        });
    }

    // ============================================================
    //  TAB SWITCHING
    // ============================================================
    navLinks.forEach(function(link) {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            navLinks.forEach(function(l) { l.classList.remove('active'); });
            this.classList.add('active');

            var tab = this.dataset.tab;
            Object.keys(tabContents).forEach(function(key) {
                tabContents[key].style.display = (key === tab) ? 'block' : 'none';
            });
        });
    });

})();
