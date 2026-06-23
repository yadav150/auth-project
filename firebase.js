const firebaseConfig = {
  apiKey: "AIzaSyC3RBe6AlCewKXkcVS4cDEXLDbClTvBgBY",
  authDomain: "mockly2-fe6bc.firebaseapp.com",
  projectId: "mockly2-fe6bc",
  storageBucket: "mockly2-fe6bc.firebasestorage.app",
  messagingSenderId: "535116640494",
  appId: "1:535116640494:web:4a02c00886fff2572503ff",
  measurementId: "G-VGL50BKX19"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

// Email/Password signup
async function signupUser(email, password, displayName) {
    const cred = await auth.createUserWithEmailAndPassword(email, password);
    await cred.user.updateProfile({ displayName });
    return cred.user;
}

// Email/Password login
async function loginUser(email, password) {
    const cred = await auth.signInWithEmailAndPassword(email, password);
    return cred.user;
}

// Google Sign-In
async function signInWithGoogle() {
    const provider = new firebase.auth.GoogleAuthProvider();
    const result = await auth.signInWithPopup(provider);
    return result.user;
}

// Logout
async function logoutUser() {
    await auth.signOut();
    window.location.reload(); // quick refresh to reset UI
}

// Auth state listener
function initAuthListener(callback) {
    auth.onAuthStateChanged(user => callback(user));
}

// Expose globally
window.signupUser = signupUser;
window.loginUser = loginUser;
window.signInWithGoogle = signInWithGoogle;
window.logoutUser = logoutUser;
window.initAuthListener = initAuthListener;
