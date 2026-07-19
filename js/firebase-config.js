// ============================================================
//  FIREBASE CONFIG – Yadav Authentication Project
//  All functions exposed to window for global access
// ============================================================

const firebaseConfig = {
  apiKey: "AIzaSyC3RBe6AlCewKXkcVS4cDEXLDbClTvBgBY",
  authDomain: "mockly2-fe6bc.firebaseapp.com",
  projectId: "mockly2-fe6bc",
  storageBucket: "mockly2-fe6bc.firebasestorage.app",
  messagingSenderId: "535116640494",
  appId: "1:535116640494:web:4a02c00886fff2572503ff"
};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

// ============================================================
//  AUTHENTICATION FUNCTIONS
// ============================================================

async function signupUser(email, password, displayName) {
  const cred = await auth.createUserWithEmailAndPassword(email, password);
  await cred.user.updateProfile({ displayName });
  return cred.user;
}

async function loginUser(email, password) {
  const cred = await auth.signInWithEmailAndPassword(email, password);
  return cred.user;
}

async function signInWithGoogle() {
  const provider = new firebase.auth.GoogleAuthProvider();
  const result = await auth.signInWithPopup(provider);
  return result.user;
}

async function logoutUser() {
  await auth.signOut();
}

async function sendPasswordReset(email) {
  await auth.sendPasswordResetEmail(email);
}

function initAuthListener(callback) {
  auth.onAuthStateChanged(user => callback(user));
}

// ============================================================
//  FIRESTORE HELPERS
// ============================================================

async function saveUserProfile(uid, data) {
  await db.collection('users').doc(uid).set(data, { merge: true });
}

async function getUserProfile(uid) {
  const doc = await db.collection('users').doc(uid).get();
  return doc.exists ? doc.data() : null;
}

async function addActivityLog(uid, activity) {
  await db.collection('users').doc(uid).collection('activity').add({
    ...activity,
    timestamp: firebase.firestore.FieldValue.serverTimestamp()
  });
}

async function getActivityLog(uid, limit = 10) {
  const snapshot = await db.collection('users').doc(uid).collection('activity')
    .orderBy('timestamp', 'desc').limit(limit).get();
  const logs = [];
  snapshot.forEach(doc => logs.push({ id: doc.id, ...doc.data() }));
  return logs;
}

// ============================================================
//  STORAGE HELPERS
// ============================================================

async function uploadAvatar(uid, file) {
  const ref = storage.ref().child('avatars/' + uid + '/' + Date.now() + '.jpg');
  const snapshot = await ref.put(file);
  return await snapshot.ref.getDownloadURL();
}

async function deleteAvatar(uid) {
  const ref = storage.ref().child('avatars/' + uid);
  try {
    const list = await ref.listAll();
    list.items.forEach(item => item.delete());
  } catch (e) { /* ignore */ }
}

// ============================================================
//  EXPOSE ALL FUNCTIONS TO WINDOW (Global Access)
// ============================================================

window.signupUser = signupUser;
window.loginUser = loginUser;
window.signInWithGoogle = signInWithGoogle;
window.logoutUser = logoutUser;
window.sendPasswordReset = sendPasswordReset;
window.initAuthListener = initAuthListener;

window.saveUserProfile = saveUserProfile;
window.getUserProfile = getUserProfile;
window.addActivityLog = addActivityLog;
window.getActivityLog = getActivityLog;

window.uploadAvatar = uploadAvatar;
window.deleteAvatar = deleteAvatar;

window.auth = auth;
window.db = db;
window.storage = storage;
