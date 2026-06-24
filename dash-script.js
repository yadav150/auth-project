/*********************************************
 * Mockly Dashboard Script
 * Real data only – no demo data.
 *********************************************/

const STORAGE_KEY = 'mocklyTestHistory';

function getTestHistory() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
}

function saveTestHistory(history) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
}

// Global function to save a completed test
window.saveTestResult = function(examName, score, totalQuestions, status = null) {
  const history = getTestHistory();
  const date = new Date().toISOString().split('T')[0];
  const passed = score >= 60;
  const examStatus = status || (passed ? 'Passed' : 'Failed');

  history.push({
    exam: examName,
    date: date,
    score: score + '%',
    status: examStatus,
    questions: totalQuestions
  });

  // Keep last 20 entries
  if (history.length > 20) {
    history.splice(0, history.length - 20);
  }

  saveTestHistory(history);
};

document.addEventListener('DOMContentLoaded', () => {
  firebase.auth().onAuthStateChanged((user) => {
    if (!user) {
      window.location.href = 'index.html';
      return;
    }

    // Friendly name
    let firstName = '';
    if (user.displayName) {
      firstName = user.displayName.split(' ')[0];
    } else if (user.email) {
      const username = user.email.split('@')[0];
      firstName = username
        .replace(/[._]/g, ' ')
        .replace(/\b\w/g, char => char.toUpperCase())
        .split(' ')[0];
    }
    if (!firstName) firstName = 'Student';

    document.getElementById('dashboardName').textContent = `Hello, ${firstName}`;
    document.getElementById('dashboardEmail').textContent = user.email;

    // Real data from localStorage
    const history = getTestHistory();
    const totalTests = history.length;
    const totalQuestions = history.reduce((sum, t) => sum + (t.questions || 0), 0);
    const avgScore = totalTests > 0
      ? Math.round(history.reduce((sum, t) => sum + parseInt(t.score), 0) / totalTests)
      : 0;

    // Simple rank based on test count (can be replaced)
    const rank = totalTests > 0 ? '#' + Math.min(totalTests * 3, 100) : '#0';

    document.getElementById('dashTestsTaken').textContent = totalTests;
    document.getElementById('dashAvgScore').textContent = avgScore + '%';
    document.getElementById('dashRank').textContent = rank;
    document.getElementById('dashQuestions').textContent = totalQuestions;

    // Recent tests table
    const tbody = document.querySelector('#recentTestsTable tbody');
    const noRecent = document.getElementById('noRecentTests');

    if (history.length === 0) {
      tbody.innerHTML = '';
      noRecent.style.display = 'block';
    } else {
      noRecent.style.display = 'none';
      const recent = [...history].reverse().slice(0, 5);
      tbody.innerHTML = recent.map(test => `
        <tr>
          <td><strong>${test.exam}</strong></td>
          <td>${test.date}</td>
          <td style="font-weight:600; color:${test.status === 'Passed' ? '#16a34a' : '#d32f2f'};">
            ${test.score}
          </td>
          <td><span style="color:${test.status === 'Passed' ? '#16a34a' : '#d32f2f'};">
            ${test.status}
          </span></td>
        </tr>
      `).join('');
    }

    // Logout with popup
    const logoutBtn = document.getElementById('btnLogout');
    const logoutOverlay = document.getElementById('logoutPopupOverlay');

    logoutBtn.addEventListener('click', () => {
      logoutOverlay.classList.add('active');
      logoutOverlay.setAttribute('aria-hidden', 'false');
      setTimeout(() => {
        firebase.auth().signOut().then(() => {
          window.location.href = 'index.html';
        });
      }, 2000);
    });
  });
});
