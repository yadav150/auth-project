/*********************************************
 * Mockly – Competitive Exam Prep
 * Firebase Auth + CAPTCHA (no inline forgot pwd)
 *********************************************/

let loginCaptchaAnswer = '';
let signupCaptchaAnswer = '';

function generateCaptcha() {
  const a = Math.floor(Math.random() * 12) + 1;
  const b = Math.floor(Math.random() * 12) + 1;
  return { question: `${a} + ${b} = ?`, answer: (a + b).toString() };
}

function refreshCaptchas() {
  const loginCap = generateCaptcha();
  const signupCap = generateCaptcha();
  loginCaptchaAnswer = loginCap.answer;
  signupCaptchaAnswer = signupCap.answer;

  const loginQ = document.getElementById('captchaQuestionLogin');
  const signupQ = document.getElementById('captchaQuestionSignup');
  if (loginQ) loginQ.textContent = loginCap.question;
  if (signupQ) signupQ.textContent = signupCap.question;

  const loginInput = document.getElementById('captchaInputLogin');
  const signupInput = document.getElementById('captchaInputSignup');
  if (loginInput) loginInput.value = '';
  if (signupInput) signupInput.value = '';
}

function openModal(type = 'login') {
  const overlay = document.getElementById('modalOverlay');
  const loginForm = document.getElementById('loginForm');
  const signupForm = document.getElementById('signupForm');

  overlay.classList.add('active');
  overlay.setAttribute('aria-hidden', 'false');
  refreshCaptchas();

  loginForm.style.display = 'none';
  signupForm.style.display = 'none';

  if (type === 'login') {
    loginForm.style.display = '';
  } else if (type === 'signup') {
    signupForm.style.display = '';
  }
}

function closeModal() {
  const overlay = document.getElementById('modalOverlay');
  overlay.classList.remove('active');
  overlay.setAttribute('aria-hidden', 'true');
  ['loginEmail','loginPassword','captchaInputLogin',
   'signupName','signupEmail','signupPassword','signupConfirm','captchaInputSignup'].forEach(id => {
     const el = document.getElementById(id);
     if (el) el.value = '';
  });
}

document.addEventListener('DOMContentLoaded', () => {
  // Mobile menu
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    mobileMenu.classList.toggle('active');
  });

  // Smooth scroll
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
        hamburger.classList.remove('open');
        mobileMenu.classList.remove('active');
      }
    });
  });

  // Modal listeners
  document.getElementById('modalClose').addEventListener('click', closeModal);
  document.getElementById('modalOverlay').addEventListener('click', (e) => {
    if (e.target === document.getElementById('modalOverlay')) closeModal();
  });

  // Form switching
  document.getElementById('switchToSignup').addEventListener('click', () => openModal('signup'));
  document.getElementById('switchToLogin').addEventListener('click', () => openModal('login'));

  // Login submit
  document.getElementById('loginSubmitBtn').addEventListener('click', async () => {
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value.trim();
    const captcha = document.getElementById('captchaInputLogin').value.trim();
    if (!email || !password) return alert('Please fill all fields.');
    if (captcha !== loginCaptchaAnswer) {
      alert('Incorrect CAPTCHA');
      refreshCaptchas();
      return;
    }
    try {
      await loginUser(email, password);
      window.location.href = 'dashboard.html';
    } catch (e) { alert('Login failed: ' + e.message); }
  });

  // Signup submit
  document.getElementById('signupSubmitBtn').addEventListener('click', async () => {
    const name = document.getElementById('signupName').value.trim();
    const email = document.getElementById('signupEmail').value.trim();
    const password = document.getElementById('signupPassword').value.trim();
    const confirm = document.getElementById('signupConfirm').value.trim();
    const captcha = document.getElementById('captchaInputSignup').value.trim();
    if (!name || !email || !password || !confirm) return alert('All fields required.');
    if (password !== confirm) return alert('Passwords do not match.');
    if (password.length < 8) return alert('Password must be at least 8 characters.');
    if (captcha !== signupCaptchaAnswer) {
      alert('Incorrect CAPTCHA');
      refreshCaptchas();
      return;
    }
    try {
      await signupUser(email, password, name);
      window.location.href = 'dashboard.html';
    } catch (e) { alert('Signup failed: ' + e.message); }
  });

  // Google sign-in
  async function googleAuth() {
    try {
      await signInWithGoogle();
      window.location.href = 'dashboard.html';
    } catch (e) { alert('Google sign-in failed: ' + e.message); }
  }
  document.getElementById('googleSignInBtn').addEventListener('click', googleAuth);
  document.getElementById('googleSignUpBtn').addEventListener('click', googleAuth);

  // Firebase auth listener
  if (typeof initAuthListener === 'function') {
    initAuthListener(updateUIForAuth);
  }
});

function updateUIForAuth(user) {
  const navActions = document.querySelector('.nav-actions');
  const mobileActions = document.querySelector('.mobile-actions');
  if (!navActions || !mobileActions) return;

  if (user) {
    navActions.innerHTML = `<button class="btn btn-outline" id="btnDashboard">Dashboard</button><button class="btn btn-primary" id="btnLogout">Logout</button>`;
    mobileActions.innerHTML = `<button class="btn btn-outline" id="btnDashboardM">Dashboard</button><button class="btn btn-primary" id="btnLogoutM">Logout</button>`;
    document.getElementById('btnDashboard').addEventListener('click', () => window.location.href = 'dashboard.html');
    document.getElementById('btnDashboardM').addEventListener('click', () => window.location.href = 'dashboard.html');
    document.getElementById('btnLogout').addEventListener('click', () => logoutUser());
    document.getElementById('btnLogoutM').addEventListener('click', () => logoutUser());
  } else {
    navActions.innerHTML = `<button class="btn btn-outline" id="btnLogin">Login</button><button class="btn btn-primary" id="btnSignup">Sign Up</button>`;
    mobileActions.innerHTML = `<button class="btn btn-outline" id="btnLoginMobile">Login</button><button class="btn btn-primary" id="btnSignupMobile">Sign Up</button>`;
    document.getElementById('btnLogin').addEventListener('click', () => openModal('login'));
    document.getElementById('btnSignup').addEventListener('click', () => openModal('signup'));
    document.getElementById('btnLoginMobile').addEventListener('click', () => openModal('login'));
    document.getElementById('btnSignupMobile').addEventListener('click', () => openModal('signup'));
  }
}
